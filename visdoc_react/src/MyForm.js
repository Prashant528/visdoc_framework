
import React , { useState }from 'react';
import { Form, Input, Button, Spin  } from 'antd';
import { useNavigate } from 'react-router-dom'; 
// import 'antd/dist/antd.css';

const MyForm = () => {
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate(); 

  const onFinish = async (values) => {
      console.log(values)
      setLoading(true);  // Set loading to true when the form is submitted
      try {
        const response = await fetch('http://127.0.0.1:8080/fetch_and_analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        setLoading(false);  // Set loading to false after getting the response
        navigate('/response-page', { state: { apiData: data } });  // Redirect with data
      } catch (error) {
        console.error('Error making API request:', error);
        setLoading(false);  // Set loading to false in case of error
      }
    };

  return (
    <div style={{ marginTop: '20px' }}>
      {loading ? (
        // Show loading spinner and text while the API call is in progress
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <p>Calling Github and OpenAI APIs...</p>
        </div>
      ) : (
        // Show form when not loading
        <Form name="basic" onFinish={onFinish}>
        <Form.Item
          label="Repository Link"
          name="repo_link"
          rules={[{ required: true, message: 'Please input the repo link!' }]}
          style={{ marginTop: '20px' }} 
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      )}
    </div>
  );
};

export default MyForm;

