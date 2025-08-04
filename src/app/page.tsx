
'use client';

import { useState, useEffect, useRef } from 'react';

import { ChatMessageItem } from '@/components/chat-message-item';
import { ChatInputForm } from '@/components/chat-input-form';
import { UserProfileModal } from '@/components/user-profile-modal';
import { SOSButton } from '@/components/sos-button';
import { VitalSignsTracker } from '@/components/vital-signs-tracker';
import { PrescriptionAnalyzer } from '@/components/prescription-analyzer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  personalizedHealthQuestionAnswering,
  type PersonalizedHealthQuestionAnsweringInput,
  type PersonalizedHealthQuestionAnsweringOutput
} from '@/ai/flows/personalized-health-question-answering';
import type { ChatMessage, UserProfile, AISuggestedKey, VitalSigns, Medication, SOSAlert } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Info, Activity, Heart, Pill, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialWelcomeMessage: ChatMessage = {
  id: 'welcome-message',
  text: "Hello! I'm Med Genie, your AI health assistant. I can help you with health questions, track your vital signs, analyze prescriptions, and provide emergency support. How can I help you today?",
  sender: 'ai',
  timestamp: Date.now(),
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentAiFollowUpKey, setCurrentAiFollowUpKey] = useState<AISuggestedKey | undefined>(undefined);
  const [lastUserQuestionForFollowUp, setLastUserQuestionForFollowUp] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (viewportRef.current) {
      const timerId = setTimeout(() => {
        viewportRef.current!.scrollTo({ top: viewportRef.current!.scrollHeight, behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timerId);
    }
  }, [messages]);

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  const handleSubmitQuestion = async (question: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: question,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    const aiLoadingMessage: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      text: 'Thinking...',
      sender: 'ai',
      timestamp: Date.now(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, aiLoadingMessage]);

    try {
      // Get latest vital signs
      const latestVitals = vitalSigns.length > 0 ? vitalSigns[0] : undefined;

      const input: PersonalizedHealthQuestionAnsweringInput = {
        question,
        // Basic requirements
        age: userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        gender: userProfile.gender,
        
        // Medical information
        medicalHistory: userProfile.medicalHistory,
        currentMedications: userProfile.currentMedications,
        allergies: userProfile.allergies,
        lifestyle: userProfile.lifestyle,
        symptoms: userProfile.symptoms,
        
        // Vital signs
        vitalSigns: latestVitals,
      };

      const result: PersonalizedHealthQuestionAnsweringOutput = await personalizedHealthQuestionAnswering(input);
      
      setMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessage.id)); 

      if (result.followUpQuestion) {
        const aiInfoMessageText = result.answer && result.answer !== result.followUpQuestion ? result.answer : "To provide a more accurate response, I need a little more information.";
        const aiInfoMessage: ChatMessage = {
            id: `ai-info-${Date.now()}`,
            text: aiInfoMessageText,
            sender: 'ai',
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiInfoMessage]);
        
        const aiFollowUpMessage: ChatMessage = {
          id: `ai-followup-prompt-${Date.now()}`,
          text: result.followUpQuestion, 
          sender: 'ai',
          timestamp: Date.now(),
          isFollowUpPrompt: true, 
        };
        setMessages((prev) => [...prev, aiFollowUpMessage]);
        setCurrentAiFollowUpKey(result.suggestedKey);
        setLastUserQuestionForFollowUp(question); 
        setIsProfileModalOpen(true); 

      } else {
        let responseText = result.answer;
        
        // Add health insights if available
        if (result.healthInsights && result.healthInsights.length > 0) {
          responseText += '\n\n**Health Insights:**\n' + result.healthInsights.map(insight => `• ${insight}`).join('\n');
        }
        
        // Add recommendations if available
        if (result.recommendations && result.recommendations.length > 0) {
          responseText += '\n\n**Recommendations:**\n' + result.recommendations.map(rec => `• ${rec}`).join('\n');
        }

        const aiResponseMessage: ChatMessage = {
          id: `ai-response-${Date.now()}`,
          text: responseText,
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiResponseMessage]);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessage.id));
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        text: '😔 Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get response from AI.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (newProfileData: UserProfile) => {
    const oldProfile = {...userProfile}; // Capture old profile state
    setUserProfile(newProfileData);
    setIsProfileModalOpen(false);
  
    if (lastUserQuestionForFollowUp) {
      const latestVitals = vitalSigns.length > 0 ? vitalSigns[0] : undefined;

      const updatedInput: PersonalizedHealthQuestionAnsweringInput = {
        question: lastUserQuestionForFollowUp,
        // Basic requirements
        age: newProfileData.age,
        weight: newProfileData.weight,
        height: newProfileData.height,
        gender: newProfileData.gender,
        
        // Medical information
        medicalHistory: newProfileData.medicalHistory,
        currentMedications: newProfileData.currentMedications,
        allergies: newProfileData.allergies,
        lifestyle: newProfileData.lifestyle,
        symptoms: newProfileData.symptoms,
        
        // Vital signs
        vitalSigns: latestVitals,
      };
  
      const profileUpdateMessage: ChatMessage = {
        id: `system-profile-updated-${Date.now()}`,
        text: "✅ Your information has been updated. I'll use this to refine my answer.",
        sender: 'ai',
        timestamp: Date.now(),
        isFollowUpPrompt: true,
      };
      setMessages(prev => [...prev, profileUpdateMessage]);
  
      setIsLoading(true);
      const aiLoadingMessageId = `ai-loading-refine-${Date.now()}`;
      const aiLoadingMessage: ChatMessage = {
        id: aiLoadingMessageId,
        text: 'Refining answer...',
        sender: 'ai',
        timestamp: Date.now(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, aiLoadingMessage]);
  
      try {
        const result: PersonalizedHealthQuestionAnsweringOutput = await personalizedHealthQuestionAnswering(updatedInput);
        setMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessageId));
  
        let responseText = result.answer || "Thank you for the information. How else can I help you?";
        
        // Add health insights if available
        if (result.healthInsights && result.healthInsights.length > 0) {
          responseText += '\n\n**Health Insights:**\n' + result.healthInsights.map(insight => `• ${insight}`).join('\n');
        }
        
        // Add recommendations if available
        if (result.recommendations && result.recommendations.length > 0) {
          responseText += '\n\n**Recommendations:**\n' + result.recommendations.map(rec => `• ${rec}`).join('\n');
        }

        const aiResponseMessage: ChatMessage = {
          id: `ai-refined-response-${Date.now()}`,
          text: responseText,
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiResponseMessage]);
  
        if (result.followUpQuestion) {
          const aiFollowUpMessage: ChatMessage = {
            id: `ai-refined-followup-${Date.now()}`,
            text: result.followUpQuestion,
            sender: 'ai',
            timestamp: Date.now(),
            isFollowUpPrompt: true,
          };
          setMessages((prev) => [...prev, aiFollowUpMessage]);
          console.warn("AI requested further follow-up after profile update:", result.followUpQuestion);
          toast({
            title: "Further Information Requested",
            description: "The AI has another follow-up question. Please see the chat.",
          });
        }
      } catch (error) {
        console.error('Error re-fetching AI response after profile update:', error);
        setMessages(prev => prev.filter(msg => msg.id !== aiLoadingMessageId));
        const errorMessage: ChatMessage = {
          id: `ai-error-refine-${Date.now()}`,
          text: '😔 Sorry, I encountered an error while refining the answer. Please try again.',
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        toast({
          variant: 'destructive',
          title: 'Refinement Error',
          description: 'Failed to get refined response from AI.',
        });
      } finally {
        setIsLoading(false);
        setLastUserQuestionForFollowUp(undefined);
        setCurrentAiFollowUpKey(undefined);
      }
    } else {
        // If there was no pending question, just acknowledge the update.
        const acknowledgementMessage: ChatMessage = {
            id: `system-profile-ack-${Date.now()}`,
            text: "Your health information has been updated. How can I assist you now?",
            sender: 'ai',
            timestamp: Date.now(),
        };
        // Only add if profile actually changed to avoid duplicate messages on simple close
        if (JSON.stringify(oldProfile) !== JSON.stringify(newProfileData)) {
            setMessages(prev => [...prev, acknowledgementMessage]);
        }
    }
  };
  
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    if (lastUserQuestionForFollowUp && currentAiFollowUpKey) {
      // Check against the latest userProfile state
      const relevantProfileData = userProfile[currentAiFollowUpKey];
      const relevantProfileFieldFilled = relevantProfileData && relevantProfileData.toString().trim() !== '';
      if (!relevantProfileFieldFilled) {
        const cancelFollowUpMessage: ChatMessage = {
          id: `ai-cancel-followup-${Date.now()}`,
          text: "Okay, I understand. If you change your mind, you can update your info anytime. How else can I help you today?",
          sender: 'ai',
          timestamp: Date.now(),
          isFollowUpPrompt: true,
        };
        setMessages(prev => [...prev, cancelFollowUpMessage]);
      }
    }
    setLastUserQuestionForFollowUp(undefined);
    setCurrentAiFollowUpKey(undefined);
  };

  const handleVitalSignsUpdate = (newVitals: VitalSigns) => {
    setVitalSigns(prev => [newVitals, ...prev]);
  };

  const handleMedicationsUpdate = (newMedications: Medication[]) => {
    setMedications(newMedications);
  };

  const handleSOSAlert = (alert: SOSAlert) => {
    setSosAlerts(prev => [alert, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex flex-col flex-1 overflow-hidden" role="main">
          {/* Tab Navigation and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="vitals" className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Vitals</span>
                </TabsTrigger>
                <TabsTrigger value="medications" className="flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span className="hidden sm:inline">Medications</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0">
              <div className="flex flex-col h-full p-4">
                <header className="flex justify-end mb-4 shrink-0">
                  <Button variant="outline" onClick={() => setIsProfileModalOpen(true)} aria-label="Update your health information for personalized responses">
                    <Info className="mr-2 h-4 w-4" />
                    Update Health Info
                  </Button>
                </header>

                <ScrollArea className="flex-grow min-h-0 mb-4" viewportRef={viewportRef} role="log" aria-label="Chat messages">
                  <div className="space-y-4 max-w-3xl mx-auto pr-4" role="list" aria-label="Chat conversation">
                    {messages.map((msg) => (
                      <ChatMessageItem key={msg.id} message={msg} onFeedback={handleFeedback} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="shrink-0">
                  <ChatInputForm onSubmit={handleSubmitQuestion} isLoading={isLoading} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="h-full m-0">
              <div className="h-full overflow-y-auto p-4">
                <VitalSignsTracker 
                  onVitalSignsUpdate={handleVitalSignsUpdate}
                  currentVitals={vitalSigns}
                />
              </div>
            </TabsContent>

            <TabsContent value="medications" className="h-full m-0">
              <div className="h-full overflow-y-auto p-4">
                <PrescriptionAnalyzer 
                  onMedicationsUpdate={handleMedicationsUpdate}
                  currentMedications={medications}
                />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="h-full m-0">
              <div className="h-full overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Health Profile</h2>
                    <p className="text-muted-foreground">
                      Manage your health information for personalized AI assistance
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Summary</CardTitle>
                      <CardDescription>Your current health information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Basic Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>Age: {userProfile.age || 'Not specified'}</p>
                            <p>Weight: {userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}</p>
                            <p>Height: {userProfile.height ? `${userProfile.height} cm` : 'Not specified'}</p>
                            <p>Gender: {userProfile.gender || 'Not specified'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Medical Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>Medical History: {userProfile.medicalHistory ? 'Provided' : 'Not specified'}</p>
                            <p>Current Medications: {userProfile.currentMedications ? 'Provided' : 'Not specified'}</p>
                            <p>Allergies: {userProfile.allergies ? 'Provided' : 'Not specified'}</p>
                            <p>Lifestyle: {userProfile.lifestyle ? 'Provided' : 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {userProfile.emergencyContact && (
                        <div>
                          <h4 className="font-medium mb-2">Emergency Contact</h4>
                          <div className="text-sm">
                            <p>{userProfile.emergencyContact.name} ({userProfile.emergencyContact.relationship})</p>
                            <p>{userProfile.emergencyContact.phone}</p>
                          </div>
                        </div>
                      )}

                      <Button onClick={() => setIsProfileModalOpen(true)}>
                        Update Profile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
            </Tabs>
        </main>

        {/* Right Sidebar */}
        <aside className="md:w-1/3 lg:w-80 xl:w-96 p-4 border-l border-border/40 bg-card overflow-y-auto hidden md:flex md:flex-col" role="complementary" aria-label="Important medical notice">
          <div className="sticky top-4 space-y-4">
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle asChild>
                <h2>Important Notice</h2>
              </AlertTitle>
              <AlertDescription>
                Med Genie provides information for general knowledge only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </AlertDescription>
            </Alert>

            {sosAlerts.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Emergency Alerts</AlertTitle>
                <AlertDescription>
                  You have {sosAlerts.filter(alert => alert.status === 'active').length} active emergency alert(s).
                </AlertDescription>
              </Alert>
            )}

            {vitalSigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Latest Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vitalSigns[0].heartRate && (
                    <div className="flex justify-between text-sm">
                      <span>Heart Rate:</span>
                      <span className="font-medium">{vitalSigns[0].heartRate} bpm</span>
                    </div>
                  )}
                  {vitalSigns[0].bloodPressure && (
                    <div className="flex justify-between text-sm">
                      <span>Blood Pressure:</span>
                      <span className="font-medium">{vitalSigns[0].bloodPressure.systolic}/{vitalSigns[0].bloodPressure.diastolic}</span>
                    </div>
                  )}
                  {vitalSigns[0].steps && (
                    <div className="flex justify-between text-sm">
                      <span>Steps Today:</span>
                      <span className="font-medium">{vitalSigns[0].steps.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>

      {/* SOS Button */}
      <SOSButton userProfile={userProfile} onSOSAlert={handleSOSAlert} />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onSave={handleSaveProfile}
        currentProfile={userProfile}
        aiSuggestedKey={currentAiFollowUpKey}
      />
    </div>
  );
}

    