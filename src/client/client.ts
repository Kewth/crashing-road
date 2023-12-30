import * as THREE from "three";
import * as CANNON from "cannon-es";
import Stats from 'three/examples/jsm/libs/stats.module'
// import CannonDebugger from "cannon-es-debugger";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { Boundary, groundCANNONmaterial } from "./boundary";
import { jumpGenerator } from "./jump";
import { Car, chassisCANNONMaterial, wheelCANNONMaterial } from "./car";
import { dummyAI } from "./dummyAI";
import { aggressiveAI } from "./aggressiveAI";
import { initKeyBinding } from "./keyBinding";
import { TrailCamera } from "./trailCamera";
import { CustomLight } from "./customLight";

const scene = new THREE.Scene();
const world = new CANNON.World();
// const cannonDebugger = CannonDebugger(scene, world)
world.gravity.set(0, 0, -9.8);
world.step(0.1);
world.defaultContactMaterial.friction = 0;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const aggressiveCar = new Car(0, -20, 2, scene, world);

const playerCar = new Car(0, 0, 2, scene, world);

playerCar.addCollisionDetection();
let npcCars: Car[] = [];
for (let i = 1; i <= 20; i++) {
    // Code to be executed in each iteration
    let curCar = new Car(0, 10 + 20 * i, 2, scene, world);
    npcCars.push(curCar);
}

const boundary = new Boundary(playerCar.obj3d, scene, world)

const light = new CustomLight(playerCar.obj3d, scene);

const camera = new TrailCamera(playerCar.obj3d)

const wheel_ground = new CANNON.ContactMaterial(
    wheelCANNONMaterial,
    groundCANNONmaterial,
    {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
    },
);
const chassis_ground = new CANNON.ContactMaterial(
    chassisCANNONMaterial,
    groundCANNONmaterial,
    {
        friction: 0.3,
        restitution: 0.3,
    },
);
// world.addContactMaterial(wheel_ground)
world.addContactMaterial(chassis_ground)


window.addEventListener("resize", () => {
    camera.camera.aspect = window.innerWidth / window.innerHeight;
    camera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

initKeyBinding(playerCar, camera);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/libs/draco/gltf/')
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
let carModel: THREE.Object3D | undefined = undefined
// let boxHelper: THREE.BoxHelper | undefined = undefined

loader.load(
    'models/ferrari.glb',
    gltf => {
        carModel = gltf.scene.children[0];
        console.log(carModel);
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        // playerCar.chassis.useModel(scene, carModel, q)
        carModel.applyQuaternion(q);
        playerCar.useModel(carModel);
        // scene.add(carModel)
        // boxHelper = new THREE.BoxHelper( carModel, 0xffff00 );
        // scene.add(boxHelper)
    },
    undefined,
    error => {
        console.error(error);
    }
);

const clock = new THREE.Clock();
let delta;

type UpdateObject = { update(): void }
const updObjs: UpdateObject[] = [
    aggressiveCar,
    playerCar,
    ...npcCars,
    boundary,
    light,
    camera,
]

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate);
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);
    updObjs.forEach(obj => obj.update());
    const dis = playerCar.obj3d.position.y;
    jumpGenerator.generate(dis).forEach((j) => {
        j.update();
        j.addin(scene, world);
    });
    // scene.add( new THREE.DirectionalLightHelper(light.light) )
    // cannonDebugger.update()
    // if (boxHelper) boxHelper.update();
    aggressiveAI(aggressiveCar, playerCar);
    npcCars.forEach(car => dummyAI(car))
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera.camera);
}

animate();
