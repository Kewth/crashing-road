import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Car } from "./car";
import { PIDController } from "./utils";
import { Vec3 } from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";

function castToXY(v3: THREE.Vector3) {
    return new THREE.Vector2(v3.x, v3.y)
}

function castToVector3(v3: Vec3) {
    return new THREE.Vector3(v3.x, v3.y, v3.z);
}

function getDirectionalOffset(vec: THREE.Vector2, target: THREE.Vector2) {
    vec = vec.normalize() // normalizing a zero vector returns a zero vector
    target = target.normalize()
    return vec.x * target.y - vec.y * target.x
}

export class AggressiveAI {
    car: Car
    targetCar: Car

    constructor(posX: number, posY: number, posZ: number, scene: THREE.Scene, world: CANNON.World, targetCar: Car) {
        this.car = new Car(posX, posY, posZ, 'ferrari', scene, world);
        this.targetCar = targetCar;
    }
    
    update() {
        this.car.update();
        if (this.car.pos.y < this.targetCar.pos.y - Setting.aggressiveDistance - 10) {
            this.car.worldPos.y = this.targetCar.pos.y - Setting.aggressiveDistance - 10;
            this.car.update();
        }

        const pos = castToXY(this.car.pos)
        let targetpos = castToXY(this.targetCar.pos)
        const relDisp = targetpos.clone().sub(pos)
        const v = castToXY(castToVector3(this.car.velocity))
        const targetv = castToXY(castToVector3(this.targetCar.velocity))
        const maxv = 15

        let vcon = new PIDController(0.1, 0.05, 0.01)
        let xcon = new PIDController(0.1, 0, 0.5)
        this.car.drive(0.4 * vcon.update(maxv - this.car.velocity.length(), 0.1));
        const posx = this.car.pos.x;
        this.car.steer(xcon.update(getDirectionalOffset(v, relDisp), 0.1))
    }
}
