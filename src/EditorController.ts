import * as BABYLON from 'babylonjs';
import BabylonImageLayer from './BabylonImageLayer';

let flatnessDirection = 1.0;
let flatnessSpeed = 0.5;
let flatness = 0.0;
let lastTime = Date.now();
const speed:number = 1.0;

export type EditorProps = {
  scene: BABYLON.Scene;
  canvas: HTMLCanvasElement;
  engine: BABYLON.Engine;
  textureURL?: string;
  camera: BABYLON.ArcRotateCamera;
}

export default class EditorController {
  props: EditorProps;
  zoomIn:boolean = false;
  zoomOut:boolean = false;
  camera?:BABYLON.ArcRotateCamera = undefined;
  layers : Map<string, BabylonImageLayer> = new Map();
  prototypeMesh : BABYLON.AbstractMesh;
  planeDirection:BABYLON.Vector3 = BABYLON.Vector3.Backward();

  constructor(props: EditorProps) {
    this.props = props;

    const worldDistance:number = 20;
    
    this.planeDirection.rotateByQuaternionToRef(
      BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), 20.0), this.planeDirection);
    
    this.props.scene.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);

    this.props.scene.setActiveCameraByName("camera");

    let light = new BABYLON.PointLight("light", new BABYLON.Vector3(0.,25.,0,), this.props.scene);
    light.intensity = 590.0;

    // This targets the camera to scene origin
    this.props.camera.setTarget(BABYLON.Vector3.Zero());
    
    // This attaches the camera to the canvas
    this.props.camera.attachControl(this.props.canvas, true);
    this.props.camera.minZ = 0.1;

    const groundMaterial = this.setupGroundMaterial(this.props.scene);

    let groundPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 120, height: 120}, this.props.scene);
    groundPlane.position = BABYLON.Vector3.Down().scale(worldDistance / 2.0);
    groundPlane.material = groundMaterial;

    this.props.scene.actionManager = new BABYLON.ActionManager(this.props.scene);

    this.props.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyDownTrigger,
      parameter: 'a',
    }, 
    () => this.zoomIn = true));

    this.props.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'a',
    }, 
    () => this.zoomIn = false));

    this.props.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyDownTrigger,
      parameter: 'z',
    },
    () => this.zoomOut = true));

    this.props.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'z',
    },
    () => this.zoomOut = false));

    this.props.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
      trigger: BABYLON.ActionManager.OnKeyUpTrigger,
      parameter: 'q',
    },
    () => flatnessDirection *= -1.0));

    BABYLON.SceneLoader.LoadAssetContainer("./", "UnrollSphere3.glb", this.props.scene, (loaded) => {
      const meshes = loaded.meshes;
      let rootMesh;
      for(let mesh of meshes) {
        if(mesh.id === "__root__") {
          rootMesh = mesh;
        }
      }

      if(!rootMesh) { return; }

      rootMesh.scaling = BABYLON.Vector3.One().scale(10.0); // TODO: Figure out units      
      this.prototypeMesh = rootMesh;
      //this.createImageLayer("Copenhagen.jpg");
    });
  }

  setupGroundMaterial(scene: BABYLON.Scene) : BABYLON.StandardMaterial {
    let groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.disableLighting = true;
    groundMaterial.emissiveColor = BABYLON.Color3.White();
    groundMaterial.diffuseTexture = new BABYLON.Texture("grid.png", scene);
    groundMaterial.diffuseTexture.hasAlpha = true;
    return groundMaterial;
  }

  createImageLayer(url : string, distance : number) {
    if(!this.prototypeMesh) {
      return;
    }

    const newLayer : BabylonImageLayer = new BabylonImageLayer(this.props.scene, url, distance, this.planeDirection, flatness, this.prototypeMesh);
    this.layers.set(url, newLayer);
    return url;
  }

  removeImageLayer(key : string) {
    const layer = this.layers.get(key);
    if(!layer) {
      return;
    }

    layer.cleanupMesh();
    this.layers.delete(key);
  }

  getImageLayer(key : string) {
    return this.layers.get(key);
  }

  setTexture(url: string) {
  }

  onTick() {
    if (!this.props.scene || !this.props.camera) {
      return;
    }

    if(this.zoomIn) {
      this.props.camera.radius -= speed;
      this.props.camera.radius = Math.max(this.props.camera.radius, 1.0);
    }
    else if(this.zoomOut) {
      this.props.camera.radius += speed;
      this.props.camera.radius = Math.min(this.props.camera.radius, 40.0);
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

    for(let layer of this.layers.values()) {
      layer.setFlatness(flatness);
    }
  }
}