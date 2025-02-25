import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  version: number;
  currentPrompt: string;
  isRoleSet: boolean;
  isLoadingFeedback: boolean;
  onPromptChange: (value: string) => void;
  onSave: () => void;
  onFeedbackRequest: () => void;
}

export function PromptInput({
  version,
  currentPrompt,
  isRoleSet,
  isLoadingFeedback,
  onPromptChange,
  onSave,
  onFeedbackRequest
}: PromptInputProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold mb-4'>
        {version === 1 ? 'Buat Prompt Versi 1' : `Buat Prompt Versi ${version}`}
      </h2>
      <div className='space-y-4'>
        <Textarea
          placeholder='Tuliskan instruksi Anda di sini...'
          value={currentPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className='min-h-[200px]'
        />
        <div className='flex gap-2'>
          <Button 
            onClick={onSave} 
            disabled={!currentPrompt.trim() || !isRoleSet}
          >
            Simpan Prompt
          </Button>
          {version > 1 && (
            <Button 
              onClick={onFeedbackRequest} 
              variant='outline' 
              disabled={isLoadingFeedback}
            >
              {isLoadingFeedback ? 'Memuat Masukan...' : 'Minta Masukan'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}