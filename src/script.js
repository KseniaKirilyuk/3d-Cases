import './style.css'
import * as THREE from 'three'
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Texture()

//Textures
const textureLoader = new THREE.TextureLoader()
const mtcTexture = textureLoader.load('/models/textures/softRed.png')
const textTexture = textureLoader.load( "/models/textures/lightPink.png" );

//Text
let text;
const fontLoader = new THREE.FontLoader()
fontLoader.load(
    'fonts/Alegreya_Sans_Bold.json',
    (font)=>{
       const textGeometry = new THREE.TextGeometry(
            `RASPBERRY
            PIE`,
            {
                font: font,
                size: 2,
                height: 0.7,
                curveSegments: 7,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        textGeometry.center()
        const textMaterial =  new THREE.MeshMatcapMaterial()
        textMaterial.matcap = textTexture
        text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)
        console.log("--->", text)
    }
)
 console.log(text)
/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader) // draco is not applied because the file doesn't require draco compression

let mixer = null
 gltfLoader.load(
    '/models/raspberryblend.glb',
    (glb) =>
    {
       const berryMesh = glb.scene
       console.log(glb.scene.scale)
        berryMesh.children.map(item=>{
            item.rotateOnAxis.y = 0.5
            item.material = new THREE.MeshMatcapMaterial()
            item.material.matcap = mtcTexture
        })
        berryMaker(berryMesh)
    }
)
const berryGroup = new THREE.Group();
let oneBerry = false;

const berryMaker = (berryMesh) => {
    for(let i = 0; i<200; i++){
        oneBerry = new THREE.Mesh();
        oneBerry= berryMesh.clone()
        oneBerry.position.x = (Math.random() - 0.5) * 19
        oneBerry.position.y = (Math.random() - 0.5) * 15
        oneBerry.position.z = (Math.random() - 0.5) * 20 // -0.5 to putt berries on positive and negative side of axes
       berryGroup.add(berryMesh, oneBerry)
        
    }
}

scene.add(berryGroup)
//gsap.to(berryGroup.position.y, {rotation:"360", ease:Linear.easeNone, repeat:-1})

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
controls.target.set(0, 1, 0)
controls.enableDamping = true

// Cursor
const cursor = {
    x: 0,
    y: 0
}
canvas.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5 // range from -.5 to .5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
console.log("berryGroup", berryGroup)
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
    berryGroup.children.map(item=> item.rotation.y = elapsedTime*0.1 )

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()