import './style.css'
import * as THREE from 'three'
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'


/**
 * Base
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Texture()

//Textures
const textureLoader = new THREE.TextureLoader()
const berryTexture = textureLoader.load('/models/textures/softRed.png');
const textTexture = textureLoader.load( "/models/textures/chalk.png" );
const leavesTexture = textureLoader.load( "/models/textures/green.png" );

//Text
let text;
const fontLoader = new THREE.FontLoader()
fontLoader.load(
    'fonts/Fredoka _One_Regular.json',
    (font)=>{
       const textGeometry = new THREE.TextGeometry(
            "RASPBERRY",
            {
                font: font,
                size: 2,
                height: 0.7,
                curveSegments: 7,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 2
            }
        )
        textGeometry.center()
        const textMaterial =  new THREE.MeshMatcapMaterial()
        textMaterial.matcap = textTexture
        text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)
    }
)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader) 

let mixer = null
 gltfLoader.load(
    '/models/raspberryV1.glb',
    (glb) =>
    {
       const berryMesh = glb.scene
        berryMesh.children.map(item=>{
            if(item.name === "Leaves"){
            item.material = new THREE.MeshMatcapMaterial()
            item.material.matcap = leavesTexture}
            else if(item.name === "Berry"){
            item.children.map(berry=>{
                berry.material = new THREE.MeshMatcapMaterial()
                berry.material.matcap = berryTexture 
            })
            }
        })
        berryMaker(berryMesh)
    }
)
gltfLoader.load( //!!! TODO
    '/models/raspberryV2.glb',
    (glb) =>
    {
       const berryMesh = glb.scene
        berryMesh.children.map(item=>{
            if(item.name === "Leaves"){
            item.material = new THREE.MeshMatcapMaterial()
            item.material.matcap = leavesTexture}
            else if(item.name === "Berry"){
            item.children.map(berry=>{
                berry.material = new THREE.MeshMatcapMaterial()
                berry.material.matcap = berryTexture 
            })
            }
        })
        berryMaker(berryMesh)
    }
)

const berryGroup = new THREE.Group();
let oneBerry = false;
const berryMaker = (berryMesh) => {
    for(let i = 0; i<50; i++){
        //oneBerry = new THREE.Mesh();
        oneBerry= berryMesh.clone()
        //oneBerry.rotation.y(180)
        oneBerry.position.x = (Math.random() - 0.5) * 19
        oneBerry.position.y = (Math.random() - 0.5) * 15
        oneBerry.position.z = (Math.random() - 0.5) * 20 // -0.5 to put berries on positive and negative side of axes
        oneBerry.rotation.x = Math.random()
        oneBerry.rotation.z = Math.random()
        oneBerry.rotation.y = Math.random()
        //oneBerry.rotate.y=360
       berryGroup.add(oneBerry)
    }
}

scene.add(berryGroup)


/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 0.55);
light.position.set(150, 150, 150);
scene.add(light);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width/sizes.height, .1, 50)
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

// create an AudioListener and add it to the camera
//const listener = new THREE.AudioListener();
//const file = '/sounds/trackk1.wav';
//camera.add( listener );

// create a global audio source
// const sound = new THREE.Audio( listener );
// const fftSize = 128;
// const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

// load a sound and set it as the Audio object's buffer
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load( file, function( buffer ) {
// 	sound.setBuffer( buffer );
// 	sound.setLoop( true );
// 	sound.setVolume( 0.5 );
// 	sound.play();
// });

// const analyser = new THREE.AudioAnalyser( sound, fftSize );
// const uniforms = {
//     tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, format ) }
//     };
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
// renderer.shadowMap.enabled = true //?
// renderer.shadowMap.type = THREE.PCFSoftShadowMap//?
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock() //starts at 0
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }
    // Update objects
   berryGroup.children.map(item=> item.rotation.y = elapsedTime*0.5 )
   //camera.position.x = Math.cos(elapsedTime*0.0002)
   camera.position.y = Math.sin(elapsedTime)
   camera.position.z = Math.sin(camera.position.y)+10
    camera.lookAt(0,0,0)

    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()