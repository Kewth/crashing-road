import { Car } from "./car";

/**
 * initialize the keybinding. call it once at the begining
 *
 * @param car: player's car
 */
export function initKeyBinding(car: Car) {
    // Add force on keydown
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "w": car.drive(1); break;
            case "s": car.drive(-1); break;
            case "a": car.steer(1); break;
            case "d": car.steer(-1); break;
            case "b": car.brake(1); break;
        }
    });
    // Reset force on keyup
    document.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "w": car.drive(0); break;
            case "s": car.drive(0); break;
            case "a": car.steer(0); break;
            case "d": car.steer(0); break;
            case "b": car.brake(0); break;
        }
    });
}