var Colors = {
  lightviolet: "#555B6E",
  lightblue: "#89B0AE",
  paleblue: "#BEE3DB",
  nearwhite: "#FAF9F9",
  palepink: "#FDE8DA",
  pink: "#FFD6BA",
};

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

function handleWindowResize(){
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function init() {
  // set up the scene, the camera and the renderer
  createScene();

  //   // add the lights
  //   createLights();

  //   // add the objects
  //   createPlane();
  //   createSea();
  //   createSky();

  //   // start a loop that will update the objects' positions
  //   // and render the scene on each frame
  //   loop();
}

window.addEventListener("load", init, false);
