import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarField from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const width = window.innerWidth;
const height = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
const loader = new THREE.TextureLoader();
renderer.setSize(width,height);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = (width) / height;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.z = 5;

const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;

const earthGeo = new THREE.IcosahedronGeometry(1, 12);
const mat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: loader.load("./textures/8k_earth_daymap.jpg"),
    bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
    bumpScale: 0.04
});

const earthMesh = new THREE.Mesh(earthGeo, mat)
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
    map: loader.load("./textures/8k_earth_nightmap.jpg"),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const lightsMesh = new THREE.Mesh(earthGeo, lightsMat);
earthGroup.add(lightsMesh);

const cloudMat = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/8k_earth_clouds.jpg"),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const cloudMesh = new THREE.Mesh(earthGeo, cloudMat);
cloudMesh.scale.setScalar(1.003);
earthGroup.add(cloudMesh);


const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(earthGeo, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

scene.add(earthGroup);

const stars = getStarField({numStars: 2000});
scene.add(stars);



const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set( 2, 0.5, 1.5);
scene.add(sunLight);

function animate(t = 0) {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    cloudMesh.rotation.y += 0.0028;
    glowMesh.rotation.y += 0.002;

    controls.update();
    renderer.render(scene, camera);
}

animate();

function handleWinResize(){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
window.addEventListener('resize', handleWinResize. true);
