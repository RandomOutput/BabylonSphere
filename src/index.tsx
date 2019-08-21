import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';

class PageWithScene extends React.Component<{}, {}> {
      onSceneMount(e: SceneEventArgs) : void {
        const { canvas, scene, engine } = e;

        scene.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.0, Math.PI / 2.0, 40, new BABYLON.Vector3(0,0,0), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 20, scene);
        sphere.rotate(new BABYLON.Vector3(0,0,1), Math.PI, BABYLON.Space.LOCAL);
        sphere.flipFaces(true);

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        myMaterial.disableLighting = true;
        myMaterial.emissiveTexture = new BABYLON.Texture("Copenhagen.jpg", scene);

        sphere.material = myMaterial;

        // Move the sphere upward 1/2 its height
        sphere.position.y = 0;

        engine.runRenderLoop(() => {
            if (scene) {
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
