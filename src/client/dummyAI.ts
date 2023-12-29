import { Car } from "./car";
import { PhysicalObject } from "./physicalObject";
import { PIDController } from "./utils";
import { getDirectionalOffset, castToVector3, castToXY } from "./aggressiveAI";

function dummyAI(car: Car, obs_list: PhysicalObject[] = []) {
    let nearest_obs = undefined
    let min_dist = 100000

    const carPos = car.chassis.mesh.position

    for (const obs of obs_list) {
        if(obs.body.position.y > carPos.y && obs.body.position.y - carPos.y < min_dist) {
            min_dist = obs.body.position.y - carPos.y
            nearest_obs = obs
        }
    }
    
    const targetv = car.target_v
    let targetx = car.target_x

    if(nearest_obs != undefined) {
        if(Math.abs(targetx - nearest_obs.mesh.position.x) < 4) {
            if(carPos.x < nearest_obs.mesh.position.x) {
                targetx -= 0.01
            }
            else {
                targetx += 0.01
            }
        }
    }

    car.target_x = targetx

    let vcon = new PIDController(0.1, 0.05, 0.01)
    let xcon = new PIDController(0.01, 0, 0.1)
    car.drive(0.4 * vcon.update(targetv - car.chassis.body.velocity.length(), 0.1));
    const posx = car.chassis.mesh.position.x;
    car.steer(xcon.update(posx - targetx, 0.1))

    
}

export { dummyAI };
