import { Car } from "./car";
import { TrailCamera } from "./trailCamera";

/**
 * initialize the keybinding. call it once at the begining
 *
 * @param car: player's car
 */
export function initKeyBinding(car: Car, camera: TrailCamera) {
    // Add force on keydown
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            // case "w": car.drive(1); break;
            // case "s": car.drive(-1); break;
            // case "a": car.steer(1); break;
            // case "d": car.steer(-1); break;
            // case " ": car.brake(1); break;
            case "ArrowUp": camera.move = -0.01; break;
            case "ArrowDown": camera.move = +0.01; break;
        }
    });
    // Reset force on keyup
    document.addEventListener("keyup", (event) => {
        switch (event.key) {
            // case "w": car.drive(0); break;
            // case "s": car.drive(0); break;
            // case "a": car.steer(0); break;
            // case "d": car.steer(0); break;
            // case " ": car.brake(0); break;
            case "ArrowUp": camera.move = 0; break;
            case "ArrowDown": camera.move = 0; break;
        }
    });
}