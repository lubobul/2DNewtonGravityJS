import {Body} from "./types";

export const SECONDS_PER_DAY = 86400;

export const BODIES = {
    Earth: {
        color: "blue",
        diameter: 12742000,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 5.972 * Math.pow(10, 24)
    } as Body,
    Venus: {
        color: "orange",
        diameter: 12104000,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 4.867 * Math.pow(10, 24)
    },
    Jupiter: {
        color: "orange",
        diameter: 139822000 / 10,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 1.898 * Math.pow(10, 27)
    } as Body,
    Sun: {
        color: "yellow",
        diameter: 1391400000 / 30,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 1.989 * Math.pow(10, 30)
    },
    Moon: {
        color: "grey",
        diameter: 3474000,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 7.342 * Math.pow(10, 22)
    },
    Mars: {
        color: "red",
        diameter: 6779000,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 6.39 * Math.pow(10, 23)
    },
    Mercury: {
        color: "grey",
        diameter: 4879000,
        x: 0,
        y: 0,
        v_x: 0,
        v_y: 0,
        mass: 3.285 * Math.pow(10, 23)
    }
}
