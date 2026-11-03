import { createServer } from "vite";
import { writeFile } from "node:fs/promises";
import path from "node:path";

// Offline asset generation only; the catalog continues to display ordinary PNG images.
const source = `
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { catalogModelConfigs } from '/src/features/product-3d/product-models.ts';
import { prepareModel, disposeModel } from '/src/features/product-3d/model-resources.ts';
const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, preserveDrawingBuffer:true});
renderer.setSize(512,512); renderer.setClearColor(0x000000,0);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const pmrem=new THREE.PMREMGenerator(renderer);
const room=new RoomEnvironment(); const environment=pmrem.fromScene(room,.04);
room.dispose();
try {
 for (const [key,config] of Object.entries(catalogModelConfigs)) {
  const scene=new THREE.Scene(); scene.environment=environment.texture;
  const camera=new THREE.PerspectiveCamera(36,1,.01,100);
  camera.position.set(0,.15,6.3); camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x778078,1.4));
  const light=new THREE.DirectionalLight(0xffffff,2); light.position.set(3,4,5); scene.add(light);
  const model=await new GLTFLoader().loadAsync(config.modelUrl);
  const scale=prepareModel(model.scene,config.model,4);
  const group=new THREE.Group(); group.scale.setScalar(scale); group.rotation.set(...config.model.rotation);
  group.add(model.scene); scene.add(group);
  renderer.toneMappingExposure=1;
  renderer.render(scene,camera);
  const response=await fetch('/__thumbnail-save/'+key,{method:'POST',headers:{'Content-Type':'image/png'},body:await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png'))});
  if(!response.ok) throw new Error('Save failed: '+key);
  disposeModel(model.scene);
 }
 await fetch('/__thumbnail-done',{method:'POST'});
 document.body.textContent='THUMBNAILS_COMPLETE';
} catch(error) { document.body.textContent=String(error); console.error(error); }
environment.dispose(); pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss();
`;
const server = await createServer({
  server: { host: "0.0.0.0", port: 5188, strictPort: true },
  plugins: [{ name: "offline-catalog-thumbnails", configureServer(vite) {
    vite.middlewares.use(async (req, res, next) => {
      if (req.url === "/__thumbnail-render") {
        res.setHeader("Content-Type", "text/html");
        res.end(await vite.transformIndexHtml(req.url, '<html><body>Rendering…<script type="module" src="/__thumbnail-source.js"></script></body></html>'));
      } else if (req.method === "POST" && /^\/__thumbnail-save\/[a-z0-9-]+$/.test(req.url || "")) {
        const key = req.url.split("/").pop();
        if (!/^(coca-cola-can|nivea-aftershave|sunsilk-shampoo|lays-[a-z-]+)$/.test(key)) { res.statusCode=400; res.end(); return; }
        const chunks=[]; for await (const chunk of req) chunks.push(chunk);
        await writeFile(path.resolve("public/images/productos/modelos", key+".png"),Buffer.concat(chunks));
        console.log("Rendered",key); res.end("ok");
      } else if (req.url === "/__thumbnail-done") { console.log("THUMBNAILS_COMPLETE"); res.end("ok"); }
      else next();
    });
  }, resolveId(id) { if(id==="/__thumbnail-source.js") return id; }, load(id) { if(id==="/__thumbnail-source.js") return source; } }],
});
await server.listen();
console.log("Open http://localhost:5188/__thumbnail-render in a WebGL-capable browser.");
