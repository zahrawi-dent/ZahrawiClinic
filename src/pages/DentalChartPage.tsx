import { JSX, createSignal, onMount, Show } from 'solid-js';
import { Link } from '@tanstack/solid-router';
import { dentalOps } from 'src/operations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query';
import { DentalChart } from 'src/components/DentalChart/DentalChart';
import type { 
  PatientInfo, 
  SavedChartState 
} from 'src/components/DentalChart/types/dental.types';

export default function DentalChartPage(props: { patientId: string }): JSX.Element {
  const queryClient = useQueryClient();
  const [hasSaved, setHasSaved] = createSignal(false);
  const [chartInitialized, setChartInitialized] = createSignal(false);
  
  // Query to get dental chart data for this patient
  const dentalChartQuery = useQuery(() => ({
    queryKey: ['dental-chart', props.patientId],
    queryFn: async () => {
      try {
        // Try to fetch existing dental chart data
        const chartData = await dentalOps.dentalCharts.getByPatientId(props.patientId);
        return chartData;
      } catch (error) {
        console.error('Error fetching dental chart data:', error);
        // Return null if no chart exists yet
        return null;
      }
    },
    enabled: !!props.patientId
  }));

  // Query to get patient details to populate PatientInfo
  const patientQuery = useQuery(() => ({
    queryKey: ['patient-details', props.patientId],
    queryFn: () => dentalOps.patients.getById(props.patientId),
    enabled: !!props.patientId
  }));

  // Mutation for saving dental chart data
  const saveDentalChartMutation = useMutation(() => ({
    mutationFn: async (chartData: string) => {
      try {
        // Check if dental chart already exists for this patient
        const existingChart = await dentalOps.dentalCharts.getByPatientId(props.patientId);
        
        if (existingChart) {
          // Update existing chart
          return await dentalOps.dentalCharts.update(existingChart.id, {
            patient: props.patientId,
            chartData
          });
        } else {
          // Create new chart
          return await dentalOps.dentalCharts.create({
            patient: props.patientId,
            chartData
          });
        }
      } catch (error) {
        console.error('Error saving dental chart:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the dental chart query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['dental-chart', props.patientId] });
      setHasSaved(true);
      // Reset saved status after 3 seconds
      setTimeout(() => setHasSaved(false), 3000);
    }
  }));

  // Function to get chart data from localStorage and save it
  const handleSaveChart = async () => {
    try {
      // Get the chart data from localStorage where DentalChart stores it
      const chartData = localStorage.getItem('solidDentalChartState_v2');
      if (chartData) {
        saveDentalChartMutation.mutate(chartData);
      } else {
        console.error('No chart data found in localStorage');
      }
    } catch (error) {
      console.error('Error saving chart:', error);
    }
  };

  // Function to convert patient data to PatientInfo format
  const mapPatientToChartInfo = (patient: any): PatientInfo => {
    if (!patient) {
      return { 
        name: 'Unknown Patient', 
        id: props.patientId || '', 
        dob: '', 
        lastVisit: '', 
        nextAppointment: '' 
      };
    }
    
    return {
      name: `${patient.firstName} ${patient.lastName}`,
      id: patient.id || props.patientId,
      dob: new Date(patient.age).toLocaleDateString(),
      lastVisit: '', // Could be populated from appointments if available
      nextAppointment: '' // Could be populated from appointments if available
    };
  };

  // Initialize the chart with data from PocketBase
  onMount(() => {
    if (dentalChartQuery.isSuccess && patientQuery.isSuccess) {
      // Get patient info
      const patientInfo = mapPatientToChartInfo(patientQuery.data);
      
      if (dentalChartQuery.data?.chartData) {
        // If we have chart data, load it
        try {
          const chartData = JSON.parse(dentalChartQuery.data.chartData);
          // Update the patient info in the chart data
          chartData.patientInfo = patientInfo;
          // Set the chart data to localStorage for DentalChart to use
          localStorage.setItem('solidDentalChartState_v2', JSON.stringify(chartData));
        } catch (error) {
          console.error('Error parsing chart data:', error);
        }
      } else {
        // If no chart data, initialize with just patient info
        // The DentalChart component will use default state for teeth
        const initialState: Partial<SavedChartState> = {
          version: 2,
          patientInfo,
          viewFilter: 'all',
          dentitionMode: 'permanent',
          showPerioVisuals: true,
          showPerioSummary: false
        };
        
        localStorage.setItem('solidDentalChartState_v2', JSON.stringify(initialState));
      }
      
      setChartInitialized(true);
    }
  });

  return (
    <div class="flex flex-col h-full">
      <div class="bg-white shadow p-4 mb-4 flex justify-between items-center">
        <div>
          <Link
            to={`/patients/${props.patientId}`}
            class="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Patient
          </Link>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">
            Dental Chart
            {patientQuery.isSuccess && patientQuery.data && (
              <span class="ml-2">
                - {patientQuery.data.firstName} {patientQuery.data.lastName}
              </span>
            )}
          </h1>
        </div>
        <div class="flex items-center">
          <button
            onClick={handleSaveChart}
            disabled={saveDentalChartMutation.isPending}
            class={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              saveDentalChartMutation.isPending
                ? 'bg-indigo-400 cursor-not-allowed'
                : hasSaved()
                ? 'bg-green-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saveDentalChartMutation.isPending
              ? 'Saving...'
              : hasSaved()
              ? 'Saved!'
              : 'Save Chart'}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-gray-50">
        {dentalChartQuery.isLoading || patientQuery.isLoading ? (
          <div class="flex justify-center items-center h-64">
            <div class="text-center">
              <p class="text-gray-500">Loading dental chart data...</p>
            </div>
          </div>
        ) : dentalChartQuery.isError ? (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-4">
            <p>Error loading dental chart: {dentalChartQuery.error?.toString()}</p>
          </div>
        ) : (
          <Show when={chartInitialized()}>
            <DentalChart />
          </Show>
        )}
      </div>
    </div>
  );
} 