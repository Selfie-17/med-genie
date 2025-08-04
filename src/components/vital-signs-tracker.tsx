'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Thermometer, Droplets, Watch, Zap, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VitalSigns } from '@/lib/types';

interface VitalSignsTrackerProps {
  onVitalSignsUpdate: (vitals: VitalSigns) => void;
  currentVitals?: VitalSigns[];
}

const vitalSignsIcons = {
  heartRate: Heart,
  bloodPressure: Activity,
  temperature: Thermometer,
  oxygenSaturation: Droplets,
  bloodGlucose: Zap,
  steps: Watch,
  sleepHours: Watch,
};

const vitalSignsLabels = {
  heartRate: 'Heart Rate',
  bloodPressure: 'Blood Pressure',
  temperature: 'Temperature',
  oxygenSaturation: 'Oxygen Saturation',
  bloodGlucose: 'Blood Glucose',
  steps: 'Steps',
  sleepHours: 'Sleep Hours',
};

const vitalSignsUnits = {
  heartRate: 'bpm',
  bloodPressure: 'mmHg',
  temperature: '°C',
  oxygenSaturation: '%',
  bloodGlucose: 'mg/dL',
  steps: 'steps',
  sleepHours: 'hours',
};

const normalRanges = {
  heartRate: { min: 60, max: 100 },
  bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
  temperature: { min: 36.1, max: 37.2 },
  oxygenSaturation: { min: 95, max: 100 },
  bloodGlucose: { min: 70, max: 140 },
  steps: { min: 0, max: 10000 },
  sleepHours: { min: 7, max: 9 },
};

export function VitalSignsTracker({ onVitalSignsUpdate, currentVitals = [] }: VitalSignsTrackerProps) {
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
  const [manualVitals, setManualVitals] = useState<Partial<VitalSigns>>({});
  const [selectedVitalType, setSelectedVitalType] = useState<keyof VitalSigns>('heartRate');
  const { toast } = useToast();

  // Mock data for demonstration - in real app, this would come from Google Fit API
  const mockVitalSigns: VitalSigns[] = [
    {
      timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 36.8,
      oxygenSaturation: 98,
      steps: 8500,
      sleepHours: 7.5,
    },
    {
      timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
      heartRate: 78,
      bloodPressure: { systolic: 125, diastolic: 82 },
      temperature: 36.9,
      oxygenSaturation: 97,
      steps: 12000,
      sleepHours: 7.5,
    },
    {
      timestamp: Date.now(),
      heartRate: 75,
      bloodPressure: { systolic: 118, diastolic: 78 },
      temperature: 36.7,
      oxygenSaturation: 99,
      steps: 15000,
      sleepHours: 7.5,
    },
  ];

  const allVitals = [...currentVitals, ...mockVitalSigns].sort((a, b) => b.timestamp - a.timestamp);
  const latestVitals = allVitals[0];

  const getVitalStatus = (type: keyof VitalSigns, value: number) => {
    const range = normalRanges[type];
    if (!range) return 'normal';

    if (type === 'bloodPressure') {
      const bpRange = range as typeof normalRanges.bloodPressure;
      if (value > bpRange.systolic.max || value < bpRange.systolic.min) return 'warning';
      return 'normal';
    }

    if (value < range.min || value > range.max) return 'warning';
    return 'normal';
  };

  const getVitalColor = (type: keyof VitalSigns, value: number) => {
    const status = getVitalStatus(type, value);
    return status === 'warning' ? 'text-red-600' : 'text-green-600';
  };

  const handleGoogleFitConnect = async () => {
    // In a real implementation, this would integrate with Google Fit API
    try {
      // Simulate Google Fit connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsGoogleFitConnected(true);
      toast({
        title: 'Google Fit Connected',
        description: 'Your health data is now being synced from Google Fit.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Failed to connect to Google Fit. Please try again.',
      });
    }
  };

  const handleManualEntry = () => {
    if (!manualVitals[selectedVitalType]) {
      toast({
        variant: 'destructive',
        title: 'Value Required',
        description: 'Please enter a value for the selected vital sign.',
      });
      return;
    }

    const newVitals: VitalSigns = {
      timestamp: Date.now(),
      [selectedVitalType]: manualVitals[selectedVitalType],
    } as VitalSigns;

    onVitalSignsUpdate(newVitals);
    setIsManualEntryOpen(false);
    setManualVitals({});
    toast({
      title: 'Vital Signs Updated',
      description: 'Your vital signs have been recorded successfully.',
    });
  };

  const renderVitalCard = (type: keyof VitalSigns, value: any, label: string, unit: string) => {
    const Icon = vitalSignsIcons[type];
    const color = getVitalColor(type, value);
    const status = getVitalStatus(type, value);

    return (
      <Card key={type} className="flex-1 min-w-[200px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </span>
            <Badge variant={status === 'warning' ? 'destructive' : 'secondary'} className="text-xs">
              {status === 'warning' ? 'Alert' : 'Normal'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {type === 'bloodPressure' ? (
              <span className={color}>
                {value.systolic}/{value.diastolic}
              </span>
            ) : (
              <span className={color}>{value}</span>
            )}
            <span className="text-sm text-muted-foreground ml-1">{unit}</span>
          </div>
          {type === 'steps' && (
            <Progress value={(value / normalRanges.steps.max) * 100} className="h-2" />
          )}
        </CardContent>
      </Card>
    );
  };

  if (!latestVitals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs Tracker</CardTitle>
          <CardDescription>No vital signs data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={() => setIsManualEntryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Entry
            </Button>
            <Button variant="outline" onClick={handleGoogleFitConnect}>
              <Settings className="w-4 h-4 mr-2" />
              Connect Google Fit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vital Signs Tracker</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(latestVitals.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsManualEntryOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
          <Button
            variant={isGoogleFitConnected ? 'secondary' : 'outline'}
            onClick={handleGoogleFitConnect}
            disabled={isGoogleFitConnected}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isGoogleFitConnected ? 'Connected' : 'Connect Google Fit'}
          </Button>
        </div>
      </div>

      {/* Current Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {latestVitals.heartRate && renderVitalCard('heartRate', latestVitals.heartRate, 'Heart Rate', 'bpm')}
        {latestVitals.bloodPressure && renderVitalCard('bloodPressure', latestVitals.bloodPressure, 'Blood Pressure', 'mmHg')}
        {latestVitals.temperature && renderVitalCard('temperature', latestVitals.temperature, 'Temperature', '°C')}
        {latestVitals.oxygenSaturation && renderVitalCard('oxygenSaturation', latestVitals.oxygenSaturation, 'Oxygen Saturation', '%')}
        {latestVitals.bloodGlucose && renderVitalCard('bloodGlucose', latestVitals.bloodGlucose, 'Blood Glucose', 'mg/dL')}
        {latestVitals.steps && renderVitalCard('steps', latestVitals.steps, 'Steps', 'steps')}
        {latestVitals.sleepHours && renderVitalCard('sleepHours', latestVitals.sleepHours, 'Sleep Hours', 'hours')}
      </div>

      {/* Trends Chart */}
      {allVitals.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Trends</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={allVitals.filter(v => v.heartRate).slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis domain={[50, 120]} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any) => [`${value} bpm`, 'Heart Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Dialog */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vital Signs Entry</DialogTitle>
            <DialogDescription>
              Manually enter your vital signs measurements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vital Sign Type</Label>
              <Select value={selectedVitalType} onValueChange={(value: keyof VitalSigns) => setSelectedVitalType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(vitalSignsLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                step="0.1"
                placeholder={`Enter ${vitalSignsLabels[selectedVitalType].toLowerCase()}`}
                value={manualVitals[selectedVitalType] || ''}
                onChange={(e) => setManualVitals(prev => ({
                  ...prev,
                  [selectedVitalType]: parseFloat(e.target.value) || 0
                }))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Unit: {vitalSignsUnits[selectedVitalType]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualEntry}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 