import * as React from 'react';
import Layer from './Layer';
import { ReactComponent } from '*.svg';

export type ImageLayerInspectorProps = {
  layer : Layer;
};

export default class ImageLayerInspector extends React.Component<ImageLayerInspectorProps, {}> {
  render() {
    return (
      <div className="image-container">
        <div className="file-label">
          {this.props.layer.file.name + " | " + this.props.layer.distance}
        </div>
      </div>
    );
  }
}