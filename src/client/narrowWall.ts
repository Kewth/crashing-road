import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";

const wallHeight = 5;
const narrowWallLength = 100
const groundWidth = Setting.groundWidth
const groundMaterial = new THREE.MeshPhongMaterial();
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xccccc, side: THREE.DoubleSide });
const groundGeometry = new THREE.PlaneGeometry(Setting.groundWidth, 1000);
const wallGeometry = new THREE.PlaneGeometry(wallHeight * 2, narrowWallLength);
const FrontWallGeometry = new THREE.PlaneGeometry(wallHeight, groundWidth / 4)
const sideWallShape = new CANNON.Box(new CANNON.Vec3(wallHeight, narrowWallLength/2, 0.01));
const frontWallShape = new CANNON.Box(new CANNON.Vec3(wallHeight/2, groundWidth / 8, 0.01))

const groundCANNONmaterial = new CANNON.Material("ground");
const wallCANNONmaterial = new CANNON.Material("wall");

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

export class NarrowWall {
    // ground: PhysicalObject
    leftSideWall: PhysicalObject
    rightSideWall: PhysicalObject
    leftFrontWall: PhysicalObject
    rightFrontWall: PhysicalObject
    
    constructor(startingY: number, scene: THREE.Scene, world: CANNON.World) {
        // this.ground = new PhysicalObject(
        //     new THREE.Mesh(groundGeometry, groundMaterial),
        //     new CANNON.Body({
        //         mass: 0,
        //         shape: planeShape,
        //         material: groundCANNONmaterial,
        //     }),
        // );
        // this.ground.obj.receiveShadow = true;

        this.leftSideWall = new PhysicalObject(
            new THREE.Mesh(wallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: sideWallShape,
                material: wallCANNONmaterial,
            }),
        );
        this.leftSideWall.body.quaternion.setFromEuler(0, Math.PI / 2, 0);
        this.leftSideWall.obj.receiveShadow = true;
        this.leftSideWall.body.position.set(-Setting.groundWidth / 4, startingY + narrowWallLength/2, 0);

        this.leftFrontWall = new PhysicalObject(
            new THREE.Mesh(FrontWallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: frontWallShape,
                material: wallCANNONmaterial,
            }),
        );
        this.leftFrontWall.body.quaternion.setFromEuler(Math.PI/2, 0, 0);
        this.leftFrontWall.obj.receiveShadow = true;
        this.leftFrontWall.body.position.set(-(3/8) * Setting.groundWidth, startingY, 2); // coefficient should be 3/8?


        this.rightSideWall = new PhysicalObject(
            new THREE.Mesh(wallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: sideWallShape,
                material: wallCANNONmaterial,
            }),
        );
        this.rightSideWall.body.quaternion.setFromEuler(0, -Math.PI / 2, 0);
        this.rightSideWall.obj.receiveShadow = true;
        this.rightSideWall.body.position.set(Setting.groundWidth / 4, startingY + narrowWallLength/2, 0);

        this.rightFrontWall = new PhysicalObject(
            new THREE.Mesh(FrontWallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: frontWallShape,
                material: wallCANNONmaterial,
            }),
        );
        this.rightFrontWall.body.quaternion.setFromEuler(Math.PI/2, 0, 0);
        this.rightFrontWall.obj.receiveShadow = true;
        this.rightFrontWall.body.position.set((3/8) * Setting.groundWidth, startingY, 2); // coefficient should be 3/8?

        // this.ground.addin(scene, world);
        this.leftSideWall.addin(scene, world);
        this.rightSideWall.addin(scene, world);
        this.leftFrontWall.addin(scene, world)
        this.rightFrontWall.addin(scene, world)
        // this.ground.update();
        this.leftSideWall.update();
        this.rightSideWall.update();
        this.leftFrontWall.update();
        this.rightFrontWall.update();
    }
}