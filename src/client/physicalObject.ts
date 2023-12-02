import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class PhysicalObject {
    mesh
    body
    constructor(mesh: THREE.Mesh, body: CANNON.Body) {
        this.mesh = mesh
        this.body = body
    }
    update() {
        this.mesh.position.set(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        )
        this.mesh.quaternion.set(
            this.body.quaternion.x,
            this.body.quaternion.y,
            this.body.quaternion.z,
            this.body.quaternion.w,
        )
    }
    addin(scene: THREE.Scene, world: CANNON.World) {
        scene.add(this.mesh)
        world.addBody(this.body)
    }
}
