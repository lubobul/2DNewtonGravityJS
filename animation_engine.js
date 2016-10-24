window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function AnimationEngine() {

    var animate_callback;
    var prev_time_log = undefined;
    var running = true;

    var scope = {
    
        Animate: function (callback) {
            animate_callback = callback;
        },

        Start: function () 
        { 
            running = true;
            Animate(); 
        },

        Stop: function ()
        {
            running = false;
        }
    }

    scope.fps = 0;
    scope.delta_time = 0;
    
    function Animate() {
    
        if (!prev_time_log) {
            prev_time_log = new Date().getTime();
    
            requestAnimFrame(function () {
                Animate();
    
            });
    
            return;
        }
    
        scope.delta_time = (new Date().getTime() - prev_time_log) / 1000;
    
        prev_time_log = new Date().getTime()
    
        //calc fps
        scope.fps = 1 / scope.delta_time;
    
        animate_callback();
    
        if (running) {
            requestAnimFrame(function () {
                Animate();
            });
        }
    }

    return scope;
}