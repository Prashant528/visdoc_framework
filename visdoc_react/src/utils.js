export function extractRepoName(url) {
    try {
        const pathParts = new URL(url).pathname.split('/');
        return pathParts[2] || null;
    } catch (error) {
        console.error("Invalid URL", error);
        return null;
    }
}


export function calculateNodeDepth(adjacencyList) {
    const depthMap = {};
    const queue = [];
  
    // Identify root nodes (nodes with no incoming edges)
    Object.keys(adjacencyList).forEach(node => {
      if (!Object.values(adjacencyList).some(children => children.includes(node))) {
        depthMap[node] = 1; // Root nodes start at depth 1
        queue.push(node);
      }
    });
  
    // BFS traversal to assign depths
    while (queue.length) {
      const currentNode = queue.shift();
      const currentDepth = depthMap[currentNode];
  
      (adjacencyList[currentNode] || []).forEach(child => {
        if (!(child in depthMap)) {
          depthMap[child] = currentDepth + 1;
          queue.push(child);
        }
      });
    }
  
    return depthMap;
  }
  
export function countHiddenDescendants(nodeId, allNodes, adjacencyList) {
    const visited = new Set();
    const stack = [...(adjacencyList[nodeId] || [])];
    let count = 0;
  
    while (stack.length > 0) {
      const currentId = stack.pop();
      if (visited.has(currentId)) continue;
      visited.add(currentId);
  
      const currentNode = allNodes.find(n => n.id === currentId);
      if (!currentNode) continue; // Defensive check
  
      if (!currentNode.data?.isVisible) {
        count += 1;
      }
  
      const children = adjacencyList[currentId];
      if (children && Array.isArray(children)) {
        for (let child of children) {
          if (!visited.has(child)) {
            stack.push(child);
          }
        }
      }
    }
  
    return count;
  }
  