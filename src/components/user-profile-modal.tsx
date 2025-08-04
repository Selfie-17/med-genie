'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import type { UserProfile, AISuggestedKey, PrescriptionImage, Medication } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert } from '@/components/ui/alert';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile;
  aiSuggestedKey?: AISuggestedKey;
}

const profileFieldLabels: Record<AISuggestedKey, string> = {
  age: "Age",
  weight: "Weight (kg)",
  height: "Height (cm)",
  gender: "Gender",
  medicalHistory: "Medical History",
  currentMedications: "Current Medications",
  allergies: "Allergies",
  lifestyle: "Lifestyle",
  symptoms: "Current Symptoms",
  emergencyContact: "Emergency Contact",
};

const profileFieldPlaceholders: Record<AISuggestedKey, string> = {
  age: "Enter your age",
  weight: "Enter weight in kg",
  height: "Enter height in cm",
  gender: "Select gender",
  medicalHistory: "e.g., Allergic to penicillin, Diagnosed with asthma in 2010",
  currentMedications: "e.g., Metformin 500mg twice daily, Aspirin 81mg daily",
  allergies: "e.g., Penicillin, Peanuts, Latex",
  lifestyle: "e.g., Vegetarian, exercise 3 times a week, non-smoker",
  symptoms: "e.g., Persistent cough for 2 weeks, occasional headaches",
  emergencyContact: "Emergency contact information",
};

export function UserProfileModal({ isOpen, onClose, onSave, currentProfile, aiSuggestedKey }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>(currentProfile);
  const [prescriptionImages, setPrescriptionImages] = useState<PrescriptionImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [focusedField, setFocusedField] = useState<AISuggestedKey | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'medical' | 'emergency' | 'prescriptions'>('basic');

  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile]);
  
  useEffect(() => {
    if (isOpen && aiSuggestedKey) {
      setFocusedField(aiSuggestedKey);
      // Determine which tab to show based on the suggested key
      if (['age', 'weight', 'height', 'gender'].includes(aiSuggestedKey)) {
        setActiveTab('basic');
      } else if (['medicalHistory', 'currentMedications', 'allergies', 'lifestyle', 'symptoms'].includes(aiSuggestedKey)) {
        setActiveTab('medical');
      } else if (aiSuggestedKey === 'emergencyContact') {
        setActiveTab('emergency');
      }
      
      // Focus the appropriate input
      setTimeout(() => {
        const inputElement = document.getElementById(`profile-${aiSuggestedKey}`);
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    } else {
      setFocusedField(null);
    }
  }, [isOpen, aiSuggestedKey]);

  const handleSave = () => {
    onSave(profile);
    toast({
      title: "Profile Updated",
      description: "Your health information has been saved for this session.",
    });
    onClose();
  };

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: keyof UserProfile['emergencyContact'], value: string) => {
    setProfile((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      } as UserProfile['emergencyContact'],
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Simulate image upload and analysis
      const imageUrl = URL.createObjectURL(file);
      const newImage: PrescriptionImage = {
        id: `img-${Date.now()}`,
        imageUrl,
        uploadedAt: Date.now(),
        analyzedMedications: [], // This would be populated by AI analysis
        notes: 'Analysis pending...',
      };

      setPrescriptionImages(prev => [...prev, newImage]);
      toast({
        title: 'Image uploaded',
        description: 'Prescription image uploaded successfully. Analysis will be available shortly.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (imageId: string) => {
    setPrescriptionImages(prev => prev.filter(img => img.id !== imageId));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'medical', label: 'Medical', icon: '🏥' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Personalize Your Health Profile</DialogTitle>
          <DialogDescription>
            Provide detailed information to help Med Genie give you more accurate and personalized health guidance.
            {aiSuggestedKey && (
              <span className="mt-2 block text-primary font-medium">
                The AI has requested more information about your {profileFieldLabels[aiSuggestedKey].toLowerCase()}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-4 scrollbar-hide">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-age">Age</Label>
                  <Input
                    id="profile-age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Enter your age"
                    className={focusedField === 'age' ? 'ring-2 ring-primary' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-gender">Gender</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger className={focusedField === 'gender' ? 'ring-2 ring-primary' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-weight">Weight (kg)</Label>
                  <Input
                    id="profile-weight"
                    type="number"
                    step="0.1"
                    value={profile.weight || ''}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                    placeholder="Enter weight in kg"
                    className={focusedField === 'weight' ? 'ring-2 ring-primary' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-height">Height (cm)</Label>
                  <Input
                    id="profile-height"
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                    placeholder="Enter height in cm"
                    className={focusedField === 'height' ? 'ring-2 ring-primary' : ''}
                  />
                </div>
              </div>
              {profile.weight && profile.height && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    BMI: {((profile.weight / Math.pow(profile.height / 100, 2)) || 0).toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-medicalHistory">Medical History</Label>
                <Textarea
                  id="profile-medicalHistory"
                  value={profile.medicalHistory || ''}
                  onChange={(e) => handleChange('medicalHistory', e.target.value)}
                  placeholder={profileFieldPlaceholders.medicalHistory}
                  className={focusedField === 'medicalHistory' ? 'ring-2 ring-primary' : ''}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="profile-currentMedications">Current Medications</Label>
                <Textarea
                  id="profile-currentMedications"
                  value={profile.currentMedications || ''}
                  onChange={(e) => handleChange('currentMedications', e.target.value)}
                  placeholder={profileFieldPlaceholders.currentMedications}
                  className={focusedField === 'currentMedications' ? 'ring-2 ring-primary' : ''}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="profile-allergies">Allergies</Label>
                <Textarea
                  id="profile-allergies"
                  value={profile.allergies || ''}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder={profileFieldPlaceholders.allergies}
                  className={focusedField === 'allergies' ? 'ring-2 ring-primary' : ''}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="profile-lifestyle">Lifestyle</Label>
                <Textarea
                  id="profile-lifestyle"
                  value={profile.lifestyle || ''}
                  onChange={(e) => handleChange('lifestyle', e.target.value)}
                  placeholder={profileFieldPlaceholders.lifestyle}
                  className={focusedField === 'lifestyle' ? 'ring-2 ring-primary' : ''}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="profile-symptoms">Current Symptoms</Label>
                <Textarea
                  id="profile-symptoms"
                  value={profile.symptoms || ''}
                  onChange={(e) => handleChange('symptoms', e.target.value)}
                  placeholder={profileFieldPlaceholders.symptoms}
                  className={focusedField === 'symptoms' ? 'ring-2 ring-primary' : ''}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <h4 className="font-medium">Emergency Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    This information will be used in case of emergency situations or SOS alerts.
                  </p>
                </div>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency-name">Contact Name</Label>
                  <Input
                    id="emergency-name"
                    value={profile.emergencyContact?.name || ''}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-phone">Phone Number</Label>
                  <Input
                    id="emergency-phone"
                    type="tel"
                    value={profile.emergencyContact?.phone || ''}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergency-relationship">Relationship</Label>
                <Input
                  id="emergency-relationship"
                  value={profile.emergencyContact?.relationship || ''}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Friend"
                />
              </div>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Prescription Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload images of your prescriptions for AI analysis and medication tracking.
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  variant="outline"
                >
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </Button>
              </div>

              {prescriptionImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Uploaded Prescriptions</h4>
                  {prescriptionImages.map((image) => (
                    <Card key={image.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Prescription Image
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>
                          Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <img
                            src={image.imageUrl}
                            alt="Prescription"
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{image.notes}</p>
                            {image.analyzedMedications && image.analyzedMedications.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Detected Medications:</p>
                                <div className="flex flex-wrap gap-1">
                                  {image.analyzedMedications.map((med, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {med.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Information
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
