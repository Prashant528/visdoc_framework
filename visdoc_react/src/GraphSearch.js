import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import './index.css';

const GraphSearch = ({ nodes, summaries, onSearchResults, onCenterNode, clearSearch }) => {
  const [query, setQuery] = useState('');
  const [tempQuery, setTempQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSearch = () => {
    const searchTerm = tempQuery.toLowerCase();
    setQuery(searchTerm);
    setShowTooltip(false); // Reset tooltip on each search
  
    if (!searchTerm) {
      onSearchResults(null, null);
      setCurrentIndex(0);
      return;
    }
  
    const matchingNodes = nodes.filter((node) => {
      const nodeName = node.id.toLowerCase();
      const summaryText = summaries[node.id]?.toLowerCase() || '';
      return nodeName.includes(searchTerm) || summaryText.includes(searchTerm);
    });
  
    onSearchResults(matchingNodes, searchTerm);
  
    if (matchingNodes.length === 0) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000); // Hide after 3 seconds
        return;
      }
  
    if (matchingNodes.length > 0) {
      const nextIndex = currentIndex % matchingNodes.length;
      setCurrentIndex(nextIndex + 1);
      onCenterNode(matchingNodes[nextIndex].position, matchingNodes[nextIndex].id);
    }
  };
  
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search input when clearSearch is called
//   useEffect(() => {
//     if (clearSearch) {
//       setQuery('');
//       setTempQuery('');
//     }
//   }, [clearSearch]);

  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '10px', 
        marginTop:'10px',
        padding: '5px', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        backgroundColor: '#f8f9fa', 
        width: '30%' 
      }} className="search-container">
        <input
          type="text"
          placeholder="Search nodes/content..."
          value={tempQuery}
          onChange={(e) => setTempQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '5px',
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
          }} className="button-container"
        />
        <button 
          onClick={handleSearch} 
          style={{
            marginLeft: '10px',
            padding: '2px 2px',
            border: '2px solid #007bff',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '5px',
          }} className="search-button"
        >
          <FaSearch size={20} />
        </button>
        {showTooltip && (
          <div className="search-tooltip">
            No results found
          </div>
        )}
      </div>
  );
};

export default GraphSearch;
