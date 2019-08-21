import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';
import { CameraInputsManager } from 'babylonjs';

class PageWithScene extends React.Component<{}, {}> {
      onSceneMount(e: SceneEventArgs) : void {
        const speed = 1.0;
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

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 20, scene);
        sphere.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
        sphere.flipFaces(true);

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        myMaterial.disableLighting = true;
        myMaterial.emissiveTexture = new BABYLON.Texture("Copenhagen.jpg", scene);

        sphere.material = myMaterial;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere2 = BABYLON.Mesh.CreateSphere("sphere2", 16, 18, scene);
        sphere2.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
        sphere2.flipFaces(true);

        var myMaterial2 = new BABYLON.StandardMaterial("myMaterial2", scene);
        myMaterial2.disableLighting = true;
        //myMaterial2.emissiveTexture = 
        myMaterial2.emissiveColor = new BABYLON.Color3(1.0,1.0,1.0);
        myMaterial2.diffuseTexture = new BABYLON.Texture("trees.png", scene);
        myMaterial2.diffuseTexture.hasAlpha = true;

        sphere2.material = myMaterial2;

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
