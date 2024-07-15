import {Coordinates} from "./types";

export class Canvas {
    get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }
    get offsetX(): number {
        return this._offsetX;
    }

    get offsetY(): number {
        return this._offsetY;
    }

    get height(): number {
        return this.canvas.height;
    }

    get width(): number {
        return this.canvas.width;
    }

    private readonly _ctx: CanvasRenderingContext2D;

    private _offsetX = 0;
    private _offsetY = 0;

    constructor(private canvas: HTMLCanvasElement,
                private canvasContainer?: Element,
                public onMouseLeftClick?: (coordinates: Coordinates) => void,
                public onMouseRightClick?: (coordinates: Coordinates) => void,
                public onMouseLeftClickUp?: (coordinates: Coordinates) => void,
                public onMouseRightClickUp?: (coordinates: Coordinates) => void,
                public onMouseMove?: (coordinates: Coordinates) => void,

    ) {
        this._ctx = this.canvas.getContext("2d");

        this._offsetX = this.canvas.width / 2;
        this._offsetY = this.canvas.height / 2;

        //Get Canvas Coordinates on click
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
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

            this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
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
        this._ctx.transform(1, 0, 0, -1, 0, this.canvas.height);
    }

//Draw a line from posX,posY to posXto, posYto with offset
    public drawPixel(x: number, y: number) {
        this._ctx.fillRect(x + this._offsetX, y + this._offsetY, 1, 1);
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
            this._ctx.setLineDash(segments);
        }

        this._ctx.lineWidth = lineWidth;
        this._ctx.strokeStyle = lineColor;

        this._ctx.beginPath();
        this._ctx.moveTo(posX, posY);
        this._ctx.lineTo(posXto, posYto);
        this._ctx.closePath();
        this._ctx.stroke();
        //restore
        this._ctx.setLineDash([0, 0]);
    }

    public drawObjectWithOffset(posX: number, posY: number, radius: number, color: string) {
        this.drawObject(posX + this._offsetX, posY + this._offsetY, radius, color);
    }

    public drawObjectNoOffset(posX: number, posY: number, radius: number, color: string) {
        this.drawObject(posX, posY, radius, color);
    }

//Draws an oval object
    public drawObject(posX: number, posY: number, radius: number, color: string): void {
        this._ctx.beginPath();
        this._ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
        this._ctx.closePath();
        this._ctx.fillStyle = color;
        this._ctx.fill();
    }

//Draws the X Y dahsed AXIS
    public initXYAxis(): void {
        this.drawLineNoOffset(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2,
            0.5, "green", [0.5, 2.5]);
        this.drawLineNoOffset(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height,
            0.5, "green", [0.5, 2.5]);
    }

    public clearCanvas(): void {
        this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public resizeCanvasToFitContainer(): void {
        if(!this.canvasContainer){
            return;
        }

        if(this.canvas.width != this.canvasContainer.clientWidth || this.canvas.height != this.canvasContainer.clientHeight){
            this._ctx.canvas.width = this.canvasContainer.clientWidth;
            this._ctx.canvas.height = this.canvasContainer.clientHeight;

            this._offsetX = this.canvas.width / 2;
            this._offsetY = this.canvas.height / 2;

            this.invertCanvasAxis();
        }
    }
}