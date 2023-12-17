import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PhysicalObject } from './physicalObject'

const chassisSizeX = 1.5
const chassisSizeY = 3
const chassisSizeZ = 0.8
const wheelOffsetX = 0.8
const wheelOffsetY = 0.8
const wheelOffsetZ = 0
const wheelRadius = 0.4
const carMass = 500

const maxSteerVal = 0.5
const maxForce = 1500
const brakeForce = 100000

const chassisCANNONMaterial = new CANNON.Material('chassis')
const wheelCANNONMaterial = new CANNON.Material('wheel')

const chassis = new PhysicalObject(
    new THREE.Mesh(
        new THREE.BoxGeometry(chassisSizeX, chassisSizeY, chassisSizeZ),
        new THREE.MeshPhongMaterial({
            color: 0x66ccff,
        }),
    ),
    new CANNON.Body({
        mass: carMass,
        shape: new CANNON.Box(new CANNON.Vec3(chassisSizeX / 2, chassisSizeY / 2, chassisSizeZ / 2)),
        position: new CANNON.Vec3(0, 0, 5),
        material: chassisCANNONMaterial,
    }),
)
chassis.mesh.castShadow = true

const vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassis.body,
    indexRightAxis: 0,
    indexForwardAxis: 1,
    indexUpAxis: 2,
})
const wheelOptions = {
    radius: wheelRadius,
    directionLocal: new CANNON.Vec3(0, 0, -1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
}
wheelOptions.chassisConnectionPointLocal.set(wheelOffsetX, wheelOffsetY, -wheelOffsetZ)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(-wheelOffsetX, wheelOffsetY, -wheelOffsetZ)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(wheelOffsetX, -wheelOffsetY, -wheelOffsetZ)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(-wheelOffsetX, -wheelOffsetY, -wheelOffsetZ)
vehicle.addWheel(wheelOptions)

const wheels: PhysicalObject[] = []
const wheelQuaternion = new CANNON.Quaternion()
wheelQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2)

vehicle.wheelInfos.forEach(wheel => {
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius * 0.5, 20)
    const wheelObj = new PhysicalObject(
        new THREE.Mesh(
            new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius * 0.5, 20),
            new THREE.MeshPhongMaterial({
                color: 0x66ccff,
            }),
        ),
        new CANNON.Body({
            mass: 0,
            material: wheelCANNONMaterial,
            type: CANNON.Body.KINEMATIC,
            collisionFilterGroup: 0, // turn off collisions
        }),
    )
    const q = wheelQuaternion
    wheelObj.body.addShape(cylinderShape, new CANNON.Vec3(), q)
    wheelObj.mesh.geometry.applyQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w))
    wheels.push(wheelObj)
})

export const car = {
    chassis: chassis,
    vehicle: vehicle,
    wheels: wheels,
    chassisCANNONMaterial: chassisCANNONMaterial,
    wheelCANNONMaterial: wheelCANNONMaterial,
    addin(scene: THREE.Scene, world: CANNON.World) {
        scene.add(chassis.mesh)
        vehicle.addToWorld(world)
        wheels.forEach(w => w.addin(scene, world))
        world.addEventListener('postStep', () => {
          for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i)
            const transform = vehicle.wheelInfos[i].worldTransform
            const wheelObj = wheels[i]
            wheelObj.body.position.copy(transform.position)
            wheelObj.body.quaternion.copy(transform.quaternion)
          }
        })
    },
    moveForward() {
        vehicle.applyEngineForce(maxForce, 2)
        vehicle.applyEngineForce(maxForce, 3)
    },
    moveBackword() {
        vehicle.applyEngineForce(-maxForce, 2)
        vehicle.applyEngineForce(-maxForce, 3)
    },
    stopMove() {
        vehicle.applyEngineForce(0, 2)
        vehicle.applyEngineForce(0, 3)
    },
    turnLeft() {
        vehicle.setSteeringValue(maxSteerVal, 0)
        vehicle.setSteeringValue(maxSteerVal, 1)
    },
    turnRight() {
        vehicle.setSteeringValue(-maxSteerVal, 0)
        vehicle.setSteeringValue(-maxSteerVal, 1)
    },
    stopTurn() {
        vehicle.setSteeringValue(0, 0)
        vehicle.setSteeringValue(0, 1)
    },
    brake() {
        vehicle.setBrake(brakeForce, 0)
        vehicle.setBrake(brakeForce, 1)
        vehicle.setBrake(brakeForce, 2)
        vehicle.setBrake(brakeForce, 3)
    },
    stopBrake() {
        vehicle.setBrake(0, 0)
        vehicle.setBrake(0, 1)
        vehicle.setBrake(0, 2)
        vehicle.setBrake(0, 3)
    },
    update() {
        chassis.update(),
        wheels.forEach(w => w.update())
    },
    addKeyBinding() {
        // Add force on keydown
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    this.moveForward()
                    break
                case 's':
                case 'ArrowDown':
                    this.moveBackword()
                    break
                case 'a':
                case 'ArrowLeft':
                    this.turnLeft()
                    break
                case 'd':
                case 'ArrowRight':
                    this.turnRight()
                    break
                case 'b':
                    this.brake()
                    break
            }
        })
        // Reset force on keyup
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    this.stopMove()
                    break
                case 's':
                case 'ArrowDown':
                    this.stopMove()
                    break
                case 'a':
                case 'ArrowLeft':
                    this.stopTurn()
                    break
                case 'd':
                case 'ArrowRight':
                    this.stopTurn()
                    break
                case 'b':
                    this.stopBrake()
                    break
            }
        })
    },
}