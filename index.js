import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarField from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

function isMobileDevice() {
    return window.innerWidth <= 768;
}

const loadingManager = new THREE.LoadingManager(
    () => {
        // On load complete
        const loadingScreen = document.getElementById("loading-screen");
        const threeJsScene = document.getElementById("threejs-container");

        let opacity = 1;
        function fadeOutLoadingScreen() {
            opacity -= 0.0045; // Adjust speed as needed
            loadingScreen.style.opacity = opacity;

            if (opacity <= 0) {
                loadingScreen.style.display = "none"; // Remove it from the layout
                threeJsScene.style.display = "block"; // Show the Three.js scene
                fadeInThreeJsScene();
            } else {
                requestAnimationFrame(fadeOutLoadingScreen);
            }
        }

        // Fade in the Three.js scene
        let sceneOpacity = 0;
        function fadeInThreeJsScene() {
            sceneOpacity += 0.02; // Adjust speed as needed
            threeJsScene.style.opacity = sceneOpacity;

            if (sceneOpacity < 1) {
                requestAnimationFrame(fadeInThreeJsScene);
            }
        }

        fadeOutLoadingScreen();

    },
    (itemUrl, itemLoaded, itemTotal) => {
        // On progress (optional)
        console.log(`Loaded ${itemLoaded} of ${itemTotal} items.`);
        const progress = (itemLoaded / itemTotal) * 100;
        updateLogoProgress(progress);
    }
);

function updateLogoProgress(progress) {

    const logoGroup = document.querySelector('#logo');
    console.log("Mobile Device ? ") + isMobileDevice();

    logoGroup.style.clipPath = `inset(0 ${100 - progress}% 0 0)`;
    logoGroup.style.transition = 'clip-path 2s ease-in-out';
}

function startApp() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width,height);
    const threeJsScene = document.getElementById("threejs-container");
    threeJsScene.style.display = "none"; // Hide initially
    threeJsScene.appendChild(renderer.domElement);

    const fov = 75;
    const aspect = (width) / height;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 4;

    
    const loader = new THREE.TextureLoader(loadingManager);
    const mat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: loader.load("./textures/8k_earth_daymap.jpg"),
        bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
        bumpScale: 0.04
    });
    const lightsMat = new THREE.MeshBasicMaterial({
        map: loader.load("./textures/8k_earth_nightmap.jpg"),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const cloudMat = new THREE.MeshStandardMaterial({
        map: loader.load("./textures/2k_earth_clouds.jpg"),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const scene = new THREE.Scene();
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = -23.4 * Math.PI / 180;

    const earthGeo = new THREE.IcosahedronGeometry(1, 12);
    

    const earthMesh = new THREE.Mesh(earthGeo, mat)
    earthGroup.add(earthMesh);
    
    const lightsMesh = new THREE.Mesh(earthGeo, lightsMat);
    earthGroup.add(lightsMesh);

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
}

function handleWinResize(){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
window.addEventListener('resize', handleWinResize. true);
startApp();
