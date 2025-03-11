import React, { useEffect } from "react";
import './index.css';
import ReactMarkdown from 'react-markdown';

const Modal = ({ isOpen, handleCloseModal, children }) => {

// Close modal when 'Escape' key is pressed
useEffect(() => {
	const handleKeyDown = (event) => {
		if (event.key === 'Escape') {
		handleCloseModal();
		}
	};

	if (isOpen) {
		window.addEventListener('keydown', handleKeyDown);
	}

	return () => {
		window.removeEventListener('keydown', handleKeyDown);
	};
	}, [isOpen, handleCloseModal]);

  if (!isOpen) return null;

  // Preprocess Markdown content
  const preprocessMarkdown = (text) => {
    if (!text) return '';

    // Replace <br /> or <br> with Markdown line breaks
    let updatedText = text.replace(/<br\s*\/?>/g, '  \n');

    // Add a blank line after headers if missing
    updatedText = updatedText.replace(/(#+\s.*)(?=\n\S)/g, '$1\n');

    return updatedText;
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleCloseModal}>&times;</span>
        <ReactMarkdown>{preprocessMarkdown(children)}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Modal;
