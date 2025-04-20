import { Component, createEffect, createSignal } from 'solid-js';
import { DentalChart } from './DentalChart';
import type { PatientInfo, SavedChartState } from './types/dental.types';

interface DentalChartWrapperProps {
  initialChartData?: SavedChartState | null;
  patientInfo?: PatientInfo;
  onSave?: () => void;
  ref?: (el: any) => void;
}

// This wrapper component gives us a way to expose methods for external use
// and handle the props we need for PocketBase integration
export const DentalChartWrapper: Component<DentalChartWrapperProps> = (props) => {
  // Store a reference to the component instance
  let chartComponent: any;

  // Method to get chart data - will be exposed via ref
  const getChartData = (): SavedChartState => {
    // The specific implementation will depend on how the DentalChart 
    // component stores its state. This is a placeholder.
    // We'll use localStorage to get the current chart state
    const savedData = localStorage.getItem('solidDentalChartState_v2');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing dental chart data:', error);
        return null;
      }
    }
    return null;
  };

  // Set up reference to expose component methods
  createEffect(() => {
    if (props.ref) {
      props.ref({
        getChartData
      });
    }
  });

  // Handle initial data loading
  createEffect(() => {
    if (props.initialChartData) {
      // Initialize the chart with the provided data
      // This will happen in a later modification where we'll add 
      // loadFromJson method to the DentalChart component
      console.log('Initial chart data available:', props.initialChartData);
      
      // Save the data to localStorage for DentalChart to pick up
      localStorage.setItem('solidDentalChartState_v2', JSON.stringify(props.initialChartData));
    }
  });

  return (
    <DentalChart 
      ref={(el) => { chartComponent = el; }}
      // We'll pass patientInfo to DentalChart in the next modification
    />
  );
}; 