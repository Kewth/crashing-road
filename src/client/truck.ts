import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";
import { Car } from "./car";
import { DummyLaneAI } from "./dummyLaneAI";

const generateLength = 20;
const generateProb = 0.8;
const numLimit = 20;

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

    constructor(obj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.focusObj = obj;
        this.scene = scene;
        this.world = world;
        this.nowDis = 0;
        this.truck_list = [];
    }

    update() {
        const dis = this.focusObj.position.y;
        while (dis + Setting.generateDistance > this.nowDis) {
            if (Math.random() < generateProb) {
                const lane = Math.floor(Math.random() * Setting.numberLane);
                const posX = -Setting.groundWidth / 2 + (lane + 0.5) * (Setting.groundWidth / Setting.numberLane);
                const posY = this.nowDis + generateLength * 0.5;
                const posZ = 2;
                if (this.truck_list.length >= numLimit) {
                    const truck = this.truck_list.find(truck =>
                        truck.car.pos.y < this.focusObj.position.y - Setting.backwardDistance ||
                        truck.car.pos.y > this.focusObj.position.y + Setting.generateDistance * 2
                    );
                    truck?.car.worldPos.set(posX, posY, posZ);
                    truck?.car.worldQuaternion.set(0, 0, 0, 1);
                    truck?.car.velocity.set(0, 0, 0);
                }
                else {
                    const truck = new Car(posX, posY, posZ, 'truck', this.scene, this.world);
                    this.truck_list.push(new DummyLaneAI(truck, 20));
                }
            }
            this.nowDis += generateLength;
        }
        this.truck_list.forEach(truck => {
            truck.update();
        });
    }
}