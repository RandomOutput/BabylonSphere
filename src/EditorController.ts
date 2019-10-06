import * as BABYLON from 'babylonjs';

let flatnessDirection = 1.0;
let flatnessSpeed = 0.5;
let flatness = 0.0;
let lastTime = Date.now();
const speed:number = 1.0;

let shaderMaterial: BABYLON.ShaderMaterial | null;

export type EditorProps = {
  scene: BABYLON.Scene;
  canvas: HTMLCanvasElement;
  engine: BABYLON.Engine;
  textureURL?: string;
  camera: BABYLON.ArcRotateCamera;
}

export type EditorState = {

}

export default class EditorController {
  props: EditorProps;
  zoomIn:boolean = false;
  zoomOut:boolean = false;
  camera?:BABYLON.ArcRotateCamera = undefined;

  constructor(props: EditorProps) {
    this.props = props;
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
    
    console.log("shaderMaterial", shaderMaterial);

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
    if(!this.props.scene || !shaderMaterial) {
      console.log("scene",this.props.scene);
      console.log("shaderMat", shaderMaterial);
      return;
    }
    console.log("set texture", url);
    const newTex = new BABYLON.Texture(url, this.props.scene);
    shaderMaterial.setTexture("textureSampler", newTex);
  }
  
  onSceneSetup() : void {
    console.log("onSceneSetup");
    const worldDistance:number = 20;
    
    let planeDirection:BABYLON.Vector3 = BABYLON.Vector3.Backward();
    planeDirection.rotateByQuaternionToRef(
      BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), 20.0), planeDirection);
    
    this.props.scene.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);

    this.props.scene.setActiveCameraByName("camera");

    let light = new BABYLON.PointLight("light", new BABYLON.Vector3(0.,25.,0,), this.props.scene);
    light.intensity = 590.0;

    // This targets the camera to scene origin
    this.props.camera.setTarget(BABYLON.Vector3.Zero());
    
    // This attaches the camera to the canvas
    this.props.camera.attachControl(this.props.canvas, true);
    this.props.camera.minZ = 0.1;

    shaderMaterial = this.setupShaderMaterial(this.props.scene, planeDirection);

    const groundMaterial = this.setupGroundMaterial(this.props.scene);

    let groundPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 120, height: 120}, this.props.scene);
    groundPlane.position = BABYLON.Vector3.Down().scale(worldDistance / 2.0);
    groundPlane.material = groundMaterial;

    BABYLON.SceneLoader.LoadAssetContainer("./", "UnrollSphere3.glb", this.props.scene, (loaded) => {
      
      let meshes = loaded.meshes;
      let sphereMesh;
      let root;
      for(let mesh of meshes) {
        if(mesh.id === "__root__") {
          mesh.scaling = BABYLON.Vector3.One().scale(10.0);
          this.props.scene.addMesh(mesh, true);
          root = mesh;
        }
      }

      meshes = this.props.scene.meshes;
      for(let mesh of this.props.scene.meshes) {
        if(mesh.id === "Sphere"){
          sphereMesh = mesh;
        }
      }
      
      (sphereMesh as BABYLON.AbstractMesh).material = shaderMaterial;
    });

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
    
    if(shaderMaterial) { 
      shaderMaterial.setFloat("flatness", flatness);
    }
  }
}