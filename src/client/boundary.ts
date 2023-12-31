import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { Setting } from "./setting";
import { CANNONMaterial } from "./cannonMaterial";

const wallHeight = 3;
const groundMaterial = new THREE.MeshPhongMaterial();
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xccccc });
const groundGeometry = new THREE.PlaneGeometry(Setting.groundWidth, 1000);
const envGeometry = new THREE.PlaneGeometry(1000, 1000);
const wallGeometry = new THREE.PlaneGeometry(wallHeight * 2, 1000);
const planeShape = new CANNON.Plane();

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
    roadMesh: THREE.Mesh
    envMesh: THREE.Mesh
    leftWall: PhysicalObject
    rightWall: PhysicalObject
    focusObj: THREE.Object3D
    fenceLength: number | undefined
    roadTextureLength: number | undefined

    constructor(focusObj: THREE.Object3D, scene: THREE.Scene, world: CANNON.World) {
        this.ground = new PhysicalObject(
            new THREE.Group(),
            new CANNON.Body({
                mass: 0,
                shape: planeShape,
                material: CANNONMaterial.ground,
            }),
        );
        this.roadMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.roadMesh.receiveShadow = true;
        this.ground.obj.add(this.roadMesh);
        this.envMesh = new THREE.Mesh(envGeometry, groundMaterial);
        this.envMesh.position.set(0, 0, -0.1);
        this.envMesh.receiveShadow = true;
        this.ground.obj.add(this.envMesh);

        this.leftWall = new PhysicalObject(
            new THREE.Mesh(wallGeometry, wallMaterial),
            new CANNON.Body({
                mass: 0,
                shape: planeShape,
                material: CANNONMaterial.wall,
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
                material: CANNONMaterial.wall,
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
        const length = box.max.y - box.min.y;
        [this.leftWall, this.rightWall].forEach(wall => {
            const scene = wall.obj.parent;
            scene?.remove(wall.obj);
            wall.obj = new THREE.Group();
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

    useRoadTexture(texture: THREE.Texture) {
        texture = texture.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const repeatY = 50;
        texture.repeat.set(Setting.numberLane, repeatY);
        if (this.roadTextureLength !== undefined) return;
        this.roadMesh.material = new THREE.MeshPhongMaterial({ map: texture });
        this.roadTextureLength = 1000 / repeatY;
    }

    useEnvTexture(texture: THREE.Texture) {
        texture = texture.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        const repeatX = 100;
        const repeatY = 100;
        texture.repeat.set(repeatX, repeatY);
        // if (this.roadTextureLength !== undefined) return; TODO
        this.envMesh.material = new THREE.MeshPhongMaterial({ map: texture });
    }

    // FIXME: 使用纹理代替模型 (done)
    // useRoadModel(model: THREE.Object3D) {
    //     const box = new THREE.Box3().setFromObject(model);
    //     const modelWidth = box.max.x - box.min.x;
    //     let xNum = Math.ceil(Setting.groundWidth / modelWidth);
    //     const scene = this.ground.obj.parent;
    //     scene?.remove(this.ground.obj);
    //     this.ground.obj = new THREE.Group();
    //     for (let i = 0; i < xNum; i ++) {
    //         const mod = model.clone();
    //         mod.scale.set(Setting.groundWidth / modelWidth / xNum, 1, 1);
    //         mod.position.set(Setting.groundWidth * (0.5 / xNum - 0.5 + i / xNum), 0, 0)
    //         this.ground.obj.add(mod);
    //     }
    //     scene?.add(this.ground.obj);
    // }

    update() {
        const fy = this.focusObj.position.y
        if (this.roadTextureLength) {
            const y = this.ground.obj.position.y
            const ny = Math.floor((fy - y) / this.roadTextureLength) * this.roadTextureLength + y;
            this.ground.obj.position.y = ny;
        }
        else
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