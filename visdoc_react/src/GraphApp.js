import React, { useCallback, useState, useMemo, useEffect } from 'react';
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

// We'll modify render_graph or import some helper from it
import { initialGraphData, reLayoutVisibleElements } from './graph_generator';

import Modal from './Modal';
import VideoModal from './VideoModal';

const repo_name = 'Flutter';

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
        adjacencyList[current].forEach(child => {
          if (!visited.has(child)) {
            stack.push(child);
          }
        });
      }
    }
  }
  return descendants;
}

const checkVideoExists = async (videoTitle, repo) => {
  try {
    const response = await fetch(`/assets/videos/${repo}/${videoTitle}.mp4`, { method: 'HEAD' });

    if (!response.ok) {
      console.log(`Video ${videoTitle}.mp4 not found for repo ${repo}. Response:`, response.status);
      return false;
    }

    // Extra safety: Ensure correct Content-Type is returned
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('video')) {
      console.log(`Invalid content type for ${videoTitle}: ${contentType}`);
      return false;
    }

    console.log(`Video ${videoTitle}.mp4 found for repo ${repo}`);
    return true;
  } catch (error) {
    console.error(`Error checking video for ${videoTitle}:`, error);
    return false;
  }
};

function NodeWithToolbar({ data, handleOpenModal, handleOpenVideoModal, onExpand, onCollapse, repo, adjacencyList }) {
  const openModal = () => {
    handleOpenModal(data.label);
  };
  const hasChildren = adjacencyList[data.label] && adjacencyList[data.label].length > 0;

  const [videoExists, setVideoExists] = useState(false);

  useEffect(() => {
    const fetchVideoStatus = async () => {
      const exists = await checkVideoExists(data.label, repo);
      setVideoExists(exists);
    };
    fetchVideoStatus();
  }, [data.label, repo]);

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid black',
        borderRadius: '20px',
        backgroundColor: '#f0f8ff',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        // Add a small transition to help visualize repositioning
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
      }}
      className="node-hover"
    >
      {/* Node Toolbar (Text / Videos) */}
      <NodeToolbar isVisible={data.forceToolbarVisible} position={data.toolbarPosition}>
        <button onClick={() => handleOpenModal(data.label)}>Text</button>
        {videoExists && <button onClick={() => handleOpenVideoModal(data.label)}>Video</button>}
      </NodeToolbar>

      {/* Node Label */}
      <div className="new_node_label">{data.label}</div>

      {/* Collapse Button (on the left side) */}
      <div
        style={{
          position: 'absolute',
          left: '-1.5rem',
          top: '50%',
          transform: 'translateY(-50%)'
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
      {/* Expand Button (Only if children exist) */}
      {hasChildren && (
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
      )}

      {/* React Flow Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  'node-with-toolbar': NodeWithToolbar,
};

const GraphApp = ({ graph_sequences, summaries , repo}) => {
  const navigate = useNavigate();

  // 1) Build the entire graph (all nodes/edges), but do NOT do the final Dagre layout yet.
  //    Instead, we use a custom function that identifies root nodes and sets them + their children to visible.
  const { initialNodes, initialEdges, adjacencyList } = initialGraphData(
    repo_name,
    graph_sequences
  );

  // 2) Use the standard React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // For sequence highlighting
  const [activeSequence, setActiveSequence] = useState(null);

  // 3) A function to "re-run" the Dagre layout on the currently visible nodes/edges.
  const runLayout = useCallback((currentNodes, currentEdges) => {
    const [newNodes, newEdges] = reLayoutVisibleElements(currentNodes, currentEdges);
    // Return the newly laid out arrays
    return [newNodes, newEdges];
  }, []);

  // 4) Expand logic
  const handleExpand = useCallback(
    (nodeId) => {
      // Show immediate children
      setNodes((prevNodes) => {
        // First, make immediate children visible
        const nextNodes = prevNodes.map((node) => {
          if (adjacencyList[nodeId]?.includes(node.id)) {
            return {
              ...node,
              data: { ...node.data, isVisible: true },
            };
          }
          return node;
        });
        // Re-run dagre layout for newly visible nodes
        const [laidOutNodes, ] = runLayout(nextNodes, edges);
        return laidOutNodes;
      });
    },
    [adjacencyList, edges, runLayout, setNodes]
  );

  // 5) Collapse logic
  const handleCollapse = useCallback(
    (nodeId) => {
      // Hide entire subtree
      const descendants = gatherDescendants(nodeId, adjacencyList);

      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((node) => {
          if (descendants.includes(node.id)) {
            return { 
              ...node, 
              data: { ...node.data, isVisible: false },
            };
          }
          return node;
        });
        // Re-run dagre layout after collapsing
        const [laidOutNodes, ] = runLayout(nextNodes, edges);
        return laidOutNodes;
      });
    },
    [adjacencyList, edges, runLayout, setNodes]
  );

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

  // Create Videos / Edit Texts
  const handleCreateVideosButtonClick = () => {
    navigate('/creator-page', { state: { flow: graph_sequences, summaries: summaries } });
  };

  // OnConnect for React Flow
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  // Modal
  const [modalContent, setModalContent] = useState('');
  const [open, setOpen] = useState(false);

  const handleCloseModal = () => setOpen(false);
  const handleOpenModal = (label) => {
    const summary = summaries[label] || 'No summary available';
    setModalContent(summary);
    setOpen(true);
  };

  // 6) Filter/Style by visibility & sequence highlighting
  const visibleNodes = nodes.filter((node) => node.data.isVisible);

  const modifiedNodes = visibleNodes.map((node) => {
    if (activeSequence) {
      const sequenceEdges = graph_sequences.find(
        (seq) => seq.sequence === activeSequence
      )?.edges || [];
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

  const visibleEdges = edges.filter((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    return sourceNode?.data.isVisible && targetNode?.data.isVisible;
  });

  const modifiedEdges = visibleEdges.map((edge) => {
    if (activeSequence) {
      const sequenceEdges = graph_sequences.find(
        (seq) => seq.sequence === activeSequence
      )?.edges || [];
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

  //video modal components
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');

  const handleOpenVideoModal = (videoTitle) => {
    setSelectedVideo(videoTitle);
    setVideoOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoOpen(false);
  };

  return (
    <div style={{ height: 600 }}>
      {/* Top Controls: Sequence + create/edit buttons */}
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
          <span className="sequence-label">Choose a task:</span>
          {sequenceButtons}
        </div>

        {/* Create Videos Button */}
        {/* <button 
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
        </button> */}
        {/* <button 
          onClick={handleCreateVideosButtonClick} 
          style={{ 
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '8px 8px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            margin: '0 0 0 0.5rem'
          }}
        >
          Edit Texts
        </button>*/}
      </div> 

      {/* The React Flow Graph */}
      <div className="graph-container">
      <ReactFlow
        style={{ height: '100%' }} 
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
              handleOpenVideoModal={handleOpenVideoModal}
              onExpand={handleExpand}
              onCollapse={handleCollapse}
              repo={repo}
              adjacencyList={adjacencyList}
            />
          ),
        }}
      >
        <Modal isOpen={open} handleCloseModal={handleCloseModal}>
          {modalContent}
        </Modal>
        <VideoModal isOpen={videoOpen} videoTitle={selectedVideo} handleClose={handleCloseVideoModal} repo={repo}/>

        <Controls />

      </ReactFlow>
      </div>
    </div>
  );
};

export default GraphApp;
