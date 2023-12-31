import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Car } from "./car";
import { Setting } from "./setting";

export class DummyLaneAI {
    car: Car

    constructor(car: Car) {
        this.car = car;
    }
    
    update() {
        this.car.update();
        this.car.drive(1);
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        const lane = Math.floor((this.car.pos.x + Setting.groundWidth * 0.5) / laneWidth);
        const targetX = - Setting.groundWidth * 0.5 + laneWidth * (lane + 0.5);
        const dt = 0.1;
        const direction = new THREE.Vector3(0, 1, 0).applyQuaternion(this.car.quaternion).normalize();
        const nextX = this.car.pos.x + direction.x * this.car.velocity.x * dt;
        this.car.steer((nextX - targetX) / laneWidth);
    }
}