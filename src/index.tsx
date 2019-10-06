import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';
import 'babylonjs-loaders';
import ImageContainer from './ImageContainer';
import './index.css';
import EditorController from './EditorController';

export type PageProps = {

}

export type PageState = {
  scene?: BABYLON.Scene;
  hasImage: boolean;
  textureURL?: string;
  editorController?: EditorController;
}

class PageWithScene extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);

    this.state = {
      scene: undefined,
      hasImage: false,
      textureURL: undefined,
      editorController: undefined
    }
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
      console.log(url);
      if(this.state.editorController) {
        this.state.editorController.setTexture(url);
      }
    };

    reader.readAsArrayBuffer(files[0]);
  }

  onSceneMount(e: SceneEventArgs) : void {
    const { canvas, scene, engine } = e;
    
    // This creates and positions a free camera (non-mesh)
    let camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.0, Math.PI / 2.0, 30.0, new BABYLON.Vector3(0,0,0), scene);

    this.setState({ scene: scene });
    let textureURL = this.state.textureURL;
    
    let ec = new EditorController({
      scene,
      canvas,
      engine,
      textureURL,
      camera,
    });

    console.log("ec", ec);

    this.setState({ editorController: ec});
    
    ec.onSceneSetup();
    
    engine.runRenderLoop(() => {
      ec.onTick();
      
      if(scene.cameras.length <= 0) {
        return;
      }

      scene.render();
    });
  }

  render() {
    const showScene = () => {
      return (
      <div className="canvas-container">
        <BabylonScene height={400} width={800} onSceneMount={this.onSceneMount.bind(this)} />
      </div>
      );
    }

    return (
    <div>
      {showScene()}
      <div className="UI-container">
      <ImageContainer onChange={this.imageChange.bind(this)}/>
      </div>
    </div>
    );
  }
}

ReactDOM.render(
    <PageWithScene />,
    document.getElementById('root')
  );
