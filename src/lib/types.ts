export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  isLoading?: boolean;
  feedback?: 'good' | 'bad';
  isFollowUpPrompt?: boolean;
  originalQuestion?: string; // Store original question for context with AI's follow-up
}

export interface UserProfile {
  // Basic Requirements
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: 'male' | 'female' | 'other';
  
  // Medical Information
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  lifestyle?: string;
  symptoms?: string;
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface VitalSigns {
  timestamp: number;
  heartRate?: number; // bpm
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number; // celsius
  oxygenSaturation?: number; // percentage
  bloodGlucose?: number; // mg/dL
  steps?: number;
  sleepHours?: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  notes?: string;
}

export interface PrescriptionImage {
  id: string;
  imageUrl: string;
  uploadedAt: number;
  analyzedMedications?: Medication[];
  notes?: string;
}

export interface SOSAlert {
  id: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'escalated';
  emergencyContactNotified: boolean;
}

export type AISuggestedKey = keyof UserProfile;
