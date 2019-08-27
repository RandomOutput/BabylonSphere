import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';
import 'babylonjs-loaders';
//import { AnimationGroup } from 'babylonjs';

let flatness = 0.5;
let lastTime = Date.now();
let shaderMaterial: BABYLON.ShaderMaterial | null;

class PageWithScene extends React.Component<{}, {}> {
  onSceneMount(e: SceneEventArgs) : void {
    const speed:number = 1.0;
    const worldDistance:number = 20;
    const overlayDistance:number = 17;
    
    let planeDirection:BABYLON.Vector3 = BABYLON.Vector3.Backward();
    planeDirection.rotateByQuaternionToRef(
      BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), 20.0), planeDirection);
    let zoomIn:boolean = false;
    let zoomOut:boolean = false;
    
    const { canvas, scene, engine } = e;
    
    scene.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
    
    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.0, Math.PI / 2.0, 30.0, new BABYLON.Vector3(0,0,0), scene);

    let light = new BABYLON.PointLight("light", new BABYLON.Vector3(0.,25.,0,), scene);
    light.intensity = 590.0;

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    
    camera.minZ = 0.1;
    
    var WorldMaterial = new BABYLON.StandardMaterial("WorldMaterial", scene);
    WorldMaterial.disableLighting = true;
    WorldMaterial.diffuseTexture = new BABYLON.Texture("Copenhagen.jpg", scene);
    WorldMaterial.emissiveColor = BABYLON.Color3.White();
    WorldMaterial.diffuseTexture.hasAlpha = true;
    WorldMaterial.backFaceCulling = true;

    let threeSixtyMat = new BABYLON.StandardMaterial("360Mat", scene);
    let tex = new BABYLON.Texture("Copenhagen.jpg", scene, false, true);
    tex.invertZ = false;

    threeSixtyMat.backFaceCulling = true;
    threeSixtyMat.disableLighting = true;
    
    threeSixtyMat.diffuseTexture = tex;
    threeSixtyMat.emissiveColor = BABYLON.Color3.White();
    threeSixtyMat.sideOrientation = BABYLON.Mesh.FRONTSIDE;

    shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./360Sphere",
    {
      needAlphaBlending: true,
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "flatness"]
    });

    shaderMaterial.setFloat("flatness", flatness);
    shaderMaterial.setTexture("textureSampler", tex);
    shaderMaterial.setVector3("target", planeDirection);
    shaderMaterial.backFaceCulling = true;
    shaderMaterial.sideOrientation = BABYLON.Mesh.FRONTSIDE;

    BABYLON.SceneLoader.LoadAssetContainer("./", "UnrollSphere3.glb", scene, (loaded) => {
      
      let meshes = loaded.meshes;
      let sphereMesh;
      let root;
      for(let mesh of meshes) {
        if(mesh.id === "__root__") {
          mesh.scaling = BABYLON.Vector3.One().scale(10.0);
          scene.addMesh(mesh, true);
          root = mesh;
        }
      }

      meshes = scene.meshes;
      for(let mesh of scene.meshes) {
        if(mesh.id === "Sphere"){
          sphereMesh = mesh;
        }
      }

      for(let animationGroup of loaded.animationGroups) {
        scene.addAnimationGroup(animationGroup);
      }

      let animGroup = scene.animationGroups[0];
      for(let targetedAnimation of animGroup.targetedAnimations) {
        targetedAnimation.target = root;
      }

      console.log("to: " + animGroup.to);
      //animGroup.goToFrame(4.0);
      animGroup.play(true);
      
      (sphereMesh as BABYLON.AbstractMesh).material = shaderMaterial;
    });


    /*
    BABYLON.SceneLoader.ImportMesh("Sphere", "./", "UnrollSphere3.glb", scene, (meshes, particleSystems, skeletons) => {
      let mesh = meshes[1];
      mesh.scaling = new BABYLON.Vector3(10.0, 10.0, 10.0);
      //mesh.position = new BABYLON.Vector3(3.707277774810791 * 10.0, 0., 0.);
      mesh.material = shaderMaterial;
    });*/
    
    var OverlayMaterial = new BABYLON.StandardMaterial("OverlayMaterial", scene);
    OverlayMaterial.disableLighting = true;
    OverlayMaterial.emissiveColor = new BABYLON.Color3(1.0,1.0,1.0);
    OverlayMaterial.diffuseTexture = new BABYLON.Texture("trees.png", scene);
    OverlayMaterial.diffuseTexture.hasAlpha = true;
    OverlayMaterial.sideOrientation = BABYLON.Mesh.FRONTSIDE;

    var GroundMaterial = new BABYLON.StandardMaterial("GroundMaterial", scene);
    GroundMaterial.disableLighting = true;
    GroundMaterial.emissiveColor = BABYLON.Color3.White();
    GroundMaterial.diffuseTexture = new BABYLON.Texture("grid.png", scene);
    GroundMaterial.diffuseTexture.hasAlpha = true;

    const up = BABYLON.Vector3.Up();
    const right = BABYLON.Vector3.Cross(planeDirection, up);

    let worldPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreatePlane("worldPlane", { width: worldDistance*2, height: worldDistance }, scene);
    worldPlane.position = planeDirection.scale(worldDistance);
    worldPlane.rotation = BABYLON.Vector3.RotationFromAxis(right, BABYLON.Vector3.Up(), planeDirection.scale(-1.));
    worldPlane.material = threeSixtyMat;

    let overlayPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreatePlane("overlayPlane", { width: overlayDistance * 2, height: overlayDistance }, scene);
    overlayPlane.position = planeDirection.scale(overlayDistance);
    overlayPlane.rotation = BABYLON.Vector3.RotationFromAxis(right, BABYLON.Vector3.Up(), planeDirection.scale(-1.));
    overlayPlane.material = OverlayMaterial;

    let groundPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 120, height: 120}, scene);
    groundPlane.position = BABYLON.Vector3.Down().scale(worldDistance / 2.0);
    groundPlane.material = GroundMaterial;

    /*
    let sphere = BABYLON.Mesh.CreateSphere("sphere1", 5, 20, scene);
    sphere.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
    //sphere.flipFaces(true);
    */

    //sphere.material = shaderMaterial;

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    /*
    var sphere2 = BABYLON.Mesh.CreateSphere("sphere2", 16, 18, scene);
    sphere2.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
    //sphere2.flipFaces(true);

    sphere2.material = OverlayMaterial;
*/
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyDownTrigger,
      parameter: 'a',
    }, 
    () => zoomIn = true));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'a',
    }, 
    () => zoomIn = false));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyDownTrigger,
      parameter: 'z',
    },
    () => zoomOut = true));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'z',
    },
    () => zoomOut = false));

    engine.runRenderLoop(() => {
      if (scene) {
        if(zoomIn) {
          camera.radius -= speed;
          camera.radius = Math.max(camera.radius, 1.0);
        }
        else if(zoomOut) {
          camera.radius += speed;
          camera.radius = Math.min(camera.radius, 40.0);
        }

        let deltaTime = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();
        flatness += (0.5 * deltaTime);
        flatness = Math.min(1.0, flatness);
        //flatness = flatness % 1.0;
        if(shaderMaterial) { 
          shaderMaterial.setFloat("flatness", flatness);
        }

        scene.render();
      }
    });
  }

  AddMeshRecursive(scene: BABYLON.Scene, mesh: BABYLON.AbstractMesh, onAdd: (mesh:BABYLON.AbstractMesh)=>void | undefined) : void {
    scene.addMesh(mesh);
    //onAdd(mesh);
    /*for(let child of mesh.getChildMeshes(true)) {
      this.AddMeshRecursive(scene, child, onAdd);
    }*/
  }

  render() {
    return (
      <div>
        <BabylonScene height={400} width={800} onSceneMount={this.onSceneMount} />
      </div>
    )
  }
}

ReactDOM.render(
    <PageWithScene />,
    document.getElementById('root')
  );
