import * as THREE from "../node_modules/three/build/three.module.js";

// COLORES

let Colors = {
  lightviolet: 0x555b6e,
  lightblue: 0x89b0ae,
  paleblue: 0xbee3db,
  nearwhite: 0xfaf9f9,
  palepink: 0xfde8da,
  pink: 0xffd6ba,
};
function loop() {
  requestAnimationFrame(loop);
}
function init(event) {
  loop();
}

window.addEventListener("load", init, false);
