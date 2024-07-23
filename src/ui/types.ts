export interface Coordinates{
    x: number;
    y: number;
}

export enum SimulationChoice{
    Sandbox = "Sandbox",
    SolarSystem = "SolarSystem",
    Particles = "Particles",
    Attraction = "Attraction",
    Repulsion = "Repulsion",
    Explosion = "Explosion",
}