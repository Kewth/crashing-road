import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";
import { CANNONMaterial } from "./cannonMaterial";

interface CarConfig {
    chassisSizeX: number;
    chassisSizeY: number;
    chassisSizeZ: number;
    wheelOffsetX: number;
    wheelOffsetY: number;
    wheelOffsetZ: number;
    wheelRadius: number;
    mass: number;
}

type ConfigName = "ferrari" | "truck" | "police"
const configMap: {[key in ConfigName]: CarConfig} = {
    "ferrari" : {
        chassisSizeX: 2.0,
        chassisSizeY: 4.3,
        chassisSizeZ: 0.8,
        wheelOffsetX: 1.0,
        wheelOffsetY: 1.6,
        wheelOffsetZ: 0,
        wheelRadius: 0.4,
        mass: 500,
    },
    "truck" : {
        chassisSizeX: 2.2,
        chassisSizeY: 5.2,
        chassisSizeZ: 2.7,
        wheelOffsetX: 1.1,
        wheelOffsetY: 2.1,
        wheelOffsetZ: 0.8,
        wheelRadius: 0.5,
        mass: 1000,
    },
    "police" : {
        chassisSizeX: 2.0,
        chassisSizeY: 4.8,
        chassisSizeZ: 0.8,
        wheelOffsetX: 1.0,
        wheelOffsetY: 1.7,
        wheelOffsetZ: 0,
        wheelRadius: 0.4,
        mass: 500,
    },
}
const modelMap: {[key in ConfigName]: THREE.Object3D | undefined} = {
    "ferrari" : undefined,
    "truck" : undefined,
    "police" : undefined,
}

// const chassisSizeX = 2.0;
// const chassisSizeY = 4.3;
// const chassisSizeZ = 0.8;
// const wheelOffsetX = 1.0;
// const wheelOffsetY = 1.6;
// const wheelOffsetZ = 0;
// const wheelRadius = 0.4;
// const carMass = 500;

const maxSteerVal = 0.5;
const maxForce = 1500;
const brakeForce = 500;

const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0x66ccff });
const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x66ccff });
const brokenWheelMaterial = new THREE.MeshPhongMaterial({ color: 0xff4500 });

const wheelOptions = {
    radius: 0, // need to be set
    directionLocal: new CANNON.Vec3(0, 0, -1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 1, 0), // need to be set
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
};

export class Car {
    obj3d: THREE.Object3D;
    private configName: ConfigName;
    private vehicle: CANNON.RaycastVehicle;
    private wheel3ds: (THREE.Object3D | undefined)[];
    private wheelBodys: CANNON.Body[];
    private wheelIsBroken: boolean[];
    private collisionLockUntil: number;
    private usingModel: boolean;

    constructor(posX: number, posY: number, posZ: number, configName: ConfigName, scene: THREE.Scene, world: CANNON.World) {
        this.obj3d = new THREE.Group();
        const config = configMap[configName];
        if (!config) console.error(`no config (${configName})`)
        this.configName = configName;
        // chassis
        const chassisGeometry = new THREE.BoxGeometry(
            config.chassisSizeX,
            config.chassisSizeY,
            config.chassisSizeZ,
        );
        const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial)
        const chassisBody = new CANNON.Body({
            mass: config.mass,
            shape: new CANNON.Box(
                new CANNON.Vec3(
                    config.chassisSizeX / 2,
                    config.chassisSizeY / 2,
                    config.chassisSizeZ / 2,
                ),
            ),
            position: new CANNON.Vec3(posX, posY, posZ),
            material: CANNONMaterial.chassis,
        })
        chassisMesh.castShadow = true;
        this.obj3d.add(chassisMesh)
        // logical vehicle
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 0,
            indexForwardAxis: 1,
            indexUpAxis: 2,
        });
        wheelOptions.radius = config.wheelRadius
        wheelOptions.chassisConnectionPointLocal.set(
            config.wheelOffsetX,
            config.wheelOffsetY,
            -config.wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            -config.wheelOffsetX,
            config.wheelOffsetY,
            -config.wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            config.wheelOffsetX,
            -config.wheelOffsetY,
            -config.wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        wheelOptions.chassisConnectionPointLocal.set(
            -config.wheelOffsetX,
            -config.wheelOffsetY,
            -config.wheelOffsetZ,
        );
        this.vehicle.addWheel(wheelOptions);
        // wheels
        this.wheel3ds = [];
        this.wheelBodys = [];
        this.wheelIsBroken = [];
        const wheelQuaternion = new CANNON.Quaternion();
        wheelQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2);
        this.vehicle.wheelInfos.forEach((wheel) => {
            // wheel mesh
            const wheelMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    wheel.radius,
                    wheel.radius,
                    wheel.radius * 0.5,
                    20,
                ),
                wheelMaterial
            )
            const q = wheelQuaternion;
            wheelMesh.geometry.applyQuaternion(
                new THREE.Quaternion(q.x, q.y, q.z, q.w),
            );
            wheelMesh.position.set(
                wheel.chassisConnectionPointLocal.x,
                wheel.chassisConnectionPointLocal.y,
                wheel.chassisConnectionPointLocal.z - config.chassisSizeZ / 2,
            );
            this.obj3d.add(wheelMesh);
            this.wheel3ds.push(wheelMesh);
            // wheel body
            const cylinderShape = new CANNON.Cylinder(
                wheel.radius,
                wheel.radius,
                wheel.radius * 0.5,
                20,
            );
            const wheelBody = new CANNON.Body({
                mass: 0,
                material: CANNONMaterial.wheel,
                type: CANNON.Body.KINEMATIC,
                collisionFilterGroup: 0, // turn off collisions
            })
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
            world.addBody(wheelBody);
            this.wheelBodys.push(wheelBody);
            // other property
            this.wheelIsBroken.push(false);
        });
        // add into scene & world
        scene.add(this.obj3d);
        this.vehicle.addToWorld(world);
        // postStep
        world.addEventListener("postStep", () => {
            for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
                this.vehicle.updateWheelTransform(i);
                const transform = this.vehicle.wheelInfos[i].worldTransform;
                const body = this.wheelBodys[i];
                body.position.copy(transform.position);
                body.quaternion.copy(transform.quaternion);
            }
        });
        // other property
        this.usingModel = false;
        this.collisionLockUntil = Date.now();
    }


    destroy() {
        // Remove the car's 3D object from the scene
        this.obj3d.removeFromParent();

        // Remove the car's wheel bodies from the world
        for (const wheelBody of this.wheelBodys) {
            wheelBody.world?.removeBody(wheelBody);
        }

        // Dispose materials used by the car
        chassisMaterial.dispose();
        wheelMaterial.dispose();
        brokenWheelMaterial.dispose();

        // Dispose geometries used by the car
        // chassisGeometry.dispose();

        this.vehicle.world && this.vehicle.removeFromWorld(this.vehicle.world)
    }


    brake(r: number) {
        this.vehicle.setBrake(r * brakeForce, 0);
        this.vehicle.setBrake(r * brakeForce, 1);
        this.vehicle.setBrake(r * brakeForce, 2);
        this.vehicle.setBrake(r * brakeForce, 3);
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
        const lim = 10 / (this.velocity.length() + 10)
        r = Math.max(-lim, Math.min(r, lim))
        this.applyEngineForce(r, 2);
        this.applyEngineForce(r, 3);
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
        if (!this.usingModel && modelMap[this.configName]) {
            this.useModel(modelMap[this.configName]!)
        }
        PhysicalObject.update(this.obj3d, this.vehicle.chassisBody)
        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            const w = this.wheel3ds[i];
            if (!w) break;
            w.rotation.set(0, 0, 0);
            if (this.usingModel) {
                w.rotateY(this.vehicle.wheelInfos[i].steering);
                w.rotateX(-this.vehicle.wheelInfos[i].rotation);
            }
            else {
                w.rotateZ(this.vehicle.wheelInfos[i].steering);
            }
        }
    }

    // call this after initialization if this car is controlled by player
    addCollisionDetection() {
        return;
        // Listen for collisions
        this.vehicle.chassisBody.addEventListener("collide", (e: any) => {
            const t = Date.now();
            if (e.contact && t >= this.collisionLockUntil) {
                // Get the relative velocity of the collision
                const velocity = e.contact.getImpactVelocityAlongNormal();
                // Calculate the damage. This is a simple example, you might want to use a more complex formula.
                const damage = Math.abs(velocity) * this.vehicle.chassisBody.mass
                // If the chassis's health is 0 or less, remove it from the game.
                if (damage > 3000) {
                    const index = Math.floor(Math.random() * 4);
                    if (this.wheelIsBroken[index] === false) {
                        this.setSteeringValue(0, index);
                        this.applyEngineForce(0, index);
                        this.wheelIsBroken[index] = true;
                        const w3d = this.wheel3ds[index]
                        if (w3d instanceof THREE.Mesh)
                            w3d.material = brokenWheelMaterial
                        console.log(t, this.collisionLockUntil)
                        this.collisionLockUntil = t + 2000;
                    }
                }
            }
        });
    }

    // use a model to replace simple mesh
    private useModel(model: THREE.Object3D) {
        if (this.usingModel) return;
        model = model.clone();
        model.position.z -= configMap[this.configName].chassisSizeZ / 2;
        this.obj3d.remove(this.obj3d.children[0]);
        const wheelNames = ['wheel_fr', 'wheel_fl', 'wheel_rr', 'wheel_rl'];
        for (let i = 0; i < 4; i ++) {
            const w = model.getObjectByName(wheelNames[i]);
            this.obj3d.remove(this.wheel3ds[i]!);
            this.wheel3ds[i] = w;
            w?.scale.set(1.2, 1.2, 1.2);
        }
        this.obj3d.add(model);
        this.usingModel = true;
    }

    // get 3d position
    get pos() {
        return this.obj3d.position
    }

    // get 3d quaternion
    get quaternion() {
        return this.obj3d.quaternion
    }

    // get physical velocity
    get velocity() {
        return this.vehicle.chassisBody.velocity
    }

    // get world position
    get worldPos() {
        return this.vehicle.chassisBody.position
    }

    // get world position
    get worldQuaternion() {
        return this.vehicle.chassisBody.quaternion
    }

    // add a model map, the corresponding cars will use this model automatically
    static addModel(name: ConfigName, model: THREE.Object3D) {
        modelMap[name] = model;
    }
}
