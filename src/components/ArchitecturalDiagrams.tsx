import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  GitFork, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Activity, 
  Layers, 
  Eye,
  FileCode
} from 'lucide-react';
import { MERMAID_DIAGRAM_LOGICAL_ARCH, MERMAID_DIAGRAM_SEQUENCE_FLOW } from '../data/mermaidDiagrams';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    background: '#090d16',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#64748b',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e1b4b',
  },
  sequence: {
    actorMargin: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: false,
  },
});

export const ArchitecturalDiagrams: React.FC = () => {
  const [activeDiagram, setActiveDiagram] = useState<'logical' | 'sequence'>('logical');
  const [copied, setCopied] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [renderError, setRenderError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentMermaidCode = activeDiagram === 'logical' 
    ? MERMAID_DIAGRAM_LOGICAL_ARCH 
    : MERMAID_DIAGRAM_SEQUENCE_FLOW;

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      try {
        setRenderError(null);
        containerRef.current.innerHTML = '';
        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(id, currentMermaidCode);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.maxWidth = '100%';
          }
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Failed to render diagram.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [activeDiagram, currentMermaidCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Carrier-Grade 3GPP Architectural Diagrams (Mermaid.js)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end logical topology and dual-session converged sequence flow rendered in real-time.
          </p>
        </div>

        {/* Tab Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => { setActiveDiagram('logical'); setZoom(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeDiagram === 'logical' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Logical Architecture & Data Flow
            </button>
            <button
              onClick={() => { setActiveDiagram('sequence'); setZoom(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                activeDiagram === 'sequence' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Dual-Session Converged Call Sequence Flow
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Mermaid!' : 'Copy Mermaid Code'}</span>
          </button>
        </div>
      </div>

      {/* Diagram Canvas Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span className="font-mono text-slate-300 font-semibold">
              {activeDiagram === 'logical' 
                ? '3GPP Ingress -> Unified Gateway -> Priority Queue -> Redis CAS -> N28 PCF -> Kafka Settlement' 
                : 'Concurrent Execution: 5G Data Interim SCUR vs Priority VoLTE Diameter Ro Call Setup & N28 Breach'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live SVG Rendered</span>
        </div>

        {renderError ? (
          <div className="p-6 text-center text-rose-400 bg-rose-950/20 border border-rose-900 rounded-lg text-xs font-mono">
            {renderError}
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[500px] flex items-center justify-center p-2">
            <div 
              ref={containerRef} 
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
              className="w-full flex justify-center"
            />
          </div>
        )}
      </div>

      {/* Raw Mermaid Source Code Preview Drawer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Raw Mermaid.js Source Specification</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Directly embeddable in GitHub / Markdown</span>
        </div>
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300/90 overflow-x-auto max-h-[220px] leading-relaxed">
          {currentMermaidCode}
        </pre>
      </div>
    </div>
  );
};
