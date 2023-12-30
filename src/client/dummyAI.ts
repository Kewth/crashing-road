import { Car } from "./car";
import { PIDController } from "./utils";

function dummyAI(car: Car) {
    const targetv = 10
    const targetx = 0
    let vcon = new PIDController(0.1, 0.05, 0.01)
    let xcon = new PIDController(0.1, 0, 0.5)
    car.drive(0.4 * vcon.update(targetv - car.velocity().length(), 0.1));
    const posx = car.pos().x
    car.steer(xcon.update(posx - targetx, 0.1))
}

export { dummyAI };
