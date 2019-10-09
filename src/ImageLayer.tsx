import * as React from 'react';
import EditorController from './EditorController';
import BabylonImageLayer from './BabylonImageLayer';

export type ImageLayerProps = {
  editorController : EditorController | undefined;
  url : string;
  distance : number;
}

export type ImageLayerState = {
  layerKey : string | undefined;
}

export default class ImageLayer extends React.Component<ImageLayerProps, ImageLayerState> {
  componentDidMount() {
    if(!this.props.editorController) {
      return;
    }
    
    const key = this.props.editorController.createImageLayer(this.props.url, this.props.distance);
    this.setState({layerKey: key});
  }
  
  componentDidUpdate(prevProps : ImageLayerProps) {
    if(!this.state.layerKey || !this.props.editorController) {
      return;
    }
    
    const imageLayer : BabylonImageLayer | undefined = this.props.editorController.getImageLayer(this.state.layerKey!);

    if(!imageLayer) {
      return;
    }

    if(this.props.distance !== prevProps.distance) {
      imageLayer.setDistance(this.props.distance);
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