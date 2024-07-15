import {AnimationEngine} from "./src/engine/animation-engine";
import {UiControls} from "./src/ui/ui-controls";
import {GravityEngine} from "./src/engine/gravity-engine";
import {SimulationEngine} from "./src/engine/simulation-engine";
import {Canvas} from "./src/ui/canvas";
export * from "./src/ui/ui-controls";


window.onload = () => {
    const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    const canvasHolder = document.getElementsByClassName('canvas-holder')[0];

    const gravityEngine = new GravityEngine();
    const uiControls = new UiControls(gravityEngine);
    (window as any).uiControls = uiControls;

    const simulationEngine = new SimulationEngine(
        new AnimationEngine(),
        new Canvas(
            canvas,
            canvasHolder
        ),
        uiControls,
        gravityEngine,
    );

    uiControls.simulationEngine = simulationEngine;
    uiControls.sandbox();

    simulationEngine.start();
}