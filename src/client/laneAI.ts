import { Car } from "./car";
import { PhysicalObject } from "./physicalObject";
import { PIDController } from "./utils";
import { getDirectionalOffset, castToVector3, castToXY } from "./aggressiveAI";
import { Setting } from "./setting";

/**
 * 
 * @param laneID index of the lane, starting from 0
 * @returns the target X of the lane
 */
function calcLaneX(laneID: number) {
    laneID = Math.max(0, Math.min(laneID, Setting.numberLane-1));
    return (laneID + 0.5) * (Setting.groundWidth / Setting.numberLane);
}

function changeLane(car: Car) {
    const laneX = calcLaneX(car.laneID)
    if(Math.abs(car.target_x - laneX) > 0.1) {
        car.target_x -= 0.01*Math.sign(car.target_x - laneX)
    }
    return
}

function inLane(posX: number, laneID: number, width: number) {
    const laneX = calcLaneX(laneID)
    const laneRadius = (Setting.groundWidth / Setting.numberLane)/2
    width /= 2
    width += laneRadius
    if(posX + width >= laneX && posX - width <= laneX) {
        return true
    }
    return false
}

function laneAI(car: Car, obs_list: PhysicalObject[] = []) {
    let nearest_obs = undefined
    let min_dist = 100000

    const carPos = car.chassis.mesh.position

    for (const obs of obs_list) {
        if(obs.body.position.y > carPos.y && obs.body.position.y - carPos.y < min_dist) {
            min_dist = obs.body.position.y - carPos.y
            nearest_obs = obs
        }
    }
    
    

    if(nearest_obs != undefined) {
        const obsX = nearest_obs.mesh.position.x
        if(inLane(obsX, car.laneID, 6)){
            if(!inLane(obsX, car.laneID-1, 6)) {
                car.laneID -= 1
            }
            else {
                car.laneID += 1
            }
            car.laneID = Math.max(0, Math.min(car.laneID, Setting.numberLane-1));
        }
    }

    changeLane(car)

    const targetv = car.target_v
    const targetx = car.target_x


    let vcon = new PIDController(0.1, 0.05, 0.01)
    let xcon = new PIDController(0.01, 0, 0.1)
    car.drive(0.4 * vcon.update(targetv - car.chassis.body.velocity.length(), 0.1));
    const posx = car.chassis.mesh.position.x;
    car.steer(xcon.update(posx - targetx, 0.1))

    
}

export { laneAI };
