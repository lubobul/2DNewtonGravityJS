import {AnimationEngine} from "./engine/animation-engine";

export class FooBar{
    public name: string;
}

(function fooBar(){
    const bar = new FooBar();
    bar.name = "Testing typescript";
    console.log(bar);

    let animationEngine = new AnimationEngine();
    let accumulatedTimeUpdateFps = 0;
    animationEngine.setAnimationFrameCallback(() => {

        if(accumulatedTimeUpdateFps < 0.5){
            accumulatedTimeUpdateFps += animationEngine.delta_time;
        }else{
            accumulatedTimeUpdateFps = 0;
            console.log("FPS: " + Math.round(animationEngine.fps));
        }
    });

    animationEngine.start();
})();