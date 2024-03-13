import { React, useMemo, useState } from 'react';
import '../styles/DragFile.css'
import supportFormats from '../utils/SupportFormats';

const DragFiles = () => {
    const [format, setFormat] = useState('Jpg');

    return (
        <div className='Conteiner-drag-file'>
            <div className='Conteiner-format-file'>
                {supportFormats.map((frmt, index) => (
                    <span className={frmt !== format ? 'passive' : 'active'} onClick={() => setFormat(frmt)} key={index}>{frmt}</span>
                ))}
            </div>
            <div className='Drag-file'>
                <span>Click here to upload files or drag your here</span>
            </div>
            <div className='Container-buttons'>
                <button className='Download-btn'>Download all</button>
                <button className='Clear-btn'>Clear all</button>
            </div>
        </div>
    );
}

export default DragFiles;
