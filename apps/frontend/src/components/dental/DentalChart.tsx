import { type Component, For, Show, createMemo, createSignal } from 'solid-js'
import type { DentalChartsRecord, DentalChartsResponse, DentalChartsChart_typeOptions, DentalChartsNotation_systemOptions, DentalChartsDentitionOptions } from '../../types/pocketbase-types'

type ToothSurface = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual'
type ToothCondition = 'sound' | 'caries' | 'filled' | 'missing' | 'impacted' | 'root_canal' | 'crown' | 'bridge' | 'implant' | 'fracture' | 'fissure_seal'

export type ChartState = {
  teeth: Record<string, {
    present: boolean
    conditions: Partial<Record<ToothSurface, ToothCondition>>
    notes?: string
  }>
  perio?: {
    pockets: Record<string, [number, number, number, number, number, number]> // 6 sites per tooth
    bleeding: Record<string, boolean>
    recession: Record<string, [number, number, number, number, number, number]>
  }
}

export type DentalChartProps = {
  value: ChartState
  onChange?: (next: ChartState) => void
  notation?: DentalChartsNotation_systemOptions
  dentition?: DentalChartsDentitionOptions
  readOnly?: boolean
}

const SURFACES: ToothSurface[] = ['occlusal', 'mesial', 'distal', 'buccal', 'lingual']
const CONDITIONS: ToothCondition[] = ['sound', 'caries', 'filled', 'missing', 'impacted', 'root_canal', 'crown', 'bridge', 'implant', 'fracture', 'fissure_seal']

function clone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) }

function getPermanentUniversalNumbers(): string[] {
  return Array.from({ length: 32 }, (_, i) => String(i + 1))
}

function getPrimaryUniversalLetters(): string[] {
  const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T']
  return letters
}

const Badge: Component<{ active?: boolean, children: any, onClick?: () => void }> = (props) => (
  <button
    class={`px-2 py-1 rounded-md text-xs border ${props.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-200 border-gray-700 hover:bg-gray-800'}`}
    onClick={props.onClick}
  >{props.children}</button>
)

export const DentalChart: Component<DentalChartProps> = (props) => {
  const [selectedTooth, setSelectedTooth] = createSignal<string | null>(null)
  const [selectedSurface, setSelectedSurface] = createSignal<ToothSurface>('occlusal')
  const [selectedCondition, setSelectedCondition] = createSignal<ToothCondition>('caries')

  const teethList = createMemo(() => {
    if (props.dentition === 'primary') return getPrimaryUniversalLetters()
    return getPermanentUniversalNumbers()
  })

  const chart = () => props.value
  const readOnly = () => !!props.readOnly

  const ensureTooth = (id: string) => {
    if (!chart().teeth[id]) {
      const next = clone(chart())
      next.teeth[id] = { present: true, conditions: {} }
      props.onChange?.(next)
    }
  }

  const togglePresence = (id: string) => {
    if (readOnly()) return
    const next = clone(chart())
    if (!next.teeth[id]) next.teeth[id] = { present: true, conditions: {} }
    next.teeth[id].present = !next.teeth[id].present
    props.onChange?.(next)
  }

  const applyCondition = (id: string) => {
    if (readOnly()) return
    ensureTooth(id)
    const next = clone(chart())
    const surf = selectedSurface()
    const cond = selectedCondition()
    next.teeth[id].conditions[surf] = cond
    props.onChange?.(next)
  }

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-300">Surface</span>
        <For each={SURFACES}>{(s) => (
          <Badge active={selectedSurface() === s} onClick={() => setSelectedSurface(s)}>{s}</Badge>
        )}</For>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-300">Condition</span>
        <For each={CONDITIONS}>{(c) => (
          <Badge active={selectedCondition() === c} onClick={() => setSelectedCondition(c)}>{c}</Badge>
        )}</For>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <div class="grid grid-cols-8 gap-2">
            <For each={teethList()}>{(id) => (
              <div class="border border-gray-800 rounded p-2 text-center">
                <div class="flex items-center justify-between mb-1">
                  <button class={`text-xs ${chart().teeth[id]?.present !== false ? 'text-green-400' : 'text-red-500'}`} onClick={() => togglePresence(id)}>
                    {chart().teeth[id]?.present !== false ? 'Present' : 'Missing'}
                  </button>
                  <div class="text-xs text-gray-400">{id}</div>
                </div>
                <div class="grid grid-cols-3 gap-1">
                  <For each={SURFACES}>{(s) => (
                    <button
                      class={`text-[10px] py-1 rounded border ${selectedTooth() === id && selectedSurface() === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-gray-200 border-slate-700'}`}
                      onClick={() => { setSelectedTooth(id); setSelectedSurface(s) }}
                    >{s[0].toUpperCase()}</button>
                  )}</For>
                </div>
                <div class="mt-2">
                  <button class="text-xs px-2 py-1 rounded border border-blue-700 text-blue-200 hover:bg-blue-800" onClick={() => applyCondition(id)}>Apply</button>
                </div>
                <Show when={Object.keys(chart().teeth[id]?.conditions || {}).length > 0}>
                  <div class="mt-2 text-[10px] text-gray-300 space-y-0.5 text-left">
                    <For each={Object.entries(chart().teeth[id]?.conditions || {})}>{([s, c]) => (
                      <div>{s}: <span class="text-gray-100 font-medium">{c}</span></div>
                    )}</For>
                  </div>
                </Show>
              </div>
            )}</For>
          </div>
        </div>
        <div>
          <div class="rounded-lg border border-gray-800 p-3">
            <div class="text-sm text-gray-200 mb-2">Perio (optional)</div>
            <div class="text-xs text-gray-400">Perio charting UI can be expanded here (pockets, bleeding, recession).</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DentalChart


