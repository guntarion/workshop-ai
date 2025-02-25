import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Prompt } from '../types';

interface PromptHistoryProps {
  prompts: Prompt[];
  isLoadingFeedback: boolean;
  streamingFeedback: string;
}

export function PromptHistory({
  prompts,
  isLoadingFeedback,
  streamingFeedback
}: PromptHistoryProps) {
  return (
    <>
      {prompts.map((prompt, index) => (
        <Card key={index} className='p-6'>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Prompt Versi {prompt.version}</h3>
              <span className='text-sm text-gray-500'>
                {prompt.timestamp.toLocaleString()}
              </span>
            </div>

            <div className='bg-gray-50 p-4 rounded-md'>
              <pre className='whitespace-pre-wrap font-mono text-sm'>
                {prompt.content}
              </pre>
            </div>

            {(prompt.feedback || (index === prompts.length - 1 && isLoadingFeedback)) && (
              <Alert>
                <AlertDescription>
                  <div className='whitespace-pre-wrap'>
                    {index === prompts.length - 1 && isLoadingFeedback 
                      ? streamingFeedback || 'Loading...' 
                      : prompt.feedback}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      ))}
    </>
  );
}