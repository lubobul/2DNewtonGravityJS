window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function AnimationEngine() {

    this.animate_callback = undefined;
    this.prev_time_log = undefined;
    this.running = true;

    this.fps = 0;
    this.delta_time = 0;
}

AnimationEngine.prototype.SetAnimateCallback = function(callback)
{
    this.animate_callback = callback;
}

AnimationEngine.prototype.Start = function()
{
    this.running = true;
    this.Animate();
}

AnimationEngine.prototype.Stop = function()
{
    this.running = false;
}

AnimationEngine.prototype.Animate = function()
{
    var _this = this;
    
     if (!this.prev_time_log) {
            this.prev_time_log = new Date().getTime();
    
            requestAnimFrame(function () {
                _this.Animate();  
            });
    
            return;
        }
    
        this.delta_time = (new Date().getTime() - this.prev_time_log) / 1000;
    
        this.prev_time_log = new Date().getTime()
    
        //calc fps
        this.fps = 1 / this.delta_time;
    
        this.animate_callback();
    
        if (this.running) {
            requestAnimFrame(function () {
                _this.Animate();
            });
        }
}