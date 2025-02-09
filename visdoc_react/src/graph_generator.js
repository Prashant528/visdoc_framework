import { MarkerType } from '@xyflow/react';
import dagre from 'dagre';

/** Use these constants as you wish */
const edge_color = '#007FFF';
const nodeWidth = 150;
const nodeHeight = 30;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

/**
 * Takes a list of nodes & edges, runs Dagre layout, and returns new positions.
 */
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
 * Build the complete graph (nodes + edges) from graph_sequences data.
 * Also build an adjacency list. But do NOT keep everything visible by default.
 * Instead, only show "root nodes" (no incoming edges) and their children.
 */
export function initialGraphData(repo_name, graph_sequences) {
  let nodes = [];
  let edges = [];

  // For adjacency list
  const incomingEdges = {};  // track which nodes have inbound connections

  for (let i = 0; i < graph_sequences.length; i++) {
    for (let j = 0; j < graph_sequences[i]['edges'].length; j++) {
      let edge = graph_sequences[i]['edges'][j];
      let edge_label = edge['edge_label'] ?? '';
      edge_label = edge_label.substring(edge_label.lastIndexOf('/') + 1);

      // Track inbound edges
      if (!incomingEdges[edge.target]) {
        incomingEdges[edge.target] = [];
      }
      incomingEdges[edge.target].push(edge.source);

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

  // Build adjacencyList from edges
  const adjacencyList = {};
  edges.forEach(edge => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = [];
    }
    adjacencyList[edge.source].push(edge.target);
  });

  // Identify root nodes (those who have no incoming edges)
  // => so their IDs are not in incomingEdges or have an empty array
  const rootNodeIds = nodes
    .map(n => n.id)
    .filter(id => !incomingEdges[id]); // no incoming edges => root

  // Mark root nodes as visible, and also their immediate children
  const newNodes = nodes.map(node => {
    if (rootNodeIds.includes(node.id)) {
      return {
        ...node,
        data: {
          ...node.data,
          isVisible: true
        }
      };
    } 
    // If this node is a child of any root node, also set visible
    for (let rootId of rootNodeIds) {
      if (adjacencyList[rootId]?.includes(node.id)) {
        return {
          ...node,
          data: {
            ...node.data,
            isVisible: true
          }
        };
      }
    }
    // Otherwise, set isVisible = false
    return {
      ...node,
      data: {
        ...node.data,
        isVisible: false
      }
    };
  });

  // We can run a one-time full layout so that we at least have positions for all nodes
  // (even those that are hidden). This helps avoid weird overlaps later.
  const [positionedNodes, positionedEdges] = getLayoutedElements(newNodes, edges);

  return {
    initialNodes: positionedNodes,
    initialEdges: positionedEdges,
    adjacencyList,
  };
}

/**
 * This helper re-runs Dagre layout on ONLY the visible nodes + edges,
 * then merges the newly computed positions back into your full `nodes` array.
 */
export function reLayoutVisibleElements(nodes, edges) {
  // 1) Filter to visible nodes
  const visibleNodes = nodes.filter(n => n.data.isVisible);

  // 2) Filter edges for which both source & target are visible
  const visibleEdges = edges.filter(e => {
    const sourceVisible = nodes.find(n => n.id === e.source)?.data.isVisible;
    const targetVisible = nodes.find(n => n.id === e.target)?.data.isVisible;
    return sourceVisible && targetVisible;
  });

  // 3) Run Dagre layout on just these visible nodes/edges
  const [layoutedVisibleNodes] = getLayoutedElements(visibleNodes, visibleEdges, 'LR');

  // 4) Merge the newly updated positions back into the original nodes array
  const updatedNodes = nodes.map(originalNode => {
    if (!originalNode.data.isVisible) {
      // If it's not visible, keep it as-is
      return originalNode;
    }
    // Otherwise, find its new position from layoutedVisibleNodes
    const updated = layoutedVisibleNodes.find(n => n.id === originalNode.id);
    if (updated) {
      return {
        ...originalNode,
        position: updated.position,
      };
    }
    return originalNode;
  });

  // Return the updated nodes (with new positions), and edges unchanged
  return [updatedNodes, edges];
}

// Helper to create a node
function create_node(node_name) {
  return {
    id: node_name,
    data: {
      label: node_name,
      // We'll override isVisible logic separately
      isVisible: false,
    },
    position: { x: 0, y: 0 },
    sourcePosition: 'right',
    targetPosition: 'left',
    type: 'node-with-toolbar',
  };
}

// Helper to create an edge
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
