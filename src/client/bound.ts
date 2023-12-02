import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PhysicalObject } from "./physicalObject"
import { Setting } from './setting'

const wallHeight = 5
const groundMaterial = new THREE.MeshPhongMaterial()
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xccccc })
const groundGeometry = new THREE.PlaneGeometry(Setting.groundWidth, 1000)
const wallGeometry = new THREE.PlaneGeometry(wallHeight * 2, 1000)
const planeShape = new CANNON.Plane()

const groundCANNONmaterial = new CANNON.Material('ground')

const ground = new PhysicalObject(
    new THREE.Mesh(groundGeometry, groundMaterial),
    new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: groundCANNONmaterial,
    }),
)
ground.mesh.receiveShadow = true

const leftWall = new PhysicalObject(
    new THREE.Mesh(wallGeometry, wallMaterial),
    new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: groundCANNONmaterial,
    }),
)
leftWall.body.quaternion.setFromEuler(0, Math.PI / 2, 0)
leftWall.mesh.receiveShadow = true
leftWall.body.position.set(-Setting.groundWidth / 2, 0, 0)

const rightWall = new PhysicalObject(
    new THREE.Mesh(wallGeometry, wallMaterial),
    new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: groundCANNONmaterial,
    }),
)
rightWall.body.quaternion.setFromEuler(0, -Math.PI / 2, 0)
rightWall.mesh.receiveShadow = true
rightWall.body.position.set(Setting.groundWidth / 2, 0, 0)

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

export const bound = {
    ground: ground,
    leftWall: leftWall,
    rightWall: rightWall,
    groundCANNONmaterial: groundCANNONmaterial,
    addin(scene: THREE.Scene, world: CANNON.World) {
        this.ground.addin(scene, world)
        this.leftWall.addin(scene, world)
        this.rightWall.addin(scene, world)
        this.ground.update()
        this.leftWall.update()
        this.rightWall.update()
    },
    update(dis: number) {
        this.ground.mesh.position.set(0, dis, 0)
        this.leftWall.mesh.position.set(-Setting.groundWidth / 2, dis, 0)
        this.rightWall.mesh.position.set(Setting.groundWidth / 2, dis, 0)
    },
}