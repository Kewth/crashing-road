import * as THREE from 'three'
import * as CANNON from 'cannon-es'

class PhysicalObject {
    mesh
    body
    constructor(mesh: THREE.Mesh, body: CANNON.Body) {
        this.mesh = mesh
        this.body = body
    }
    updatePosition() {
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

const scene = new THREE.Scene()
const world = new CANNON.World()
world.gravity.set(0, 0, -9.82)
world.step(0.1)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.rotateX(Math.PI * 0.3)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)
const light = new THREE.DirectionalLight()
light.castShadow = true
scene.add(light)
scene.add(light.target)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const groundGeometry = new THREE.PlaneGeometry(20, 1000)
const phongMaterial = new THREE.MeshPhongMaterial()
const planeShape = new CANNON.Plane()

const ground = new PhysicalObject(
    new THREE.Mesh(
        groundGeometry,
        phongMaterial,
    ),
    new CANNON.Body({
        mass: 0,
        shape: planeShape,
    }),
)
ground.mesh.receiveShadow = true
ground.addin(scene, world)
ground.updatePosition()

const carSize = 1
const car = new PhysicalObject(
    new THREE.Mesh(
        new THREE.BoxGeometry(carSize, carSize, carSize),
        new THREE.MeshPhongMaterial({
            color: 0x66ccff,
        }),
    ),
    new CANNON.Body({
        mass: 10,
        shape: new CANNON.Box(new CANNON.Vec3(carSize / 2, carSize / 2, carSize / 2)),
        position: new CANNON.Vec3(0, 0, 5)
    }),
)
car.mesh.castShadow = true
car.addin(scene, world)

const jumpGeometry = new THREE.CylinderGeometry(0, 1, 0.5, 5)
const jumpMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
})
const jumpShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
for (let i = 0; i < 100; i++) {
    const jump = new PhysicalObject(
        new THREE.Mesh(
            jumpGeometry,
            jumpMaterial,
        ),
        new CANNON.Body({
            mass: 0,
            shape: jumpShape,
            position: new CANNON.Vec3(Math.random() * 20 - 10, Math.random() * 1000 - 500, 0.5),
        })
    )
    jump.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    jump.addin(scene, world)
    jump.updatePosition()
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// keyboard
const keyMap: { [id: string]: boolean } = {}
const onDocumentKey = (e: KeyboardEvent) => {
    keyMap[e.code] = e.type === 'keydown'
}

document.addEventListener('keydown', onDocumentKey, false)
document.addEventListener('keyup', onDocumentKey, false)
const clock = new THREE.Clock()
let delta

function animate() {
    requestAnimationFrame(animate)
    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)
    car.updatePosition()
    camera.position.set(
        car.mesh.position.x,
        car.mesh.position.y - 5,
        car.mesh.position.z + 5,
    )
    if (keyMap['KeyW'] || keyMap['ArrowUp']) {
        car.body.velocity.y += 10 * delta
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        car.body.velocity.y -= 10 * delta
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        car.body.velocity.x -= 10 * delta
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        car.body.velocity.x += 10 * delta
    }
    light.position.set(
        car.mesh.position.x + 2,
        car.mesh.position.y + 4,
        car.mesh.position.z + 2,
    )
    light.target.position.set(
        car.mesh.position.x - 2,
        car.mesh.position.y - 4,
        car.mesh.position.z - 2,
    )
    // scene.add( new THREE.DirectionalLightHelper(light) )
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()

