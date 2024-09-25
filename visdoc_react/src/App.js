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
import MyModal from './text_modal';

const repo_name= 'Flutter'

const initialNodes = [
  {
    id: 'Node 1',
    data: { label: 'Node 1' },
    position: { x: 0, y: 0 },
    sourcePosition: 'right',
    targetPosition: 'left',
  },
  {
    id: 'Node 2',
    data: { label: 'Node 2' },
    position: { x: 250, y: 0 },
    sourcePosition: 'right',
    targetPosition: 'left',
  },
  {
    id: 'Node 3',
    data: { label: 'Node 3' },
    position: { x: 500, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    type:'node-with-toolbar'
  },
  {
    id: 'Node 4',
    data: { label: 'Node 4' },
    position: { x: 500, y: -100 },
    sourcePosition: 'right',
    targetPosition: 'left',
    type:'node-with-toolbar',
  }
];

const initialEdges = [
  {
    id: 'Edge 1',
    source: 'Node 1',
    type: 'smoothstep',
    target: 'Node 2',
  },
  {
    id: 'Edge 2',
    source: 'Node 2',
    type: 'smoothstep',
    target: 'Node 3',
  },
  {
    id: 'Edge 3',
    source: 'Node 2',
    type: 'smoothstep',
    target: 'Node 4',
    
  }
];

function NodeWithToolbar({ data }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [text, setText] = useState('');

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);
  const handleTextChange = (e) => setText(e.target.value);

  return (
    <div style={{ padding: 10, border: '1px solid black', borderRadius: 5 }}>
      <NodeToolbar
        isVisible={data.forceToolbarVisible}
        position={data.toolbarPosition}
      >
        <button onClick={togglePopup}>Text</button>
        <button>Images</button>
        <button>Videos</button>
      </NodeToolbar>
      <div className="new_node_label">{data.label}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {isPopupOpen && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            padding: 10,
            border: '1px solid gray',
            backgroundColor: 'white',
            zIndex: 100,
            borderRadius: 5,
          }}
        >
          <div style={{ marginBottom: 10 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

          <div>
            <button onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
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
  
  // const nodeTypes = useMemo(() => ({ toolbar_node: NodeWithToolbar }), []);

  console.log(nodes)
  console.log(edges)

  
  return (
    <div style={{ height: 800 }}>
    <MyModal text="Hello"/>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      attributionPosition="bottom-left"
      nodeTypes={nodeTypes}
    >
      <Controls />
    </ReactFlow>
    </div>
  );
};

export default App;
