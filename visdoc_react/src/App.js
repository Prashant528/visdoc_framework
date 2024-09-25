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

import render_graph from './graph_generator'
import graph_sequences from "./dummy_data";
// import MyModal from './text_modal';
import Modal from './Modal';

const repo_name= 'Flutter'

function NodeWithToolbar({ data,handleOpenModal }) {

  return (
    <div style={{ padding: 10, border: '1px solid black', borderRadius: 5 }}>
      <NodeToolbar
        isVisible={data.forceToolbarVisible}
        position={data.toolbarPosition}
      >
        <button onClick={handleOpenModal}>Text</button>
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


const App = () => {
  let graph = render_graph(repo_name, graph_sequences)
  // console.log(graph[0])
  // console.log(graph[1])
  let initialNodes = graph[0]
  let initialEdges = graph[1]
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );

  const [modalContent, setModalContent] = useState('Modal content');
  const [open, setOpen] = useState(false);
  const handleCloseModal = () => {setOpen(false);};
	const handleOpenModal = () => {setModalContent(modalContent);setOpen(true);};
  // const nodeTypes = useMemo(() => ({ toolbar_node: NodeWithToolbar }), []);

  console.log(nodes)
  console.log(edges)

  
  return (
    <div style={{ height: 800 }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
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

export default App;
