# 2DNewtonGravityJS
This tool is written in vanilla JavaScript and is intended for experimenting with Newton's universal gravitation in 2D environment.

## Complexity
The big O per frame varies depending on the selected options in the menu. The default FPS cap is 60. The default complexity is O(n*(n-1)) where n = **OBJECTS_IN_SIMULATION**. Using the experimental features changes big O. For instance turning ON **traces** changes complexity to O(n * (n-1) * 180) where **180** is a constant determening the size of stored trace coordinates in the trace stack. Enabling colision also adds overhead, however it doesn't change the amount of cycles.

P.S. Adding too many objects to the simulation may exeed the capabilities of your browser or PC, thus resulting in lower FPS.

## A bit of history
This project was started purely as an intent to learn using the HTML5 canvas and applying some calculus in order to draw something interesting. Later on, after achieveing theoretical object attraction and repulsion and mapped static graphs on a canvas, I decided to animate some movement. At this step I introduced a simple object orientated render frame callback using browser's API. First the animated implementation was for 1 static and 1 dynamic objects. Next step was using 2 dynamic objects. A bigger step was introducing interraction between multiple objects. Later I advanced with adding proper **time** control, which in means brings the tool 1 step closer to simulation. Since it is not a descrete event simulation it seemed necessary to introduce time tracking. Tracing of objects and collision was later introduced as extras.

## How to run
Running this tool is a piece of cake - simply download all files in a root folder, then drag and drop the **gravity.htm** into your favorite browser. No building, bundling, compiling, whatsoever is required. 

## Examples
### Solar system
![graviti1](https://user-images.githubusercontent.com/1053670/37459425-aa436bf8-2850-11e8-9fee-f41302639620.gif)
### Sandbox
![graviti2](https://user-images.githubusercontent.com/1053670/37459790-dc2c6ede-2851-11e8-8d1a-e95f3a91bd6f.gif)
### Attraction
![graviti3](https://user-images.githubusercontent.com/1053670/37460081-cc2f8a9c-2852-11e8-8ecc-025cc18edc8f.gif)
### Repulsion
![graviti4](https://user-images.githubusercontent.com/1053670/37460477-ffe26ade-2853-11e8-9e96-2224761d3df9.gif)
### Explosion (Combining repulsion and collision)
![graviti5](https://user-images.githubusercontent.com/1053670/37460609-669ea634-2854-11e8-9291-1f2af0e445cc.gif)

