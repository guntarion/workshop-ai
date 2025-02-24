// src/app/(protected)/admin/(categories)/(aiPages)/qwenAi/page.tsx
'use client';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import CommonCardHeader from '@/CommonComponents/CommonCardHeader';
import { Card, CardBody, Col, Container, Row, Input, Button, Spinner } from 'reactstrap';
import { useState, useRef, useEffect } from 'react';

const QwenAiPage = () => {
  // State management for user input, response, and loading state
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  // Function to construct the full prompt
  const constructPrompt = (input: string) => {
    return `Tell me 10 things related with ${input}`;
  };

  // Handle form submission and API call
  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const fullPrompt = constructPrompt(userInput.trim());
      console.log('Sending prompt:', fullPrompt); // Add logging

      const response = await fetch('/api/aiApi/qwenAIApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: fullPrompt,
          model: 'qwen-turbo', // qwen-turbo, qwen-plus, qwen-max
          temperature: 0.7,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        } else {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          throw new Error('Received invalid response from server');
        }
      }

      // Handle streaming response
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          lines.forEach((line) => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  setResponse((prev) => prev + `\nError: ${data.error}`);
                } else if (data.content) {
                  setResponse((prev) => prev + (data.content || ''));
                }
              } catch (e) {
                console.error('Error parsing JSON from stream:', e, 'Line:', line);
              }
            }
          });
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setResponse(data.content || JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom of response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <>
      <CommonBreadcrumb pageTitle='QWEN AI Support Page' parent='AI Support' />
      <Container fluid>
        <Row>
          <Col sm='12'>
            <Card>
              <CommonCardHeader
                heading='QWEN AI Support'
                subHeading={[{ text: 'Powered by Alibaba Cloud QWEN model' }, { text: 'Enter a topic to get 10 related things' }]}
              />
              <CardBody>
                <div className='mb-3'>
                  <Input
                    type='textarea'
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder='Enter a topic (e.g., "artificial intelligence", "space exploration")'
                    rows={2}
                  />
                  <small className='text-muted mt-1 d-block'>The AI will generate 10 things related to your topic</small>
                </div>
                <div className='mb-3'>
                  <Button color='primary' onClick={handleSubmit} disabled={isLoading || !userInput.trim()}>
                    {isLoading ? (
                      <>
                        <Spinner size='sm' className='me-2' />
                        Processing...
                      </>
                    ) : (
                      'Get Related Things'
                    )}
                  </Button>
                </div>
                {response && (
                  <div
                    ref={responseRef}
                    className='p-3 border rounded'
                    style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {response}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default QwenAiPage;
