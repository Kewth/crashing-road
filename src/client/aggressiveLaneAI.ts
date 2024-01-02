import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Car } from "./car";
import { Setting } from "./setting";
import { LaneFenceGenerator } from "./laneFence";
import { ObsTester } from "./obsTest";

export class AggressiveLaneAI {
    car: Car
    plyCar: Car
    targetV: number
    backwardY: number
    forwardY: number

    constructor(car: Car, plyCar: Car, targetV: number, backwardY: number, forwardY: number) {
        this.car = car;
        this.plyCar = plyCar;
        this.targetV = targetV;
        this.backwardY = backwardY;
        this.forwardY = forwardY;
    }

    update() {
        this.car.update();
        this.car.drive(this.car.velocity.length() > this.targetV ? 0 : 1);
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        let lane = Math.floor((this.car.pos.x + Setting.groundWidth * 0.5) / laneWidth);
        if (this.car.pos.y - this.backwardY < this.plyCar.pos.y && this.plyCar.pos.y < this.car.pos.y + this.forwardY) {
            let plyLane = Math.floor((this.plyCar.pos.x + Setting.groundWidth * 0.5) / laneWidth);
            if (Math.abs(lane - plyLane) == 1)
                lane = plyLane;
        }
        const targetX = - Setting.groundWidth * 0.5 + laneWidth * (lane + 0.5);
        const dt = 1;
        const nextX = this.car.pos.x + this.car.velocity.x * dt;
        this.car.steer((nextX - targetX) / laneWidth * 0.5);
    }
}