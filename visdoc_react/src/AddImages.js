import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const AddImages = ({ summaries }) => {
  const [data, setData] = useState(
    Object.fromEntries(
      Object.entries(summaries).map(([topic, content]) => [
        topic,
        content.split('<br />').map((subContent) => ({ text: subContent, image: null })),
      ])
    )
  );

  const handleImageUpload = (topic, index, event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const updatedData = { ...data };
      updatedData[topic][index].image = reader.result; // Save the image as Base64
      setData(updatedData);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const generateJson = () => {
    const generatedJson = {};
    Object.entries(data).forEach(([topic, subContents]) => {
      generatedJson[topic] = subContents.map((subContent) => ({
        subContent: {
          text: subContent.text,
          image: subContent.image || '', // Include empty image field if not uploaded
        },
      }));
    });
    console.log('Generated JSON:', JSON.stringify(generatedJson, null, 2));
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
                <ReactMarkdown>{subContent.text}</ReactMarkdown>
                {subContent.image && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={subContent.image}
                      alt={`Uploaded for ${topic} - ${index}`}
                      style={{ maxWidth: '100%', borderRadius: '4px' }}
                    />
                  </div>
                )}
                <label
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#bbbbbb',
                    color: '#fff',
                    borderRadius: '20%',
                    width: '25px',
                    height: '25px',
                    textAlign: 'center',
                    lineHeight: '23px',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  +
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
        onClick={generateJson}
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
