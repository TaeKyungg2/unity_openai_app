import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
console.log("hello?");
const loader = new GLTFLoader();
let mixer, actions = {}, currentAction;
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = true;
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.forward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.backward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.right = false;
      break;
  }
});
camera.position.set(0, 1.5, 3);
const scene = new THREE.Scene();
// 렌더러 (화면에 그림 그리는 역할)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// --- 카메라 컨트롤 (드래그/줌) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // 부드럽게 감속되는 움직임
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);       // 카메라가 바라볼 중심점
controls.update();
controls.enableKeys = false;
// 조명
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(2, 3, 5);
scene.add(light);
const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);
// 바닥용 Plane 추가
const planeGeometry = new THREE.PlaneGeometry(20, 20); // 가로 20, 세로 20
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,  // 회색 바닥
    roughness: 1,
    metalness: 0,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // X축 기준으로 눕히기
plane.position.y = 0; // Y축 기준 바닥 높이
plane.receiveShadow = true;
scene.add(plane);

let model;
let penguin;
const moveSpeed = 0.05; // 이동 속도 (적절히 조절)
loader.load('pin.glb', function(gltf) {
    model = gltf.scene;
    scene.add(model);
    
    mixer = new THREE.AnimationMixer(model);
    model.traverse((child) => {
    console.log("child:",child.name, child.type);
    });
    console.log('animations:', gltf.animations);
    console.log('animation names:', gltf.animations.map(a => a.name));
    penguin = model;
    gltf.animations.forEach(clip => {
        actions[clip.name] = mixer.clipAction(clip);
    })
    console.log('animation names:', gltf.animations.map(a => a.name));

    actions["animation_0"].play();
    currentAction = actions["animation_0"];
})

function switchAction(name) {
    if (actions[name] && currentAction !== actions[name]) {
    currentAction.fadeOut(0.5);
    actions[name].reset().fadeIn(0.5).play();
    currentAction = actions[name];
    }
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        if (keys.forward) penguin.position.z -= moveSpeed;
        if (keys.backward) penguin.position.z += moveSpeed;
        if (keys.left) penguin.position.x -= moveSpeed;
        if (keys.right) penguin.position.x += moveSpeed;

    }
    if (mixer) mixer.update(clock.getDelta());
    controls.update(); 
    renderer.render(scene, camera);
}
animate();
