import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";

const wallHeight = 3;
const groundMaterial = new THREE.MeshPhongMaterial();
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xccccc });
const groundGeometry = new THREE.PlaneGeometry(Setting.groundWidth, 1000);
const wallGeometry = new THREE.PlaneGeometry(wallHeight * 2, 1000);
const planeShape = new CANNON.Plane();

export const groundCANNONmaterial = new CANNON.Material("ground");
export const wallCANNONmaterial = new CANNON.Material("wall");

// const groundWidth = 60
// const groundLength = 120
// const matrix: number[][] = []
// for (let i = 0; i < groundWidth; i++) {
//     matrix.push([])
//     for (let j = 0; j < groundLength; j++) {
//         //高度由两个余弦函数叠加形成
//         const height = Math.cos(i * Math.PI * 0.1) * Math.cos(j * Math.PI * 0.1) * 0.5
//         matrix[i].push(height)
//     }
// }
// var hfShape = new CANNON.Heightfield(matrix, {
//     elementSize: 1
// })
// var hfBody = new CANNON.Body({ mass: 0, material: groundCANNONmaterial })
// hfBody.addShape(hfShape)
// hfBody.position.set(-groundWidth / 2, -10, 0)
// world.addBody(hfBody);

export class Boundary {
    ground: PhysicalObject
    leftWall: PhysicalObject
    rightWall: PhysicalObject
    focusObj: THREE.Object3D
    fenceLength: number | undefined

    constructor(focusObj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.ground = new PhysicalObject(
            new THREE.Mesh(groundGeometry, groundMaterial),
            new CANNON.Body({
                mass: 0,
                shape: planeShape,
                material: groundCANNONmaterial,
            }),
        );
        this.ground.obj.receiveShadow = true;

        this.leftWall = new PhysicalObject(
            new THREE.Mesh(wallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: planeShape,
                material: wallCANNONmaterial,
            }),
        );
        this.leftWall.body.quaternion.setFromEuler(0, Math.PI / 2, 0);
        this.leftWall.obj.receiveShadow = true;
        this.leftWall.body.position.set(-Setting.groundWidth / 2, 0, 0);

        this.rightWall = new PhysicalObject(
            new THREE.Mesh(wallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: planeShape,
                material: wallCANNONmaterial,
            }),
        );
        this.rightWall.body.quaternion.setFromEuler(0, -Math.PI / 2, 0);
        this.rightWall.obj.receiveShadow = true;
        this.rightWall.body.position.set(Setting.groundWidth / 2, 0, 0);

        this.ground.addin(scene, world);
        this.leftWall.addin(scene, world);
        this.rightWall.addin(scene, world);
        this.ground.update();
        this.leftWall.update();
        this.rightWall.update();
        this.focusObj = focusObj
    }

    useFenceModel(model: THREE.Object3D) {
        if (this.fenceLength !== undefined) return;
        const box = new THREE.Box3().setFromObject(model);
        console.log(box);
        const length = box.max.y - box.min.y;
        [this.leftWall, this.rightWall].forEach(wall => {
            const scene = wall.obj.parent;
            scene?.remove(wall.obj);
            wall.obj = new THREE.Group();
            wall.obj.receiveShadow = true;
            for (let y = -100; y < 400; y += length) {
                const fence = model.clone();
                if (wall === this.leftWall)
                    fence.rotateY(-Math.PI / 2);
                if (wall === this.rightWall)
                    fence.rotateY(Math.PI / 2);
                fence.position.set(0, y, 0);
                wall.obj.add(fence);
            }
            scene?.add(wall.obj);
            wall.update();
        })
        this.fenceLength = length;
    }

    update() {
        const fy = this.focusObj.position.y
        this.ground.obj.position.y = fy;
        if (this.fenceLength) {
            const y = this.leftWall.obj.position.y
            const ny = Math.floor((fy - y) / this.fenceLength) * this.fenceLength + y;
            this.leftWall.obj.position.y = ny;
            this.rightWall.obj.position.y = ny;
        }
        else {
            this.leftWall.obj.position.y = fy;
            this.rightWall.obj.position.y = fy;
        }
    }
}