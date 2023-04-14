import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { postFile } from '../api/helper';

export default function DropzoneComponent({showUploadedFile}) {

    const onDrop = useCallback(async (acceptedFiles) => {
        const name = acceptedFiles[0].name
        const formData = new FormData()
        formData.append('files', acceptedFiles[0])
        formData.append('name', name)
        const properData = await postFile(formData)
        showUploadedFile(properData)
    }, []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: 'text/plain, application/json'
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    return (
        <div {...getRootProps({style})}>
        <input type="file" {...getInputProps()} />
        <div>Drag and drop your map saves here (JSON, TXT).</div>
        </div>
    )
}


const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    transition: 'border .3s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };