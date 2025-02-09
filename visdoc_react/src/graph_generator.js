import { MarkerType } from '@xyflow/react';
import dagre from 'dagre';

const edge_color = '#007FFF';
const nodeWidth = 150;
const nodeHeight = 30;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function getLayoutedElements(nodes, edges, direction = 'LR') {
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 400,
    nodesep: 200,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const positionedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: dagreNode.x, y: dagreNode.y },
      positionAbsolute: true,
      sourcePosition: 'right',
      targetPosition: 'left',
    };
  });

  return [positionedNodes, edges];
}

/**
 * Build the graph (nodes + edges) from graph_sequences data, then layout with dagre.
 */
export default function render_graph(repo_name, graph_sequences) {
  let nodes = [];
  let edges = [];

  for (let i = 0; i < graph_sequences.length; i++) {
    for (let j = 0; j < graph_sequences[i]['edges'].length; j++) {
      let edge = graph_sequences[i]['edges'][j];
      let edge_label = edge['edge_label'] ?? '';
      edge_label = edge_label.substring(edge_label.lastIndexOf('/') + 1);

      // Add source node if not already in list
      if (!nodes.find((n) => n.id === edge.source)) {
        nodes.push(create_node(edge.source));
      }
      // Add target node if not already in list
      if (!nodes.find((n) => n.id === edge.target)) {
        nodes.push(create_node(edge.target));
      }

      // Add the edge
      edges.push(create_edge(edge.source, edge.target, edge_label));
    }
  }

  // Return dagre-layouted nodes/edges
  return getLayoutedElements(nodes, edges);
}

function create_node(node_name) {
  return {
    id: node_name,
    data: { 
      label: node_name,
      // Default each node to be visible at first
      isVisible: true,
    },
    position: { x: 0, y: 0 }, // will be updated by dagre
    sourcePosition: 'right',
    targetPosition: 'left',
    type: 'node-with-toolbar',
  };
}

function create_edge(source, target, edge_label = '') {
  return {
    id: `${source}_${target}`,
    source,
    target,
    label: edge_label,
    labelStyle: { fontSize: 16, fill: '#fff', fontWeight: 'bold' },
    labelBgStyle: { fill: '#007bff', fillOpacity: 0.7, rx: 5, ry: 5 },
    labelBgPadding: [5, 3],
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 25,
      color: edge_color,
    },
    style: { strokeWidth: 3, stroke: edge_color },
  };
}
