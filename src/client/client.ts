import * as THREE from "three";
import * as CANNON from "cannon-es";
import Stats from 'three/examples/jsm/libs/stats.module'
// import CannonDebugger from "cannon-es-debugger";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { Boundary, groundCANNONmaterial } from "./boundary";
import { jumpGenerator } from "./jump";
import { Car, chassisCANNONMaterial, wheelCANNONMaterial } from "./car";
import { DummyAI } from "./dummyAI";
import { AggressiveAI } from "./aggressiveAI";
import { initKeyBinding } from "./keyBinding";
import { TrailCamera } from "./trailCamera";
import { CustomLight } from "./customLight";
import { PhysicalObject } from "./physicalObject";
import { DashBoard } from "./dashBoard";
import { BottomInfo } from "./bottomInfo";
import { NarrowWall } from "./narrowWall";
import { randFloat } from "three/src/math/MathUtils";
import { Setting } from "./setting";

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

const playerCar = new Car(0, 0, 2, scene, world);
playerCar.addCollisionDetection();

const aggressiveAI = new AggressiveAI(0, -20, 2, scene, world, playerCar);

let obs_list: PhysicalObject[] = [];

let dummyAIs: DummyAI[] = [];
for (let i = 1; i <= 20; i++) {
    // Code to be executed in each iteration
    dummyAIs.push(new DummyAI(0, 10 + 20 * i, 2, scene, world, obs_list));
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
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
// let boxHelper: THREE.BoxHelper | undefined = undefined

let carModel: THREE.Object3D | undefined = undefined
gltfLoader.load(
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
    err => { console.error(err) }
);

let fenceModel: THREE.Object3D | undefined = undefined
gltfLoader.load(
    'models/fence.glb',
    gltf => {
        fenceModel = gltf.scene.children[0];
        fenceModel.rotateX(Math.PI / 2);
        fenceModel.rotateY(Math.PI);
        // scene.add(fenceModel);
        boundary.useFenceModel(fenceModel)
        console.log(fenceModel);
    },
    undefined,
    err => { console.error(err) }
)

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    'images/road.jpg',
    tex => {
        boundary.useRoadTexture(tex);
    },
    undefined,
    err => { console.error(err) }
)

// let roadModel: THREE.Object3D | undefined = undefined
// gltfLoader.load(
//     'models/road.glb',
//     gltf => {
//         roadModel = gltf.scene.children[0];
//         roadModel.rotateX(Math.PI / 2);
//         scene.add(roadModel);
//         boundary.useRoadModel(roadModel);
//     },
//     undefined,
//     err => { console.error(err) }
// )

const bottomInfo = new BottomInfo(playerCar.obj3d, aggressiveAI.car.obj3d);
const dashboard = new DashBoard(() => 3.6 * playerCar.velocity().length()); // pass in speed in km/h

const clock = new THREE.Clock();
let delta;

type UpdateObject = { update(): void }
const updObjs: UpdateObject[] = [
    playerCar,
    boundary,
    light,
    camera,
    bottomInfo,
    dashboard,
]

let npcCars: (DummyAI|AggressiveAI)[] = [
    ...dummyAIs,
    aggressiveAI,
]

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate);
    delta = Math.min(clock.getDelta(), 0.1);
    world.step(delta);
    updObjs.forEach(obj => obj.update());
    for(let i = 0; i < npcCars.length; i++) {
        const npcCar = npcCars[i];
        if(npcCar.car.pos().y < playerCar.pos().y-100 && npcCar instanceof DummyAI) {
            // alert("failing npc")
            npcCar.car.destroy()
            npcCars.splice(i, 1)
            npcCars.push(new DummyAI(randFloat(-Setting.groundWidth/4, Setting.groundWidth/4), playerCar.pos().y + 500 + randFloat(-200, 200), 2, scene, world, obs_list))
        }
        if(npcCar.car.pos().y < playerCar.pos().y-200 && npcCar instanceof AggressiveAI) {
            // alert("failing npc")
            npcCar.car.destroy()
            npcCars.splice(i, 1)
            npcCars.push(new AggressiveAI(randFloat(-Setting.groundWidth/4, Setting.groundWidth/4), playerCar.pos().y - 50, 2, scene, world, playerCar))
        }
        
    }
    while(npcCars.length<15) {
        npcCars.push(new DummyAI(randFloat(-Setting.groundWidth/4, Setting.groundWidth/4), playerCar.pos().y + 500 + playerCar.velocity().y * 10 + randFloat(-200, 200), 2, scene, world, obs_list))
    }
    npcCars.forEach(obj => obj.update());
    const dis = playerCar.pos().y
    jumpGenerator.generate(dis).forEach((j) => {
        j.update();
        j.addin(scene, world);
        obs_list.push(j)
    });
    // scene.add( new THREE.DirectionalLightHelper(light.light) )
    // cannonDebugger.update()
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera.camera);
}

const narrowWall = new NarrowWall(100, scene, world)

animate();
