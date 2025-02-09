import React from 'react';
import { useLocation } from 'react-router-dom';
import GraphApp from './GraphApp';
import { ReactFlowProvider } from '@xyflow/react';

const ResponsePage = () => {
  const location = useLocation();
  const { apiData } = location.state || {}; // Safeguard against missing state
  const graph_sequences = apiData?.flow || [];
  const summaries = apiData?.content || {};

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100vh' }}>
      {/* <h3>Contribution Workflow</h3> */}
      <GraphApp graph_sequences={graph_sequences} summaries={summaries} />
    </div>
    </ReactFlowProvider>
  );
};

export default ResponsePage;
