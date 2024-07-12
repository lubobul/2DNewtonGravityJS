import {Body} from "../engine/types";
import {GravityEngine} from "../engine/gravity-engine";
import {SimulationEngine} from "../engine/simulation-engine";

export class UiControls{
    get gravitationalObjectSelection(): Body {
        return this._gravitationalObjectSelection;
    }

    private _gravitationalObjectSelection: Body = null;

    constructor(
        private gravityEngine: GravityEngine,
        public simulationEngine?: SimulationEngine,
    ) {
        this.selectObject("earth");
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
    public faster(): void{
        this.simulationEngine.elapsedSimulationTimePerSecond *= 2;

        this.updateSpeed();
    }

//decrease speed simulation by a factor of 2
    public slower(): void {
        this.simulationEngine.elapsedSimulationTimePerSecond /= 2;

        this.updateSpeed();
    }

    public  pauseUnpause(): void {
        if (this.simulationEngine.isRunning){
            document.getElementById("pause-unpause").innerHTML = "Unpause";
        } else {
            document.getElementById("pause-unpause").innerHTML = "Pause";
        }

        this.simulationEngine.isRunning = !this.simulationEngine.isRunning;
    }

    // var reset_delegate = sandbox;
    //
    // public  resetSimulation(): void {
    //     if(reset_delegate)
    //         reset_delegate.call();
    // }
    //
    // public  changeStaticObjectsState(): void {
    //     areStaticObjectsOn = document.getElementById("static-objects").checked;
    //
    //     if (areStaticObjectsOn)
    //     {
    //         document.getElementById("static-objects-checkbox-label").innerHTML = "Enabled";
    //     }
    //     else
    //     {
    //         document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";
    //     }
    // }
    //
    // public  changeClampedDistanceState(): void {
    //     isDistanceBetweenObjectsClamped = document.getElementById("clamped-distance").checked;
    //
    //     if (isDistanceBetweenObjectsClamped) {
    //         document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";
    //     }
    //     else {
    //         document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";
    //     }
    // }

    // public  changeTracesState(): void {
    //     areTracesOn = document.getElementById("object-traces").checked;
    //
    //     objectTraceStack = [];
    //
    //     if (areTracesOn)
    //     {
    //         document.getElementById("object-traces-checkbox-label").innerHTML = "Enabled";
    //     }
    //     else
    //     {
    //         document.getElementById("object-traces-checkbox-label").innerHTML = "Disabled";
    //     }
    // }

    // public  changeCollisionState(): void {
    //     isColisionModeOn = document.getElementById("collision").checked;
    //
    //     if (isColisionModeOn)
    //     {
    //         document.getElementById("object-collision-checkbox-label").innerHTML = "Enabled";
    //     }
    //     else
    //     {
    //         document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";
    //     }
    // }

    public  hideTracesOption(): void {
        var popup = document.getElementById("traces-holder");
        popup.style.display = 'none';
    }

    public  showTracesOption(): void {
        var popup = document.getElementById("traces-holder");
        popup.style.display = 'block';
    }

    public  hideObjectStats(): void {
        var popup = document.getElementById("object-stats-holder");
        popup.style.display = 'none';
    }

    public  showObjectStats(): void {
        var popup = document.getElementById("object-stats-holder");
        popup.style.display = 'block';
    }


    // public  resetUiControls(): void {
    //     document.getElementById("pause-unpause").innerHTML = "Pause";
    //
    //     (document.getElementById("static-objects") as any).checked = false;
    //     document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";
    //
    //     (document.getElementById("object-traces") as any).checked = false;
    //
    //     (document.getElementById("clamped-distance") as any).checked = false;
    //
    //     document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";
    //
    //     isColisionModeOn, document.getElementById("collision").checked = false;
    //
    //     document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";
    //
    //     hideObjectStats();
    //
    //     //give time for UI to update
    //     setTimeout(updateSpeed, 10);
    // }

//Change selected object for adding it into the simulation via drag&drop
    public  selectObject(value) : void {
        if (value == 'earth') {
            this._gravitationalObjectSelection = {
                color: "blue",
                diameter: 12742000,
                //substracting offset because adding it when rendering
                x: 0,
                y: 0,
                v_x: 0,
                v_y: 0,
                mass: 5.972 * Math.pow(10, 24)
            }

        }
        else if (value == 'jupiter') {
            this._gravitationalObjectSelection = {
                color: "orange",
                diameter: 139822000 / 10,
                //substracting offset because adding it when rendering
                x: 0,
                y: 0,
                v_x: 0,
                v_y: 0,
                mass: 1.898 * Math.pow(10, 27)
            }
        }
        else if (value == 'sun') {
            this._gravitationalObjectSelection = {
                color: "yellow",
                diameter: 1391400000 / 30,
                //substracting offset because adding it when rendering
                x: 0,
                y: 0,
                v_x: 0,
                v_y: 0,
                mass: 1.989 * Math.pow(10, 30)
            }
        } else if (value == 'moon') {
            this._gravitationalObjectSelection = {
                color: "grey",
                diameter: 3474000,
                //substracting offset because adding it when rendering
                x: 0,
                y: 0,
                v_x: 0,
                v_y: 0,
                mass: 7.342 * Math.pow(10, 22)
            }
        }
    }

    private readonly fps_element = document.getElementById("fps");
    private accumulatedTimeUpdateFps: number = 1;
//Update fps element
    public updateFps(fps: number, delta_time: number): void {
        if(this.accumulatedTimeUpdateFps < 0.5){
            this.accumulatedTimeUpdateFps += delta_time;
        }else{
            this.accumulatedTimeUpdateFps = 0;
            this.fps_element.innerHTML = "FPS: " + Math.round(fps);
        }
    }

    private  readonly days_element = document.getElementById("days");
//Update days element
    public updateDays(days: number): void {
        this.days_element.innerHTML = "Days: " + Math.round(days * 100) / 100;
    }

    private speed_element = document.getElementById("speed");
//Update speed element
    public updateSpeed(): void {
        this.speed_element.innerHTML = "Speed: " + this.simulationEngine.elapsedSimulationTimePerSecond + "x";
    }

    private readonly obj_velocity_x_element = document.getElementById("object-velocity-x");
    private readonly  obj_velocity_y_element = document.getElementById("object-velocity-y");
    private readonly  obj_speed_element = document.getElementById("object-speed");

//Update object stats
    public updateObjectStats(body: Body): void {
        this.obj_velocity_x_element.innerHTML = "Velocity X: " + Math.round(body.v_x) + "m/s";
        this.obj_velocity_y_element.innerHTML = "Velocity Y: " + Math.round(body.v_y) + "m/s";
        this.obj_speed_element.innerHTML = "Speed: " + Math.round(Math.sqrt(Math.pow(body.v_x, 2)
            + Math.pow(body.v_y, 2))) + "m/s";
    }
}
