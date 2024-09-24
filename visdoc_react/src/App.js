import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import render_graph from './graph_generator'
import graph_sequences from "./dummy_data";

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
  },
  {
    id: 'Node 4',
    data: { label: 'Node 4' },
    position: { x: 500, y: -100 },
    sourcePosition: 'right',
    targetPosition: 'left',
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

const App = () => {
  let graph = render_graph(graph_sequences)
  // console.log(graph[0])
  // console.log(graph[1])
  let initialNodes = graph[0]
  let initialEdges = graph[1]
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );


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
    ></ReactFlow>
    </div>
  );
};

export default App;
