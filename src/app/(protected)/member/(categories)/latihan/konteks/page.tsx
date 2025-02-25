'use client';

import { useState } from 'react';
import styles from './konteks.module.scss';
import { useSession } from 'next-auth/react';
import { RoleInput } from './components/RoleInput';
import { PromptInput } from './components/PromptInput';
import { PromptHistory } from './components/PromptHistory';
import { EmailButton } from './components/EmailButton';
import { usePrompts } from './hooks/usePrompts';
import { useAIFeedback } from './hooks/useAIFeedback';
import { useEmailSender } from './hooks/useEmailSender';

const KonteksPage = () => {
  const [role, setRole] = useState('');
  const { data: session } = useSession();
  const { 
    prompts, 
    currentPrompt, 
    setCurrentPrompt, 
    addPromptVersion, 
    updatePromptFeedback,
    latestPrompt 
  } = usePrompts();
  const { 
    isLoadingFeedback, 
    streamingFeedback, 
    getFeedback 
  } = useAIFeedback();
  const { 
    emailStatus, 
    sendEmail 
  } = useEmailSender();

  const handleFeedbackRequest = async () => {
    if (!latestPrompt) return;
    
    try {
      const feedback = await getFeedback(role, latestPrompt.version, latestPrompt.content);
      if (feedback) {
        updatePromptFeedback(latestPrompt.version, feedback);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
    }
  };

  const handleEmailSend = () => {
    if (!session?.user?.email) return;
    sendEmail(role, prompts, session.user.email);
  };

  const handleSavePrompt = () => {
    if (currentPrompt.trim()) {
      addPromptVersion(currentPrompt);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Latihan Kejelasan Instruksi</h1>
        <EmailButton
          show={prompts.length > 0}
          status={emailStatus}
          userEmail={session?.user?.email}
          onSend={handleEmailSend}
        />
      </div>

      <div className={styles.roleSection}>
        <RoleInput 
          role={role}
          onChange={setRole}
        />
      </div>

      <div className={styles.promptSection}>
        <PromptInput
          version={prompts.length + 1}
          currentPrompt={currentPrompt}
          isRoleSet={role.trim().length > 0}
          isLoadingFeedback={isLoadingFeedback}
          onPromptChange={setCurrentPrompt}
          onSave={handleSavePrompt}
          onFeedbackRequest={handleFeedbackRequest}
        />
      </div>

      <div className={styles.promptsContainer}>
        <PromptHistory
          prompts={prompts}
          isLoadingFeedback={isLoadingFeedback}
          streamingFeedback={streamingFeedback}
        />
      </div>
    </div>
  );
};

export default KonteksPage;
