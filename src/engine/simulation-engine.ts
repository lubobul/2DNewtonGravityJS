import {AnimationEngine} from "./animation-engine";
import {Canvas} from "../ui/canvas";
import {UiControls} from "../ui/ui-controls";
import {GravityEngine} from "./gravity-engine";
import {SECONDS_PER_DAY} from "./constants";
import {Coordinates} from "../ui/types";
import {cartesianToPolar} from "../utils/math";

export class SimulationEngine {
    get tracesEnabled(): boolean {
        return this._tracesEnabled;
    }

    set tracesEnabled(value: boolean) {
        this._tracesEnabled = value;
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    set isRunning(isRunning: boolean) {
        this._isRunning = isRunning;
    }

    get elapsedSimulationTimePerSecond(): number {
        return this._elapsedSimulationTimePerSecond;
    }

    set elapsedSimulationTimePerSecond(value: number) {
        this._elapsedSimulationTimePerSecond = value;
    }

    private _elapsedSimulationTimePerSecond: number = 86400; //86400 secs = 1 day
    private _isRunning = false;
    private _tracesEnabled = false;
    private elapsedSimulationDays = 0;
    private distanceDivisor: number = 1000000; //TODO Change this when selecting different objects
    private sizeDivisor: number = 1000000; //TODO Change this when selecting different objects
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
        private canvas: Canvas,
        private uiControls: UiControls,
        private gravityEngine: GravityEngine,
    ) {
        this.canvas.onMouseRightClick = this.canvasRightClick.bind(this);
        this.canvas.onMouseLeftClick = this.canvasLeftClick.bind(this);
        this.canvas.onMouseLeftClickUp = this.canvasLeftClickUp.bind(this);
        this.canvas.onMouseMove = this.canvasMouseMove.bind(this);
        this.animationEngine.setAnimationFrameCallback(this.tick.bind(this));
    }

    public start(): void {
        this.animationEngine.start();
        this.isRunning = true;
    }

    public tick(): void {
        this.canvas.resizeCanvasToFitContainer();

        this.uiControls.updateFps(this.animationEngine.fps, this.animationEngine.delta_time);

        // t - time between calculting new positions
        const simulationDeltaTime = this.elapsedSimulationTimePerSecond * this.animationEngine.delta_time;

        this.canvas.clearCanvas();
        //TODO move this to new layer with alpha(canvas)
        this.canvas.initXYAxis();

        //That's where all dynamic calculations occur, called in a specific order
        if (this._isRunning) {
            ////Takes a lot of CPU - enable only for a single object...
            ////attempting to get long traces when slower
            if (this._tracesEnabled) {
                this.gravityEngine.updateObjectsTrajectoryStack();
            }

            this.gravityEngine.calculateMultipleObjects(simulationDeltaTime);

            this.elapsedSimulationDays += (this.animationEngine.delta_time * this.elapsedSimulationTimePerSecond) / SECONDS_PER_DAY;
        }

        this.drawObjectsInTheSimulation();
        this.uiControls.updateDays(this.elapsedSimulationDays);

        if (this.selectedObjectForStatsIndex > -1) {
            this.uiControls.updateObjectStats(this.gravityEngine.gravitationalObjects[this.selectedObjectForStatsIndex]);
        }

        if (this._tracesEnabled) {
            this.drawTraces();
        }

        this.newObjectDirectionVector();
    }

    private drawObjectsInTheSimulation(): void {
        for (let objects_i = 0, len_object = this.gravityEngine.gravitationalObjects.length; objects_i < len_object; objects_i++) {
            let object_to_draw = this.gravityEngine.gravitationalObjects[objects_i];
            this.canvas.drawObjectWithOffset(object_to_draw.x / this.distanceDivisor, object_to_draw.y / this.distanceDivisor, (object_to_draw.diameter / 2) / this.sizeDivisor, object_to_draw.color);
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
                Math.pow(((this.gravityEngine.gravitationalObjects[i].x / this.distanceDivisor) - (coordinates.x - this.canvas.offsetX)), 2) +
                Math.pow(((this.gravityEngine.gravitationalObjects[i].y / this.distanceDivisor) - (coordinates.y - this.canvas.offsetY)), 2)
            );

            if (r <= (this.gravityEngine.gravitationalObjects[i].diameter / this.sizeDivisor) / 2 + 1) {
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
            this.canvas.ctx.fillStyle = "rgba(0,0,0," + alpha + ")"; //dim trace at tail

            //Trace
            let trace = this.gravityEngine.objectsTrajectoriesStack[i];
            //Objects
            for (let j = 0, len_j = trace.length; j < len_j; j++) {
                this.canvas.drawPixel(trace[j].x / this.distanceDivisor, trace[j].y / this.distanceDivisor);
            }
        }
    }

    //Draws vector of drag-drop adding new object
    private newObjectDirectionVector(): void {
        if (this.shouldDrawDirectionVector) {
            this.canvas.drawLineNoOffset(this.object_vector_start_x, this.object_vector_start_y,
                this.object_vector_direction_x, this.object_vector_direction_y,
                0.2, "red");

            //draw actual object to be launched
            this.canvas.drawObjectNoOffset(this.object_vector_start_x, this.object_vector_start_y,
                (this.uiControls.gravitationalObjectSelection.diameter / 2) / this.sizeDivisor, this.uiControls.gravitationalObjectSelection.color);

            //draw direction indicator
            this.canvas.drawObjectNoOffset(this.object_vector_direction_x, this.object_vector_direction_y,
                this.VECTOR_DIRECTION_BALL_r / this.sizeDivisor, "red");
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

    private new_object_velocity_factor = 50;

//Inserts a UI selected object into the simulation, calculating direction ad speed proportional to the created drag & drop vector
    private insertNewObjectIntoTheSimulation(): void {
        //substracting start x and y from direction x and y to get 0.0 to x.y,
        //have in mind that coordinate system starts from X0/Y0 therefore always X >0 & Y >0 and it is OK to substract coordinates like this
        let polarCoordinates = cartesianToPolar(this.object_vector_direction_x - this.object_vector_start_x, this.object_vector_direction_y - this.object_vector_start_y);

        let v = (polarCoordinates.r * this.new_object_velocity_factor); //linear progression of velocity based on vector length (needs to be figured out properly)

        const selectedObject = this.uiControls.gravitationalObjectSelection;

        let newObj =
            {
                color: selectedObject.color,
                diameter: selectedObject.diameter,
                //substracting offset because adding it when rendering
                x: (this.object_vector_start_x - this.canvas.offsetX) * this.distanceDivisor,
                y: (this.object_vector_start_y - this.canvas.offsetY) * this.distanceDivisor,
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

}