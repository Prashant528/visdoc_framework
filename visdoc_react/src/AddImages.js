import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const AddImages = ({ flow, summaries }) => {
  const [data, setData] = useState(
    Object.fromEntries(
      Object.entries(summaries).map(([topic, content]) => [
        topic,
        content.split('<br />').map((subContent) => ({
          text: subContent,
          image: null,
          isEditing: false,
        })),
      ])
    )
  );

  const navigate = useNavigate();

  const handleTextChange = (topic, index, value) => {
    const updatedData = { ...data };
    updatedData[topic][index].text = value;
    setData(updatedData);
  };

  const toggleEditMode = (topic, index) => {
    const updatedData = { ...data };
    updatedData[topic][index].isEditing = !updatedData[topic][index].isEditing;
    setData(updatedData);
  };

  const handleImageUpload = (topic, index, event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const updatedData = { ...data };
      updatedData[topic][index].image = reader.result;
      setData(updatedData);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideos = () => {
    const updatedSummaries = {};
    Object.entries(data).forEach(([topic, subContents]) => {
      updatedSummaries[topic] = subContents.map((subContent) => subContent.text).join('<br />');
    });

    navigate('/response-page', {
      state: { apiData: { flow: flow, content: updatedSummaries } },
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', overflowX: 'scroll', gap: '1rem', padding: '1rem' }}>
        {Object.entries(data).map(([topic, subContents]) => (
          <div
            key={topic}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              minWidth: '300px',
            }}
          >
            <h2>{topic}</h2>
            {subContents.map((subContent, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                {subContent.isEditing ? (
                  <textarea
                    value={subContent.text}
                    onChange={(e) => handleTextChange(topic, index, e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      marginBottom: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <ReactMarkdown>{subContent.text}</ReactMarkdown>
                )}

                {subContent.image && (
                  <img
                    src={subContent.image}
                    alt={`Uploaded for ${topic} - ${index}`}
                    style={{ maxWidth: '100%', borderRadius: '4px', marginTop: '0.5rem' }}
                  />
                )}

                <button
                  className="common-button"
                  onClick={() => toggleEditMode(topic, index)}
                >
                  {subContent.isEditing ? 'Save' : 'Edit'}
                </button>

                <label className="common-button plus-button">
                  <img
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-image'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'></rect><circle cx='8.5' cy='8.5' r='1.5'></circle><path d='M21 15l-5-5L5 21'></path></svg>"
                    alt="icon"
                    width="16"
                    height="16"
                    style={{ verticalAlign: 'middle' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(topic, index, e)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={handleGenerateVideos}
        style={{
          display: 'block',
          margin: '2rem auto',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Generate Videos
      </button>
    </div>
  );
};

export default AddImages;
