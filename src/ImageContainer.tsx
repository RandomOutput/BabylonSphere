import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons'
import Layer from "./Layer";

export type ImageContainerProps = {
  layer ?: Layer;
  onChange ?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default (props: ImageContainerProps) => {
  if(!props.onChange) {
    return (
      <div className="image-container">
        <div className="file-label">
          { props.layer ? (props.layer.file.name + " | " + props.layer.distance) : "NO_FILE_NAME" }
        </div>
      </div>
    );
  }

  return (
    <div className="image-container">
      <span className='image-name'></span>
      <label className="file-label" htmlFor="file-selector-01">
        <FontAwesomeIcon icon={faFileImage} />
        Select File
      </label>
      <input type='file' id="file-selector-01" className="file-selector" onChange={e => props.onChange!(e) } />
    </div>
  );
}
