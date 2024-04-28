import React, { useEffect, useRef, useState } from 'react';
import '../styles/DragFile.css';
import supportImageFormats from '../utils/supportFormats';
import Loading from './UI/Loading/Loading';
import ShowFiles from './ShowFiles';

const DragFiles = () => {
    const [format, setFormat] = useState(['JPEG', 'image']);
    const [files, setFiles] = useState([]);
    const [filesRef, setFilesRef] = useState([]);
    const [error, setError] = useState(false);
    const inputFilesRef = useRef(null);
    const [isProcessing, setProcessing] = useState(false);

    function createFiles(json, format, callback) {
        const keysJson = Object.keys(json)
        let receivedBase64Data, decodedBinaryData, decodedUint8Array, blob, myFile;
        let list = [];

        for (let index = 0; index < keysJson.length; index++) {
            receivedBase64Data = json[keysJson[index]]['base64data'];
            decodedBinaryData = atob(receivedBase64Data);
            decodedUint8Array = new Uint8Array(decodedBinaryData.length);

            for (let i = 0; i < decodedBinaryData.length; i++) {
                decodedUint8Array[i] = decodedBinaryData.charCodeAt(i);
            }

            blob = new Blob([decodedUint8Array]);

            blob.name = `${keysJson[index]}.${format.toLowerCase()}`;
            blob.lastModified = new Date();


            myFile = new File([blob], `${keysJson[index]}.${format.toLowerCase()}`, { type: json[keysJson[index]]['mimetype'] })

            list.push(myFile);
        }

        callback(list);
    }

    function submitFiles() {
        if (error == true) {
            setError(false)
        }

        if (files.length !== 0) {
            setProcessing(true)

            const formData = new FormData();

            formData.append('toFormat', format);
            formData.append('fromFormat', files[0].type.split('/')[0]);

            for (var i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            fetch('http://localhost:3000/',
                {
                    method: "POST",
                    body: formData
                })
                .then(res => res.json())
                .then(json => {
                    createFiles(json, format[0], (list) => {
                        setFiles(list);
                    });

                    setProcessing(false)
                })
        }
    }

    function selectFiles() {
        if (error == true) {
            setError(false)
        }

        inputFilesRef.current.click();
    }

    function dragStart(e) {
        e.preventDefault();
    }

    function onDrop(e) {
        e.preventDefault();
        setFiles([...files, ...e.dataTransfer.files])
    }

    function clearAll() {
        if (error == true) {
            setError(false)
        }

        inputFilesRef.current.value = null;
        setFiles([]);
    }

    function filesHandler(e) {
        let fileItems = e.target.files
        let filteredFiles = []

        for (let file of fileItems) {
            if (files.length != 0) {
                files[0].type.split('/')[0] === file.type.split('/')[0] ? filteredFiles.push(file) : setError(true)
            }
            else {
                fileItems.item(0).type.split('/')[0] === file.type.split('/')[0] ? filteredFiles.push(file) : setError(true)
            }
        }

        setFiles([...files, ...filteredFiles])
    }

    function deleteItem(index) {
        setFiles(files.filter(item => item !== files[index]))
    }

    function getFileItemsRef(filesRef) {
        setFilesRef(filesRef)
    }

    function downloadAll() {
        filesRef.forEach((item) => {
            item.click();
        })
    }

    return (
        <div className='Conteiner-drag-file'>
            <div className='Conteiner-format-file'>
                {supportImageFormats.map((frmt, index) => (
                    <span className={frmt[0] !== format[0] ? 'passive' : 'active'} onClick={() => setFormat(frmt)} key={index}>{frmt[0]}</span>
                ))}
            </div>

            <div className='Drag-file' onDragStart={dragStart} onDragOver={dragStart} onDragLeave={dragStart} onDrop={onDrop}>
                {
                    isProcessing ? <Loading /> : <ShowFiles files={files} deleteItem={deleteItem} getFileItemsRef={getFileItemsRef} />
                }
                <input className='Input-files' type="file" ref={inputFilesRef} onChange={(e) =>
                    filesHandler(e)
                } multiple accept='image/*, video/*' />
            </div>

            {error &&
                <div className='Error'>
                    <span>Type of files can be only the same</span>
                </div>
            }

            <div className='Container-buttons'>
                <button disabled={isProcessing} onClick={selectFiles} className='UploadFile-btn'>Upload Files</button>
                <button disabled={files.length == 0 || isProcessing} onClick={submitFiles} className='Submit-btn'>Submit</button>
                <button disabled={files.length == 0 || isProcessing} onClick={downloadAll} className='Download-all-btn'>Download all</button>
                <button disabled={files.length == 0 || isProcessing} onClick={clearAll} className='Clear-btn'>Clear all</button>
            </div>
        </div>
    );
}

export default DragFiles;
