import React from 'react';
import { useLocation } from 'react-router-dom';
import GraphApp from './GraphApp';

const ResponsePage = () => {
  const location = useLocation();
  const { apiData } = location.state || {}; // Safeguard against missing state
  const graph_sequences = apiData?.flow || [];
  const summaries = apiData?.content || {};

  return (
    <div>
      <h3>Contribution Workflow</h3>
      <GraphApp graph_sequences={graph_sequences} summaries={summaries} />
    </div>
  );
};

export default ResponsePage;
