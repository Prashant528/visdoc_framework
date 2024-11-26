import React from 'react';
import { useLocation } from 'react-router-dom';
import GraphApp from './GraphApp';

const ResponsePage = () => {
  const location = useLocation();
  const { apiData } = location.state;  // Get the API response from the state

  let graph_sequences = apiData['flow']
  let summaries = apiData['content']
  return (
    <div>
      <h3>Contribution Workflow</h3>
      {/* <pre>{JSON.stringify(apiData, null, 2)}</pre> */}
      <GraphApp graph_sequences={graph_sequences} summaries={summaries}/>
    </div>
  );
};

export default ResponsePage;
