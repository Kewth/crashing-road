import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PhysicalObject } from './physicalObject'
import { Setting } from './setting'

const generateLength = 200
const generateNum = 30

const jumpRadius = 4
const jumpHeight = 0.6
const jumpGeometry = new THREE.CylinderGeometry(0.01, jumpRadius, jumpHeight, 5)
const jumpMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
const jumpShape = new CANNON.Cylinder(0.01, jumpRadius, jumpHeight, 5)

const xRange = Setting.groundWidth - jumpRadius * 2
const temp = new CANNON.Vec3()

export const jumpGenerator = {
    nowDis: 0,
    generate(dis: number) {
        const res = []
        if (dis + generateLength > this.nowDis) {
            for (let i = 0; i < generateNum; i++) {
                temp.set(
                    (Math.random() - 0.5) * xRange,
                    this.nowDis + Math.random() * generateLength,
                    0,
                )
                const jump = new PhysicalObject(
                    new THREE.Mesh(jumpGeometry, jumpMaterial),
                    new CANNON.Body({
                        mass: 0,
                        shape: jumpShape,
                        position: temp,
                        // material: bound.groundCANNONmaterial,
                    })
                )
                jump.body.quaternion.setFromEuler(Math.PI / 2, 0, 0)
                res.push(jump)
            }
            this.nowDis += generateLength
        }
        return res
    },
}