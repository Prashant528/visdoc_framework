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