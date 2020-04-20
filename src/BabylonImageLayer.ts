import * as BABYLON from 'babylonjs';

export default class BabylonImageLayer {
  scene : BABYLON.Scene;
  material : BABYLON.ShaderMaterial;
  flatness : number;
  mesh : BABYLON.AbstractMesh | undefined;
  distance : number;

  constructor (scene : BABYLON.Scene, url : string, distance : number, facing : BABYLON.Vector3, initialFlatness : number, sourceMesh : BABYLON.AbstractMesh) {
    this.scene = scene;
    this.flatness = initialFlatness;
    this.distance = distance;
    this.material = this.setupShaderMaterial(this.scene, facing);
    this.setTexture(url);
    this.setupMesh(sourceMesh);
  }

  /// Sets up the material that is used to transition the photosphere between 
  /// a sphere and flat.
  setupShaderMaterial(scene: BABYLON.Scene, facing: BABYLON.Vector3) : BABYLON.ShaderMaterial {
    const tex = new BABYLON.Texture(null, scene, false, true);

    let shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./360Sphere",
    {
      needAlphaBlending: true,
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "flatness"]
    });

    shaderMaterial.backFaceCulling = true;
    shaderMaterial.sideOrientation = BABYLON.Mesh.FRONTSIDE;

    shaderMaterial.setFloat("flatness", this.flatness);
    shaderMaterial.setTexture("textureSampler", tex);
    shaderMaterial.setVector3("target", facing);

    return shaderMaterial;
  }

  /// Sets the texture (the photoshphere image) on the model.
  setTexture(url : string) {
    const newTex = new BABYLON.Texture(url, this.scene, false, true);
    this.material.setTexture("textureSampler", newTex);
  }

  /// Clones the "prototype mesh" for photospheres 
  setupMesh(prototypeMesh : BABYLON.AbstractMesh) {
    const newMesh : BABYLON.Nullable<BABYLON.AbstractMesh> = prototypeMesh.clone("ImageMesh", null);

    if(!newMesh) {
      return;
    }

    this.mesh = newMesh;
    
    this.scene.addMesh(this.mesh, true);
    let sphereMesh;
    for(let subMesh of this.mesh.getChildMeshes()) {
      console.log("submesh id", subMesh.id);
      if(subMesh.id === "ImageMesh.Sphere.Sphere"){
        sphereMesh = subMesh;
      }
    }

    if(!sphereMesh) {
      console.log("No Sphere Mesh");
      return;
    }
    
    (sphereMesh as BABYLON.AbstractMesh).material = this.material;
    
    this.setDistance(this.distance);
  }

  setDistance(distance : number) {
    console.log("distance", distance);

    if(!this.mesh) {
      return;
    }

    const forward = this.mesh.forward;
    const newPosition = forward.scale(distance);
    this.mesh.position = newPosition;
    console.log("new position", newPosition);
  }

  setFlatness(flatness : number) {
    if(!this.material) {
      return;
    }

    if(!this.mesh) {
      return;
    }

    this.material.setFloat("flatness", flatness);
    
    const scaledDistance : number = this.distance * flatness;
    const newPosition : BABYLON.Vector3 = this.mesh.forward.scale(scaledDistance);
    this.mesh.position = newPosition;

    const flatScale : number = 10.0;
    const roundScale : number = this.distance;
    const newScale : number = roundScale + ((flatScale - roundScale) * flatness);
    this.mesh.scaling = BABYLON.Vector3.One().scale(newScale);
  }

  cleanupMesh() {
    if(this.mesh) {
      this.scene.removeMesh(this.mesh, true);
    }
  }
}