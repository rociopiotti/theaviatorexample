// COLORES

var Colors = {
  lightviolet: "#555B6E",
  lightblue: "#89B0AE",
  paleblue: "#BEE3DB",
  nearwhite: "#FAF9F9",
  palepink: "#FDE8DA",
  pink: "#FFD6BA",
};

// THREEJS VARIABLES RELACIONADAS
let scene,
  camera,
  fielOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  HEIGHT,
  WIDTH,
  renderer,
  container;

// INCIA THREE JS, PANTALLA

function createScene() {
  // Tomo el ancho y el alto de la pantalla,
  // se usan para setear el aspect ratio de la camara y
  // el tamaño del renderer.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // CREO LA ESCENA
  scene = new THREE.Scene();

  // Agrego una efecto niebla a la escena; del mismo color que el
  // color del fondo usado en la hoja de estilo
  scene.for = new THREE.Fog(0xf7d9aa, 100, 950);

  // Creo la camara
  aspectRatio = WIDTH / HEIGHT;
  fielOfView = 60;
  nearPlane = 1;
  farPlane = 1000;
  camera = new THREE.PerspectiveCamera(
    fielOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  // SETEO LA POSICION DE LA CAMARA
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Creo el renderer

  renderer = new THREE.WebGLRenderer({
    // Permito transparenciad muestren el gradiente del fondo
    // definido en el css
    alpha: true,

    // Activo el anti-aliasing; esto es menos performante,
    // pero, como el projecto esta baso en low-poly, deberia estar bien
    antialias: true,
  });
  // Defino el tamaño del renderer, en este caso
  // llenará toda la pantala

  // Habilito el renderizado de sombras
  renderer.shadowMap.enable = true;

  // Agego al DOM element del renderer al contenedor
  // creado en HTML
  container = document.getElementById("world");
  container.appendChild(renderer.domElement);

  // Escucho a la pantalla: si el usuario modifica el tamaño
  // acutalizamos el tamaño de la camara y el renderer.
  window.addEventListener("resize", handleWindowResize, false);
}

// MANEJA LOS EVENTOS DE PANTALLA

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

// LUCES

let hemisphereLight, shadowLight;

function createLights() {
  /// Una luz hemisferica es luz en degrade;
  // el primer parametro es la luz del cielo, el segundo parametro es el color del suelo,
  // el tercer paramentro es la intensidad de la luz
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // Una luz direccional brilla desde una direccion especifica
  // Actua como el sol, esto significa que todos los rayos son producidos en paralelo.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

  // Setea la direccion de la luz
  shadowLight.position.set(150, 350, 350);

  // Permite la proyeccion de la lus.
  shadowLight.castShadow = true;

  // define el area visible de la sombra proyectada
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // para activar las luces, hay que agregarlas a la escena
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

function init() {
  // set up the scene, the camera and the renderer
  createScene();

  // add the lights
  createLights();

  //   // add the objects
  //   createPlane();
  //   createSea();
  //   createSky();

  //   // start a loop that will update the objects' positions
  //   // and render the scene on each frame
  //   loop();
}

window.addEventListener("load", init, false);
