import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";
import { Car } from "./car";
import { DummyLaneAI } from "./dummyLaneAI";

const generateLength = 30;
const truckLimit = 15;
const policeLimit = 5;

interface Clock {
    delta: number
}

export class TruckGenerator {
    private focusObj: THREE.Object3D;
    private clock: Clock;
    private scene: THREE.Scene;
    private world: CANNON.World;
    private truck_list: DummyLaneAI[];
    private minY: number;
    private maxY: number;
    private baselineV: number;

    constructor(obj: THREE.Object3D, clock: Clock, scene: THREE.Scene, world: CANNON.World) {
        this.focusObj = obj;
        this.clock = clock;
        this.scene = scene;
        this.world = world;
        this.truck_list = [];
        this.minY = 0;
        this.maxY = 0;
        this.baselineV = 0;
        // for (let i = 0; i < 15; i++) {
        //     const truck = new Car(0, 1000 + i * 50, 2, 'truck', this.scene, this.world);
        //     truck.update();
        //     this.truck_list.push(new DummyLaneAI(truck, 20));
        // }
        // for (let i = 0; i < 5; i++) {
        //     const police = new Car(0, 3000 + i * 50, 2, 'police', this.scene, this.world);
        //     police.update();
        //     this.police_list.push(new DummyLaneAI(police, 20));
        // }
    }
    
    // private pickRandomFarAI() {
    //     let ais = [...this.police_list, ...this.truck_list].filter(ai =>
    //         ai.car.pos.y < this.focusObj.position.y - Setting.backwardDistance ||
    //         ai.car.pos.y > this.focusObj.position.y + Setting.generateDistance * 2
    //     );
    //     return ais.length > 0 ? ais[Math.floor(Math.random() * ais.length)] : undefined;
    // }

    generateNewCar(posY: number) {
        const lane1 = Math.floor(Math.random() * Setting.numberLane);
        const lane2 = Math.floor(Math.random() * Setting.numberLane);
        const posX1 = -Setting.groundWidth / 2 + (lane1 + 0.5) * (Setting.groundWidth / Setting.numberLane);
        const posX2 = -Setting.groundWidth / 2 + (lane2 + 0.5) * (Setting.groundWidth / Setting.numberLane);
        const posZ = 2;
        const truck1 = new Car(posX1, posY, posZ, Math.random() < 0.8 ? 'truck' : 'police', this.scene, this.world);
        this.truck_list.push(new DummyLaneAI(truck1, 20));
        truck1.velocity.set(0, this.baselineV, 0);
        if (lane2 != lane1) {
            const truck2 = new Car(posX2, posY, posZ, Math.random() < 0.8 ? 'truck' : 'police', this.scene, this.world);
            this.truck_list.push(new DummyLaneAI(truck2, 20));
            truck2.velocity.set(0, this.baselineV, 0);
        }
    }

    update() {
        const carY = this.focusObj.position.y;
        // destroy
        if (this.maxY > carY + Setting.generateDistance + 50) {
            const ai = this.truck_list.find(
                ai => ai.car.pos.y > carY + Setting.generateDistance + 50
            );
            if (ai) {
                ai.car.destroy();
                this.truck_list.splice(this.truck_list.indexOf(ai), 1);
                this.maxY -= generateLength;
            }
        }
        if (this.minY < carY - Setting.backwardDistance - 50) {
            const ai = this.truck_list.find(
                ai => ai.car.pos.y < carY - Setting.generateDistance - 50
            );
            if (ai) {
                ai.car.destroy();
                this.truck_list.splice(this.truck_list.indexOf(ai), 1);
                this.minY += generateLength;
            }
        }
        // generate
        while (this.minY - generateLength >= carY - Setting.backwardDistance) {
            this.minY -= generateLength;
            this.generateNewCar(this.minY);
            console.log(`generate backword ${this.minY} ${carY - Setting.backwardDistance}`)
        }
        while (this.maxY + generateLength <= carY + Setting.generateDistance) {
            this.maxY += generateLength;
            this.generateNewCar(this.maxY);
            console.log('generate forward')
        }
        // while (dis + Setting.generateDistance > this.nowDis) {
        //     if (Math.random() < generateProb) {
        //         const lane = Math.floor(Math.random() * Setting.numberLane);
        //         const posX = -Setting.groundWidth / 2 + (lane + 0.5) * (Setting.groundWidth / Setting.numberLane);
        //         const posY = this.nowDis + generateLength * 0.5;
        //         const posZ = 2;
        //         // const truckRem = truckLimit - this.truck_list.length
        //         // const policeRem = policeLimit - this.police_list.length
        //         if (this.truck_list.length >= truckLimit) {
        //             if (this.police_list.length < policeLimit) {
        //                 const police = new Car(posX, posY, posZ, 'police', this.scene, this.world);
        //                 this.police_list.push(new DummyLaneAI(police, 20));
        //             }
        //             else {
        //                 const ai = this.pickRandomFarAI();
        //                 if (ai) {
        //                     ai.car.worldPos.set(posX, posY, posZ);
        //                     ai.car.worldQuaternion.set(0, 0, 0, 1);
        //                     ai.car.velocity.set(0, 18, 0);
        //                 }
        //             }
        //         }
        //         else {
        //             const truck = new Car(posX, posY, posZ, 'truck', this.scene, this.world);
        //             this.truck_list.push(new DummyLaneAI(truck, 20));
        //         }
        //     }
        //     this.nowDis += generateLength;
        // }
        // const now = Date.now();
        // if (now > this.backward_checkTime + 1_000) {
        //     const ai = this.pickRandomFarAI();
        //     if (ai) {
        //         const lane = Math.floor(Math.random() * Setting.numberLane);
        //         const posX = -Setting.groundWidth / 2 + (lane + 0.5) * (Setting.groundWidth / Setting.numberLane);
        //         const posY = dis - Setting.backwardDistance * 0.5;
        //         const posZ = 2;
        //         ai.car.worldPos.set(posX, posY, posZ);
        //         ai.car.worldQuaternion.set(0, 0, 0, 1);
        //         ai.car.velocity.set(0, 22, 0);
        //     }
        //     this.backward_checkTime += 1_000;
        // }
        this.truck_list.forEach(ai => ai.update());
        // this.police_list.forEach(ai => ai.update());
        this.minY += this.baselineV * this.clock.delta;
        this.maxY += this.baselineV * this.clock.delta;
        this.baselineV = Math.min(this.baselineV + 4 * this.clock.delta, 20);
    }
}