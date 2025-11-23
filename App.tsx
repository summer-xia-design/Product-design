import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { StyleSelector } from './components/StyleSelector';
import { DesignStyle, ImageFile, GenerationState } from './types';
import { generateRenderFromSketch } from './services/geminiService';

const App: React.FC = () => {
  const [sketch, setSketch] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(DesignStyle.REALISTIC);
  const [generation, setGeneration] = useState<GenerationState>({
    isLoading: false,
    error: null,
    resultImage: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setGeneration(prev => ({ ...prev, error: "File size too large. Please use an image under 5MB." }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSketch({
          file,
          preview: reader.result as string,
          base64: reader.result as string
        });
        setGeneration({ isLoading: false, error: null, resultImage: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sketch) {
      setGeneration(prev => ({ ...prev, error: "Please upload a sketch first." }));
      return;
    }

    setGeneration({ isLoading: true, error: null, resultImage: null });

    try {
      const result = await generateRenderFromSketch(sketch.base64, prompt, selectedStyle);
      setGeneration({
        isLoading: false,
        error: null,
        resultImage: result
      });
    } catch (err: any) {
      setGeneration({
        isLoading: false,
        error: err.message || "Failed to generate render.",
        resultImage: null
      });
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Controls & Input */}
          <div className="lg:col-span-5 space-y-8 flex flex-col">
            
            {/* Upload Area */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400">Input Sketch</label>
              <div 
                className={`
                  relative border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden
                  ${sketch ? 'border-indigo-500/50 bg-zinc-900/50' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'}
                  aspect-video flex flex-col items-center justify-center group cursor-pointer
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden" 
                />
                
                {sketch ? (
                  <img 
                    src={sketch.preview} 
                    alt="Sketch Preview" 
                    className="w-full h-full object-contain p-2" 
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-zinc-300 font-medium">Click to upload sketch</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                
                {sketch && (
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">Change Image</p>
                   </div>
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
               <label className="text-sm font-medium text-zinc-400">Details & Material</label>
               <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A portable speaker, matte black plastic with orange accents, mesh texture..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
               />
            </div>

            {/* Style Selector */}
            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />

            {/* Generate Action */}
            <button
              onClick={handleGenerate}
              disabled={!sketch || generation.isLoading}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                ${!sketch || generation.isLoading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]'
                }
              `}
            >
              {generation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rendering...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Generate Render
                </>
              )}
            </button>
            
            {generation.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Error: {generation.error}
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-8 flex items-center justify-center relative min-h-[400px]">
              
              {!generation.resultImage && !generation.isLoading && !sketch && (
                <div className="text-center max-w-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-200 mb-2">Ready to Render</h3>
                  <p className="text-zinc-500">Upload a sketch and select a style to generate a professional industrial design visualization.</p>
                </div>
              )}

              {/* Loading State Animation */}
              {generation.isLoading && (
                 <div className="absolute inset-0 z-10 bg-zinc-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-indigo-400 font-medium animate-pulse">Analyzing Sketch Geometry...</p>
                 </div>
              )}

              {/* Previous State - Comparison visual (simulated) */}
              {!generation.resultImage && sketch && !generation.isLoading && (
                <div className="opacity-30 blur-sm w-full h-full flex items-center justify-center">
                   <img src={sketch.preview} className="max-h-full max-w-full object-contain" alt="Waiting" />
                </div>
              )}

              {/* Result Image */}
              {generation.resultImage && (
                <div className="relative group w-full h-full flex items-center justify-center">
                  <img 
                    src={generation.resultImage} 
                    alt="Generated Render" 
                    className="max-h-[600px] max-w-full rounded-lg shadow-2xl object-contain"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => downloadImage(generation.resultImage!, `render-${Date.now()}.png`)}
                      className="bg-white text-zinc-950 px-5 py-2.5 rounded-full font-semibold shadow-lg hover:bg-zinc-100 active:scale-95 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download High-Res
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;