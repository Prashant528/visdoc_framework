import React from 'react';
import { useLocation } from 'react-router-dom';
import AddImages from './AddImages'

const VidCreatorPage = () => {
  const location = useLocation();
  const {flow,  summaries } = location.state;  // Get the API response from the state
  // console.log(summaries)
  // console.log(flow)
  
  return (
    <div>
      <h3> Edit the contents:</h3>
      <AddImages flow ={flow} summaries={summaries}/>
      </div>
  );
};

export default VidCreatorPage;
