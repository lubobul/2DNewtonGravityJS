export interface Body{
    color: string;
    diameter: number;
    x: number;
    y: number;
    v_x: number;
    v_y: number;
    mass: number;
}

export interface Collision{
    smallBody: Body;
    bigBody: Body;
}

export interface BodyForce {
    F_x: number;
    F_y: number;
}