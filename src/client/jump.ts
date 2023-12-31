import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";

const generateLength = 200;
const generateNum = 6;

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

export class JumpGenerator {
    private focusObj: THREE.Object3D;
    private nowDis: number;
    obs_list: PhysicalObject[];
    
    constructor(obj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.focusObj = obj;
        this.nowDis = 0;
        this.obs_list = [];
        for (let T = 0; T < 3; T ++) {
            for (let i = 0; i < generateNum; i ++) {
                const jump = new PhysicalObject(
                    new THREE.Mesh(jumpGeometry, jumpMaterial),
                    new CANNON.Body({
                        mass: 0,
                        shape: jumpShape,
                    }),
                );
                jump.body.quaternion.setFromEuler(Math.PI / 2, 0, 0);
                this.addObsInRandomPos(jump);
                jump.addin(scene, world);
            }
            this.nowDis += generateLength;
        }
    }
    
    private addObsInRandomPos(obs: PhysicalObject) {
        const lane = Math.floor(Math.random() * Setting.numberLane);
        obs.body.position.set(
            -Setting.groundWidth / 2 + (lane + 0.5) * (Setting.groundWidth / Setting.numberLane),
            this.nowDis + Math.random() * generateLength,
            jumpHeight * 0.5,
        )
        obs.update();
        this.obs_list.push(obs);
    }

    update() {
        const dis = this.focusObj.position.y;
        while (dis + generateLength > this.nowDis) {
            for (let i = 0; i < generateNum; i++) {
                const jump = this.obs_list.shift()
                jump && this.addObsInRandomPos(jump);
            }
            this.nowDis += generateLength;
        }
    }
}