'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Eye, Edit, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PrescriptionImage, Medication } from '@/lib/types';

interface PrescriptionAnalyzerProps {
  onMedicationsUpdate: (medications: Medication[]) => void;
  currentMedications?: Medication[];
}

export function PrescriptionAnalyzer({ onMedicationsUpdate, currentMedications = [] }: PrescriptionAnalyzerProps) {
  const [prescriptionImages, setPrescriptionImages] = useState<PrescriptionImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PrescriptionImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 10MB.',
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const newImage: PrescriptionImage = {
      id: `img-${Date.now()}`,
      imageUrl,
      uploadedAt: Date.now(),
      analyzedMedications: [],
      notes: 'Analysis pending...',
    };

    setPrescriptionImages(prev => [...prev, newImage]);
    
    // Simulate AI analysis
    setIsAnalyzing(true);
    try {
      await analyzePrescriptionImage(newImage);
      toast({
        title: 'Analysis Complete',
        description: 'Prescription has been analyzed successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to analyze prescription. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePrescriptionImage = async (image: PrescriptionImage) => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock AI analysis results - in real implementation, this would call an AI service
    const mockMedications: Medication[] = [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date().toISOString().split('T')[0],
        prescribedBy: 'Dr. Smith',
        notes: 'Take with meals',
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date().toISOString().split('T')[0],
        prescribedBy: 'Dr. Smith',
        notes: 'Take in the morning',
      },
    ];

    const updatedImage: PrescriptionImage = {
      ...image,
      analyzedMedications: mockMedications,
      notes: `Analyzed ${mockMedications.length} medications`,
    };

    setPrescriptionImages(prev => 
      prev.map(img => img.id === image.id ? updatedImage : img)
    );

    // Update medications list
    const allMedications = [...currentMedications, ...mockMedications];
    onMedicationsUpdate(allMedications);
  };

  const removeImage = (imageId: string) => {
    setPrescriptionImages(prev => prev.filter(img => img.id !== imageId));
  };

  const viewImage = (image: PrescriptionImage) => {
    setSelectedImage(image);
    setIsViewerOpen(true);
  };

  const editMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setIsEditing(true);
  };

  const saveMedicationEdit = () => {
    if (!editingMedication) return;

    const updatedMedications = currentMedications.map(med => 
      med.name === editingMedication.name ? editingMedication : med
    );
    onMedicationsUpdate(updatedMedications);
    setIsEditing(false);
    setEditingMedication(null);
    toast({
      title: 'Medication Updated',
      description: 'Medication information has been updated.',
    });
  };

  const removeMedication = (medicationName: string) => {
    const updatedMedications = currentMedications.filter(med => med.name !== medicationName);
    onMedicationsUpdate(updatedMedications);
    toast({
      title: 'Medication Removed',
      description: 'Medication has been removed from your list.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prescription Analyzer</h2>
          <p className="text-muted-foreground">
            Upload prescription images for AI-powered medication analysis
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Prescription
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Uploaded Images */}
      {prescriptionImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Prescriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptionImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Prescription
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt="Prescription"
                      className="w-full h-32 object-cover rounded border cursor-pointer"
                      onClick={() => viewImage(image)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => viewImage(image)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-muted-foreground">{image.notes}</p>
                    {image.analyzedMedications && image.analyzedMedications.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Detected Medications:</p>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {currentMedications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Medications</h3>
          <div className="space-y-3">
            {currentMedications.map((medication, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{medication.name}</h4>
                        <Badge variant="outline">{medication.dosage}</Badge>
                        <Badge variant="secondary">{medication.frequency}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Prescribed by: {medication.prescribedBy}</p>
                        <p>Start date: {medication.startDate}</p>
                        {medication.notes && <p>Notes: {medication.notes}</p>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editMedication(medication)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMedication(medication.name)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <div>
                <h3 className="font-semibold">Analyzing Prescription</h3>
                <p className="text-sm text-muted-foreground">
                  AI is extracting medication information...
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prescription Image</DialogTitle>
            <DialogDescription>
              {selectedImage && new Date(selectedImage.uploadedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.imageUrl}
                alt="Prescription"
                className="w-full max-h-96 object-contain border rounded"
              />
              {selectedImage.analyzedMedications && selectedImage.analyzedMedications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Analyzed Medications:</h4>
                  <div className="space-y-2">
                    {selectedImage.analyzedMedications.map((med, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{med.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} - {med.frequency}
                              </p>
                              {med.notes && (
                                <p className="text-sm text-muted-foreground">{med.notes}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Medication Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update medication information
            </DialogDescription>
          </DialogHeader>
          {editingMedication && (
            <div className="space-y-4">
              <div>
                <Label>Medication Name</Label>
                <Input
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input
                  value={editingMedication.dosage}
                  onChange={(e) => setEditingMedication(prev => 
                    prev ? { ...prev, dosage: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Input
                  value={editingMedication.frequency}
                  onChange={(e) => setEditingMedication(prev => 
                    prev ? { ...prev, frequency: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Prescribed By</Label>
                <Input
                  value={editingMedication.prescribedBy || ''}
                  onChange={(e) => setEditingMedication(prev => 
                    prev ? { ...prev, prescribedBy: e.target.value } : null
                  )}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingMedication.notes || ''}
                  onChange={(e) => setEditingMedication(prev => 
                    prev ? { ...prev, notes: e.target.value } : null
                  )}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveMedicationEdit}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 