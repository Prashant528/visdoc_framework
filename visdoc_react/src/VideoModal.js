import React, { useEffect, useRef } from 'react';
import './index.css';

const VideoModal = ({ isOpen, videoTitle, handleClose }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    console.log("Showing video for :", videoTitle)
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>&times;</span>
                <video ref={videoRef} width="100%" controls>
                    <source src={`/assets/videos/${videoTitle}.mp4`} type="video/mp4" />
                    {/* <source src={`/assets/videos/Development.mp4`} type="video/mp4" /> */}

                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};

export default VideoModal;
