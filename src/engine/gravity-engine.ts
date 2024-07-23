import {Body, BodyForce, Collision} from "./types";
import {Coordinates} from "../ui/types";

export class GravityEngine {
    get objectsTrajectoryStackSize(): number {
        return this._objectsTrajectoryStackSize;
    }

    set objectsTrajectoryStackSize(value: number) {
        this._objectsTrajectoryStackSize = value;
    }

    get clampedDistanceBetweenObjectsEnabled(): boolean {
        return this._clampedDistanceBetweenObjectsEnabled;
    }

    set clampedDistanceBetweenObjectsEnabled(value: boolean) {
        this._clampedDistanceBetweenObjectsEnabled = value;
    }

    get staticObjectsEnabled(): boolean {
        return this._staticObjectsEnabled;
    }

    set staticObjectsEnabled(value: boolean) {
        this._staticObjectsEnabled = value;
    }

    get collisionEnabled(): boolean {
        return this._collisionEnabled;
    }

    set collisionEnabled(value: boolean) {
        this._collisionEnabled = value;
    }

    get objectsTrajectoriesStack(): Coordinates[][] {
        return this._objectsTrajectoriesStack;
    }

    get gravitationalObjects(): Body[] {
        return this._gravitationalObjects;
    }

    set gravitationalObjects(value: Body[]) {
        this._gravitationalObjects = value;
    }

    private _gravitationalObjects: Body[] = [];

    private tmp_F: BodyForce;
    private currentObject: Body;

    //Net force mussed be calculated for each object compared to each of the rest of objects (sum of all forces applied to a particular object)
    private net_F_x: number;
    private net_F_y: number;
    private newObjects: Body[] = [];
    private numOfObjects: number;
    private _staticObjectsEnabled: boolean = false;

    private secondObject: Body = null;
    private distance_bodies_0: number = 0;
    private distance_bodies_1: number = 0;
    private _collisionEnabled: boolean = false;
    private _clampedDistanceBetweenObjectsEnabled: boolean = false;
    private collidedGravityObjects: Collision = null;
    private readonly G: number = 6.674 * Math.pow(10, -11);
    //Elapsed time between 2 points in 2D space between the "static" and the moving object
    private elapsedSimulationTimeSeconds: number = 1; //seconds

    private _objectsTrajectoriesStack: Coordinates[][] = [];
    //length of trace behind objects in number of kept calcukated positions
    private _objectsTrajectoryStackSize = 180;

    //This is the main function for calculating N object interaction, called 1ce per frame
    public calculateMultipleObjects(deltaTimeSeconds: number) {
        this.elapsedSimulationTimeSeconds = deltaTimeSeconds;
        this.newObjects = [];

        this.numOfObjects = this._gravitationalObjects.length;

        for (let i = 0; i < this.numOfObjects; i++) {
            this.currentObject = this._gravitationalObjects[i];

            if (this.currentObject != null) {
                this.net_F_x = 0;
                this.net_F_y = 0;
                this.tmp_F = null;

                //check if an object is static, skip calculations if true
                if (!this._staticObjectsEnabled || (((this.currentObject.v_x + this.currentObject.v_y) != 0) && this._staticObjectsEnabled)) {
                    this.calculateObjectInteraction(i);
                }

                this.newObjects.push(this.currentObject);

                this._gravitationalObjects[i] = this.currentObject;
            }

        }

        this._gravitationalObjects = [];

        for (let new_i = 0; new_i < this.newObjects.length; new_i++) {
            if (this.newObjects[new_i] != null)
                this._gravitationalObjects.push(this.newObjects[new_i]);
        }
    }

    //All object iteraction goes here
    private calculateObjectInteraction(i: number) {

        for (let j = 0; j < this.numOfObjects; j++) {
            this.secondObject = this._gravitationalObjects[j];

            if (this.secondObject != null) {
                //Distance between movingBody / staticBody
                this.distance_bodies_0 = this.distance_bodies_1 = Math.sqrt(Math.pow((this.currentObject.x - this.secondObject.x), 2) + Math.pow((this.currentObject.y - this.secondObject.y), 2));

                //don't compare to self
                if (i != j) {

                    //clamp the closest distance between 2 objects
                    if ((this.currentObject.diameter / 2 + this.secondObject.diameter / 2) > this.distance_bodies_0 && this._clampedDistanceBetweenObjectsEnabled)
                        this.distance_bodies_0 = (this.currentObject.diameter / 2) + (this.secondObject.diameter / 2);

                    this.tmp_F = this.calcForce2Bodies(this.currentObject, this.secondObject, this.distance_bodies_0);

                    //calculate net force for object i
                    this.net_F_x += this.tmp_F.F_x;
                    this.net_F_y += this.tmp_F.F_y;

                    //Collision
                    if (this._collisionEnabled) {
                        if (this.currentObject.mass < this.secondObject.mass) {
                            this.collidedGravityObjects = this.calculateCollision(this.secondObject, this.currentObject, this.distance_bodies_1);

                            if (this.collidedGravityObjects != null) {
                                this.currentObject = this.collidedGravityObjects.smallBody;
                                this.secondObject = this.collidedGravityObjects.bigBody;
                            }
                        } else {
                            this.collidedGravityObjects = this.calculateCollision(this.currentObject, this.secondObject, this.distance_bodies_1);

                            if (this.collidedGravityObjects != null) {
                                this.secondObject = this.collidedGravityObjects.smallBody;
                                this.currentObject = this.collidedGravityObjects.bigBody;
                            }
                        }

                        this._gravitationalObjects[j] = this.secondObject;

                        if (this.currentObject == null) {
                            return;
                        }
                    }
                }
            }
        }

        this.currentObject = this.calcCoordinates2Bodies(this.currentObject, this.net_F_x, this.net_F_y);
    }

    //Calculate if collision occurs, transfer mass and size if so. Returns null if no collision occrus.
    //TODO Refine that so that it has two modes - one is the exact overlapped area is transferred,
    //second is - take the overlapped radius, and transfer the whole area for that % of the radius from outside towards the inside
    private calculateCollision(bigBody: Body, smallBody: Body, distance: number) {
        //checking out if collision occurred r0 + r1 < distance
        if ((bigBody.diameter / 2 + smallBody.diameter / 2) < distance) return null;

        let affectedRadius = 0;

        if (bigBody.diameter < distance) //center of small circle is outside the big circle
        {
            affectedRadius = Math.abs(distance - ((smallBody.diameter / 2) + (bigBody.diameter / 2)));
        } else if (distance + smallBody.diameter / 2 <= bigBody.diameter / 2) //the whole small one is inside the big one
        {
            affectedRadius = smallBody.diameter;
        } else// the center of the small is inside the big, but portion of it is outside
        {
            affectedRadius = Math.abs(((bigBody.diameter / 2) - distance) + (smallBody.diameter / 2));
        }

        let affected_body_factor = affectedRadius / smallBody.diameter;

        let mass_to_transfer = smallBody.mass * affected_body_factor;

        if (affected_body_factor >= 1.0) //if smallBody has been eaten, set it to null so we avoid negative radiuses, it is later removed from the simulation
        {
            bigBody.mass = bigBody.mass + smallBody.mass;
            smallBody = null;
        } else {
            bigBody.mass = bigBody.mass + mass_to_transfer;
            smallBody.mass = smallBody.mass - mass_to_transfer;
            smallBody.diameter = smallBody.diameter - affectedRadius;
        }

        //Diameter exchange from small ot big body limited to affectedRadius/ 2log(affectedRadius)
        //Later I would try and transfer surface area instead
        bigBody.diameter = bigBody.diameter + (affectedRadius / (Math.log(bigBody.diameter) / Math.LOG2E));

        return {
            smallBody: smallBody,
            bigBody: bigBody
        } as Collision;
    }

//Newton's gravitational constant

    private calcForce2Bodies(movingBody: Body, staticBody: Body, r: number) {
        // Fgrav = G*M*m/r^2
        let F = (this.G * staticBody.mass * movingBody.mass) / (Math.pow(r, 2));

        //Calculating Force for x and y

        let delta_x = staticBody.x - movingBody.x;
        let detla_y = staticBody.y - movingBody.y;

        let F_x = F * (delta_x / r);
        let F_y = F * (detla_y / r);

        return {
            F_x: F_x,
            F_y: F_y,
        } as BodyForce;
    }

//Calculates new coordinates and velocities of a moving body based on net force and elapsed time
    private calcCoordinates2Bodies(movingBody: Body, net_F_x: number, net_F_y: number) {
        let a_x = net_F_x / movingBody.mass;
        let a_y = net_F_y / movingBody.mass;

        //Calculating new velocities
        movingBody.v_x = movingBody.v_x + (a_x * this.elapsedSimulationTimeSeconds);
        movingBody.v_y = movingBody.v_y + (a_y * this.elapsedSimulationTimeSeconds);

        //Calculating new x y coordinates for the moving body
        movingBody.x = (movingBody.x + movingBody.v_x * this.elapsedSimulationTimeSeconds);
        movingBody.y = (movingBody.y + movingBody.v_y * this.elapsedSimulationTimeSeconds);

        return movingBody;
    }

    public clearTracesStack(): void {
        this._objectsTrajectoriesStack = [];
    }

    //Trace the objects and store historical coordinates in a stack
    public updateObjectsTrajectoryStack(): void {
        if (this._objectsTrajectoriesStack.length > this._objectsTrajectoryStackSize) {
            this._objectsTrajectoriesStack.shift(); //rem last
        }

        let traces: Coordinates[] = [];

        for (let i = 0, len = this.gravitationalObjects.length; i < len; i++) {
            if (this.gravitationalObjects[i].v_x + this.gravitationalObjects[i].v_y != 0) {
                traces.push({
                    x: this.gravitationalObjects[i].x,
                    y: this.gravitationalObjects[i].y,
                } as Coordinates);
            }
        }

        this._objectsTrajectoriesStack.push(traces);
    }
}