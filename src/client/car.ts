import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicalObject } from "./physicalObject";

const chassisSizeX = 2.0;
const chassisSizeY = 4.3;
const chassisSizeZ = 0.8;
const wheelOffsetX = 1.0;
const wheelOffsetY = 1.6;
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

export const chassisCANNONMaterial = new CANNON.Material("chassis");
export const wheelCANNONMaterial = new CANNON.Material("wheel");

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
    obj3d: THREE.Object3D;
    vehicle: CANNON.RaycastVehicle;
    wheel3ds: THREE.Object3D[];
    wheelBodys: CANNON.Body[];
    wheelIsBroken: boolean[];
    collisionLockUntil: number;
    usingModel: boolean;
    scene: THREE.Scene;
    world: CANNON.World;

    constructor(posX: number, posY: number, posZ: number, scene: THREE.Scene, world: CANNON.World) {
        this.obj3d = new THREE.Group();
        this.scene = scene;
        this.world = world;
        // chassis
        const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial)
        const chassisBody = new CANNON.Body({
            mass: carMass,
            shape: new CANNON.Box(
                new CANNON.Vec3(
                    chassisSizeX / 2,
                    chassisSizeY / 2,
                    chassisSizeZ / 2,
                ),
            ),
            position: new CANNON.Vec3(posX, posY, posZ),
            material: chassisCANNONMaterial,
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
                wheel.chassisConnectionPointLocal.z - chassisSizeZ / 2,
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
                material: wheelCANNONMaterial,
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
        this.scene.remove(this.obj3d);

        // Remove the car's wheel bodies from the world
        for (const wheelBody of this.wheelBodys) {
            this.world.removeBody(wheelBody);
        }

        // Dispose materials used by the car
        chassisMaterial.dispose();
        wheelMaterial.dispose();
        brokenWheelMaterial.dispose();

        // Dispose geometries used by the car
        chassisGeometry.dispose();

        this.vehicle.removeFromWorld(this.world)
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
        r = Math.max(-1, Math.min(r, 1))
        this.applyEngineForce(Math.min(r*(10/this.velocity().length()), 2), 2)
        this.applyEngineForce(Math.min(r*(10/this.velocity().length()), 2), 3)
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
        PhysicalObject.update(this.obj3d, this.vehicle.chassisBody)
        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            this.wheel3ds[i].rotation.set(0, 0, 0);
            if (this.usingModel) {
                this.wheel3ds[i].rotateY(this.vehicle.wheelInfos[i].steering);
                this.wheel3ds[i].rotateX(-this.vehicle.wheelInfos[i].rotation);
            }
            else {
                this.wheel3ds[i].rotateZ(this.vehicle.wheelInfos[i].steering);
            }
        }
    }

    // call this after initialization if this car is controlled by player
    addCollisionDetection() {
        // Listen for collisions
        this.vehicle.chassisBody.addEventListener("collide", (e: any) => {
            const t = Date.now();
            if (e.contact && t >= this.collisionLockUntil) {
                // Get the relative velocity of the collision
                const velocity = e.contact.getImpactVelocityAlongNormal();
                // Calculate the damage. This is a simple example, you might want to use a more complex formula.
                const damage = Math.abs(velocity) * carMass
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
    useModel(model: THREE.Object3D) {
        model = model.clone();
        if (this.usingModel) return;
        model.position.z -= chassisSizeZ / 2;
        this.obj3d.remove(this.obj3d.children[0]);
        const wheelNames = ['wheel_fr', 'wheel_fl', 'wheel_rr', 'wheel_rl'];
        for (let i = 0; i < 4; i ++) {
            const w = model.getObjectByName(wheelNames[i]);
            if (w) {
                w.scale.set(1.2, 1.2, 1.2)
                this.obj3d.remove(this.wheel3ds[i]);
                this.wheel3ds[i] = w;
            }
        }
        this.obj3d.add(model);
        model.traverse(node => {
            if (node instanceof THREE.Mesh) { node.castShadow = true; }
        });
        this.usingModel = true;
    }

    // get 3d position
    pos() {
        return this.obj3d.position
    }
    
    // get physical velocity
    velocity() {
        return this.vehicle.chassisBody.velocity
    }
}
