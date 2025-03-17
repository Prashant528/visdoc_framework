import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const GraphSearch = ({ nodes, summaries, onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [tempQuery, setTempQuery] = useState('');

  const handleSearch = () => {
    const searchTerm = tempQuery.toLowerCase();
    setQuery(searchTerm);
    
    if (!searchTerm) {
      onSearchResults(null, null);
      return;
    }

    // Filter nodes by name or summary content
    const matchingNodes = nodes.filter((node) => {
      const nodeName = node.id.toLowerCase();
      const summaryText = summaries[node.id]?.toLowerCase() || '';
      return nodeName.includes(searchTerm) || summaryText.includes(searchTerm);
    });
    
    onSearchResults(matchingNodes, searchTerm);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <input
        type="text"
        placeholder="Search nodes..."
        value={tempQuery}
        onChange={(e) => setTempQuery(e.target.value)}
        style={{
          padding: '8px',
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <button 
        onClick={handleSearch} 
        style={{
          marginLeft: '8px',
          padding: '8px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <FaSearch size={16} />
      </button>
    </div>
  );
};

export default GraphSearch;
