import React from 'react';
import { useLocation } from 'react-router-dom';
import AddImages from './AddImages'

const VidCreatorPage = () => {
  const location = useLocation();
  const { summaries } = location.state;  // Get the API response from the state

  return (
    <div>
      <h3>Video Creator Page</h3>
      <AddImages summaries={summaries}/>
      </div>
  );
};

export default VidCreatorPage;
