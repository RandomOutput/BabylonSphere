import React from 'react';
import Layer from './Layer';
import ImageLayerInspector from './ImageLayerInspector';
import NewLayerButton from './NewLayerButton';

export type UIStackProps = {
  onAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
  layers : Layer[]; 
}

export default class UIStack extends React.Component<UIStackProps, {}> {
  render () {
    const layers = this.props.layers;
    const stack = layers.map((layer) =>
      (<li key={layer.file.name}><ImageLayerInspector layer={layer} /></li>)
    );
    
    return (
      <ul>
        {stack}
        <li key="addImage"><NewLayerButton onChange={this.props.onAdd} /></li>
      </ul>
    );
  }
}
