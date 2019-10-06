import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons'

export type ImageContainerProps = {
  file ?: File;
  onChange ?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default (props: ImageContainerProps) => {
  if(!props.onChange) {
    return (
      <div className="image-container">
        <div className="file-label">
          { props.file ? props.file.name : "NO_FILE_NAME" }
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
