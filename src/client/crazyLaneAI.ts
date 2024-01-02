import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Car } from "./car";
import { Setting } from "./setting";
import { LaneFenceGenerator } from "./laneFence";
import { ObsTester } from "./obsTest";

export class CrazyLaneAI {
    car: Car
    obsTest: ObsTester
    targetV: number
    targetLane: number | undefined
    straightCount: number
    straightCountNeed: number

    constructor(car: Car, obsTest: ObsTester, targetV: number) {
        this.car = car;
        this.obsTest = obsTest;
        this.targetV = targetV;
        this.straightCount = 0;
        this.straightCountNeed = 100 + Math.random() * 100;
    }
    
    update() {
        this.car.update();
        this.car.drive(this.car.velocity.length() > this.targetV ? 0 : 1);
        const dt = 1;
        const nextX = this.car.pos.x + this.car.velocity.x * dt;
        if (Math.abs(nextX - this.car.pos.x) < 0.1)
            this.straightCount++;
        else
            this.straightCount = 0;
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        const nowLane = Math.floor((this.car.pos.x + Setting.groundWidth * 0.5) / laneWidth);
        // adapt the cloest lane by default
        let lane: number = nowLane;
        // go to the target lane
        if (this.targetLane !== undefined) {
            // get stuck or success
            if (this.straightCount > 30) {
                this.straightCount = 0;
                this.targetLane = undefined;
            }
            else
                lane = this.targetLane;
        }
        // try to change lane if the car has kept straight for a while
        else if (this.straightCount > this.straightCountNeed) {
            if (Math.random() < 0.5) {
                if (!this.obsTest.hasFenceOnTheLeft(nowLane, this.car.pos.y)
                    && !this.obsTest.hasFenceOnTheLeft(nowLane, this.car.pos.y + 20)) {
                    lane = nowLane - 1;
                    this.targetLane = lane;
                }
            }
            else {
                if (!this.obsTest.hasFenceOnTheRight(nowLane, this.car.pos.y)
                    && !this.obsTest.hasFenceOnTheRight(nowLane, this.car.pos.y + 20)) {
                    lane = nowLane + 1;
                    this.targetLane = lane;
                }
            }
            this.straightCount = 0;
        }
        const targetX = - Setting.groundWidth * 0.5 + laneWidth * (lane + 0.5);
        this.car.steer((nextX - targetX) / laneWidth * 0.5);
    }
}