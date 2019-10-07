import * as React from 'react';
import * as BABYLON from 'babylonjs';
import BabylonScene, { SceneEventArgs } from './SceneComponent'; // import the component above linking to file we just created.
import ReactDOM from 'react-dom';
import 'babylonjs-loaders';
import UIStack from "./UIStack";
import './index.css';
import EditorController from './EditorController';
import Layer from './Layer';
import ImageLayer from './ImageLayer';

export type PageProps = {

}

export type PageState = {
  scene?: BABYLON.Scene;
  hasImage: boolean;
  textureURL?: string;
  editorController?: EditorController;
  layers: Layer[];
}

class PageWithScene extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);

    this.state = {
      scene: undefined,
      hasImage: false,
      editorController: undefined,
      layers: [],
    }
  }

  imageChange(e : React.ChangeEvent<HTMLInputElement>) {
    console.log("imageChange");

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
      const layers = this.state.layers.concat([new Layer(url, files[0], 2.0)]);
      this.setState({ layers: layers });
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
      const imageLayers = this.state.layers.map((layer) => <ImageLayer editorController={this.state.editorController} url={layer.url} distance={2.0} />);

      return (
      <div className="canvas-container">
        {imageLayers}
        <BabylonScene height={400} width={800} onSceneMount={this.onSceneMount.bind(this)} />
      </div>
      );
    }

    return (
    <div>
      {showScene()}
      <div className="UI-container">
        <UIStack layers={this.state.layers} onAdd={(e : React.ChangeEvent<HTMLInputElement>) => 
        {
          console.log("first!");
          this.imageChange(e);
        }}/>
      </div>
    </div>
    );
  }
}

ReactDOM.render(
    <PageWithScene />,
    document.getElementById('root')
  );
