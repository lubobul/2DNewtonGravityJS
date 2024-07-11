export class AnimationEngine {
    private animationFrameCallback: Function = null;
    private requestAnimationFrame: (callBack: Function) => void;

    private previousTimeLog: number;
    private isRunning: boolean = true;
    public fps: number = 0;
    public delta_time = 0;

    /**
     * AnimationEngine's Constructor
     */
    constructor() {
        this.requestAnimationFrame = window.requestAnimationFrame ||
        //a fallback primitive function if none of the above are defined
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    }

    /**
     * Used to assign an animation frame callback method. Usually used for re-rendering changes between frames.
     * @param {*} callback 
     */
    public setAnimationFrameCallback(callback: Function): void {
        this.animationFrameCallback = callback;
    }

    /**
     * Starts the animation engine
     */
    public start(): void {
        this.isRunning = true;
        this.animate();
    }

    /**
     * Stops the animation engine
     */
    public stop(): void {
        this.isRunning = false;
    }

    /**
     * Main function
     */
    public animate(): void{
        if (!this.previousTimeLog) 
        {
            this.previousTimeLog = new Date().getTime();

            requestAnimationFrame(()=>{
                this.animate();  
            });

            return;
        }

        //calculate dt in seconds
        this.delta_time = (new Date().getTime() - this.previousTimeLog) / 1000;

        this.previousTimeLog = new Date().getTime();

        //calculate fps
        this.fps = 1 / this.delta_time;

        this.animationFrameCallback.call(this);

        if (this.isRunning) 
        {
            requestAnimationFrame(()=>{
                this.animate();  
            });
        }
    }
}