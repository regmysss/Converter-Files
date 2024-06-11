import { useEffect, useRef } from 'react';
import '../styles/ShowFile.css'

/* eslint-disable react/prop-types */
const ShowFiles = ({ files, deleteItem, getFileItemsRef }) => {
    const aFileDownloadRef = useRef([]);

    useEffect(() => {
        if (files.length != 0) {
            getFileItemsRef(aFileDownloadRef.current)
        }
    }, [files, getFileItemsRef])

    function downloadFile(index) {
        aFileDownloadRef.current[index].click();
    }

    return (
        <>
            {
                files.length === 0 ? <span className='Drag-text'>Drag your files here</span> :
                    files.map((item, index) => <div key={index} className='File-item'>
                        <span>{item.name}</span>
                        <img src={URL.createObjectURL(item)} onError={(e) => {
                            e.target.src = 'video_icon.png'
                        }} alt="Error" />
                        <a href={URL.createObjectURL(item)} download={item.name} ref={(element) => aFileDownloadRef.current[index] = element}></a>
                        <div className='Container-buttons-img'>
                            <button onClick={() => downloadFile(index)} className='Download-btn'>Download</button>
                            <button onClick={() => deleteItem(index)} className='Delete-item-btn'>&#x2715;</button>
                        </div>
                    </div>)
            }
        </>
    );
}

export default ShowFiles;