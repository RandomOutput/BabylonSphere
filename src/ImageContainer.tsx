import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons'

export type ImageContainerProps = {
  onChange : (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default (props: ImageContainerProps) => {
  return (
    <div className="image-container">
      <span className='image-name'></span>
      <label className="file-label" htmlFor="file-selector-01">
        <FontAwesomeIcon icon={faFileImage} />
        Select File
      </label>
      <input type='file' id="file-selector-01" className="file-selector" onChange={props.onChange} />
    </div>
  );
}
