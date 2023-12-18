import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";

const chassisSizeX = 1.5;
const chassisSizeY = 3;
const chassisSizeZ = 0.8;
const wheelOffsetX = 0.8;
const wheelOffsetY = 0.8;
const wheelOffsetZ = 0;
const wheelRadius = 0.4;
const carMass = 500;

const maxSteerVal = 0.5;
const maxForce = 1500;
const brakeForce = 100000;

const chassisGeometry = new THREE.BoxGeometry(
    chassisSizeX,
    chassisSizeY,
    chassisSizeZ,
);
const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0x66ccff });
const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x66ccff });
const brokenWheelMaterial = new THREE.MeshPhongMaterial({ color: 0xff4500 });

const chassisCANNONMaterial = new CANNON.Material("chassis");
const wheelCANNONMaterial = new CANNON.Material("wheel");

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
};

export class Car {
    chassis: PhysicalObject;
    vehicle: CANNON.RaycastVehicle;
    wheels: PhysicalObject[];
    chassisCANNONMaterial;
    wheelCANNONMaterial;
    wheelIsBroken: boolean[];
    collisionLockUntil: number;

    constructor(posX: number, posY: number, posZ: number) {
        this.chassisCANNONMaterial = chassisCANNONMaterial;
        this.wheelCANNONMaterial = wheelCANNONMaterial;
        // chassis
        this.chassis = new PhysicalObject(
            new THREE.Mesh(chassisGeometry, chassisMaterial),
            new CANNON.Body({
                mass: carMass,
                shape: new CANNON.Box(
                    new CANNON.Vec3(
                        chassisSizeX / 2,
                        chassisSizeY / 2,
                        chassisSizeZ / 2,
                    ),
                ),
                position: new CANNON.Vec3(posX, posY, posZ),
                material: this.chassisCANNONMaterial,
            }),
        );
        this.chassis.mesh.castShadow = true;
        // logical vehicle
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassis.body,
            indexRightAxis: 0,
            indexForwardAxis: 1,
            indexUpAxis: 2,
        });
        wheelOptions.chassisConnectionPointLocal.set(
            wheelOffsetX,
            wheelOffsetY,
            -wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            -wheelOffsetX,
            wheelOffsetY,
            -wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            wheelOffsetX,
            -wheelOffsetY,
            -wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            -wheelOffsetX,
            -wheelOffsetY,
            -wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        // wheels
        this.wheels = [];
        this.wheelIsBroken = [];
        const wheelQuaternion = new CANNON.Quaternion();
        wheelQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
        this.vehicle.wheelInfos.forEach((wheel) => {
            const cylinderShape = new CANNON.Cylinder(
                wheel.radius,
                wheel.radius,
                wheel.radius * 0.5,
                20,
            );
            const wheelObj = new PhysicalObject(
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        wheel.radius,
                        wheel.radius,
                        wheel.radius * 0.5,
                        20,
                    ),
                    wheelMaterial
                ),
                new CANNON.Body({
                    mass: 0,
                    material: this.wheelCANNONMaterial,
                    type: CANNON.Body.KINEMATIC,
                    collisionFilterGroup: 0, // turn off collisions
                }),
            );
            const q = wheelQuaternion;
            wheelObj.body.addShape(cylinderShape, new CANNON.Vec3(), q);
            wheelObj.mesh.geometry.applyQuaternion(
                new THREE.Quaternion(q.x, q.y, q.z, q.w),
            );
            this.wheels.push(wheelObj);
            this.wheelIsBroken.push(false);
        });
        this.collisionLockUntil = Date.now();
    }

    // add into world, call this after initialization
    addin(scene: THREE.Scene, world: CANNON.World) {
        scene.add(this.chassis.mesh);
        this.vehicle.addToWorld(world);
        this.wheels.forEach((w) => w.addin(scene, world));
        world.addEventListener("postStep", () => {
            for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i);
                const transform = this.vehicle.wheelInfos[i].worldTransform;
                const wheelObj = this.wheels[i];
                wheelObj.body.position.copy(transform.position);
                wheelObj.body.quaternion.copy(transform.quaternion);
            }
        });
    }

    // moving logical
    // moveForward() {
    //     this.vehicle.applyEngineForce(maxForce, 2);
    //     this.vehicle.applyEngineForce(maxForce, 3);
    // }
    // moveBackword() {
    //     this.vehicle.applyEngineForce(-maxForce, 2);
    //     this.vehicle.applyEngineForce(-maxForce, 3);
    // }
    // stopMove() {
    //     this.vehicle.applyEngineForce(0, 2);
    //     this.vehicle.applyEngineForce(0, 3);
    // }
    // turnLeft() {
    //     this.vehicle.setSteeringValue(maxSteerVal, 0);
    //     this.vehicle.setSteeringValue(maxSteerVal, 1);
    // }
    // turnRight() {
    //     this.vehicle.setSteeringValue(-maxSteerVal, 0);
    //     this.vehicle.setSteeringValue(-maxSteerVal, 1);
    // }
    // stopTurn() {
    //     this.vehicle.setSteeringValue(0, 0);
    //     this.vehicle.setSteeringValue(0, 1);
    // }
    brake() {
        this.vehicle.setBrake(brakeForce, 0);
        this.vehicle.setBrake(brakeForce, 1);
        this.vehicle.setBrake(brakeForce, 2);
        this.vehicle.setBrake(brakeForce, 3);
    }
    stopBrake() {
        this.vehicle.setBrake(0, 0);
        this.vehicle.setBrake(0, 1);
        this.vehicle.setBrake(0, 2);
        this.vehicle.setBrake(0, 3);
    }
    

    applyEngineForce(r: number, i: number) {
        if (!this.wheelIsBroken[i])
            this.vehicle.applyEngineForce(r * maxForce, i);
    }
    setSteeringValue(r: number, i: number) {
        if (!this.wheelIsBroken[i])
            this.vehicle.setSteeringValue(r * maxSteerVal, i);
    }

    /**
     * control the drive of the car
     * @param r the relative drive. ranged between -1 (full reverse) and +1 (full drive)
     */
    drive(r: number) {
        r = Math.max(-1, Math.min(r, 1))
        this.applyEngineForce(r, 2)
        this.applyEngineForce(r, 3)
    }

    /**
     * control the steer of the car
     * @param r the relative steer. ranged between -1 (right) and +1 (left)
     */
    steer(r: number) {
        r = Math.max(-1, Math.min(r, 1))
        this.setSteeringValue(r, 0)
        this.setSteeringValue(r, 1)
    }

    // update information to render
    update() {
        this.chassis.update(), this.wheels.forEach((w) => w.update());
    }

    // call this after initialization if this car is controlled by player
    addKeyBinding() {
        // Add force on keydown
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "w":
                case "ArrowUp":
                    this.drive(1);
                    break;
                case "s":
                case "ArrowDown":
                    this.drive(-1);
                    break;
                case "a":
                case "ArrowLeft":
                    this.steer(1);
                    break;
                case "d":
                case "ArrowRight":
                    this.steer(-1);
                    break;
                case "b":
                    this.brake();
                    break;
            }
        });
        // Reset force on keyup
        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "w":
                case "ArrowUp":
                    this.drive(0);
                    break;
                case "s":
                case "ArrowDown":
                    this.drive(0);
                    break;
                case "a":
                case "ArrowLeft":
                    this.steer(0);
                    break;
                case "d":
                case "ArrowRight":
                    this.steer(0);
                    break;
                case "b":
                    this.stopBrake();
                    break;
            }
        });
    }

    // call this after initialization if this car is controlled by player
    addCollisionDetection() {
        // Listen for collisions
        this.chassis.body.addEventListener("collide", (e: any) => {
            const t = Date.now();
            if (e.contact && t >= this.collisionLockUntil) {
                // Get the relative velocity of the collision
                const velocity = e.contact.getImpactVelocityAlongNormal();
                // Calculate the damage. This is a simple example, you might want to use a more complex formula.
                const damage = Math.abs(velocity) * this.chassis.body.mass;
                // If the chassis's health is 0 or less, remove it from the game.
                if (damage > 3000) {
                    const index = Math.floor(Math.random() * 4);
                    if (this.wheelIsBroken[index] === false) {
                        this.setSteeringValue(0, index);
                        this.applyEngineForce(0, index);
                        this.wheelIsBroken[index] = true;
                        this.wheels[index].mesh.material = brokenWheelMaterial
                        console.log(t, this.collisionLockUntil)
                        this.collisionLockUntil = t + 2000;
                    }
                }
            }
        });
    }
}
