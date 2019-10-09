import React from 'react';
import Layer from './Layer';
import ImageContainer from './ImageContainer';

export type UIStackProps = {
  onAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
  layers : Layer[]; 
}

export default class UIStack extends React.Component<UIStackProps, {}> {
  render () {
    const layers = this.props.layers;
    const stack = layers.map((layer) =>
      (<li key={layer.file.name}><ImageContainer layer={layer} onChange={undefined}/></li>)
    );

    console.log("props:", this.props);

    return (
      <ul>
        {stack}
        <li key="addImage"><ImageContainer layer={undefined} onChange={this.props.onAdd} /></li>
      </ul>
    );
  }
}
