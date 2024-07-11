import {AnimationEngine} from "./src/engine/animation-engine";
import {UiControls} from "./src/ui/ui-controls";
export * from "./src/ui/ui-controls";
(window as any).uiControls = new UiControls();
window.onload = function ()
{
    // invertCanvasAxis();
    //
    // initXYAxis();
    //
    // selectObject('moon');
    //
    // planetaryMode();

    loadAnimationEngine();
}

function loadAnimationEngine(): void
{
    let animationEngine = new AnimationEngine();
    animationEngine.setAnimationFrameCallback(animate);

    animationEngine.start();
}
let accumulatedTimeUpdateFps = 0;

function animate(): void{

    if(accumulatedTimeUpdateFps < 0.5){
        accumulatedTimeUpdateFps += this.delta_time;
    }else{
        accumulatedTimeUpdateFps = 0;
        console.log("FPS: " + Math.round(this.fps));
    }
}