import * as THREE from "three";
import * as CANNON from "cannon-es";

export class PhysicalObject {
    obj: THREE.Object3D;
    body: CANNON.Body;

    constructor(obj: THREE.Object3D, body: CANNON.Body) {
        this.obj = obj;
        this.body = body;
    }

    update() {
        PhysicalObject.update(this.obj, this.body)
    }

    addin(scene: THREE.Scene, world: CANNON.World) {
        scene.add(this.obj);
        world.addBody(this.body);
    }

    remove() {
        this.obj.removeFromParent();
        this.body.world?.removeBody(this.body);
    }

    static update(obj: THREE.Object3D, body: CANNON.Body) {
        obj.position.set(
            body.position.x,
            body.position.y,
            body.position.z,
        );
        obj.quaternion.set(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w,
        );
    }
}