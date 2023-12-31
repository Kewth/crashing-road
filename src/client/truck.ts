import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";
import { Car } from "./car";
import { DummyLaneAI } from "./dummyLaneAI";

const generateLength = 30;
const generateProb = 0.8;
const truckLimit = 15;
const policeLimit = 5;

const jumpRadius = 2;
const jumpHeight = 0.3;
const jumpGeometry = new THREE.CylinderGeometry(
    0.01,
    jumpRadius,
    jumpHeight,
    5,
);
const jumpMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const jumpShape = new CANNON.Cylinder(0.01, jumpRadius, jumpHeight, 5);

export class TruckGenerator {
    private focusObj: THREE.Object3D;
    private scene: THREE.Scene;
    private world: CANNON.World;
    private nowDis: number;
    private truck_list: DummyLaneAI[];
    private police_list: DummyLaneAI[];

    constructor(obj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.focusObj = obj;
        this.scene = scene;
        this.world = world;
        this.nowDis = 0;
        this.truck_list = [];
        this.police_list = [];
    }

    update() {
        const dis = this.focusObj.position.y;
        while (dis + Setting.generateDistance > this.nowDis) {
            if (Math.random() < generateProb) {
                const lane = Math.floor(Math.random() * Setting.numberLane);
                const posX = -Setting.groundWidth / 2 + (lane + 0.5) * (Setting.groundWidth / Setting.numberLane);
                const posY = this.nowDis + generateLength * 0.5;
                const posZ = 2;
                if (this.truck_list.length >= truckLimit) {
                    if (this.police_list.length < policeLimit) {
                        const police = new Car(posX, posY, posZ, 'police', this.scene, this.world);
                        this.police_list.push(new DummyLaneAI(police, 20));
                    }
                    else {
                        let ais = [...this.police_list, ...this.truck_list].filter(ai =>
                            ai.car.pos.y < this.focusObj.position.y - Setting.backwardDistance ||
                            ai.car.pos.y > this.focusObj.position.y + Setting.generateDistance * 2
                        )
                        if (ais.length > 0) {
                            const ai = ais[Math.floor(Math.random() * ais.length)];
                            ai.car.worldPos.set(posX, posY, posZ);
                            ai.car.worldQuaternion.set(0, 0, 0, 1);
                            ai.car.velocity.set(0, 10, 0);
                        }
                    }
                }
                else {
                    const truck = new Car(posX, posY, posZ, 'truck', this.scene, this.world);
                    this.truck_list.push(new DummyLaneAI(truck, 20));
                }
            }
            this.nowDis += generateLength;
        }
        this.truck_list.forEach(ai => ai.update());
        this.police_list.forEach(ai => ai.update());
    }
}