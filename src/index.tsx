import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';

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
        var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.0, Math.PI / 2.0, 1.0, new BABYLON.Vector3(0,0,0), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        camera.minZ = 0.1;
        
        var WorldMaterial = new BABYLON.StandardMaterial("WorldMaterial", scene);
        WorldMaterial.disableLighting = true;
        WorldMaterial.emissiveTexture = new BABYLON.Texture("Copenhagen.jpg", scene);
        
        var OverlayMaterial = new BABYLON.StandardMaterial("OverlayMaterial", scene);
        OverlayMaterial.disableLighting = true;
        //OverlayMaterial.emissiveTexture = 
        OverlayMaterial.emissiveColor = new BABYLON.Color3(1.0,1.0,1.0);
        OverlayMaterial.diffuseTexture = new BABYLON.Texture("trees.png", scene);
        OverlayMaterial.diffuseTexture.hasAlpha = true;

        var GroundMaterial = new BABYLON.StandardMaterial("GroundMaterial", scene);
        GroundMaterial.disableLighting = true;
        GroundMaterial.emissiveColor = BABYLON.Color3.White();
        GroundMaterial.diffuseTexture = new BABYLON.Texture("grid.png", scene);
        GroundMaterial.diffuseTexture.hasAlpha = true;
        
        const up = BABYLON.Vector3.Up();
        const right = BABYLON.Vector3.Cross(up, planeDirection);
        
        var worldPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreatePlane("worldPlane", { width: 10, height: 5 }, scene);
        worldPlane.position = planeDirection.scale(worldDistance);
        worldPlane.rotation = BABYLON.Vector3.RotationFromAxis(right, BABYLON.Vector3.Up(), planeDirection);
        worldPlane.material = WorldMaterial;

        var overlayPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreatePlane("overlayPlane", { width: 10, height: 5 }, scene);
        overlayPlane.position = planeDirection.scale(overlayDistance);
        overlayPlane.rotation = BABYLON.Vector3.RotationFromAxis(right, BABYLON.Vector3.Up(), planeDirection);
        overlayPlane.material = OverlayMaterial;

        var groundPlane:BABYLON.Mesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 80, height: 80}, scene);
        groundPlane.position = BABYLON.Vector3.Down().scale(worldDistance / 2.0);
        groundPlane.material = GroundMaterial;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 20, scene);
        sphere.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
        sphere.flipFaces(true);


        sphere.material = WorldMaterial;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere2 = BABYLON.Mesh.CreateSphere("sphere2", 16, 18, scene);
        sphere2.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
        sphere2.flipFaces(true);


        sphere2.material = OverlayMaterial;

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

                scene.render();
            }
        });
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
