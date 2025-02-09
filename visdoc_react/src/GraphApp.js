import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  NodeToolbar,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom'; 

import render_graph from './graph_generator';
import Modal from './Modal';

const repo_name= 'Flutter';

/**
 * Recursively gather all descendants of a node (children, grandchildren, etc.)
 * excluding the node itself.
 */
function gatherDescendants(nodeId, adjacencyList) {
  const stack = [...(adjacencyList[nodeId] || [])];
  const visited = new Set();
  const descendants = [];

  while (stack.length) {
    const current = stack.pop();
    if (!visited.has(current)) {
      visited.add(current);
      descendants.push(current);
      if (adjacencyList[current]) {
        adjacencyList[current].forEach((child) => {
          if (!visited.has(child)) {
            stack.push(child);
          }
        });
      }
    }
  }

  return descendants;
}

function NodeWithToolbar({ data, handleOpenModal, onExpand, onCollapse }) {
  const openModal = () => {
    handleOpenModal(data.label);
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid black',
        borderRadius: '20px',
        backgroundColor: '#f0f8ff',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        /* Add a small transition to see movement/fade changes */
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
      }}
      className="node-hover"
    >
      {/* Node Toolbar (Text / Videos) */}
      <NodeToolbar
        isVisible={data.forceToolbarVisible}
        position={data.toolbarPosition}
      >
        <button onClick={openModal}>Text</button>
        <button>Videos</button>
      </NodeToolbar>

      {/* Node Label */}
      <div className="new_node_label">{data.label}</div>

      {/* Collapse Button (on the left side) */}
      <div
        style={{
          position: 'absolute',
          left: '-1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <button 
          onClick={() => onCollapse(data.label)} 
          style={{ cursor: 'pointer' }}
          aria-label="collapse children"
        >
          ❮
        </button>
      </div>

      {/* Expand Button (on the right side) */}
      <div
        style={{
          position: 'absolute',
          right: '-1.5rem',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <button 
          onClick={() => onExpand(data.label)} 
          style={{ cursor: 'pointer' }}
          aria-label="expand children"
        >
          ❯
        </button>
      </div>

      {/* React Flow Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  'node-with-toolbar': NodeWithToolbar,
};

const GraphApp = ({ graph_sequences, summaries }) => {
  const navigate = useNavigate();
  let [initialNodes, initialEdges] = render_graph(repo_name, graph_sequences);

  // 1. Build adjacency list for expand/collapse
  const adjacencyList = useMemo(() => {
    const adjacency = {};
    initialEdges.forEach((edge) => {
      if (!adjacency[edge.source]) {
        adjacency[edge.source] = [];
      }
      adjacency[edge.source].push(edge.target);
    });
    return adjacency;
  }, [initialEdges]);

  // 2. Ensure isVisible is set on all nodes
  initialNodes = initialNodes.map(node => {
    return {
      ...node,
      data: {
        ...node.data,
        isVisible: node.data.isVisible !== false
      }
    };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // For sequence highlighting
  const [activeSequence, setActiveSequence] = useState(null);

  // 3. Expand/Collapse
  const handleExpand = useCallback((nodeId) => {
    // Show only immediate children
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (adjacencyList[nodeId]?.includes(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              isVisible: true
            }
          };
        }
        return node;
      });
    });
  }, [adjacencyList, setNodes]);

  const handleCollapse = useCallback((nodeId) => {
    // Hide the entire subtree under nodeId
    const descendants = gatherDescendants(nodeId, adjacencyList);

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (descendants.includes(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              isVisible: false
            }
          };
        }
        return node;
      })
    );
  }, [adjacencyList, setNodes]);

  // Sequence Buttons
  const sequenceButtons = graph_sequences.map((seq, index) => (
    <button
      key={index}
      onClick={() => setActiveSequence(seq.sequence)}
      style={{
        marginRight: '8px',
        backgroundColor: activeSequence === seq.sequence ? '#ff7f50' : '#f0f0f0',
        color: activeSequence === seq.sequence ? '#fff' : '#000',
        border: activeSequence === seq.sequence ? '2px solid #0056b3' : '1px solid #ccc',
        borderRadius: '4px',
        padding: '6px 12px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
      className={`sequence-button ${activeSequence === seq.sequence ? 'active' : ''}`}
    >
      {seq.sequence}
    </button>
  ));

  // "Create Videos" and "Edit Texts" Buttons
  const handleCreateVideosButtonClick = () => {
    navigate('/creator-page', { state: { flow: graph_sequences, summaries: summaries } });
  };

  // onConnect for React Flow
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // Modal logic
  const [modalContent, setModalContent] = useState('');
  const [open, setOpen] = useState(false);

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleOpenModal = (label) => {
    const summary = summaries[label] || 'No summary available';
    setModalContent(summary);
    setOpen(true);
  };

  // 4. Filter/Style by visibility & sequence highlighting
  const visibleNodes = nodes.filter((node) => node.data.isVisible);

  const modifiedNodes = visibleNodes.map((node) => {
    if (activeSequence) {
      const sequenceEdges = graph_sequences.find((seq) => seq.sequence === activeSequence).edges;
      const isActive = sequenceEdges.some(
        (edge) => edge.source === node.id || edge.target === node.id
      );
      return {
        ...node,
        className: isActive ? 'highlighted-node' : '',
      };
    }
    return node;
  });

  // Show edges only if both source & target are visible
  const visibleEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    return sourceNode?.data.isVisible && targetNode?.data.isVisible;
  });

  // Apply sequence highlighting to visible edges
  const modifiedEdges = visibleEdges.map((edge) => {
    if (activeSequence) {
      const sequenceEdges = graph_sequences.find((seq) => seq.sequence === activeSequence).edges;
      const isActive = sequenceEdges.some(
        (seqEdge) => seqEdge.source === edge.source && seqEdge.target === edge.target
      );
      return {
        ...edge,
        style: {
          ...edge.style,
          stroke: isActive ? '#ff7f50' : '#ccc',
          strokeWidth: isActive ? 4 : 3,
        },
      };
    }
    return edge;
  });

  return (
    <div style={{ height: 600 }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          width: '100%' 
        }}
      >
        {/* Sequence buttons */}
        <div className='sequence-buttons-container'>
          {sequenceButtons}
        </div>

        {/* Create Videos Button */}
        <button 
          onClick={handleCreateVideosButtonClick} 
          style={{ 
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '8px 16px', 
            border: 'none', 
            marginLeft: '8px',
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Create Videos
        </button>
        <button 
          onClick={handleCreateVideosButtonClick} 
          style={{ 
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            margin: '0 0 0 0.5rem'
          }}
        >
          Edit Texts
        </button>
      </div>

      <ReactFlow
        nodes={modifiedNodes}
        edges={modifiedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        nodeTypes={{
          'node-with-toolbar': (nodeProps) => (
            <NodeWithToolbar
              {...nodeProps}
              handleOpenModal={handleOpenModal}
              onExpand={handleExpand}
              onCollapse={handleCollapse}
            />
          ),
        }}
      >
        <Modal isOpen={open} handleCloseModal={handleCloseModal}>
          {modalContent}
        </Modal>
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GraphApp;
