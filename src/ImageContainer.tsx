import React from 'react';

export default (props: any) => {
  return (
    <div className="image-container">
      <span className='image-name'></span>
      <label className="file-label" htmlFor="file-selector-01"> 
        Select File
      </label>
      <input type='file' id="file-selector-01" className="file-selector" onChange={props.onChange} />
    </div>
  );
}
