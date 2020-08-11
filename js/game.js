import * as THREE from "../node_modules/three/build/three.module.js";

// COLORES

let Colors = {
  lightviolet: 0x555b6e,
  lightblue: 0x89b0ae,
  paleblue: 0xbee3db,
  nearwhite: 0xffffff,
  palepink: 0xfde8da,
  pink: 0xffd6ba,
  brown: 0x23190f,
};
// SCENE
let scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  HEIGHT,
  WIDTH,
  renderer,
  container;

let mousePos = { x: 0, y: 0 };
function createScene() {
  // Get the width and the height of the screen,
  // use them to set up the aspect ratio of the camera
  // and the size of the renderer.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the scene
  scene = new THREE.Scene();

  // Add a fog effect to the scene; same color as the
  // background color used in the style sheet
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  // Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  // Set the position of the camera
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    // Allow transparency to show the gradient background
    // we defined in the CSS
    alpha: true,

    // Activate the anti-aliasing; this is less performant,
    // but, as our project is low-poly based, it should be fine :)
    antialias: true,
  });

  // Define the size of the renderer; in this case,
  // it will fill the entire screen
  renderer.setSize(WIDTH, HEIGHT);

  // Enable shadow rendering
  renderer.shadowMap.enabled = true;

  // Add the DOM element of the renderer to the
  // container we created in the HTML
  container = document.getElementById("world");
  container.appendChild(renderer.domElement);

  // Listen to the screen: if the user resizes it
  // we have to update the camera and the renderer size
  window.addEventListener("resize", handleWindowResize, false);
}

function handleWindowResize() {
  // update height and width of the renderer and the camera
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

// LIGHTS
let hemisphereLight, shadowLight;

function createLights() {
  // A hemisphere light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

  // Set the direction of the light
  shadowLight.position.set(150, 350, 350);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

// First let's define a Sea object :
let Sea = function () {
  // create the geometry (shape) of the cylinder;
  // the parameters are:
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  let geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

  // rotate the geometry on the x axis
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  // create the material
  let mat = new THREE.MeshPhongMaterial({
    color: Colors.lightblue,
    transparent: true,
    opacity: 0.6,
    shading: THREE.FlatShading,
  });

  // To create an object in Three.js, we have to create a mesh
  // which is a combination of a geometry and some material
  this.mesh = new THREE.Mesh(geom, mat);

  // Allow the sea to receive shadows
  this.mesh.receiveShadow = true;
};

// NUBES

let Cloud = function () {
  // Se crea un contenedor vacio que tendrá las diferentes partes de la nube
  this.mesh = new THREE.Object3D();
  // se crea una geometria cubo
  // Esta forma será duplicada para crear la nube
  var geom = new THREE.BoxGeometry(20, 20, 20);
  // se crea el material, un material simple blanco
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.nearwhite,
  });

  // se duplican las geometrias un numero random de veces
  let nBlocks = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < nBlocks; i++) {
    let m = new THREE.Mesh(geom, mat);

    m.position.x = i * 15;
    m.position.y = Math.random() * 10;
    m.position.z = Math.random() * 10;
    m.position.z = Math.random() * Math.PI * 2;
    m.position.y = Math.random() * Math.PI * 2;

    // Setear el tamaño del cubo random
    let s = 0.1 + Math.random() * 0.9;
    m.scale.set(s, s, s);

    //Se permite a cada cubo recibit sombras
    m.castShadow = true;
    m.receiveShadow = true;

    // Se agrega el cubo al contenedor que se creo en un principio
    this.mesh.add(m);
  }
};

let Sky = function () {
  // Se crea un contenedor vacio
  this.mesh = new THREE.Object3D();

  // se elije un numero de nubes que van a ir esparcidas por el cielo
  this.nClouds = 20;

  // Para distribuir las nubes consistentemente,
  // necesitamos ubicarlas en un angulo uniforme

  let stepAngle = (Math.PI * 2) / this.nClouds;

  // Se crean las nubes
  for (let i = 0; i < this.nClouds; i++) {
    let c = new Cloud();

    // Setear la rotacion y la posicion de cada nube;
    // para eso usa trigonometría
    let a = stepAngle * i; // este es el angulo final de la nube
    let h = 750 + Math.random() * 200; // esta es la distancia entre el centro del eje y la nube

    // Trigonometria
    // se convierten las coordenadas polares (angulo y distancia) a coordenadas cartesianas (x,y)
    c.mesh.position.y = Math.sin(a) * h;
    c.mesh.position.x = Math.cos(a) * h;

    // Se rota la nube de acuerdo a su posicion
    c.mesh.rotation.z = a + Math.PI / 2;

    // Para un mejor resultado, se posicionan las nubes a diferentes profundidades de la escena
    c.mesh.position.z = -400 - Math.random() * 400;

    // Tanmbien se setea una escala random para cada nube
    let s = 1 + Math.random() * 2;
    c.mesh.scale.set(s, s, s);

    // no hay que olvidarse de agregarl la malla de cada nube a la escena
    this.mesh.add(c.mesh);
  }
};

let Airplane = function () {
  this.mesh = new THREE.Object3D();

  // Se crea la cabina

  let geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
  let matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.pink,
    shading: THREE.FlatShading,
  });

  // Es posible acceder al vértice de la forma a través 
  // del array de los vértices, y mover sus propiedades x, y z:

  geomCockpit.vertices[4].y-=10;
  geomCockpit.vertices[4].z+=20;
  geomCockpit.vertices[5].y-=10;
  geomCockpit.vertices[5].z-=20;
  geomCockpit.vertices[6].y+=30;
  geomCockpit.vertices[6].z+=20;
  geomCockpit.vertices[7].y+=30;
  geomCockpit.vertices[7].z-=20;



  let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  // Se crea el motor

  let geoEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
  let matEngine = new THREE.MeshPhongMaterial({
    color: Colors.nearwhite,
    shading: THREE.FlatShading,
  });
  let engine = new THREE.Mesh(geoEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // Se crea cola
  let geoTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
  let matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.pink,
    shading: THREE.FlatShading,
  });
  let tailPlane = new THREE.Mesh(geoTailPlane, matTailPlane);
  tailPlane.position.set(-35, 25, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // Se crean alas
  let geoSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
  let matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.pink,
    shading: THREE.FlatShading,
  });
  let sideWing = new THREE.Mesh(geoSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  // Propulsor
  let geoPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
  let matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.palepink,
    shading: THREE.FlatShading,
  });
  this.propeller = new THREE.Mesh(geoPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  // paletas
  let geoBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
  let matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading,
  });
  let blade = new THREE.Mesh(geoBlade, matBlade);
  blade.position.set(8, 0, 0);
  blade.castShadow = true;
  blade.receiveShadow = true;
  this.propeller.add(this.blade);
  this.propeller.position.set(50, 0, 0);
  this.mesh.add(this.propeller);
};
// Ahora se instancia el cielo y se mueve el centro un poro hacia el fondo de la escena
let sky;

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}
// Instantiate the sea and add it to the scene:
let sea;

function createSea() {
  sea = new Sea();

  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -600;

  // add the mesh of the sea to the scene
  scene.add(sea.mesh);
}

let airplane;

function createPlane() {
  airplane = new Airplane();
  airplane.mesh.scale.set(0.25, 0.25, 0.25);
  airplane.mesh.position.y = 100;
  scene.add(airplane.mesh);
}

function handleMouseMove(event) {
  let tx = -1 + (event.clientX / WIDTH) * 2;
  let ty = 1 - (event.clientY / HEIGHT) * 2;
  mousePos = { x: tx, y: ty };
}

function updatePlane() {
  let targetX = normalize(mousePos.x, -1, 1, -100, 100);
  let targetY = normalize(mousePos.y, -1, 1, -25, 175);

  airplane.mesh.position.y = targetY;
  airplane.mesh.position.x = targetX;
  airplane.propeller.rotation.x += 0.3;
}
function normalize(v, vmin, vmax, tmin, tmax) {
  var nv = Math.max(Math.min(v, vmax), vmin);
  var dv = vmax - vmin;
  var pc = (nv - vmin) / dv;
  var dt = tmax - tmin;
  var tv = tmin + pc * dt;
  return tv;
}
function loop() {
  airplane.propeller.rotation.x += 0.3;
  sea.mesh.rotation.z += 0.005;
  sky.mesh.rotation.z += 0.01;

  updatePlane();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function init(event) {
  createScene();
  createLights();
  createSea();
  createSky();
  createPlane();

  document.addEventListener("mousemove", handleMouseMove, false);
  loop();
}

window.addEventListener("load", init, false);
