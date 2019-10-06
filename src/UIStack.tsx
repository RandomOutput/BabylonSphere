import React from 'react';
import Layer from './Layer';

export type UIStackProps = {
  files : Layer[]; 
}

export default class UIStack extends React.Component<{}, {}> {
  
  
  render () {
    return (
      <ul>

      </ul>
    );
  }
}
