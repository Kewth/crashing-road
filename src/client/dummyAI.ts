import * as CANNON from "cannon-es";
import { Car } from "./car";
import { PhysicalObject } from "./physicalObject";
import { PIDController } from "./utils";

export class DummyAI {
    car: Car
    obs_list: PhysicalObject[]
    target_x: number
    target_v: number

    constructor(posX: number, posY: number, posZ: number, scene: THREE.Scene, world: CANNON.World, obs_list: PhysicalObject[]) {
        this.car = new Car(posX, posY, posZ, scene, world);
        this.obs_list = obs_list;
        this.target_x = 0;
        this.target_v = 10;
    }
    
    update() {
        this.car.update();

        let nearest_obs = undefined
        let min_dist = 100000

        const carPos = this.car.pos()

        for (const obs of this.obs_list) {
            if(obs.body.position.y > carPos.y && obs.body.position.y - carPos.y < min_dist) {
                min_dist = obs.body.position.y - carPos.y
                nearest_obs = obs
            }
        }
        
        const targetv = this.target_v
        let targetx = this.target_x

        if(nearest_obs != undefined) {
            if(Math.abs(targetx - nearest_obs.obj.position.x) < 4) {
                if(carPos.x < nearest_obs.obj.position.x) {
                    targetx -= 0.01
                }
                else {
                    targetx += 0.01
                }
            }
        }

        this.target_x = targetx

        let vcon = new PIDController(0.1, 0.05, 0.01)
        let xcon = new PIDController(0.01, 0, 0.1)
        this.car.drive(0.4 * vcon.update(targetv - this.car.velocity().length(), 0.1));
        const posx = this.car.pos().x
        this.car.steer(xcon.update(posx - targetx, 0.1))
    }
}