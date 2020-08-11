import * as THREE from "../node_modules/three/build/three.module.js";

// COLORES

const Colors = {
  lightviolet: 0x5e60ce,
  bluejean: 0x4ea8de,
  paleblue: 0x6883ba,
  white: 0xffffff,
  brown: 0x23190f,
  yellow: 0xeca400,
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
let hemisphereLight, shadowLight, ambientLight;

function createLights() {
  // A hemisphere light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0xc3c3c3, 0.9);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);

// Una luz ambiente agrega un color global y hace las sombras más suaves
  ambientLight = new THREE.AmbientLight (0xF8FA90,0.3);
  

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
  scene.add(ambientLight);
}

var Pilot = function () {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "pilot";

  // angleHair es la propiedad pra animar el pelo luego
  this.angleHairs = 0;

  // Cuerpo del piloto
  const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
  const bodyMat = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2, -12, 0);
  this.mesh.add(body);

  // Cara del piloto
  const faceGeom = new THREE.BoxGeometry(10, 10, 10);
  const faceMat = new THREE.MeshLambertMaterial({ color: Colors.yellow });
  const face = new THREE.Mesh(faceGeom, faceMat);
  this.mesh.add(face);

  // // PELO
  const hairGeom = new THREE.BoxGeometry(4, 4, 4);
  const hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  const hair = new THREE.Mesh(hairGeom, hairMat);
  // Se alinea la la forma del pelo al limite inferior, eso hace que sea mas facil de scalar
  hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

  // Se crea un contenedor para el pelo
  const hairs = new THREE.Object3D();

  // Se crea un contenedor para el pelo en top
  // de la cabeza ( aquellos que van a ser animados)
  this.hairsTop = new THREE.Object3D();

  // Se crean los pelos al tope de la cabeza
  // y se posicionan en una grilla de 3 x 4
  for (let i = 0; i < 12; i++) {
    let h = hair.clone();
    let col = i % 3;
    let row = Math.floor(i / 3);
    let startsPosZ = -4;
    let startsPosX = -4;
    h.position.set(startsPosX + row * 4, 0, startsPosZ + col * 4);
    this.hairsTop.add(h);
  }

  hairs.add(this.hairsTop);

  // Se cra el pelo al costado de la cara
  const hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
  hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
  const hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  const hairSideL = hairSideR.clone();
  hairSideR.position.set(8, -2, 6);
  hairSideL.position.set(8, -2, -6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  // Se crea el pelo atras de la cabeza
  const hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
  const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1, -4, 0);
  hairs.add(hairBack);
  hairs.position.set(-5, 5, 0);

  // Se agrega a la malla el pelo
  this.mesh.add(hairs);

  const glassGeom = new THREE.BoxGeometry(5, 5, 5);
  const glassMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  const glassR = new THREE.Mesh(glassGeom, glassMat);
  glassR.position.set(6, 0, 3);
  const glassL = glassR.clone();
  glassL.position.z = -glassR.position.z;

  const glassAGeom = new THREE.BoxGeometry(11, 1, 11);
  const glassA = new THREE.Mesh(glassAGeom, glassMat);
  this.mesh.add(glassR);
  this.mesh.add(glassL);
  this.mesh.add(glassA);

  const earGeom = new THREE.BoxGeometry(2, 3, 2);
  const earL = new THREE.Mesh(earGeom, faceMat);
  earL.position.set(0, 0, -6);
  const earR = earL.clone();
  earR.position.set(0, 0, 6);
  this.mesh.add(earL);
  this.mesh.add(earR);
};

// Mueve el pelo (( PREGUNTAR ESTO ))
Pilot.prototype.updateHairs = function () {
  // Agarro el pelo
  let hairs = this.hairsTop.children;

  // los actualizaos de acuerdo al angulo
  let l = hairs.length;
  for (let i = 0; i < l; i++) {
    let h = hairs[i];
    // cada elemento del pelo se escala en una base cilindrida entre 75% y 100% de su tamaño original
    h.scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
  }
  // se incrementa el ángulo para el próximo cuadro
  this.angleHairs += 0.16;
};

let Airplane = function () {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "airPlane";
  // Se crea la cabina

  const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
  const matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.yellow,
    shading: THREE.FlatShading,
  });

  // Es posible acceder al vértice de la forma a través
  // del array de los vértices, y mover sus propiedades x, y z:

  geomCockpit.vertices[4].y -= 10;
  geomCockpit.vertices[4].z += 20;
  geomCockpit.vertices[5].y -= 10;
  geomCockpit.vertices[5].z -= 20;
  geomCockpit.vertices[6].y += 30;
  geomCockpit.vertices[6].z += 20;
  geomCockpit.vertices[7].y += 30;
  geomCockpit.vertices[7].z -= 20;

  let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  // Se crea el motor

  const geoEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
  const matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    shading: THREE.FlatShading,
  });
  const engine = new THREE.Mesh(geoEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // Se crea cola
  const geoTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
  const matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.yellow,
    shading: THREE.FlatShading,
  });
  const tailPlane = new THREE.Mesh(geoTailPlane, matTailPlane);
  tailPlane.position.set(-35, 25, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // Se crean alas
  const geoSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
  const matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.yellow,
    shading: THREE.FlatShading,
  });
  const sideWing = new THREE.Mesh(geoSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  // Propulsor
  const geoPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
  const matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.bluejean,
    shading: THREE.FlatShading,
  });
  this.propeller = new THREE.Mesh(geoPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  // paletas
  const geoBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
  const matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading,
  });
  const blade = new THREE.Mesh(geoBlade, matBlade);

  blade.position.set(8, 0, 0);
  blade.castShadow = true;
  blade.receiveShadow = true;

  this.propeller.add(blade);
  this.propeller.position.set(50, 0, 0);
  this.mesh.add(this.propeller);

  this.pilot = new Pilot();
  this.pilot.mesh.position.set(-10, 27, 0);
  this.mesh.add(this.pilot.mesh);

  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;
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

// First let's define a Sea object :
let Sea = function () {
  // create the geometry (shape) of the cylinder;
  // the parameters are:
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  let geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
  // rotate the geometry on the x axis
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  // Agarro los vertices
  let l = geom.vertices.length;
  // creo un array para guardar los nuevos datos asociados a cada vetice
  this.waves = [];

  for (let i = 0; i < l; i++) {
    // Tomo cada vértice.
    let v = geom.vertices[i];
    // guado los datos asociados a el
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      // un ángulo random
      ang: Math.random() * Math.PI * 2,
      // una distancia random
      amp: 5 + Math.random() * 15,
      // una velocidad random entre 0.016 y 0.048 randianes/ por cuadro
      speed: 0.016 + Math.random() * 0.032,
    });
  }

  // create the material
  let mat = new THREE.MeshPhongMaterial({
    color: Colors.bluejean,
    transparent: true,
    opacity: 0.8,
    shading: THREE.FlatShading,
  });

  // To create an object in Three.js, we have to create a mesh
  // which is a combination of a geometry and some material
  this.mesh = new THREE.Mesh(geom, mat);

  // Allow the sea to receive shadows
  this.mesh.receiveShadow = true;
};

Sea.prototype.moveWaves = function () {
  // agarro los vertices
  let verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for (let i = 0; i < l; i++) {
    let v = verts[i];
    // Agarro la data asociada a estos
    var vprops = this.waves[i];
    // Actualizo la posicion de los vertices
    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
    // Incremento el angulo para el proximo cuadro
    vprops.ang += vprops.speed;
    // Se le dice al renderer que la geometria del mar ha cambiado
    // De hecho, en oreden para mantener el mejor nivel de performance
    // three.js agarra la geometria eignora los cambios
    // a menos que agregemos esta linea
  }
  this.mesh.geometry.verticesNeedUpdate = true;

  sea.mesh.rotation.z += 0.005;
};

// NUBES
let Cloud = function () {
  // Se crea un contenedor vacio que tendrá las diferentes partes de la nube
  this.mesh = new THREE.Object3D();
  // se crea una geometria cubo
  // Esta forma será duplicada para crear la nube
  const geom = new THREE.BoxGeometry(20, 20, 20);
  // se crea el material, un material simple blanco
  const mat = new THREE.MeshPhongMaterial({
    color: Colors.white,
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

// Ahora se instancia el cielo y se mueve el centro un poro hacia el fondo de la escena
let sky;

// Instantiate the sea and add it to the scene:
let sea;
let airplane;

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

function createSea() {
  sea = new Sea();
  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -600;
  // add the mesh of the sea to the scene
  scene.add(sea.mesh);
}

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
  updatePlane();
  airplane.pilot.updateHairs();
  airplane.propeller.rotation.x += 0.3;
  sea.moveWaves();
  sky.mesh.rotation.z += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function init(event) {
  document.addEventListener("mousemove", handleMouseMove, false);
  createScene();
  createLights();
  createSea();
  createSky();
  createPlane();
  loop();
}

window.addEventListener("load", init, false);
