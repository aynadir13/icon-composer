import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Image as ImageIcon, 
  Upload, 
  Move, 
  Droplet, 
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  Download // Correction de l'import manquant
} from 'lucide-react';

// --- Types ---

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'color';
  src?: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  blur: number;
  borderRadius: number;
  borderWidth: number;
  borderOpacity: number;
  visible: boolean;
  zIndex: number;
}

// --- Constants ---

const BACKGROUND_GRADIENTS = [
  "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
  "bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-orange-400 via-red-500 to-rose-600",
  "bg-slate-900",
  "bg-white"
];

// --- Components ---

const Slider = ({ label, value, min, max, step = 1, onChange, unit = "" }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
      <span className="text-[10px] text-blue-400 font-mono">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'composer' | 'simulator'>('composer');
  
  // State for Composer
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Simulator
  const [simImg, setSimImg] = useState<string | null>(null);
  const simFileRef = useRef<HTMLInputElement>(null);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // --- Handlers ---

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newLayer: Layer = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.split('.')[0],
          type: 'image',
          src: event.target?.result as string,
          x: 50,
          y: 50,
          size: 60,
          opacity: 1,
          blur: 0,
          borderRadius: 20,
          borderWidth: 0,
          borderOpacity: 0.2,
          visible: true,
          zIndex: layers.length
        };
        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // --- Styles ---

  const getLayerStyle = (layer: Layer) => ({
    position: 'absolute' as const,
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.size}%`,
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    opacity: layer.opacity,
    backdropFilter: layer.blur > 0 ? `blur(${layer.blur}px)` : 'none',
    WebkitBackdropFilter: layer.blur > 0 ? `blur(${layer.blur}px)` : 'none',
    borderRadius: `${layer.borderRadius}%`,
    border: layer.borderWidth > 0 ? `${layer.borderWidth}px solid rgba(255,255,255,${layer.borderOpacity})` : 'none',
    display: layer.visible ? 'block' : 'none',
    zIndex: layer.zIndex,
    pointerEvents: 'none' as const,
  });

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-slate-300 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#111] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">IconComposer <span className="text-blue-500 text-[10px] ml-1 px-1.5 py-0.5 border border-blue-500/30 rounded">PRO</span></span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <nav className="flex gap-2">
            <button 
              onClick={() => setActiveTab('composer')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'composer' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Éditeur de Calques
            </button>
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'simulator' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Simulateur
            </button>
          </nav>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-2">
          <Download className="w-3.5 h-3.5" /> Exporter
        </button>
      </header>

      {activeTab === 'composer' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Layers */}
          <aside className="w-64 border-r border-white/5 bg-[#111] flex flex-col shrink-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calques</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:bg-white/5 rounded text-blue-400"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={addImageLayer} />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {layers.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-[10px] text-slate-600">Aucun calque. Importez une image pour commencer.</p>
                </div>
              ) : (
                layers.slice().reverse().map((layer) => (
                  <div 
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all ${selectedLayerId === layer.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="w-8 h-8 rounded bg-slate-800 shrink-0 overflow-hidden border border-white/10">
                      <img src={layer.src} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${selectedLayerId === layer.id ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {layer.name}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}>
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Center: Canvas */}
          <main className="flex-1 bg-[#050505] relative flex items-center justify-center p-12 overflow-hidden">
            {/* BG Selector */}
            <div className="absolute top-6 flex gap-2 z-20">
              {BACKGROUND_GRADIENTS.map((bg, i) => (
                <button 
                  key={i} 
                  onClick={() => setBgIndex(i)}
                  className={`w-6 h-6 rounded-full border-2 ${bg} ${bgIndex === i ? 'border-blue-500 scale-110' : 'border-transparent opacity-50'}`}
                />
              ))}
            </div>

            {/* Icon Artboard */}
            <div 
              className={`w-[400px] h-[400px] rounded-[80px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-500 border border-white/10 ${BACKGROUND_GRADIENTS[bgIndex]}`}
            >
              {layers.map((layer) => (
                <img 
                  key={layer.id} 
                  src={layer.src} 
                  style={getLayerStyle(layer)}
                  alt={layer.name}
                />
              ))}
              
              {/* Gloss Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-white/5" />
            </div>

            {/* Hint */}
            <div className="absolute bottom-6 text-[10px] text-slate-600 flex items-center gap-2">
              <Move className="w-3 h-3" /> Utilisez les contrôles à droite pour ajuster les calques
            </div>
          </main>

          {/* Right Panel: Properties */}
          <aside className="w-72 border-l border-white/5 bg-[#111] shrink-0 overflow-y-auto p-5">
            {!selectedLayer ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                <Settings2 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">Sélectionnez un calque pour modifier ses propriétés</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <header className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Propriétés</h3>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400">ID: {selectedLayer.id}</span>
                </header>

                <section className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-blue-500 mb-4 uppercase">Disposition</h4>
                    <Slider label="Position X" value={selectedLayer.x} min={0} max={100} onChange={(v) => updateLayer(selectedLayer.id, { x: v })} unit="%" />
                    <Slider label="Position Y" value={selectedLayer.y} min={0} max={100} onChange={(v) => updateLayer(selectedLayer.id, { y: v })} unit="%" />
                    <Slider label="Taille" value={selectedLayer.size} min={5} max={150} onChange={(v) => updateLayer(selectedLayer.id, { size: v })} unit="%" />
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-blue-500 mb-4 uppercase">Effets Liquid Glass</h4>
                    <Slider label="Opacité" value={selectedLayer.opacity} min={0} max={1} step={0.01} onChange={(v) => updateLayer(selectedLayer.id, { opacity: v })} />
                    <Slider label="Flou (Glass Blur)" value={selectedLayer.blur} min={0} max={40} onChange={(v) => updateLayer(selectedLayer.id, { blur: v })} unit="px" />
                    <Slider label="Arrondi (Corner)" value={selectedLayer.borderRadius} min={0} max={50} onChange={(v) => updateLayer(selectedLayer.id, { borderRadius: v })} unit="%" />
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-blue-500 mb-4 uppercase">Bordures</h4>
                    <Slider label="Épaisseur" value={selectedLayer.borderWidth} min={0} max={20} onChange={(v) => updateLayer(selectedLayer.id, { borderWidth: v })} unit="px" />
                    <Slider label="Opacité Bordure" value={selectedLayer.borderOpacity} min={0} max={1} step={0.01} onChange={(v) => updateLayer(selectedLayer.id, { borderOpacity: v })} />
                  </div>
                </section>
              </div>
            )}
          </aside>
        </div>
      ) : (
        /* --- Simulator Tab --- */
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black">
          <input type="file" ref={simFileRef} className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => setSimImg(ev.target?.result as string);
              reader.readAsDataURL(file);
            }
          }} />

          {!simImg ? (
            <div 
              onClick={() => simFileRef.current?.click()}
              className="w-full max-w-xl aspect-video border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">Glissez une image ici</p>
              <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-bold">Pour tester l'effet Liquid Glass</p>
            </div>
          ) : (
            <div className="relative group max-w-4xl max-h-full">
               <img src={simImg} className="rounded-xl border border-white/10 max-h-[70vh] w-auto shadow-2xl" alt="Simulated" />
               
               <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 shadow-2xl bg-white/10 rounded-3xl pointer-events-none"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-[inherit]" />
               </div>

               <button 
                onClick={() => setSimImg(null)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-400"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}