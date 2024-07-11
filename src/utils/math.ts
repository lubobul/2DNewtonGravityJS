//Degrees to radians
export function degToRad(deg: number): number {
    return (Math.PI / 180) * deg;
}

//Cartesian to polar coordinates
export function cartesianToPolar(x: number, y: number): PolarCoordinates{
    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var t = Math.atan2(y, x);

    return { r: r, t: t } as PolarCoordinates;
}

export interface PolarCoordinates{
    r: number;
    t: number;
}