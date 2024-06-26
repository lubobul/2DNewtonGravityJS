import {Body, BodyForce, Collision} from "./types";

export class GravityEngine {
    private simulationObjects: Body[] = [];

    private tmp_F: BodyForce;
    private currentObject: Body;

//Net force mussed be calculated for each object compared to each of the rest of objects (sum of all forces applied to a particular object)
    private net_F_x: number;
    private net_F_y: number;
    private newObjects: Body[] = [];
    private numOfObjects: number;
    private areStaticObjectsOn: boolean = false;

//This is the main function for calculating N object interaction, called 1ce per frame
    public calculateMultipleObjects() {
        this.newObjects = [];

        this.numOfObjects = this.simulationObjects.length;

        for (let i = 0; i < this.numOfObjects; i++) {
            this.currentObject = this.simulationObjects[i];

            if (this.currentObject != null) {
                this.net_F_x = 0;
                this.net_F_y = 0;
                this.tmp_F = null;

                //check if an object is static, skip calculations if true
                if (!this.areStaticObjectsOn || (((this.currentObject.v_x + this.currentObject.v_y) != 0) && this.areStaticObjectsOn)) {
                    this.calculateObjectInteraction(i);
                }

                this.newObjects.push(this.currentObject);

                this.simulationObjects[i] = this.currentObject;
            }

        }

        this.simulationObjects = [];

        for (let new_i = 0; new_i < this.newObjects.length; new_i++) {
            if (this.newObjects[new_i] != null)
                this.simulationObjects.push(this.newObjects[new_i]);
        }
    }

    private secondObject: Body = null;
    private distance_bodies_0: number = 0;
    private distance_bodies_1: number = 0;
    private isColisionModeOn: boolean = false;
    private isDistanceBetweenObjectsClamped: boolean = false;
    private colidedObjects: Collision = null;

//All object iteraction goes here
    private calculateObjectInteraction(i: number) {

        for (let j = 0; j < this.numOfObjects; j++) {
            this.secondObject = this.simulationObjects[j];

            if (this.secondObject != null) {
                //Distance between movingBody / staticBody
                this.distance_bodies_0 = this.distance_bodies_1 = Math.sqrt(Math.pow((this.currentObject.x - this.secondObject.x), 2) + Math.pow((this.currentObject.y - this.secondObject.y), 2));

                //don't compare to self
                if (i != j) {

                    //clamp the closest distance between 2 objects
                    if ((this.currentObject.diameter / 2 + this.secondObject.diameter / 2) > this.distance_bodies_0 && this.isDistanceBetweenObjectsClamped)
                        this.distance_bodies_0 = (this.currentObject.diameter / 2) + (this.secondObject.diameter / 2);

                    this.tmp_F = this.calcForce2Bodies(this.currentObject, this.secondObject, this.distance_bodies_0);

                    //calculate netforce for object i
                    this.net_F_x += this.tmp_F.F_x;
                    this.net_F_y += this.tmp_F.F_y;

                    //Colision
                    if (this.isColisionModeOn) {
                        if (this.currentObject.mass < this.secondObject.mass) {
                            this.colidedObjects = this.calculateCollision(this.secondObject, this.currentObject, this.distance_bodies_1);

                            if (this.colidedObjects != null) {
                                this.currentObject = this.colidedObjects.smallBody;
                                this.secondObject = this.colidedObjects.bigBody;
                            }
                        } else {
                            this.colidedObjects = this.calculateCollision(this.currentObject, this.secondObject, this.distance_bodies_1);

                            if (this.colidedObjects != null) {
                                this.secondObject = this.colidedObjects.smallBody;
                                this.currentObject = this.colidedObjects.bigBody;
                            }
                        }

                        this.simulationObjects[j] = this.secondObject;

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

    private calculateCollision(bigBody: Body, smallBody: Body, distance: number) {
        //checking out if collision occured r0 + r1 < distance
        if ((bigBody.diameter / 2 + smallBody.diameter / 2) < distance) return null;

        let affected_radius = 0;

        if (bigBody.diameter < distance) //center of small circle is outside the big circle
        {
            affected_radius = Math.abs(distance - ((smallBody.diameter / 2) + (bigBody.diameter / 2)));
        } else if (distance + smallBody.diameter / 2 <= bigBody.diameter / 2) //the whole small one is inside the big one
        {
            affected_radius = smallBody.diameter;
        } else// the center of the small is inside the big, but portion of it is outside
        {
            affected_radius = Math.abs(((bigBody.diameter / 2) - distance) + (smallBody.diameter / 2));
        }

        let affected_body_factor = affected_radius / smallBody.diameter;

        let mass_to_transfer = smallBody.mass * affected_body_factor;

        if (affected_body_factor >= 1.0) //if smallBody has been eaten, set it to null so we avoid negative radiuses, it is later removed from the simulation
        {
            bigBody.mass = bigBody.mass + smallBody.mass;
            smallBody = null;
        } else {
            bigBody.mass = bigBody.mass + mass_to_transfer;
            smallBody.mass = smallBody.mass - mass_to_transfer;
            smallBody.diameter = smallBody.diameter - affected_radius;
        }

        //Diameter exchange from small ot big body limited to affected_radius/ 2log(affected_radius)
        //Later I would try and transfer surface area instead
        bigBody.diameter = bigBody.diameter + (affected_radius / (Math.log(bigBody.diameter) / Math.LOG2E));

        return {
            smallBody: smallBody,
            bigBody: bigBody
        } as Collision;
    }

//Newton's gravitational constant

    private readonly G: number = 6.674 * Math.pow(10, -11);

//Elapsed time between 2 points in 2D space between the "static" and the moving object
    private t: number = 1; //seconds

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
        movingBody.v_x = movingBody.v_x + (a_x * this.t);
        movingBody.v_y = movingBody.v_y + (a_y * this.t);

        //Calculating new x y coordinates for the moving body
        movingBody.x = (movingBody.x + movingBody.v_x * this.t);
        movingBody.y = (movingBody.y + movingBody.v_y * this.t);

        return movingBody;
    }
}