import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { bound } from './bound'
import { jumpGenerator } from './jump'
import { Car } from './car'
import { dummyAI } from './dummyAI'

const scene = new THREE.Scene()
const world = new CANNON.World()
// const cannonDebugger = CannonDebugger(scene, world)
world.gravity.set(0, 0, -9.8)
world.step(0.1)
world.defaultContactMaterial.friction = 0

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

bound.addin(scene, world)
const car = new Car(0, 0, 5)
car.addin(scene, world)

const wheel_ground = new CANNON.ContactMaterial(car.wheelCANNONMaterial, bound.groundCANNONmaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
})
const chassis_ground = new CANNON.ContactMaterial(car.chassisCANNONMaterial, bound.groundCANNONmaterial, {
    friction: 0.3,
    restitution: 0.3,
})
// world.addContactMaterial(wheel_ground)
// world.addContactMaterial(chassis_ground)

car.addKeyBinding()

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const clock = new THREE.Clock()
let delta

function animate() {
    requestAnimationFrame(animate)
    delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)
    car.update()
    const dis = car.chassis.mesh.position.y
    bound.update(dis)
    jumpGenerator.generate(dis).forEach(j => {
        j.update()
        j.addin(scene, world)
    })
    camera.position.set(
        car.chassis.mesh.position.x,
        car.chassis.mesh.position.y - 5,
        car.chassis.mesh.position.z + 5,
    )
    light.position.set(
        car.chassis.mesh.position.x + 2,
        car.chassis.mesh.position.y + 4,
        car.chassis.mesh.position.z + 2,
    )
    light.target.position.set(
        car.chassis.mesh.position.x - 2,
        car.chassis.mesh.position.y - 4,
        car.chassis.mesh.position.z - 2,
    )
    // scene.add( new THREE.DirectionalLightHelper(light) )
    // cannonDebugger.update()
    // car.moveForward()
    dummyAI(car)
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()

