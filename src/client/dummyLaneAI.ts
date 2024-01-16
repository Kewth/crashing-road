import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Car } from "./car";
import { Setting } from "./setting";

export class DummyLaneAI {
    car: Car
    targetV: number

    constructor(car: Car, targetV: number) {
        this.car = car;
        this.targetV = targetV;
    }

    update() {
        this.car.update();
        this.car.drive(this.car.velocity.length() > this.targetV ? 0 : 1);
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        const lane = Math.floor((this.car.pos.x + Setting.groundWidth * 0.5) / laneWidth);
        const targetX = - Setting.groundWidth * 0.5 + laneWidth * (lane + 0.5);
        const dt = 1;
        const nextX = this.car.pos.x + this.car.velocity.x * dt;
        this.car.steer((nextX - targetX) / laneWidth * 0.5);
    }
}