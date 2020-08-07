var Colors = {
  lightviolet: "#555B6E",
  lightblue: "#89B0AE",
  paleblue: "#BEE3DB",
  nearwhite: "#FAF9F9",
  palepink: "#FDE8DA",
  pink: "#FFD6BA",
};

var scene,
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
  scene = new THEREE.Scene();
}

function init() {
  // set up the scene, the camera and the renderer
  createScene();

  // add the lights
  createLights();

  // add the objects
  createPlane();
  createSea();
  createSky();

  // start a loop that will update the objects' positions
  // and render the scene on each frame
  loop();
}

window.addEventListener("load", init, false);
