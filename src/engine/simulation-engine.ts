import {AnimationEngine} from "./animation-engine";
import {Canvas} from "../ui/canvas";
import {UiControls} from "../ui/ui-controls";
import {GravityEngine} from "./gravity-engine";
import {SECONDS_PER_DAY} from "./constants";
import {Coordinates} from "../ui/types";
import {cartesianToPolar} from "../utils/math";

export class SimulationEngine {
    get canvas(): Canvas {
        return this._canvas;
    }
    get distanceDivisor(): number {
        return this._distanceDivisor;
    }

    set distanceDivisor(value: number) {
        this._distanceDivisor = value;
    }

    get sizeDivisor(): number {
        return this._sizeDivisor;
    }

    set sizeDivisor(value: number) {
        this._sizeDivisor = value;
    }

    get newBodyVelocityMultiplier(): number {
        return this._newBodyVelocityMultiplier;
    }

    set newBodyVelocityMultiplier(value: number) {
        this._newBodyVelocityMultiplier = value;
    }

    get tracesEnabled(): boolean {
        return this._tracesEnabled;
    }

    set tracesEnabled(value: boolean) {
        this._tracesEnabled = value;
    }

    get isRunning(): boolean {
        return this.animationEngine.isRunning;
    }

    set isRunning(isRunning: boolean) {
        isRunning ? this.animationEngine.start() : this.animationEngine.stop();
    }

    get elapsedSimulationTimePerSecond(): number {
        return this._elapsedSimulationTimePerSecond;
    }

    set elapsedSimulationTimePerSecond(value: number) {
        this._elapsedSimulationTimePerSecond = value;
    }

    private _newBodyVelocityMultiplier = 50;
    private _elapsedSimulationTimePerSecond: number = SECONDS_PER_DAY; //86400 secs = 1 day
    private _tracesEnabled = false;
    private elapsedSimulationDays = 0;
    private _distanceDivisor: number = 1000000;
    private _sizeDivisor: number = 1000000;
    private selectedObjectForStatsIndex = -1;
    private readonly MAX_ALPHA = 0.3;

    private object_vector_direction_x = 0;
    private object_vector_direction_y = 0;

    private object_vector_start_x = 0;
    private object_vector_start_y = 0;

    private shouldDrawDirectionVector = false;
    private VECTOR_DIRECTION_BALL_r = 1500000;

    constructor(
        private animationEngine: AnimationEngine,
        private _canvas: Canvas,
        private uiControls: UiControls,
        private gravityEngine: GravityEngine,
    ) {
        this._canvas.onMouseRightClick = this.canvasRightClick.bind(this);
        this._canvas.onMouseLeftClick = this.canvasLeftClick.bind(this);
        this._canvas.onMouseLeftClickUp = this.canvasLeftClickUp.bind(this);
        this._canvas.onMouseMove = this.canvasMouseMove.bind(this);
        this.animationEngine.setAnimationFrameCallback(this.tick.bind(this));
    }

    public resetClock(): void{
        this.animationEngine.resetClock();
    }

    public start(): void {
        this.animationEngine.start();
    }

    public tick(): void {
        this._canvas.resizeCanvasToFitContainer();

        // t - time between calculting new positions
        const simulationDeltaTime = this.elapsedSimulationTimePerSecond * this.animationEngine.delta_time;

        this._canvas.clearCanvas();
        //TODO move this to new layer with alpha(canvas)
        this._canvas.initXYAxis();

        //That's where all dynamic calculations occur, called in a specific order
        if (this.isRunning) {
            ////Takes a lot of CPU - enable only for a single object...
            ////attempting to get long traces when slower
            if (this._tracesEnabled) {
                this.gravityEngine.updateObjectsTrajectoryStack();
            }

            this.gravityEngine.calculateMultipleObjects(simulationDeltaTime);

            this.elapsedSimulationDays += (this.animationEngine.delta_time * this.elapsedSimulationTimePerSecond) / SECONDS_PER_DAY;
        }

        this.drawObjectsInTheSimulation();
        this.uiControls.updateSimulationInfo(this.animationEngine.fps, this.elapsedSimulationDays, this.animationEngine.delta_time);

        if (this.selectedObjectForStatsIndex > -1) {
            const body = this.gravityEngine.gravitationalObjects[this.selectedObjectForStatsIndex];
            this.uiControls.updateObjectStats(body);
            if(!body){
                this.selectedObjectForStatsIndex = -1;
            }
        }

        if (this._tracesEnabled) {
            this.drawTraces();
        }

        this.newObjectDirectionVector();
    }

    private drawObjectsInTheSimulation(): void {
        for (let objects_i = 0, len_object = this.gravityEngine.gravitationalObjects.length; objects_i < len_object; objects_i++) {
            let object_to_draw = this.gravityEngine.gravitationalObjects[objects_i];
            this._canvas.drawObjectWithOffset(object_to_draw.x / this._distanceDivisor, object_to_draw.y / this._distanceDivisor, (object_to_draw.diameter / 2) / this._sizeDivisor, object_to_draw.color);
        }
    }

    private canvasRightClick(coordinates: Coordinates): void {
        this.showStatsForObject(coordinates);
    }

    private canvasLeftClick(coordinates: Coordinates): void {
        this.beginAddingNewGravitationalObject(coordinates);
    }

    private canvasLeftClickUp(coordinates: Coordinates): void {
        this.completeAddingNewGravitationalObject();
    }

    private canvasMouseMove(coordinates: Coordinates): void {
        this.onAddingNewGravitationalObject(coordinates);
    }


    //called once per right click on canvas, if object under mouse, select it to show stats, else hide stats
    public showStatsForObject(coordinates: Coordinates): void {
        let r = 0;

        for (let i = 0, len = this.gravityEngine.gravitationalObjects.length; i < len; i++) {
            r = Math.sqrt(
                Math.pow(((this.gravityEngine.gravitationalObjects[i].x / this._distanceDivisor) - (coordinates.x - this._canvas.offsetX)), 2) +
                Math.pow(((this.gravityEngine.gravitationalObjects[i].y / this._distanceDivisor) - (coordinates.y - this._canvas.offsetY)), 2)
            );

            if (r <= (this.gravityEngine.gravitationalObjects[i].diameter / this._sizeDivisor) / 2 + 1) {
                this.selectedObjectForStatsIndex = i;

                this.uiControls.showObjectStats();
                return;
            }
        }

        this.selectedObjectForStatsIndex = -1;
        this.uiControls.hideObjectStats();
    }


    //Draw multiple traces, trace = [object][trace]
    private drawTraces(): void {
        let alpha = 0.0;

        let alphaFraction = (this.MAX_ALPHA / this.gravityEngine.objectsTrajectoriesStack.length);

        //Traces
        for (let i = 0, len = this.gravityEngine.objectsTrajectoriesStack.length; i < len; i++) {
            alpha += alphaFraction;
            this._canvas.ctx.fillStyle = "rgba(0,0,0," + alpha + ")"; //dim trace at tail

            //Trace
            let trace = this.gravityEngine.objectsTrajectoriesStack[i];
            //Objects
            for (let j = 0, len_j = trace.length; j < len_j; j++) {
                this._canvas.drawPixel(trace[j].x / this._distanceDivisor, trace[j].y / this._distanceDivisor);
            }
        }
    }

    //Draws vector of drag-drop adding new object
    private newObjectDirectionVector(): void {
        if (this.shouldDrawDirectionVector) {
            this._canvas.drawLineNoOffset(this.object_vector_start_x, this.object_vector_start_y,
                this.object_vector_direction_x, this.object_vector_direction_y,
                0.2, "red");

            //draw actual object to be launched
            this._canvas.drawObjectNoOffset(this.object_vector_start_x, this.object_vector_start_y,
                (this.uiControls.gravitationalObjectSelection.diameter / 2) / this._sizeDivisor, this.uiControls.gravitationalObjectSelection.color);

            //draw direction indicator
            this._canvas.drawObjectNoOffset(this.object_vector_direction_x, this.object_vector_direction_y,
                this.VECTOR_DIRECTION_BALL_r / this._sizeDivisor, "red");
        }
    }

    private beginAddingNewGravitationalObject(coordinates: Coordinates): void {
        this.shouldDrawDirectionVector = true;

        this.object_vector_start_x = coordinates.x;
        this.object_vector_start_y = coordinates.y;

        this.object_vector_direction_x = this.object_vector_start_x;
        this.object_vector_direction_y = this.object_vector_start_y;
    }

    private onAddingNewGravitationalObject(coordinates: Coordinates): void {
        this.object_vector_direction_x = coordinates.x;
        this.object_vector_direction_y = coordinates.y;
    }

    private completeAddingNewGravitationalObject(): void {
        this.shouldDrawDirectionVector = false;
        this.insertNewObjectIntoTheSimulation();
    }


//Inserts a UI selected object into the simulation, calculating direction ad speed proportional to the created drag & drop vector
    private insertNewObjectIntoTheSimulation(): void {
        //substracting start x and y from direction x and y to get 0.0 to x.y,
        //have in mind that coordinate system starts from X0/Y0 therefore always X >0 & Y >0 and it is OK to substract coordinates like this
        let polarCoordinates = cartesianToPolar(this.object_vector_direction_x - this.object_vector_start_x, this.object_vector_direction_y - this.object_vector_start_y);

        let v = (polarCoordinates.r * this._newBodyVelocityMultiplier); //linear progression of velocity based on vector length (needs to be figured out properly)

        const selectedObject = this.uiControls.gravitationalObjectSelection;

        let newObj =
            {
                color: selectedObject.color,
                diameter: selectedObject.diameter,
                //substracting offset because adding it when rendering
                x: (this.object_vector_start_x - this._canvas.offsetX) * this._distanceDivisor,
                y: (this.object_vector_start_y - this._canvas.offsetY) * this._distanceDivisor,
                v_x: v * Math.cos(polarCoordinates.t),
                v_y: v * Math.sin(polarCoordinates.t),
                mass: selectedObject.mass
            }

        this.object_vector_direction_x =
            this.object_vector_start_x =
                this.object_vector_direction_y =
                    this.object_vector_start_y = 0;

        this.gravityEngine.gravitationalObjects.push(newObj);
    }

    public resetSimulation(): void {
        this._canvas.clearCanvas();
        this._canvas.initXYAxis();
        this.isRunning = true;
        this.tracesEnabled = false;
        this.gravityEngine.clearTracesStack();

        this.gravityEngine.objectsTrajectoryStackSize = 181;

        this.elapsedSimulationTimePerSecond = SECONDS_PER_DAY; //86400 secs = 1 day

        this.elapsedSimulationDays = 0;
        this.gravityEngine.gravitationalObjects = [];

        this.gravityEngine.staticObjectsEnabled = false;
        this.selectedObjectForStatsIndex = -1;
        this.gravityEngine.collisionEnabled = false;
        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = false;
    }

}