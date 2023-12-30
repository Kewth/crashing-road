import * as THREE from "three";
import * as CANNON from "cannon-es";

export class PhysicalObject {
    obj: THREE.Object3D;
    body: CANNON.Body;
    model: THREE.Object3D | undefined;
    // modelQuaternion: THREE.Quaternion | undefined;
    constructor(obj: THREE.Object3D, body: CANNON.Body) {
        this.obj = obj;
        this.body = body;
    }
    update() {
        PhysicalObject.update(this.obj, this.body)
        // if (this.model) {
        //     this.model.position.copy(this.mesh.position);
        //     if (this.modelQuaternion) {
        //         this.model.quaternion.copy(this.modelQuaternion)
        //         this.model.applyQuaternion(this.mesh.quaternion);
        //     }
        //     else 
        //         this.model.quaternion.copy(this.mesh.quaternion);
        // }
    }
    // useModel(scene: THREE.Scene, model: THREE.Object3D, q?: THREE.Quaternion) {
    //     this.model = model;
    //     this.mesh.add(this.model);
    //     this.model.position.z = -0.5;
    //     // if (q) this.modelQuaternion = q;
    //     if (q) this.model.applyQuaternion(q);
    //     // scene.remove(this.mesh);
    //     // scene.add(this.model);
    // }
    addin(scene: THREE.Scene, world: CANNON.World) {
        scene.add(this.obj);
        world.addBody(this.body);
    }

    remove(scene: THREE.Scene, world: CANNON.World) {
        scene.remove(this.obj)
        world.removeBody(this.body)
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