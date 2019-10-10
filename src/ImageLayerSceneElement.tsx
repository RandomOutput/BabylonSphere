import * as React from 'react';
import EditorController from './EditorController';
import BabylonImageLayer from './BabylonImageLayer';
import Layer from './Layer';

export type ImageLayerSceneElementProps = {
  editorController : EditorController | undefined;
  layer : Layer;
}

export type ImageLayerSceneElementState = {
  layerKey : string | undefined;
}

export default class ImageLayerSceneElement extends React.Component<ImageLayerSceneElementProps, ImageLayerSceneElementState> {
  componentDidMount() {
    if(!this.props.editorController) {
      return;
    }
    
    const key = this.props.editorController.createImageLayer(this.props.layer.url, this.props.layer.distance);
    this.setState({layerKey: key});
  }
  
  componentDidUpdate(prevProps : ImageLayerSceneElementProps) {
    if(!this.state.layerKey || !this.props.editorController) {
      return;
    }
    
    const imageLayer : BabylonImageLayer | undefined = this.props.editorController.getImageLayer(this.state.layerKey!);

    if(!imageLayer) {
      return;
    }

    if(this.props.layer.distance !== prevProps.layer.distance) {
      imageLayer.setDistance(this.props.layer.distance);
    }
  }

  componentWillUnmount() {
    if(!this.state.layerKey || !this.props.editorController) {
      return;
    }

    this.props.editorController.removeImageLayer(this.state.layerKey);
  }

  render() {
    return null;
  }
}
