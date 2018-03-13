'use strict'

window.onload = function ()
{
    invertCanvasAxis();

    offsetX = canvas.width / 2;
    offsetY = canvas.height / 2;

    initXYAxis();

    selectObject('moon');

    planetaryMode();

    loadAnimationEngine();
}

var animationEngine;

function loadAnimationEngine()
{
    animationEngine = new AnimationEngine();

    animationEngine.setAnimationFrameCallback(animate);

    animationEngine.start();
}

//Ui controls

function about()
{
    var popup = document.getElementById("popup");
    popup.style.display = 'block';
}

function closeAbout()
{
    var popup = document.getElementById("popup");
    popup.style.display = 'none';
}

//increase speed simulation by a factor of 2
function faster()
{
    elapsedTimeInRealLifePerSec *= 2;

    updateSpeed();
}

//decrease speed simulation by a factor of 2
function slower()
{
    elapsedTimeInRealLifePerSec /= 2;

    updateSpeed();
}

function pauseUnpause()
{
    if (isSimulationRunning)
        document.getElementById("pause-unpause").innerHTML = "Unpause";
    else
        document.getElementById("pause-unpause").innerHTML = "Pause";

    isSimulationRunning = !isSimulationRunning;
}

var reset_delegate = sandbox;

function resetSimulation()
{
    if(reset_delegate)
        reset_delegate.call();
}

function changeStaticObjectsState()
{
    static_objects_state = document.getElementById("static-objects").checked;

    if (static_objects_state)
    {
        document.getElementById("static-objects-checkbox-label").innerHTML = "Enabled";
    }
    else
    {
        document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";
    }
}

function changeClampedDistanceState()
{
    is_distance_between_objects_clamped = document.getElementById("clamped-distance").checked;

    if (is_distance_between_objects_clamped) {
        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";
    }
    else {
        document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";
    }
}

function changeTracesState()
{
    traceIsOn = document.getElementById("object-traces").checked;

    objectTraceStack = [];

    if (traceIsOn)
    {
        document.getElementById("object-traces-checkbox-label").innerHTML = "Enabled";
    }
    else
    {
        document.getElementById("object-traces-checkbox-label").innerHTML = "Disabled";
    }
}

function changeCollisionState()
{
    is_colision_mode_on = document.getElementById("collision").checked;

    if (is_colision_mode_on)
    {
        document.getElementById("object-collision-checkbox-label").innerHTML = "Enabled";
    }
    else
    {
        document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";
    }
}

function hideTracesOption()
{
    var popup = document.getElementById("traces-holder");
    popup.style.display = 'none';
}

function showTracesOption()
{
    var popup = document.getElementById("traces-holder");
    popup.style.display = 'block';
}

function hideObjectStats()
{
    var popup = document.getElementById("object-stats-holder");
    popup.style.display = 'none';
}

function showObjectStats()
{
    var popup = document.getElementById("object-stats-holder");
    popup.style.display = 'block';
}


function resetUiControls()
{
    document.getElementById("pause-unpause").innerHTML = "Pause";

    document.getElementById("static-objects").checked = false;
    document.getElementById("static-objects-checkbox-label").innerHTML = "Disabled";

    document.getElementById("object-traces").checked = false;

    document.getElementById("clamped-distance").checked = false;

    document.getElementById("clamped-distance-checkbox-label").innerHTML = "Disabled";

    is_colision_mode_on, document.getElementById("collision").checked = false;

    document.getElementById("object-collision-checkbox-label").innerHTML = "Disabled";

    hideObjectStats();

    //give time for UI to update
    setTimeout(updateSpeed, 10);
}

var selected_object = undefined;

//Change selected object for adding it into the simulation via drag&drop
function selectObject(value)
{
    if (value == 'earth') {
        selected_object = {
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
        selected_object = {
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
        selected_object = {
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
        selected_object = {
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

//utill

//Degrees to radians
function degToRad(deg)
{
    return (Math.PI / 180) * deg;
}

//Cartesian to polar coordinates
function cartesianToPolar(x, y)
{
    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var t = Math.atan2(y, x);

    return { r, t }
}

//Canvas Mouse controls
var offsetX = 0;
var offsetY = 0;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

//Get Canvas Coordinates on click
canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);

//Gets the coordinates of a click over the canvas ( will be used in future for object creation, drag and drop etc.)
function mouseDown(e)
{
    if (e.button === 2)
    { //right click 
        showStatsForObject(e);
    }
    else
    {
        shouldDrawDirectionVector = true;

        let coordinates = getMouseCoordinates(e);
        object_vector_start_x = coordinates.x;
        object_vector_start_y = coordinates.y;

        object_vector_direction_x = object_vector_start_x;
        object_vector_direction_y = object_vector_start_y;

        canvas.addEventListener("mousemove", mouseMove, false);
    }
}

function mouseUp(e) {
    if (e.button === 2)
    { 
        //right click
    } else
    {
        shouldDrawDirectionVector = false;
        canvas.removeEventListener("mousemove", mouseMove, false);
        insertNewObjectIntoTheSimulation();
    }
}

function mouseMove(e) {

    let coordinates = getMouseCoordinates(e);

    object_vector_direction_x = coordinates.x;
    object_vector_direction_y = coordinates.y;
}

function getMouseCoordinates(e)
{
    var x;
    var y;

    if (e.pageX || e.pageY)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= c.offsetLeft;
    y -= c.offsetTop;

    y = c.height - y; //invert y axis (click coordinates are not affected when inverting canvas axis)


    return {x, y}
}

//Invert canvas
function invertCanvasAxis()
{
    ctx.transform(1, 0, 0, -1, 0, canvas.height);
}

//Draw a line from posX,posY to posXto, posYto with offset
function drawPixel(x, y)
{
    ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
}

//Draw a line from posX,posY to posXto, posYto without offset
function drawLineNoOffset(posX, posY, posXto, posYto, lineWidth, lineColor, lineDash)
{
    if(lineDash)
    {
        ctx.setLineDash(lineDash);
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(posXto, posYto);
    ctx.closePath();
    ctx.stroke();
    //restore
    ctx.setLineDash([0, 0]);
}

function drawObjectWithOffset(posX, posY, radius, color)
{
    drawObject(posX + offsetX, posY + offsetY, radius, color);
}

function drawObjectNoOffset(posX, posY, radius, color)
{
    drawObject(posX, posY, radius, color);
}

//Draws an oval object
function drawObject(posX, posY, radius, color)
{
    ctx.beginPath();
    ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

//Draws the X Y dahsed AXIS
function initXYAxis()
{
    drawLineNoOffset(0, canvas.height / 2, canvas.width, canvas.height / 2,
        0.5, "green", [0.5, 2.5]);
    drawLineNoOffset(canvas.width / 2, 0, canvas.width / 2, canvas.height,
        0.5, "green", [0.5, 2.5]);
}

var shouldDrawDirectionVector = false;

//Draws vector of drag-drop adding new object
function newObjectDirectionVector()
{
    if(shouldDrawDirectionVector)
    {
        drawLineNoOffset(object_vector_start_x, object_vector_start_y, 
            object_vector_direction_x, object_vector_direction_y,
            0.2, "red");
        
        //draw actual object to be launched
        drawObjectNoOffset(object_vector_start_x, object_vector_start_y, 
            (selected_object.diameter / 2) / size_factor, selected_object.color);
        
        //draw direction indicator
        drawObjectNoOffset(object_vector_direction_x, object_vector_direction_y, 
                (3474000 / 2) / size_factor, "red");
    }    
}

//Clears the canvas
function clearCanvas()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var fps_element = document.getElementById("fps");
//Update fps element
function updateFps(fps)
{
    fps_element.innerHTML = "FPS: " + Math.round(fps);
}

var days_element = document.getElementById("days");
//Update days element
function updateDays()
{
    days_element.innerHTML = "Days: " + Math.round(days * 100) / 100;
}

var speed_element = document.getElementById("speed");
//Update speed element
function updateSpeed()
{
    speed_element.innerHTML = "Speed: " + elapsedTimeInRealLifePerSec + "x";
}

var obj_velocity_x_element = document.getElementById("object-velocity-x");
var obj_velocity_y_element = document.getElementById("object-velocity-y");
var obj_speed_element = document.getElementById("object-speed");

//Update object stats
function updateObjectStats()
{
    obj_velocity_x_element.innerHTML = "Velocity X: " + Math.round(initObjects[selected_object_for_stats_index].v_x) + "m/s";
    obj_velocity_y_element.innerHTML = "Velocity Y: " + Math.round(initObjects[selected_object_for_stats_index].v_y) + "m/s";
    obj_speed_element.innerHTML = "Speed: " + Math.round(Math.sqrt(Math.pow(initObjects[selected_object_for_stats_index].v_x, 2)
        + Math.pow(initObjects[selected_object_for_stats_index].v_y, 2))) + "m/s";
}



var object_vector_direction_x = 0;
var object_vector_direction_y = 0;

var object_vector_start_x = 0;
var object_vector_start_y = 0;

//Keep this as a constant
var SECONDS_PER_DAY = 86400;

var distance_factor = 0; //Objects distance factor - 1 pix = 1 meter
var size_factor = 0; //Objects size factor - 1pix = 1 meter 

function planetaryMode()
{
  
    showTracesOption();

    reset_delegate = planetaryMode;

    clearSimulationVariables();

    TRACE_LENGTH = 600;

    distance_factor = 800000000;
    size_factor = 1000000;
    new_object_velocity_factor = 5000;

    //Sun
    var body1 = {
        color: "yellow",
        diameter: 1391400000/30,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 1.989 * Math.pow(10, 30)
    }

    //Mercury
    var body2 = {
        color: "grey",
        diameter: 4879000,
        x: 0,
        y: 57910000000,
        v_x: 48000 * Math.cos(degToRad(0)),
        v_y: 48000 * Math.sin(degToRad(0)),
        mass: 3.285 * Math.pow(10, 23)
    }

    //Venus
    var body3 = {
        color: "orange",
        diameter: 12104000,
        x: 0,
        y: 108200000000,
        v_x: 35020 * Math.cos(degToRad(0)),
        v_y: 35020 * Math.sin(degToRad(0)),
        mass: 4.867 * Math.pow(10, 24)
    }

    //Earth
    var body4 = {
        color: "blue",
        diameter: 12742000,
        x: 0,
        y: 149600000000,
        v_x: 29800 * Math.cos(degToRad(0)),
        v_y: 29800 * Math.sin(degToRad(0)),
        mass: 5.972 * Math.pow(10, 24)
    }

    //mars
    var body5 = {
        color: "red",
        diameter: 6779000,
        x: 0,
        y: 227900000000,
        v_x: 24077 * Math.cos(degToRad(0)),
        v_y: 24077 * Math.sin(degToRad(0)),
        mass: 6.39 * Math.pow(10, 23)
    }

    //Jupiter
    var body6 = {
        color: "orange",
        diameter: 139822000,
        x: 0,
        y: 778500000000,
        v_x: 13070 * Math.cos(degToRad(0)),
        v_y: 13070 * Math.sin(degToRad(0)),
        mass: 1.898 * Math.pow(10, 27)
    }


    //Mercury to Jupiter real simulation
    initObjects.push(body1);
    initObjects.push(body2);
    initObjects.push(body3);
    initObjects.push(body4);
    initObjects.push(body5);
    //initObjects.push(body6);

}

function sandbox()
{
    showTracesOption();

    reset_delegate = sandbox;

    clearSimulationVariables();

    elapsedTimeInRealLifePerSec = SECONDS_PER_DAY / 4;

    new_object_velocity_factor = 50;
    distance_factor = 1000000;
    size_factor = 1000000;
}

function particles()
{
    hideTracesOption();

    clearSimulationVariables();

    is_distance_between_objects_clamped = true;
    document.getElementById("clamped-distance").checked = true;

    document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

    reset_delegate = particles;

    elapsedTimeInRealLifePerSec = SECONDS_PER_DAY / 20;

    new_object_velocity_factor = 50;
    distance_factor = 1000000;
    size_factor = 1000000;

    var obj_per_width = 25;
    var obj_per_height = 25;

    var new_particle = {};

    for (var i = 1; i <= obj_per_width; i++)
    {
        for (var j = 1; j <= obj_per_height; j++)
        {
            new_particle = {
                color: "black",
                diameter: 3474000,
                x: (((canvas.width / obj_per_width) * i) - offsetX) * distance_factor,
                y: (((canvas.height / obj_per_height) * j) - offsetY) * distance_factor,
                v_x: 0,
                v_y: 0,
                mass: 7.35 * Math.pow(10, 24)
            }

            initObjects.push(new_particle);
        }
    }

    pauseUnpause();
}

function particles2()
{
    hideTracesOption();

    clearSimulationVariables();

    is_distance_between_objects_clamped = true;

    document.getElementById("clamped-distance").checked = true;

    document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

    reset_delegate = particles2;

    elapsedTimeInRealLifePerSec = SECONDS_PER_DAY / 30;

    new_object_velocity_factor = 50;
    distance_factor = 1000000;
    size_factor = 1000000;

    var obj_per_width = 25;
    var obj_per_height = 25;

    var new_particle = {};

    for (var i = 1; i <= obj_per_width; i++)
    {
        for (var j = 1; j <= obj_per_height; j++)
        {
            new_particle = {
                color: "black",
                diameter: 2474000,
                x: (((canvas.height / 4 / obj_per_width) * i) - offsetY / 4) * distance_factor,
                y: (((canvas.height / 4 / obj_per_height) * j) - offsetY / 4) * distance_factor,
                v_x: 0,
                v_y: 0,
                mass: 7.35 * Math.pow(10, 22)
            }

            initObjects.push(new_particle);
        }
    }

    initObjects.push({
    color : "orange",
    diameter: 13982200,
    mass : 1.898e+27,
    v_x: 15950,
    v_y: 50,
    x: -217000000,
    y: 101000000
    });

    initObjects.push({
        color: "orange",
        diameter: 13982200,
        mass: 1.898e+27,
        v_x: -15950,
        v_y: 50,
        x: 234000000,
        y: -102000000
    });

    pauseUnpause();
}

function particles3() {

    clearSimulationVariables();

    hideTracesOption();

    is_distance_between_objects_clamped = true;
    document.getElementById("clamped-distance").checked = true;

    document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

    reset_delegate = particles3;

    elapsedTimeInRealLifePerSec = SECONDS_PER_DAY / 40;

    new_object_velocity_factor = 50;
    distance_factor = 1000000;
    size_factor = 1000000;

    var obj_per_width = 25;
    var obj_per_height = 25;

    var new_particle = {};

    for (var i = 1; i <= obj_per_width; i++) {
        for (var j = 1; j <= obj_per_height; j++) {
            new_particle = {
                color: "black",
                diameter: 2474000,
                x: (((canvas.height / 4 / obj_per_width) * i) - offsetY / 4) * distance_factor,
                y: (((canvas.height / 4 / obj_per_height) * j) - offsetY / 4) * distance_factor,
                v_x: 0,
                v_y: 0,
                mass: -7.35 * Math.pow(10, 22)
            }

            initObjects.push(new_particle);
        }
    }

    initObjects.push({
        color: "orange",
        diameter: 13982200,
        mass: -1.898e+27,
        v_x: 45950,
        v_y: 50,
        x: -217000000,
        y: 101000000
    });

    initObjects.push({
        color: "orange",
        diameter: 13982200,
        mass: -1.898e+27,
        v_x: -45950,
        v_y: 50,
        x: 234000000,
        y: -102000000
    });

    pauseUnpause();
}

function particles4() {

    clearSimulationVariables();

    hideTracesOption();

    is_distance_between_objects_clamped = true;
    document.getElementById("clamped-distance").checked = true;

    document.getElementById("clamped-distance-checkbox-label").innerHTML = "Obj1.r + Obj2.r";

    document.getElementById("collision").checked = true;

    is_colision_mode_on = true;

    document.getElementById("object-collision-checkbox-label").innerHTML = "Enabled"; 

    reset_delegate = particles4;

    elapsedTimeInRealLifePerSec = SECONDS_PER_DAY / 30;

    new_object_velocity_factor = 50;
    distance_factor = 1000000;
    size_factor = 1000000;

    var obj_per_width = 25;
    var obj_per_height = 25;

    var new_particle = {};

    for (var i = 1; i <= obj_per_width; i++) {
        for (var j = 1; j <= obj_per_height; j++) {
            new_particle = {
                color: "black",
                diameter: 2474000,
                x: (((canvas.height / 4 / obj_per_width) * i) - offsetY / 4) * distance_factor,
                y: (((canvas.height / 4 / obj_per_height) * j) - offsetY / 4) * distance_factor,
                v_x: 0,
                v_y: 0,
                mass: -7.35 * Math.pow(10, 22)
            }

            initObjects.push(new_particle);
        }
    }

    initObjects.push({
        color: "orange",
        diameter: 13982200,
        mass: -1.898e+27,
        v_x: 0,
        v_y: 0,
        x: 0,
        y: 0
    });

    pauseUnpause();
}

//Reset simulation variables, including UI linked settings
function clearSimulationVariables()
{
    clearCanvas();
    initXYAxis();

    isSimulationRunning = true;

    traceIsOn = false;

    TRACE_LENGTH = 180;

    elapsedTimeInRealLifePerSec = 86400; //86400 secs = 1 day

    days = 0;
    addTracePoint = 0;
    initObjects = [];

    static_objects_state = false;
    statsAreOn = false;
    is_colision_mode_on = false;
    is_distance_between_objects_clamped = false;
    
    resetUiControls();
}

var isSimulationRunning = false;

var traceIsOn = false;
var statsAreOn = false;

//Change this to run simulation faster / slower
var elapsedTimeInRealLifePerSec = 86400; //86400 secs = 1 day
var days = 0;
var addTracePoint = 0;

//callback funtcion given to animation engine called once per frame
function animate()
{

    updateFps(animationEngine.fps);

    // t - time between calculting new positions
    t = elapsedTimeInRealLifePerSec * animationEngine.delta_time;

    clearCanvas();
    //TODO move this to new layer with alpha(canvas)
    initXYAxis();

    //That's where all dynamic calculations occur, called in a specific order
    if (isSimulationRunning)
    {
        ////Takes a lot of CPU - enable only for a single object...
        ////attempting to get long traces when slower
        if (traceIsOn) calculateTraces();

        calculateMultipleObjects();

        days += (animationEngine.delta_time * elapsedTimeInRealLifePerSec) / SECONDS_PER_DAY;
    }

    drawMultipleObejcts();
    updateDays();

    if(statsAreOn) updateObjectStats()

    if (traceIsOn) drawTraces();

    newObjectDirectionVector();
}

var alpha = 0.0;
var fraction;
var trace;

//Draw multiple traces, trace = [object][trace]
function drawTraces()
{
    alpha = 0.0;

    fraction = (0.3 / objectTraceStack.length);

    //Traces
    for (var i = 0, len = objectTraceStack.length; i < len; i++)
    {
        alpha += fraction;
        ctx.fillStyle = "rgba(0,0,0," + alpha + ")"; //dim trace at tail

        //Trace
        trace = objectTraceStack[i];
        //Objects
        for (var j = 0, len_j  = trace.length; j < len_j; j++)
        {
            drawPixel(trace[j].x, trace[j].y);
        }
    }
}

var objects_i, len_object;
var object_to_draw;
//draw multiple objects
function drawMultipleObejcts()
{
    for (objects_i = 0, len_object = initObjects.length; objects_i < len_object; objects_i++)
    {
        object_to_draw = initObjects[objects_i];
        drawObjectWithOffset(object_to_draw.x / distance_factor, object_to_draw.y / distance_factor, (object_to_draw.diameter / 2) / size_factor, object_to_draw.color);
    }
}

var selected_object_for_stats_index = 0;

//called once per right click on canvas, if object under mouse, select it to show stats, else hide stats
function showStatsForObject(e)
{
    var coordinates = getMouseCoordinates(e);

    var r = 0;

    for (var i = 0, len = initObjects.length; i < len; i++)
    {
        r = Math.sqrt(Math.pow(((initObjects[i].x / distance_factor) - (coordinates.x - offsetX)), 2) + Math.pow(((initObjects[i].y / distance_factor) - (coordinates.y - offsetY)), 2));

        if (r <= (initObjects[i].diameter / size_factor) / 2 + 1)
        {
            selected_object_for_stats_index = i;

            showObjectStats();
            statsAreOn = true;
            return;
        }
    }

    statsAreOn = false;
    hideObjectStats();
}

var new_object_velocity_factor = 1;

//Inserts a UI selected object into the simulation, calculating direction ad speed proportional to the created drag & drop vector
function insertNewObjectIntoTheSimulation()
{
    //substracting start x and y from direction x and y to get 0.0 to x.y,
    //have in mind that coordinate system starts from X0/Y0 therefore always X >0 & Y >0 and it is OK to substract coordinates like this
    var polar_coordinates = cartesianToPolar(object_vector_direction_x - object_vector_start_x, object_vector_direction_y - object_vector_start_y);

    var v = (polar_coordinates.r * new_object_velocity_factor); //linear progression of velocity based on vector length (needs to be figured out properly)

    var new_obj =
    {
        color: selected_object.color,
        diameter: selected_object.diameter,
        //substracting offset because adding it when rendering
        x: (object_vector_start_x - offsetX) * distance_factor,
        y: (object_vector_start_y - offsetY) * distance_factor,
        v_x: v * Math.cos(polar_coordinates.t),
        v_y: v * Math.sin(polar_coordinates.t),
        mass: selected_object.mass
    }

    object_vector_direction_x =
        object_vector_start_x =
        object_vector_direction_y =
        object_vector_start_y = 0;

    initObjects.push(new_obj);
}

var objectTraceStack = [];
//lenght of trace behind objects in number of kept calcukated positions
var TRACE_LENGTH = 180;

//calculate multiple traces
function calculateTraces()
{
    if (objectTraceStack.length > TRACE_LENGTH)
        objectTraceStack.shift(); //rem last

    var traces = [];

    for (var i = 0, len = initObjects.length; i < len; i++)
    {
        if (initObjects[i].v_x != 0 || initObjects[i].v_y != 0)
        {
            traces.push({
                x: initObjects[i].x / distance_factor,
                y: initObjects[i].y / distance_factor
            });
        }
    }

    objectTraceStack.push(traces);
}

var initObjects = [];

var tmp_F;
var currentObject;

//Net force mussed be calculated for each object compared to each of the rest of objects (sum of all forces applied to a particular object)
var net_F_x;
var net_F_y;
var new_objects = [];

var numOfObjects;

var static_objects_state = false;
var i;
var new_i;

//This is the main function for calculating N object interaction, called 1ce per frame
function calculateMultipleObjects()
{
    new_objects = [];

    numOfObjects = initObjects.length;

    for (i = 0; i < numOfObjects; i++)
    {
        currentObject = initObjects[i];

        if (currentObject != null)
        {
            net_F_x = 0;
            net_F_y = 0;
            tmp_F = undefined;

            //check if an object is static, skip calculations if true
            if (!static_objects_state || (((currentObject.v_x + currentObject.v_y) != 0) && static_objects_state))
            {
                calculateObjectInteraction(i);
            }

            new_objects.push(currentObject);

            initObjects[i] = currentObject;
        }
      
    }

    initObjects = [];

    for (new_i = 0; new_i < new_objects.length; new_i++)
    {
        if (new_objects[new_i] != null)
            initObjects.push(new_objects[new_i]);
    }
}

var j;
var secondObject = undefined;
var distance_bodies_0 = 0;
var distance_bodies_1 = 0;
var is_colision_mode_on = false;
var is_distance_between_objects_clamped = false;

var colided_objects = undefined;

//All object iteraction goes here
function calculateObjectInteraction(i)
{

    for (j = 0; j < numOfObjects; j++)
    {
        secondObject = initObjects[j];

        if (secondObject != null)
           {
            //Distance between movingBody / staticBody
            distance_bodies_0 = distance_bodies_1 = Math.sqrt(Math.pow((currentObject.x - secondObject.x), 2) + Math.pow((currentObject.y - secondObject.y), 2));

            //don't compare to self
            if (i != j) {

                //clamp closest distance between 2 objects
                if ((currentObject.diameter / 2 + secondObject.diameter / 2) > distance_bodies_0 && is_distance_between_objects_clamped)
                    distance_bodies_0 = (currentObject.diameter / 2) + (secondObject.diameter / 2);

                tmp_F = calcForce2Bodies(currentObject, secondObject, distance_bodies_0);

                //calculate netforce for object i
                net_F_x += tmp_F.F_x;
                net_F_y += tmp_F.F_y;

                //Colision
                if (is_colision_mode_on)
                {
                    if (currentObject.mass < secondObject.mass)
                    {
                        colided_objects = calculateCollision(secondObject, currentObject, distance_bodies_1);

                        if (colided_objects != null)
                        {
                            currentObject = colided_objects.smallBody;
                            secondObject = colided_objects.bigBody;
                        }
                    }
                    else
                    {
                        colided_objects = calculateCollision(currentObject, secondObject, distance_bodies_1);

                        if (colided_objects != null)
                        {
                            secondObject = colided_objects.smallBody;
                            currentObject = colided_objects.bigBody;
                        }
                    }

                    initObjects[j] = secondObject;

                    if (currentObject == null)
                    {
                        return;
                    }
                }
            }
        }
    }

    currentObject = calcCoordinates2Bodies(currentObject, net_F_x, net_F_y);
}

//Calculate if collision occurs, transfer mass and size if so
function calculateCollision(bigBody, smallBody, distance)
{
    //checking out if collision occured r0 + r1 < distance
    if ((bigBody.diameter / 2 + smallBody.diameter / 2) < distance) return null;

    let affected_radius = 0;

    if (bigBody.diameter < distance) //center of small circle is outside the big circle
    {
        affected_radius = Math.abs(distance - ((smallBody.diameter / 2) + (bigBody.diameter / 2)));
    }
    else if(distance + smallBody.diameter/2 <= bigBody.diameter/2) //the whole small one is inside the big one
    {
        affected_radius = smallBody.diameter;
    }
    else// the center of the small is inside the big, but portion of it is outside
    {
        affected_radius = Math.abs(((bigBody.diameter / 2) - distance) + (smallBody.diameter / 2));
    }

    let affected_body_factor = affected_radius / smallBody.diameter;

    let mass_to_transfer = smallBody.mass * affected_body_factor;

    if (affected_body_factor >= 1.0) //if smallBody has been eaten, set it to null so we avoid negative radiuses, it is later removed from the simulation
    {
        bigBody.mass = bigBody.mass + smallBody.mass;
        smallBody = null;
    }
    else
    {
        bigBody.mass = bigBody.mass + mass_to_transfer;
        smallBody.mass = smallBody.mass - mass_to_transfer;
        smallBody.diameter = smallBody.diameter - affected_radius;
    }

    //Diameter exchange from small ot big body limited to affected_radius/ 2log(affected_radius)
    //Later I would try and transfer surface area instead
    bigBody.diameter = bigBody.diameter + (affected_radius / (Math.log(bigBody.diameter) / Math.LOG2E));

    return { smallBody, bigBody };
}

//Newton's gravitational constant
var G = 6.674 * Math.pow(10, -11);

//Elapsed time between 2 points in 2D space between the "static" and the moving object
var t = 1; //seconds

function calcForce2Bodies(movingBody, staticBody, r)
{
    // Fgrav = G*M*m/r^2
    let F = (G * staticBody.mass * movingBody.mass) / (Math.pow(r, 2));

    //Calculating Force for x and y

    let delta_x = staticBody.x - movingBody.x;
    let detla_y = staticBody.y - movingBody.y;

    let F_x = F * (delta_x / r);
    let F_y = F * (detla_y / r);

    return { F_x, F_y };
}

//Calculates new coordinates and velocities of a moving body based on net force and elapsed time
function calcCoordinates2Bodies(movingBody, net_F_x, net_F_y)
{
    let a_x = net_F_x / movingBody.mass;
    let a_y = net_F_y / movingBody.mass;

    //Calculating new velocities
    movingBody.v_x = movingBody.v_x + (a_x * t);
    movingBody.v_y = movingBody.v_y + (a_y * t);

    //Calculating new x y coordinates for the moving body
    movingBody.x = (movingBody.x + movingBody.v_x * t);
    movingBody.y = (movingBody.y + movingBody.v_y * t);

    return movingBody;
}