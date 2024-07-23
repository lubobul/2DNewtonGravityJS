import {Body} from "../engine/types";
import {GravityEngine} from "../engine/gravity-engine";
import {SimulationEngine} from "../engine/simulation-engine";
import {BODIES, SECONDS_PER_DAY} from "../engine/constants";
import {degToRad} from "../utils/math";

export class UiControls {
    get gravitationalObjectSelection(): Body {
        return this._gravitationalObjectSelection;
    }

    private _gravitationalObjectSelection: Body = null;

    constructor(
        private gravityEngine: GravityEngine,
        public simulationEngine?: SimulationEngine,
    ) {
        this.selectObject("moon");
    }

    public about(): void {
        var popup = document.getElementById("popup");
        popup.style.display = 'block';
    }

    public closeAbout(): void {
        var popup = document.getElementById("popup");
        popup.style.display = 'none';
    }

//increase speed simulation by a factor of 2
    public faster(): void {
        this.simulationEngine.elapsedSimulationTimePerSecond *= 2;

        this.updateSpeedOfTime();
    }

//decrease speed simulation by a factor of 2
    public slower(): void {
        this.simulationEngine.elapsedSimulationTimePerSecond /= 2;

        this.updateSpeedOfTime();
    }

    public pauseUnpause(): void {
        if (this.simulationEngine.isRunning) {
            document.getElementById("pause-unpause").innerHTML = "Unpause";
        } else {
            document.getElementById("pause-unpause").innerHTML = "Pause";
        }

        this.simulationEngine.isRunning = !this.simulationEngine.isRunning;
    }

    public changeStaticObjectsState(): void {
        this.gravityEngine.staticObjectsEnabled = (document.getElementById("static-objects") as any).checked;

        if (this.gravityEngine.staticObjectsEnabled) {
            document.getElementById("static-objects-checkbox-label").innerHTML = "Enabled";
        } else {
            document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";
        }
    }

    public changeClampedDistanceState(): void {
        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = (document.getElementById("clamped-distance") as any).checked;

        if (this.gravityEngine.clampedDistanceBetweenObjectsEnabled) {
            document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";
        } else {
            document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";
        }
    }

    public changeTracesState(): void {
        this.simulationEngine.tracesEnabled = (document.getElementById("object-traces") as any).checked;

        this.gravityEngine.clearTracesStack();

        if (this.simulationEngine.tracesEnabled) {
            document.getElementById("object-traces-checkbox-label").innerHTML = "Enabled";
        } else {
            document.getElementById("object-traces-checkbox-label").innerHTML = "Disabled";
        }
    }

    public changeCollisionState(): void {
        this.gravityEngine.collisionEnabled = (document.getElementById("collision") as any).checked;

        if (this.gravityEngine.collisionEnabled) {
            document.getElementById("object-collision-checkbox-label").innerHTML = "Enabled";
        } else {
            document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";
        }
    }

    public hideTracesOption(): void {
        const popup = document.getElementById("traces-holder");
        popup.style.display = 'none';
    }

    public showTracesOption(): void {
        const popup = document.getElementById("traces-holder");
        popup.style.display = 'block';
    }

    public hideObjectStats(): void {
        const popup = document.getElementById("object-stats-holder");
        popup.style.display = 'none';
    }

    public showObjectStats(): void {
        const popup = document.getElementById("object-stats-holder");
        popup.style.display = 'block';
    }


    public resetUiControls(): void {
        document.getElementById("pause-unpause").innerHTML = "Pause";

        (document.getElementById("static-objects") as any).checked = false;
        document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";

        (document.getElementById("object-traces") as any).checked = false;

        (document.getElementById("clamped-distance") as any).checked = false;

        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";

        this.gravityEngine.collisionEnabled, (document.getElementById("collision") as any).checked = false;

        document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";

        this.hideObjectStats();

        //give time for UI to update
        setTimeout(this.updateSpeedOfTime.bind(this), 10);
    }

//Change selected object for adding it into the simulation via drag&drop
    public selectObject(value): void {
        if (value == 'earth') {
            this._gravitationalObjectSelection = BODIES.Earth;
        } else if (value == 'jupiter') {
            this._gravitationalObjectSelection = BODIES.Jupiter;
        } else if (value == 'sun') {
            this._gravitationalObjectSelection = BODIES.Sun;
        } else if (value == 'moon') {
            this._gravitationalObjectSelection = BODIES.Moon
        }
    }
    private accumulatedTimeUpdateFps: number = 1;

    public updateSimulationInfo(fps: number, daysElapsed: number, delta_time: number): void {
        if (this.accumulatedTimeUpdateFps < 0.1) {
            this.accumulatedTimeUpdateFps += delta_time;
        } else {
            this.accumulatedTimeUpdateFps = 0;
            this.updateFps(fps);
            this.updateDays(daysElapsed);
        }
    }

    private readonly fps_element = document.getElementById("fps");

//Update fps element
    public updateFps(fps: number): void {
        this.fps_element.innerHTML = "FPS: " + Math.round(fps);
    }


    private readonly days_element = document.getElementById("days");

//Update days element
    public updateDays(days: number): void {
        this.days_element.innerHTML = "Days: " + Math.round(days * 100) / 100;
    }

    private speed_element = document.getElementById("speed");

//Update speed element
    public updateSpeedOfTime(): void {
        this.speed_element.innerHTML = "Speed of time: " + this.simulationEngine.elapsedSimulationTimePerSecond + "x";
    }

    private readonly canvasHtmlElement = document.getElementById("canvas");
    private readonly objStatsWrapper = document.getElementById("object-stats-holder");
    private readonly objSpeedElement = document.getElementById("object-speed");
    private readonly objMassElement = document.getElementById("object-mass");

//Update object stats
    public updateObjectStats(body: Body): void {

        if(!body){
            this.hideObjectStats();
            return;
        }

        // Get the parent's offset
        var parentOffset = this.canvasHtmlElement.getBoundingClientRect();

        this.objSpeedElement.innerHTML = "Speed: " + Math.round(Math.sqrt(Math.pow(body.v_x, 2)
            + Math.pow(body.v_y, 2))) + "m/s";

        this.objMassElement.innerHTML = "Mass: " + body.mass + "kg";

        this.objStatsWrapper.style.left =
            (body.x / this.simulationEngine.distanceDivisor) +
            this.simulationEngine.canvas.offsetX +
            parentOffset.left +
            'px';
        this.objStatsWrapper.style.top =
            (body.y / this.simulationEngine.distanceDivisor * -1) +
            this.simulationEngine.canvas.offsetY +
            parentOffset.top +
            'px';
    }

    private reset_delegate = this.sandbox.bind(this);

    public  resetSimulation(): void {
        if(this.reset_delegate){
            this.reset_delegate();
        }
    }

    public sandbox(): void {
        this.showTracesOption();

        this.reset_delegate = this.sandbox.bind(this);

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY / 4;

        this.simulationEngine.newBodyVelocityMultiplier = 50;
        this.simulationEngine.distanceDivisor = 1000000;
        this.simulationEngine.sizeDivisor = 1000000;

        this.updateSpeedOfTime();
    }

    public planetaryMode(): void {

        this.showTracesOption();

        this.reset_delegate = this.planetaryMode.bind(this);

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.gravityEngine.objectsTrajectoryStackSize = 600;

        this.simulationEngine.distanceDivisor = 800000000;
        this.simulationEngine.sizeDivisor = 1000000;
        this.simulationEngine.newBodyVelocityMultiplier = 5000;

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY * 4;

        this.simulationEngine.tracesEnabled = true;

        (document.getElementById("object-traces") as any).checked = true;
        document.getElementById("object-traces-checkbox-label").innerHTML = "Enabled";


        //Sun
        let sun = {
            ...BODIES.Sun
        };

        //Mercury
        let mercury = {
            ...BODIES.Mercury,
            x: 0,
            y: 57910000000,
            v_x: 48000 * Math.cos(degToRad(0)),
            v_y: 48000 * Math.sin(degToRad(0)),
        }

        //Venus
        let venus = {
            ...BODIES.Venus,
            x: 0,
            y: 108200000000,
            v_x: 35020 * Math.cos(degToRad(0)),
            v_y: 35020 * Math.sin(degToRad(0)),
        }

        //Earth
        let earth = {
            ...BODIES.Earth,
            x: 0,
            y: 149600000000,
            v_x: 29800 * Math.cos(degToRad(0)),
            v_y: 29800 * Math.sin(degToRad(0)),
        }

        // //Moon
        // let body5 = {
        //     color: "grey",
        //     diameter: 2000000,
        //     x: 0,
        //     y: 149600000000 + 390000000,
        //     v_x: (29800 + 1022) * Math.cos(degToRad(0)),
        //     v_y: (29800 + 1022) * Math.sin(degToRad(0)),
        //     mass: 7.342 * Math.pow(10, 22)
        // }

        //mars
        let mars = {
            ...BODIES.Mars,
            x: 0,
            y: 227900000000,
            v_x: 24077 * Math.cos(degToRad(0)),
            v_y: 24077 * Math.sin(degToRad(0)),
        }

        //Jupiter
        // let body6 = {
        //     color: "orange",
        //     diameter: 139822000,
        //     x: 0,
        //     y: 778500000000,
        //     v_x: 13070 * Math.cos(degToRad(0)),
        //     v_y: 13070 * Math.sin(degToRad(0)),
        //     mass: 1.898 * Math.pow(10, 27)
        // }


        //Mercury to Jupiter real simulation
        this.gravityEngine.gravitationalObjects.push(sun);
        this.gravityEngine.gravitationalObjects.push(mercury);
        this.gravityEngine.gravitationalObjects.push(venus);
        this.gravityEngine.gravitationalObjects.push(earth);
        this.gravityEngine.gravitationalObjects.push(mars);

        this.updateSpeedOfTime();
    }

    public particles(): void {
        //this.hideTracesOption();

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = true;
        (document.getElementById("clamped-distance") as any).checked = true;

        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

        this.reset_delegate = this.particles.bind(this);

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY / 20;

        this.simulationEngine.distanceDivisor = 1000000;
        this.simulationEngine.sizeDivisor = 1000000;
        this.simulationEngine.newBodyVelocityMultiplier = 50;

        let obj_per_width = 25;
        let obj_per_height = 25;

        let new_particle: Body;

        for (let i = 1; i <= obj_per_width; i++)
        {
            for (let j = 1; j <= obj_per_height; j++)
            {
                new_particle = {
                    color: "black",
                    diameter: 3474000,
                    x: (((this.simulationEngine.canvas.width / obj_per_width) * i) - this.simulationEngine.canvas.offsetX) * this.simulationEngine.distanceDivisor,
                    y: (((this.simulationEngine.canvas.height / obj_per_height) * j) - this.simulationEngine.canvas.offsetY) * this.simulationEngine.distanceDivisor,
                    v_x: 0,
                    v_y: 0,
                    mass: 7.35 * Math.pow(10, 24)
                };

                this.gravityEngine.gravitationalObjects.push(new_particle);
            }
        }

        this.pauseUnpause();
    }

    public particles2(): void {
        //this.hideTracesOption();

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = true;

        (document.getElementById("clamped-distance") as any).checked = true;

        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

        this.reset_delegate = this.particles2.bind(this);

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY / 30;

        this.simulationEngine.distanceDivisor = 1000000;
        this.simulationEngine.sizeDivisor = 1000000;
        this.simulationEngine.newBodyVelocityMultiplier = 50;

        let obj_per_width = 25;
        let obj_per_height = 25;

        let new_particle: Body;

        for (let i = 1; i <= obj_per_width; i++)
        {
            for (let j = 1; j <= obj_per_height; j++)
            {
                new_particle = {
                    color: "black",
                    diameter: 2474000,
                    x: (((this.simulationEngine.canvas.width / 4 / obj_per_width) * i) - this.simulationEngine.canvas.offsetX / 4) * this.simulationEngine.distanceDivisor,
                    y: (((this.simulationEngine.canvas.height / 4 / obj_per_height) * j) - this.simulationEngine.canvas.offsetY / 4) * this.simulationEngine.distanceDivisor,
                    v_x: 0,
                    v_y: 0,
                    mass: 7.35 * Math.pow(10, 22)
                }

                this.gravityEngine.gravitationalObjects.push(new_particle);
            }
        }

        this.gravityEngine.gravitationalObjects.push({
            ...BODIES.Jupiter,
            v_x: 15950,
            v_y: 50,
            x: -217000000,
            y: 101000000
        });

        this.gravityEngine.gravitationalObjects.push({
            ...BODIES.Jupiter,
            v_x: -15950,
            v_y: 50,
            x: 234000000,
            y: -102000000
        });

        this.pauseUnpause();
    }

    public particles3(): void {

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = true;
        (document.getElementById("clamped-distance") as any).checked = true;

        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

        this.reset_delegate = this.particles3.bind(this);

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY / 40;

        this.simulationEngine.distanceDivisor = 1000000;
        this.simulationEngine.sizeDivisor = 1000000;
        this.simulationEngine.newBodyVelocityMultiplier = 50;

        let obj_per_width = 25;
        let obj_per_height = 25;

        let new_particle: Body;

        for (let i = 1; i <= obj_per_width; i++) {
            for (let j = 1; j <= obj_per_height; j++) {
                new_particle = {
                    color: "black",
                    diameter: 2474000,
                    x: (((this.simulationEngine.canvas.width / 4 / obj_per_width) * i) - this.simulationEngine.canvas.offsetX / 4) * this.simulationEngine.distanceDivisor,
                    y: (((this.simulationEngine.canvas.height / 4 / obj_per_height) * j) - this.simulationEngine.canvas.offsetY / 4) * this.simulationEngine.distanceDivisor,
                    v_x: 0,
                    v_y: 0,
                    mass: -7.35 * Math.pow(10, 22)
                }

                this.gravityEngine.gravitationalObjects.push(new_particle);
            }
        }

        this.gravityEngine.gravitationalObjects.push({
            ...BODIES.Jupiter,
            mass: BODIES.Jupiter.mass * -1,
            v_x: 15950,
            v_y: 50,
            x: -217000000,
            y: 101000000
        });

        this.gravityEngine.gravitationalObjects.push({
            ...BODIES.Jupiter,
            mass: BODIES.Jupiter.mass * -1,
            v_x: -15950,
            v_y: 50,
            x: 234000000,
            y: -102000000
        });

        this.pauseUnpause();
    }

    public particles4(): void {

        this.simulationEngine.resetSimulation();
        this.resetUiControls();

        this.gravityEngine.clampedDistanceBetweenObjectsEnabled = true;
        (document.getElementById("clamped-distance") as any).checked = true;

        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

        this.gravityEngine.collisionEnabled = true;
        (document.getElementById("collision") as any).checked = true;
        document.getElementById("object-collision-checkbox-label").innerHTML = "Enabled";

        this.reset_delegate = this.particles4.bind(this);

        this.simulationEngine.elapsedSimulationTimePerSecond = SECONDS_PER_DAY / 30;

        this.simulationEngine.distanceDivisor = 1000000;
        this.simulationEngine.sizeDivisor = 1000000;
        this.simulationEngine.newBodyVelocityMultiplier = 50;

        let obj_per_width = 25;
        let obj_per_height = 25;

        let new_particle: Body;

        for (let i = 1; i <= obj_per_width; i++) {
            for (let j = 1; j <= obj_per_height; j++) {
                new_particle = {
                    color: "black",
                    diameter: 2474000,
                    x: (((this.simulationEngine.canvas.width / 4 / obj_per_width) * i) - this.simulationEngine.canvas.offsetX / 4) * this.simulationEngine.distanceDivisor,
                    y: (((this.simulationEngine.canvas.height / 4 / obj_per_height) * j) - this.simulationEngine.canvas.offsetY / 4) * this.simulationEngine.distanceDivisor,
                    v_x: 0,
                    v_y: 0,
                    mass: 7.35 * Math.pow(10, 22)
                }

                this.gravityEngine.gravitationalObjects.push(new_particle);
            }
        }

        this.gravityEngine.gravitationalObjects.push({
            ...BODIES.Jupiter,
            mass: BODIES.Jupiter.mass,
            v_x: 0,
            v_y: 0,
            x: 0,
            y: 0
        });

        setTimeout(() => {
            this.gravityEngine.gravitationalObjects.forEach((body)=> {
                body.mass *= -1;
            });
            this.pauseUnpause();

        }, 100);

    }
}
