import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MyForm from './MyForm';
import ResponsePage from './ResponsePage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MyForm />} />
      <Route path="/response-page" element={<ResponsePage />} />
    </Routes>
  );
};

export default App;
