import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { CANNONMaterial } from "./cannonMaterial";
import { Setting } from "./setting";

const generateLength = 100;
const wallHeight = 2
const wallLength = 80;

const wallGeometry = new THREE.BoxGeometry(0.01, wallLength, wallHeight);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xccccc });
const wallShape = new CANNON.Box(new CANNON.Vec3(0.01, wallLength / 2, wallHeight / 2));

export class LaneFenceGenerator {
    private focusObj: THREE.Object3D;
    private nowDis: number;
    private wall_list: PhysicalObject[];
    private usingModel: boolean;

    constructor(focusObj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.focusObj = focusObj;
        this.nowDis = 0;
        this.wall_list = [];
        this.usingModel = false;
        for (let T = 0; T < 10; T ++) {
            const wall = new PhysicalObject(
                new THREE.Group(),
                new CANNON.Body({
                    mass: 0,
                    type: CANNON.Body.STATIC,
                    shape: wallShape,
                    material: CANNONMaterial.wall,
                }),
            );
            wall.obj.add(new THREE.Mesh(wallGeometry, wallMaterial));
            this.addWallInRandomPos(wall);
            wall.addin(scene, world);
            this.nowDis += generateLength;
        }
    }

    useModel(model: THREE.Object3D) {
        if (this.usingModel) return;
        const box = new THREE.Box3().setFromObject(model);
        const olen = box.max.y - box.min.y;
        const generateNum = Math.floor(wallLength / olen);
        const rlen = wallLength / generateNum;
        this.wall_list.forEach(wall => {
            wall.obj.remove(wall.obj.children[0]);
            for (let i = 0; i < generateNum; i ++) {
                const fence = model.clone();
                fence.scale.set(1, rlen / olen, 1);
                fence.position.set(0, -wallLength * 0.5 + rlen * (0.5 + i), - wallHeight * 0.5);
                wall.obj.add(fence);
            }
        })
        this.usingModel = true;
    }

    hasFenceOnTheLeft(lane: number, y: number): boolean {
        if (lane == 0) return true;
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        const x = (lane + 0.5) * laneWidth - Setting.groundWidth / 2;
        return this.wall_list.find(wall => {
            const pos = wall.body.position;
            return x - laneWidth < pos.x && pos.x < x
                && pos.y - 0.5 * wallLength < y && y < pos.y + 0.5 * wallLength
        }) !== undefined;
    }

    hasFenceOnTheRight(lane: number, y: number): boolean {
        if (lane == Setting.numberLane - 1) return true;
        const laneWidth = Setting.groundWidth / Setting.numberLane;
        const x = (lane + 0.5) * laneWidth - Setting.groundWidth / 2;
        return this.wall_list.find(wall => {
            const pos = wall.body.position;
            return x < pos.x && pos.x < x + laneWidth
                && pos.y - 0.5 * wallLength < y && y < pos.y + 0.5 * wallLength
        }) !== undefined;
    }

    private addWallInRandomPos(wall: PhysicalObject) {
        const lane = Math.floor(Math.random() * (Setting.numberLane - 1));
        wall.body.position.set(
            -Setting.groundWidth / 2 + (lane + 1) * (Setting.groundWidth / Setting.numberLane),
            this.nowDis + 0.5 * generateLength,
            wallHeight * 0.5,
        )
        wall.update(); this.wall_list.push(wall);
    }

    update() {
        const dis = this.focusObj.position.y;
        while (dis + generateLength > this.nowDis) {
            const wall = this.wall_list.shift();
            wall && this.addWallInRandomPos(wall)
            this.nowDis += generateLength;
        }
    }
}