// Modal.js

import React from "react";
import './index.css';
import ReactMarkdown from 'react-markdown';


const Modal = ({ isOpen, handleCloseModal, children }) => {
	if (!isOpen) return null;

	return (
		<div className="modal">

                        <div className="modal-content">
                            <span className="close" onClick={handleCloseModal}>&times;</span>
							{/* <ReactMarkdown> {children} </ReactMarkdown>    */}
							{children}    
                        </div>
				
		</div>
	);
};

export default Modal;
