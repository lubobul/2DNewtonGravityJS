# 2DNewtonGravityJS
This tool is written in vanilla JavaScript and is intended for experimenting with Newton's universal gravitation in 2D environment.

## Complexity
The big O per frame varies depending on the selected options in the menu. The default FPS cap is 60. The default complexity is O(n*(n-1)) where n = **OBJECTS_IN_SIMULATION**. Using the experimental features changes big O. For instance turning on **traces** changes complexity to O(n * (n-1) * 180) where **180** is a constant determening the size of stored trace coordinates in the trace stack. Enabling colision also adds overhead, however it doesn't change the amount of cycles.

P.S. Adding too many objects to the simulation may exeed the capabilities of your browser or PC, thus resulting in lower FPS.

## A bit of history
This project was started purely as an intent to learn using the HTML5 canvas and applying some calculus in order to draw something interesting. Later on, after achieveing object attraction and repulsion static graphs on a canvas, I decided to animate some movement. First the the implementation was for 1 static and 1 dynamic object. Next step was using 2 dynamic objects. A bigger step was introducing interraction between multiple objects. Later I advanced with adding proper **time** control, which in means brings the tool 1 step closer to simulation. Since it is not a descrete event simulation it seemed necessary to introduce time tracking. Tracing of ojects and collision was later introduced as extras.

