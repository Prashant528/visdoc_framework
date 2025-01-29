import React, { useCallback, useState } from 'react';
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

import render_graph from './graph_generator'
// import graph_sequences from "./dummy_data";
// import MyModal from './text_modal';
import Modal from './Modal';

const repo_name= 'Flutter'

function NodeWithToolbar({ data,handleOpenModal }) {
  const openModal = () => {
    handleOpenModal(data.label); // Call the passed function with the label
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid black',
        borderRadius: '20px',
        backgroundColor: '#f0f8ff',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s ease-in-out',
      }}
      className="node-hover"
    >
      <NodeToolbar
        isVisible={data.forceToolbarVisible}
        position={data.toolbarPosition}
      >
        <button onClick={openModal}>Text</button>
        <button>Images</button>
        <button>Videos</button>
      </NodeToolbar>
      <div className="new_node_label">{data.label}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
        </div>
      )
    }

const nodeTypes = {
  'node-with-toolbar': NodeWithToolbar,
};


const GraphApp = ({graph_sequences, summaries}) => {
  const navigate = useNavigate(); 
  let graph = render_graph(repo_name, graph_sequences)
  // console.log(graph[0])
  // console.log(graph[1])
  let initialNodes = graph[0]
  let initialEdges = graph[1]
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [activeSequence, setActiveSequence] = useState(null);
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
  

  const handleCreateVideosButtonClick = () => {
    navigate('/creator-page', { state: { flow: graph_sequences, summaries: summaries } });
    
  };


  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );

  const [modalContent, setModalContent] = useState('');
  const [open, setOpen] = useState(false);
  const handleCloseModal = () => {setOpen(false);};
  const handleOpenModal = (label) => {
    const summary = summaries[label] || 'No summary available'; // Fetch the summary using the label
    setModalContent(summary);
    setOpen(true);
  };
  // const nodeTypes = useMemo(() => ({ toolbar_node: NodeWithToolbar }), []);

    // Modify node colors based on active sequence
    const modifiedNodes = nodes.map((node) => {
      if (activeSequence) {
        const sequenceEdges = graph_sequences.find((seq) => seq.sequence === activeSequence).edges;
        const isActive = sequenceEdges.some(edge => edge.source === node.id || edge.target === node.id);
        return {
          ...node,
          className: isActive ? 'highlighted-node' : '',
        };
      }
      return node;
    });
  
    // Modify edges based on active sequence
    const modifiedEdges = edges.map((edge) => {
      if (activeSequence) {
        const sequenceEdges = graph_sequences.find((seq) => seq.sequence === activeSequence).edges;
        const isActive = sequenceEdges.some(seqEdge => seqEdge.source === edge.source && seqEdge.target === edge.target);
  
        return {
          ...edge,
          style: { ...edge.style, stroke: isActive ? '#ff7f50' : '#ccc', strokeWidth: isActive ? 4 : 3 },
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
      {/* Left side: sequence buttons */}
      <div className='sequence-buttons-container' >
        {sequenceButtons}
      </div>

      {/* Right side: new, differently styled button */}
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
            handleOpenModal={handleOpenModal} // Passing the function here as a prop
          />
        ),
      }}
    >
      <Modal isOpen={open} handleCloseModal={handleCloseModal} children={modalContent}>
        {/* <p>{modalContent}</p> */}
      </Modal>
      <Controls />
    </ReactFlow>
    </div>
  );
};

export default GraphApp;
