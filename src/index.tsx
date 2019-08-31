import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';
import 'babylonjs-loaders';
import ImageContainer from './ImageContainer';
import Scene from './SceneComponent';
import './index.css';
//import { AnimationGroup } from 'babylonjs';

let flatnessDirection = 1.0;
let flatnessSpeed = 0.5;
let flatness = 0.0;
let lastTime = Date.now();

let shaderMaterial: BABYLON.ShaderMaterial | null;

export type PageProps = {

}

export type PageState = {
  scene?: BABYLON.Scene;
  hasImage: boolean;
}

class PageWithScene extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);

    this.state = {
      scene: undefined,
      hasImage: false,
    }
  }


  onSceneMount(e: SceneEventArgs) : void {
    const speed:number = 1.0;
    const worldDistance:number = 20;
    
    let planeDirection:BABYLON.Vector3 = BABYLON.Vector3.Backward();
    planeDirection.rotateByQuaternionToRef(
      BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), 20.0), planeDirection);
    let zoomIn:boolean = false;
    let zoomOut:boolean = false;
    
    const { canvas, scene, engine } = e;
    
    this.setState({ scene: scene });
    
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

    shaderMaterial = this.setupShaderMaterial(scene, planeDirection);

    const groundMaterial = this.setupGroundMaterial(scene);

    let groundPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 120, height: 120}, scene);
    groundPlane.position = BABYLON.Vector3.Down().scale(worldDistance / 2.0);
    groundPlane.material = groundMaterial;

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
      
      (sphereMesh as BABYLON.AbstractMesh).material = shaderMaterial;
    });

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

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'q',
    },
    () => flatnessDirection *= -1.0));

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

        const deltaTime = (Date.now() - lastTime) / 1000;
        lastTime = Date.now();
        const flatnessDelta = flatnessDirection * flatnessSpeed * deltaTime; 
        flatness += flatnessDelta;
        
        if(flatness >= 1.0) {
          flatness = 1.0;
        }
        else if(flatness <= 0) {
          flatness = 0;
        }
        
        if(shaderMaterial) { 
          shaderMaterial.setFloat("flatness", flatness);
        }

        scene.render();
      }
    });
  }

  setupShaderMaterial(scene: BABYLON.Scene, facing: BABYLON.Vector3) : BABYLON.ShaderMaterial {
    const tex = new BABYLON.Texture("Copenhagen.jpg", scene, false, true);

    let shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./360Sphere",
    {
      needAlphaBlending: true,
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "flatness"]
    });

    shaderMaterial.backFaceCulling = true;
    shaderMaterial.sideOrientation = BABYLON.Mesh.FRONTSIDE;

    shaderMaterial.setFloat("flatness", flatness);
    shaderMaterial.setTexture("textureSampler", tex);
    shaderMaterial.setVector3("target", facing);
    
    return shaderMaterial;
  }

  setupGroundMaterial(scene: BABYLON.Scene) : BABYLON.StandardMaterial {
    let groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.disableLighting = true;
    groundMaterial.emissiveColor = BABYLON.Color3.White();
    groundMaterial.diffuseTexture = new BABYLON.Texture("grid.png", scene);
    groundMaterial.diffuseTexture.hasAlpha = true;
    return groundMaterial;
  }

  setTexture(url: string) {
    if(!this.state.scene || !shaderMaterial) {
      return;
    }
    console.log("set texture", url);
    const newTex = new BABYLON.Texture(url, this.state.scene);
    shaderMaterial.setTexture("textureSampler", newTex);
  }

  imageChange(e : React.ChangeEvent<HTMLInputElement>) {
    console.log("imageChange", e);

    if(!e.target.files) {
      return;
    }
    const files = Array.from(e.target.files);
    
    if(files.length <= 0) {
      return;
    }

    let reader = new FileReader();
    reader.onload = (e: any) => {
      if(e === null || e.target === null) {
        return;
      }

      let buffer:ArrayBuffer = e.target.result;
      let url = URL.createObjectURL(new Blob([buffer]));
      this.setTexture(url);
    };

    reader.readAsArrayBuffer(files[0]);
  }

  render() {
    const showScene = () => {
      if(true) {
        return <BabylonScene height={400} width={800} onSceneMount={this.onSceneMount.bind(this)} />
      }
      
      return;
    }

    return (
      <div>
        <div>
          <ImageContainer onChange={this.imageChange.bind(this)}/>
        </div>
        {showScene()}
      </div>
    )
  }
}

ReactDOM.render(
    <PageWithScene />,
    document.getElementById('root')
  );
