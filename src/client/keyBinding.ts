import { Car } from "./car";
import { TrailCamera } from "./trailCamera";

/**
 * initialize the keybinding. call it once at the begining
 *
 * @param car: player's car
 */
export function initKeyBinding(car: Car, camera: TrailCamera) {
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "q": camera.toggleFirstPerson(); break;
            case "ArrowUp": camera.move = -0.01; break;
            case "ArrowDown": camera.move = +0.01; break;
        }
    });
    document.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "ArrowUp": camera.move = 0; break;
            case "ArrowDown": camera.move = 0; break;
        }
    });
}