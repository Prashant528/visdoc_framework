import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  NodeToolbar,
  Handle,
  Position,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom'; 

// We'll modify render_graph or import some helper from it
import { initialGraphData, reLayoutVisibleElements } from './graph_generator';

import Modal from './Modal';
import VideoModal from './VideoModal';
import GraphSearch from './GraphSearch';
import { Select } from 'antd';


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
    console.log(response)
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
      
      {/* Button Container Below the Node */}
    <div
      style={{
        position: 'absolute',
        bottom: '-2rem', // Moves buttons below the node
        left: '25%', // Centers them horizontally
        width: '50%', // Half of the node width
        display: 'flex', // Align buttons in a row
        justifyContent: 'space-between', // Space out buttons evenly
      }}
    >
      {/* Collapse Button */}
      <button
        onClick={() => onCollapse(data.label)}
        style={{
          cursor: 'pointer',
          width: '50%', // Each button takes almost half of the container
          backgroundColor: '#f0f7fc',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '4px',
          textAlign: 'center',
        }}
        aria-label="collapse children"
      >
        ❮
      </button>

      {/* Expand Button (Only if children exist) */}
      {hasChildren && (
        <button
          onClick={() => onExpand(data.label)}
          style={{
            cursor: 'pointer',
            width: '50%', // Each button takes almost half of the container
            backgroundColor: '#f0f7fc',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            textAlign: 'center',
          }}
          aria-label="expand children"
        >
          ❯
        </button>
      )}
    </div>

    {/* Depth Box (Small Box in Front of Node) */}
    <div
      style={{
        position: 'absolute',
        left: '-1.5rem', // Position the box to the left of the node
        top: '20%', // Center it vertically
        transform: 'translateY(-50%)',
        backgroundColor: '#f0f7fc', // Background color
        color: 'black', // Text color
        padding: '1px 1px', // Padding for better visibility
        borderRadius: '4px', // Rounded corners
        fontSize: '12px',
        textAlign: 'center',
        minWidth: '10px', // Ensures small but readable size
      }}
    >
      {data.depth}
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

const GraphApp = ({ graph_sequences, summaries , repo}) => {
  const navigate = useNavigate();
  const { setCenter } = useReactFlow();


  // 1) Build the entire graph (all nodes/edges), but do NOT do the final Dagre layout yet.
  //    Instead, we use a custom function that identifies root nodes and sets them + their children to visible.
  const { initialNodes, initialEdges, adjacencyList } = initialGraphData(
    repo_name,
    graph_sequences
  );

  // 2) Use the standard React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // Searching nodes and filtering them 
  const [filteredNodes, setFilteredNodes] = useState(nodes);


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
    let isActive =  node.data.isActiveSearchResult;
  
    // Maintain sequence-based highlighting
    if (activeSequence) {
      const sequenceEdges = graph_sequences.find(
        (seq) => seq.sequence === activeSequence
      )?.edges || [];
  
      isActive = sequenceEdges.some(
        (edge) => edge.source === node.id || edge.target === node.id
      );
    }
  
    // If the node is searched, apply `highlighted-node`
    const highlightClass = node.data.isHighlighted ? 'highlighted-node' : '';
    const sequenceClass = isActive ? 'sequence-highlighted' : '';
    const activeClass = node.data.isActiveSearchResult ? 'active-search-result' : '';

    return {
      ...node,
      className: `${highlightClass} ${sequenceClass} ${activeClass}`.trim(), // Ensure both classes apply properly
    };
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

  const handleSearchResults = (matchingNodes, searchTerm) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((node) => {
        const isSearched = matchingNodes && matchingNodes.some(fNode => fNode.id === node.id);
        return { 
          ...node, 
          data: { 
            ...node.data, 
            isVisible: node.data.isVisible || isSearched, // Ensure visibility
            isHighlighted: isSearched,  // Ensure highlighting
            isActiveSearchResult: false,
          } 
        };
      });
  
      // Expand all parents of searched nodes
      if (matchingNodes) {
        const visitedNodes = new Set();
        
        function expandParents(childId) {
          if (visitedNodes.has(childId)) return; // Prevent infinite loops
          visitedNodes.add(childId);
  
          Object.entries(adjacencyList).forEach(([parent, children]) => {
            if (children.includes(childId)) {
              const parentNode = updatedNodes.find(n => n.id === parent);
              if (parentNode && !parentNode.data.isVisible) {
                parentNode.data.isVisible = true;
                expandParents(parent); // Recursively expand all ancestors
              }
            }
          });
        }
  
        matchingNodes.forEach(node => expandParents(node.id));
      }
  
      return [...updatedNodes]; // 🔥 Force React to detect the state change
    });
  };
  
  const handleCenterNode = (position, nodeId) => {
    if (position) {
      setCenter(position.x, position.y, { zoom: 0.5 });
    }
    
    console.log("Centered node:", nodeId)
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        const isActive = node.id === nodeId;
        return {
          ...node,
          className: isActive ? 'active-search-result' : '',
          data: { 
            ...node.data, 
            isActiveSearchResult: isActive,
          },
        };
      });
    });
  
    // Force a small delay to trigger ReactFlow re-render
    setTimeout(() => setNodes((prevNodes) => [...prevNodes]), 10);
  };
  
  const centerFirstNodeOfSequence = (sequenceName) => {
    const selectedSequence = graph_sequences.find(seq => seq.sequence === sequenceName);
    if (selectedSequence && selectedSequence.edges.length > 0) {
      const firstNodeId = selectedSequence.edges[0].target;
      const firstNode = nodes.find(node => node.id === firstNodeId);
  
      if (firstNode && firstNode.position) {
        setCenter(firstNode.position.x, firstNode.position.y, { zoom: 0.5 });
  
        // Highlight the first node
        setNodes(prevNodes =>
          prevNodes.map(node => ({
            ...node,
            className: node.id === firstNodeId ? 'active-search-result' : '',
            data: {
              ...node.data,
              isActiveSearchResult: node.id === firstNodeId,
            },
          }))
        );
      }
    }
  };
  
  const handleClearGraph = () => {
    setNodes(initialNodes);   // Reset nodes to initial state
    setEdges(initialEdges);   // Reset edges to initial state
    setActiveSequence(null);  // Reset dropdown selection
    // Run Dagre layout to reset node positions
    const [resetNodes, resetEdges] = reLayoutVisibleElements(initialNodes, initialEdges);
    setNodes(resetNodes);
    setEdges(resetEdges);

    // Find the first node and center the view on it
    if (resetNodes.length > 0) {
      const firstNode = resetNodes[0];  // Assuming the first node is the entry point
      setCenter(firstNode.position.x, firstNode.position.y, { zoom: 0.5 });
    }
  };
  

  return (
    <div style={{ height: 200 }}>
      {/* Top Controls: Sequence + create/edit buttons */}
      <div 
       style={{ 
        display: 'flex', 
        justifyContent: 'center',  // Centering the items
        alignItems: 'center', 
        gap: '100px',  // Adjust spacing between dropdown and search
        width: '100%',
        marginBottom: '0px'
      }}
      >
        {/* Sequence buttons */}
        <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          width: '40%'  // Same width as the search box
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '10px' }}>Choose a category:</span>
        <Select
          style={{ width: 250 }}
          placeholder="Select a category"
          onChange={(value) => {
            if (value === "None") {
              // Reset the graph to its initial state
              setActiveSequence(null);
              setNodes(initialNodes);
              setEdges(initialEdges);
              return;
            }
        
            // Otherwise, set the active sequence and center the first node
            setActiveSequence(value);
            centerFirstNodeOfSequence(value);
          }}
          value={activeSequence}
        >
          {/* Add the "None" option to revert the graph */}
          <Select.Option key="none" value="None">
            None
          </Select.Option>
          
          {graph_sequences.map((seq, index) => (
            <Select.Option key={index} value={seq.sequence}>
              {seq.sequence}
            </Select.Option>
          ))}
        </Select>
      </div>


        <GraphSearch 
          style={{ width: 300 }}
          nodes={nodes} 
          summaries={summaries} 
          onSearchResults={handleSearchResults} 
          onCenterNode={handleCenterNode}
          clearSearch={handleClearGraph}/>

          
        <button 
            onClick={handleClearGraph}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              backgroundColor: '#ff4d4f', /* Red color for emphasis */
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Clear
          </button>
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
