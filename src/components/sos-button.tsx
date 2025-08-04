'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SOSAlert, UserProfile } from '@/lib/types';

interface SOSButtonProps {
  userProfile: UserProfile;
  onSOSAlert: (alert: SOSAlert) => void;
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300',
};

const severityLabels = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
  critical: 'Critical Emergency',
};

export function SOSButton({ userProfile, onSOSAlert }: SOSButtonProps) {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SOSAlert | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Unable to get your location. Please enable location services.',
          });
        }
      );
    }
  }, [toast]);

  const handleSOSClick = () => {
    setIsSOSModalOpen(true);
  };

  const handleSubmitSOS = async () => {
    if (!symptoms.trim()) {
      toast({
        variant: 'destructive',
        title: 'Symptoms Required',
        description: 'Please describe your symptoms to proceed.',
      });
      return;
    }

    setIsProcessing(true);

    const alert: SOSAlert = {
      id: `sos-${Date.now()}`,
      timestamp: Date.now(),
      location: location || undefined,
      symptoms: symptoms.trim(),
      severity,
      status: 'active',
      emergencyContactNotified: false,
    };

    setCurrentAlert(alert);
    onSOSAlert(alert);

    // Simulate emergency contact notification
    if (userProfile.emergencyContact?.phone) {
      try {
        // In a real implementation, this would call an SMS/phone service
        console.log('Notifying emergency contact:', userProfile.emergencyContact);
        alert.emergencyContactNotified = true;
        setCurrentAlert({ ...alert, emergencyContactNotified: true });
        
        toast({
          title: 'Emergency Contact Notified',
          description: `Contacted ${userProfile.emergencyContact.name} at ${userProfile.emergencyContact.phone}`,
        });
      } catch (error) {
        console.error('Failed to notify emergency contact:', error);
        toast({
          variant: 'destructive',
          title: 'Notification Failed',
          description: 'Failed to notify emergency contact. Please call them directly.',
        });
      }
    }

    setIsProcessing(false);
    setIsSOSModalOpen(false);
    setSymptoms('');
    setSeverity('medium');
  };

  const handleResolveAlert = () => {
    if (currentAlert) {
      const resolvedAlert = { ...currentAlert, status: 'resolved' as const };
      setCurrentAlert(resolvedAlert);
      toast({
        title: 'Alert Resolved',
        description: 'The emergency alert has been marked as resolved.',
      });
    }
  };

  const handleEscalateAlert = () => {
    if (currentAlert) {
      const escalatedAlert = { ...currentAlert, status: 'escalated' as const };
      setCurrentAlert(escalatedAlert);
      toast({
        title: 'Alert Escalated',
        description: 'The emergency alert has been escalated to emergency services.',
      });
    }
  };

  return (
    <>
      {/* SOS Button */}
      <Button
        onClick={handleSOSClick}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg z-50 animate-pulse"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="w-8 h-8" />
      </Button>

      {/* SOS Modal */}
      <Dialog open={isSOSModalOpen} onOpenChange={setIsSOSModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency SOS Alert
            </DialogTitle>
            <DialogDescription>
              Please describe your symptoms and select the severity level. This will help us provide appropriate assistance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Severity Level</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      severity === level
                        ? severityColors[level]
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {severityLabels[level]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Describe Your Symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe what you're experiencing..."
                className="w-full mt-2 p-3 border rounded-lg resize-none"
                rows={4}
              />
            </div>

            {location && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </AlertDescription>
              </Alert>
            )}

            {userProfile.emergencyContact && (
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  Emergency contact: {userProfile.emergencyContact.name} ({userProfile.emergencyContact.phone})
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSOSModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSOS}
              disabled={isProcessing || !symptoms.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Sending Alert...' : 'Send SOS Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Alert Display */}
      {currentAlert && currentAlert.status === 'active' && (
        <Card className="fixed top-6 right-6 w-80 bg-red-50 border-red-200 z-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Active Emergency Alert
            </CardTitle>
            <CardDescription className="text-red-600">
              {new Date(currentAlert.timestamp).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge className={severityColors[currentAlert.severity]}>
                {severityLabels[currentAlert.severity]}
              </Badge>
            </div>
            <p className="text-sm text-red-700">{currentAlert.symptoms}</p>
            
            {currentAlert.emergencyContactNotified && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Emergency contact notified
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResolveAlert}
                className="flex-1"
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleEscalateAlert}
                className="flex-1"
              >
                Escalate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 