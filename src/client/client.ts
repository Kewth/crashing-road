import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

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
const cannonDebugger = CannonDebugger(scene, world)
world.gravity.set(0, 0, -9.8)
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

const groundCANNONmaterial = new CANNON.Material('ground')
const ground = new PhysicalObject(
    new THREE.Mesh(
        groundGeometry,
        phongMaterial,
    ),
    new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: groundCANNONmaterial,
    }),
)
ground.mesh.receiveShadow = true
ground.addin(scene, world)
ground.updatePosition()

// vehicle
const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 2, 0.5))
const chassisBody = new CANNON.Body({
    mass: 150,
    shape: chassisShape,
    position: new CANNON.Vec3(0, 0, 5),
    // angularVelocity: new CANNON.Vec3(0, 0, 0.5),
})
const CAR = new PhysicalObject(
    new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 1),
        new THREE.MeshPhongMaterial({
            color: 0x66ccff,
        }),
    ),
    chassisBody,
)
scene.add(CAR.mesh)
CAR.updatePosition()
const vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0,
    indexForwardAxis: 1,
    indexUpAxis: 2,
})
const wheelOptions = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, 0, -1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(0, 1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
}
wheelOptions.chassisConnectionPointLocal.set(2, 2, 0)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(-2, 2, 0)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(2, -2, 0)
vehicle.addWheel(wheelOptions)
wheelOptions.chassisConnectionPointLocal.set(-2, -2, 0)
vehicle.addWheel(wheelOptions)
vehicle.addToWorld(world)
const wheels: PhysicalObject[] = []
const wheelCANNONMaterial = new CANNON.Material('wheel')
vehicle.wheelInfos.forEach((wheel) => {
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2)
    const body = 
        new CANNON.Body({
            mass: 0,
            material: wheelCANNONMaterial,
            type: CANNON.Body.KINEMATIC,
            collisionFilterGroup: 0, // turn off collisions
        })
    body.addShape(cylinderShape, new CANNON.Vec3(), q)
    // body.addShape(cylinderShape)
    // body.quaternion.copy(q)
    const wheelObj = new PhysicalObject(
        new THREE.Mesh(
            new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius / 2, 20),
            new THREE.MeshPhongMaterial({
                color: 0x66ccff,
            }),
        ),
        body,
    )
    console.log(q)
    console.log(wheelObj.body.quaternion)
    wheelObj.updatePosition()
    wheelObj.addin(scene, world)
    wheels.push(wheelObj)
})
world.addEventListener('postStep', () => {
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i)
    const transform = vehicle.wheelInfos[i].worldTransform
    const wheelObj = wheels[i]
    wheelObj.body.position.copy(transform.position)
    wheelObj.body.quaternion.copy(transform.quaternion)
    wheelObj.updatePosition()
    const q = new THREE.Quaternion()
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
    wheelObj.mesh.applyQuaternion(q)
  }
})

const wheel_ground = new CANNON.ContactMaterial(wheelCANNONMaterial, groundCANNONmaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
})
world.addContactMaterial(wheel_ground)

// const carSize = 1
// const car = new PhysicalObject(
//     new THREE.Mesh(
//         new THREE.BoxGeometry(carSize, carSize, carSize),
//         new THREE.MeshPhongMaterial({
//             color: 0x66ccff,
//         }),
//     ),
//     new CANNON.Body({
//         mass: 10,
//         shape: new CANNON.Box(new CANNON.Vec3(carSize / 2, carSize / 2, carSize / 2)),
//         position: new CANNON.Vec3(0, 0, 10)
//     }),
// )
// car.mesh.castShadow = true
// car.addin(scene, world)

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

const maxForce = 1000
const maxSteerVal = 0.5

function animate() {
    requestAnimationFrame(animate)
    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)
    // car.updatePosition()
    CAR.updatePosition()
    camera.position.set(
        CAR.mesh.position.x,
        CAR.mesh.position.y - 5,
        CAR.mesh.position.z + 5,
    )
    if (keyMap['KeyW'] || keyMap['ArrowUp']) {
        // CAR.body.velocity.y += 10 * delta
        vehicle.applyEngineForce(-maxForce, 2)
        vehicle.applyEngineForce(-maxForce, 3)
    }
    if (keyMap['KeyS'] || keyMap['ArrowDown']) {
        // CAR.body.velocity.y -= 10 * delta
        vehicle.applyEngineForce(maxForce, 2)
        vehicle.applyEngineForce(maxForce, 3)
    }
    if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
        // CAR.body.velocity.x -= 10 * delta
        vehicle.setSteeringValue(maxSteerVal, 0)
        vehicle.setSteeringValue(maxSteerVal, 1)
    }
    if (keyMap['KeyD'] || keyMap['ArrowRight']) {
        // CAR.body.velocity.x += 10 * delta
        vehicle.setSteeringValue(-maxSteerVal, 0)
        vehicle.setSteeringValue(-maxSteerVal, 1)
    }
    light.position.set(
        CAR.mesh.position.x + 2,
        CAR.mesh.position.y + 4,
        CAR.mesh.position.z + 2,
    )
    light.target.position.set(
        CAR.mesh.position.x - 2,
        CAR.mesh.position.y - 4,
        CAR.mesh.position.z - 2,
    )
    // scene.add( new THREE.DirectionalLightHelper(light) )
    cannonDebugger.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()

