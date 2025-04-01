import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import './index.css';

const GraphSearch = ({ nodes, summaries, onSearchResults, onCenterNode, expandNodeAndRevealPath }) => {
  const [tempQuery, setTempQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const graphContainer = document.querySelector('.react-flow');
      const clickedInsideGraph = graphContainer?.contains(event.target);

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !clickedInsideGraph
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSearch = () => {
    const search = tempQuery.trim().toLowerCase();
    if (!search) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }

    const matched = nodes.map((node) => {
      const nodeId = node.id;
      const title = nodeId;
      const content = summaries[nodeId] || '';
      const lowerTitle = title.toLowerCase();
      const lowerContent = content.toLowerCase();

      if (lowerTitle.includes(search)) {
        return { id: nodeId, type: 'title', title };
      } else if (lowerContent.includes(search)) {
        const start = lowerContent.indexOf(search);
        const snippet = content.substring(
          Math.max(0, start - 20),
          Math.min(content.length, start + search.length + 40)
        );
        return { id: nodeId, type: 'content', title, snippet, search };
      }
      return null;
    }).filter(Boolean);

    setSearchTerm(search);
    setResults(matched);
    setDropdownOpen(true);
  };

  const handleSelect = (id) => {
    const node = nodes.find(n => n.id === id);
    if (node && node.position) {
      if (expandNodeAndRevealPath) {
        expandNodeAndRevealPath(id); // expands all ancestors and their children
      }
      onCenterNode(node.position, node.id);
      onSearchResults([node], searchTerm);
    }
    setDropdownOpen(false);
  };

  const highlightMatch = (text, keyword) => {
    const regex = new RegExp(`(${keyword})`, 'ig');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} style={{ backgroundColor: 'yellow' }}>{part}</strong>
      ) : (
        part
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ position: 'relative', width: '30%' }} ref={containerRef}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginTop: '5px',
          marginBottom: '5px'
        }}
      >
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
            fontSize: '16px'
          }}
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
            cursor: 'pointer'
          }}
        >
          <FaSearch size={20} />
        </button>
      </div>

      {dropdownOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleSelect(result.id)}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
            >
              <strong>{highlightMatch(result.title, searchTerm)}</strong>
              {result.type === 'content' && (
                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                  {highlightMatch(result.snippet, searchTerm)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraphSearch;
