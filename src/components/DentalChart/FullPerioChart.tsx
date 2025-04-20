// src/components/DentalChart/FullPerioChart.tsx
import { Component, For, Show, Index, Accessor, JSX } from 'solid-js';
import type { Tooth, PeriodontalMeasurements } from './types/dental.types';

interface FullPerioChartProps {
  upperTeeth: Accessor<Readonly<Tooth[]>>;
  lowerTeeth: Accessor<Readonly<Tooth[]>>;
}

const SITE_INDICES_BUCCAL = [0, 1, 2]; // MB, B, DB
const SITE_INDICES_LINGUAL = [5, 4, 3]; // ML, L, DL (reverse order for display consistency M->D)

// Helper to get site value or default
const getVal = (arr: (number | boolean | null)[] | undefined, index: number): string | number | JSX.Element => {
  const val = arr?.[index];
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') {
    return val ? <span class="text-red-600 font-bold">•</span> : '-'; // Red dot for true (BOP)
  }
  // Optionally style high PD numbers
  if (typeof val === 'number' && val >= 5) {
    return <span class="text-red-600 font-semibold">{val}</span>;
  }
  return val;
};

// Helper to calculate CAL
export const getCal = (pdArr: (number | null)[] | undefined, recArr: (number | null)[] | undefined, index: number): string | number => {
  const pd = pdArr?.[index];
  const rec = recArr?.[index];
  // Treat null PD or REC as 0 for CAL calculation if the other exists? Or return '-'? Let's return '-' if either is null.
  if (pd === null || pd === undefined || rec === null || rec === undefined) return '-';
  const cal = pd + rec; // CAL = PD + REC (where REC is positive)

  // Optionally style high CAL numbers
  if (cal >= 5) {
    return <span class="text-red-600 font-bold">{cal}</span>;
  }
  return cal;
};

// Reusable Row Component for a single metric (Buccal or Lingual)
const PerioMetricRow: Component<{
  label: string;
  teeth: Accessor<Readonly<Tooth[]>>;
  siteIndices: number[];
  dataExtractor: (perio: PeriodontalMeasurements | undefined, siteIndex: number) => string | number | JSX.Element;
  rowClass?: string;
}> = (props) => {
  return (
    <div class={`grid grid-flow-col auto-cols-max items-center border-b border-gray-200 min-h-[24px] ${props.rowClass || ''}`}>
      <div class="w-[50px] px-1 font-medium text-xs border-r border-gray-200 sticky left-0 bg-gray-50 z-10">{props.label}</div>
      <Index each={props.teeth()}>
        {(tooth) => (
          <div class="w-[44px] border-r border-gray-200 text-center grid grid-cols-3 gap-0">
            <Index each={props.siteIndices}>
              {(siteIndex) => (
                <div class="text-xs px-0.5 py-0.5 border-l border-dotted border-gray-200 first:border-l-0">
                  {props.dataExtractor(tooth().periodontal, siteIndex())}
                </div>
              )}
            </Index>
          </div>
        )}
      </Index>
    </div>
  );
};


export const FullPerioChart: Component<FullPerioChartProps> = (props) => {
  return (
    <div class="mt-6 mb-6 bg-white p-3 rounded-lg shadow-md border border-gray-200 overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <h2 class="text-xl font-semibold mb-3 text-center text-gray-700">Periodontal Chart</h2>

      {/* --- Upper Arch --- */}
      <div class="mb-4">
        <h3 class="text-sm font-semibold mb-1 text-gray-600 pl-[50px] sticky left-0">Upper Arch</h3>
        {/* Tooth Numbers Row */}
        <div class="grid grid-flow-col auto-cols-max items-center border-b-2 border-gray-400 min-h-[24px] bg-gray-100 sticky top-0 z-20">
          <div class="w-[50px] px-1 font-semibold text-xs border-r border-gray-300 sticky left-0 bg-gray-100 z-10">Tooth #</div>
          <Index each={props.upperTeeth()}>
            {(tooth) => (
              <div class={`w-[44px] border-r border-gray-300 text-center text-xs font-semibold px-0.5 py-0.5 ${tooth().isDeciduous ? 'text-purple-700' : ''}`}>
                {tooth().name}
              </div>
            )}
          </Index>
        </div>
        {/* Buccal Metrics */}
        <PerioMetricRow label="PD (B)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
        <PerioMetricRow label="REC (B)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
        <PerioMetricRow label="BOP (B)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
        <PerioMetricRow label="CAL (B)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
        {/* Add Furcation Row Here */}
        {/* Lingual Metrics */}
        <PerioMetricRow label="PD (L)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
        <PerioMetricRow label="REC (L)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
        <PerioMetricRow label="BOP (L)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
        <PerioMetricRow label="CAL (L)" teeth={props.upperTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
        {/* Add Mobility Row Here (often single value per tooth) */}
      </div>

      {/* --- Lower Arch --- */}
      <div>
        <h3 class="text-sm font-semibold mb-1 text-gray-600 pl-[50px] sticky left-0">Lower Arch</h3>
        {/* Tooth Numbers Row */}
        <div class="grid grid-flow-col auto-cols-max items-center border-b-2 border-gray-400 min-h-[24px] bg-gray-100 sticky top-0 z-20">
          <div class="w-[50px] px-1 font-semibold text-xs border-r border-gray-300 sticky left-0 bg-gray-100 z-10">Tooth #</div>
          <Index each={props.lowerTeeth()}>
            {(tooth) => (
              <div class={`w-[44px] border-r border-gray-300 text-center text-xs font-semibold px-0.5 py-0.5 ${tooth().isDeciduous ? 'text-purple-700' : ''}`}>
                {tooth().name}
              </div>
            )}
          </Index>
        </div>
        {/* Buccal Metrics */}
        <PerioMetricRow label="PD (B)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
        <PerioMetricRow label="REC (B)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
        <PerioMetricRow label="BOP (B)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
        <PerioMetricRow label="CAL (B)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_BUCCAL} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
        {/* Add Furcation Row Here */}
        {/* Lingual Metrics */}
        <PerioMetricRow label="PD (L)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.pocketDepth, i)} rowClass="bg-blue-50" />
        <PerioMetricRow label="REC (L)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.recession, i)} rowClass="bg-yellow-50" />
        <PerioMetricRow label="BOP (L)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getVal(p?.bleedingOnProbing, i)} rowClass="bg-red-50" />
        <PerioMetricRow label="CAL (L)" teeth={props.lowerTeeth} siteIndices={SITE_INDICES_LINGUAL} dataExtractor={(p, i) => getCal(p?.pocketDepth, p?.recession, i)} rowClass="bg-green-50 font-semibold" />
        {/* Add Mobility Row Here */}
      </div>

    </div>
  );
};
