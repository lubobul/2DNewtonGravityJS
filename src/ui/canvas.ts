import {Coordinates} from "./types";

export class Canvas {
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement,
                private offsetX: number,
                private offsetY: number,
                public onMouseLeftClick: (coordinates: Coordinates) => void = null,
                public onMouseRightClick: (coordinates: Coordinates) => void = null,
                public onMouseLeftClickUp: (coordinates: Coordinates) => void = null,
                public onMouseRightClickUp: (coordinates: Coordinates) => void = null,
                public onMouseMove: (coordinates: Coordinates) => void = null,
    ) {
        this.ctx = this.canvas.getContext("2d");

        //Get Canvas Coordinates on click
        this.canvas.addEventListener("mousedown", this.mouseDown, false);
        this.canvas.addEventListener("mouseup", this.mouseUp, false);
    }


//Gets the coordinates of a click over the canvas ( will be used in future for object creation, drag and drop etc.)
    public mouseDown(e: MouseEvent) {
        if (e.button === 2) { //right click
            //showStatsForObject(e);
            if (this.onMouseRightClick) {
                this.onMouseRightClick(this.getMouseCoordinates(e));
            }
        } else {
            //shouldDrawDirectionVector = true;
            if (this.onMouseLeftClick) {
                this.onMouseLeftClick(this.getMouseCoordinates(e));
            }
            // object_vector_start_x = coordinates.x;
            // object_vector_start_y = coordinates.y;
            //
            // object_vector_direction_x = object_vector_start_x;
            // object_vector_direction_y = object_vector_start_y;

            this.canvas.addEventListener("mousemove", this.mouseMove, false);
        }
    }

    public mouseUp(e: MouseEvent) {
        if (e.button === 2) {
            //right click
            if (this.onMouseRightClickUp) {
                this.onMouseRightClickUp(this.getMouseCoordinates(e));
            }
        } else {
            //shouldDrawDirectionVector = false;
            if (this.onMouseLeftClickUp) {
                this.onMouseLeftClickUp(this.getMouseCoordinates(e));
            }
            this.canvas.removeEventListener("mousemove", this.mouseMove, false);
            //insertNewObjectIntoTheSimulation();
        }
    }

    public mouseMove(e: MouseEvent) {
        if (this.onMouseMove) {
            this.onMouseMove(this.getMouseCoordinates(e));
        }
        // object_vector_direction_x = coordinates.x;
        // object_vector_direction_y = coordinates.y;
    }

    public getMouseCoordinates(e: MouseEvent): Coordinates {
        var x;
        var y;

        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;

        //invert y axis (click coordinates are not affected when inverting canvas axis)
        y = this.canvas.height - y;


        return {
            x: x,
            y: y,
        } as Coordinates;
    }

//Invert canvas
    public invertCanvasAxis() {
        this.ctx.transform(1, 0, 0, -1, 0, this.canvas.height);
    }

//Draw a line from posX,posY to posXto, posYto with offset
    public drawPixel(x: number, y: number) {
        this.ctx.fillRect(x + this.offsetX, y + this.offsetY, 1, 1);
    }

//Draw a line from posX,posY to posXto, posYto without offset
    public drawLineNoOffset(
        posX: number,
        posY: number,
        posXto: number,
        posYto: number,
        lineWidth: number,
        lineColor: string,
        segments?: number[]): void {
        if (segments) {
            this.ctx.setLineDash(segments);
        }

        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;

        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(posXto, posYto);
        this.ctx.closePath();
        this.ctx.stroke();
        //restore
        this.ctx.setLineDash([0, 0]);
    }

    public drawObjectWithOffset(posX: number, posY: number, radius: number, color: string) {
        this.drawObject(posX + this.offsetX, posY + this.offsetY, radius, color);
    }

    public drawObjectNoOffset(posX: number, posY: number, radius: number, color: string) {
        this.drawObject(posX, posY, radius, color);
    }

//Draws an oval object
    public drawObject(posX: number, posY: number, radius: number, color: string): void {
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

//Draws the X Y dahsed AXIS
    public initXYAxis(): void {
        this.drawLineNoOffset(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2,
            0.5, "green", [0.5, 2.5]);
        this.drawLineNoOffset(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height,
            0.5, "green", [0.5, 2.5]);
    }

    public clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}