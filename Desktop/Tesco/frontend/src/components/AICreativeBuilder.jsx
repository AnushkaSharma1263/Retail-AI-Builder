import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

// Use relative URLs in development (via Vite proxy) or full URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001');

export default function AICreativeBuilder() {
  const [assets, setAssets] = useState([]); // {id, name, src, type}
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [paletteSync, setPaletteSync] = useState(true);
  const [bgRemove, setBgRemove] = useState(false);
  const [tone, setTone] = useState('neutral'); // neutral | bold | playful | premium
  const [objective, setObjective] = useState('awareness'); // awareness|conversion|sales
  const [variants, setVariants] = useState([]);
  const [violations, setViolations] = useState([]);
  const [currentRenderedImage, setCurrentRenderedImage] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const [format, setFormat] = useState('square');

  // Upload files to backend
  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedFiles = response.data.files.map(file => ({
        ...file,
        src: file.src.startsWith('http') ? file.src : `${API_BASE_URL}${file.src}` // Full URL
      }));

      setAssets((prev) => [...uploadedFiles, ...prev]);
      if (!selectedAssetId && uploadedFiles.length) {
        setSelectedAssetId(uploadedFiles[0].id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Generate layout variants via backend
  async function generateVariants() {
    if (assets.length === 0) {
      alert('Please upload at least one asset first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-variants`, {
        assets,
        tone,
        objective,
        format
      });

      const newVariants = response.data.variants;
      setVariants(newVariants);
      
      // Render first variant
      if (newVariants.length > 0) {
        await renderVariantToCanvas(newVariants[0]);
      }
    } catch (error) {
      console.error('Variant generation error:', error);
      alert('Failed to generate variants: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Render variant to canvas via backend
  async function renderVariantToCanvas(variant) {
    if (!variant) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/render-variant`, {
        variant,
        assets,
        bgRemove,
        tone,
        objective,
        format
      });

      const imageUrl = `${API_BASE_URL}${response.data.imageUrl}`;
      setCurrentRenderedImage(imageUrl);
      setViolations(response.data.violations || []);
      
      // Extract quote from variant if available
      if (variant.generativeLayout?.textOverlay?.quote) {
        setCurrentQuote(variant.generativeLayout.textOverlay.quote);
      } else if (variant.generativeLayout?.textOverlay?.text) {
        setCurrentQuote(variant.generativeLayout.textOverlay.text);
      } else {
        setCurrentQuote(null);
      }

      // Also update local canvas preview
      if (canvasRef.current) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Set canvas size based on format
          let width, height;
          if (format === 'square') {
            width = height = 800;
          } else if (format === 'story') {
            width = 1080;
            height = 1920;
          } else {
            width = 1200;
            height = 628;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Scale image to fit canvas while maintaining aspect ratio
          const scale = Math.min(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Render error:', error);
      alert('Failed to render variant: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Auto-fix contrast via backend
  async function autoFixContrast() {
    if (!currentRenderedImage) return;

    setLoading(true);
    try {
      // Extract the path from the full URL
      const imagePath = currentRenderedImage.replace(API_BASE_URL, '');
      const response = await axios.post(`${API_BASE_URL}/api/auto-fix`, {
        imageUrl: imagePath
      });

      const fixedImageUrl = `${API_BASE_URL}${response.data.imageUrl}`;
      setCurrentRenderedImage(fixedImageUrl);
      setViolations(response.data.violations || []);

      // Update canvas
      if (canvasRef.current) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        };
        img.src = fixedImageUrl;
      }
    } catch (error) {
      console.error('Auto-fix error:', error);
      alert('Failed to auto-fix: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Export current canvas as PNG
  function exportCanvas() {
    if (!currentRenderedImage) {
      alert('No image to export. Please generate and render a variant first.');
      return;
    }

    // Download the rendered image
    const link = document.createElement('a');
    link.download = 'creative-' + Date.now() + '.png';
    link.href = currentRenderedImage;
    link.click();
  }

  // Export for specific platform
  async function exportForPlatform(platform, format) {
    if (!currentRenderedImage) {
      alert('No image to export. Please generate and render a variant first.');
      return;
    }

    setLoading(true);
    try {
      const imagePath = currentRenderedImage.replace(API_BASE_URL, '');
      const response = await axios.post(`${API_BASE_URL}/api/export-platform`, {
        imageUrl: imagePath,
        platform,
        format
      });

      // Download the platform-optimized image
      const link = document.createElement('a');
      link.download = `${platform}-${format}-${Date.now()}.png`;
      link.href = `${API_BASE_URL}${response.data.imageUrl}`;
      link.click();
    } catch (error) {
      console.error('Platform export error:', error);
      alert('Failed to export: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Batch export for multiple platforms
  async function batchExport() {
    if (!currentRenderedImage) {
      alert('No image to export. Please generate and render a variant first.');
      return;
    }

    setLoading(true);
    try {
      const imagePath = currentRenderedImage.replace(API_BASE_URL, '');
      const platforms = [
        { platform: 'meta', format: 'square' },
        { platform: 'meta', format: 'story' },
        { platform: 'google', format: 'banner' },
        { platform: 'amazon', format: 'main' }
      ];

      const response = await axios.post(`${API_BASE_URL}/api/export-batch`, {
        imageUrl: imagePath,
        platforms
      });

      // Download all exported images
      response.data.exports.forEach((exportItem, index) => {
        if (exportItem.success !== false && exportItem.imageUrl) {
          setTimeout(() => {
            const link = document.createElement('a');
            link.download = `${exportItem.platform}-${exportItem.format}-${Date.now()}.png`;
            link.href = `${API_BASE_URL}${exportItem.imageUrl}`;
            link.click();
          }, index * 500); // Stagger downloads
        }
      });

      alert(`Exported ${response.data.successful} of ${response.data.total} formats successfully`);
    } catch (error) {
      console.error('Batch export error:', error);
      alert('Failed to batch export: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Delete asset
  async function removeAsset(asset) {
    try {
      // Extract filename from path
      const filename = asset.src.split('/').pop();
      await axios.delete(`${API_BASE_URL}/api/assets/${filename}`);
      
      setAssets((prev) => prev.filter(a => a.id !== asset.id));
      if (selectedAssetId === asset.id) {
        setSelectedAssetId(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from UI even if backend delete fails
      setAssets((prev) => prev.filter(a => a.id !== asset.id));
      if (selectedAssetId === asset.id) {
        setSelectedAssetId(null);
      }
    }
  }

  // Re-render when controls change
  useEffect(() => {
    if (variants.length > 0) {
      renderVariantToCanvas(variants[0]);
    }
  }, [bgRemove, tone, objective, format]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="col-span-4 bg-white rounded-2xl p-4 shadow">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">AI Creative Builder</h2>
            <p className="text-xs text-slate-500 mt-1">
              Generative Design Engine • AI-Optimized Layouts
            </p>
          </div>

          <label className="block mb-2 text-sm font-medium">Upload Assets</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFiles} 
            className="mb-3 w-full text-sm"
            disabled={loading}
          />

          <div className="mb-4">
            <h3 className="font-medium">Uploaded</h3>
            <div className="mt-2 space-y-2 max-h-48 overflow-auto">
              {assets.map(a => (
                <div key={a.id} className={`flex items-center justify-between p-2 rounded ${selectedAssetId===a.id? 'ring-2 ring-indigo-300':''}`}>
                  <div className="flex items-center gap-2">
                    <img src={a.src} alt={a.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <div className="text-sm font-medium truncate max-w-[120px]">{a.name}</div>
                      <div className="text-xs text-slate-500">{a.type || 'image'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" 
                      onClick={() => setSelectedAssetId(a.id)}
                      disabled={loading}
                    >
                      Use
                    </button>
                    <button 
                      className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100" 
                      onClick={() => removeAsset(a)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {assets.length===0 && <div className="text-xs text-slate-400">No assets yet — upload a product image and a logo.</div>}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium">Smart Editing</h3>
            <label className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                checked={bgRemove} 
                onChange={(e) => setBgRemove(e.target.checked)}
                disabled={loading}
              />
              <span className="text-sm">Background Removal</span>
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                checked={paletteSync} 
                onChange={(e) => setPaletteSync(e.target.checked)}
                disabled={loading}
              />
              <span className="text-sm">Palette Sync (preview only)</span>
            </label>
          </div>

          <div className="mb-4">
            <h3 className="font-medium">AI Style Controls</h3>
            <p className="text-xs text-slate-500 mb-2">The Generative Engine adapts layouts based on these settings</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Brand Tone</label>
                <select 
                  value={tone} 
                  onChange={(e)=>setTone(e.target.value)} 
                  className="p-2 rounded border w-full text-sm"
                  disabled={loading}
                >
                  <option value="neutral">Neutral</option>
                  <option value="bold">Bold</option>
                  <option value="playful">Playful</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Objective</label>
                <select 
                  value={objective} 
                  onChange={(e)=>setObjective(e.target.value)} 
                  className="p-2 rounded border w-full text-sm"
                  disabled={loading}
                >
                  <option value="awareness">Awareness</option>
                  <option value="conversion">Conversion</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs">Format</label>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={()=>setFormat('square')} 
                  className={`px-2 py-1 rounded text-sm ${format==='square'?'bg-indigo-600 text-white':'bg-slate-100'}`}
                  disabled={loading}
                >
                  Square
                </button>
                <button 
                  onClick={()=>setFormat('story')} 
                  className={`px-2 py-1 rounded text-sm ${format==='story'?'bg-indigo-600 text-white':'bg-slate-100'}`}
                  disabled={loading}
                >
                  Story
                </button>
                <button 
                  onClick={()=>setFormat('banner')} 
                  className={`px-2 py-1 rounded text-sm ${format==='banner'?'bg-indigo-600 text-white':'bg-slate-100'}`}
                  disabled={loading}
                >
                  Banner
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2" 
              onClick={generateVariants}
              disabled={loading || assets.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Generate AI Layouts
            </button>
            <button 
              className="w-full px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50" 
              onClick={() => renderVariantToCanvas(variants[0])}
              disabled={loading || variants.length === 0}
            >
              Render Selected
            </button>
            <button 
              className="w-full px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" 
              onClick={exportCanvas}
              disabled={loading || !currentRenderedImage}
            >
              Export PNG
            </button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Violations</h3>
            <div className="mt-2 text-sm">
              {violations.length===0 ? (
                <div className="text-xs text-slate-400">No violations detected.</div>
              ) : (
                <ul className="space-y-1 text-xs text-red-600">
                  {violations.map((v, idx) => (
                    <li key={idx}>• {v.message}</li>
                  ))}
                </ul>
              )}

              {violations.length>0 && violations.some(v => v.type === 'low-contrast') && (
                <div className="mt-2">
                  <button 
                    onClick={autoFixContrast} 
                    className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                    disabled={loading}
                  >
                    Auto-fix contrast
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="col-span-5 bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Live Canvas</div>
            <div className="text-xs text-slate-500">Server-side rendering</div>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="border rounded-lg bg-gray-100 p-3 relative">
              {currentRenderedImage ? (
                <>
                  <img 
                    src={currentRenderedImage} 
                    alt="Rendered creative" 
                    className="rounded-lg shadow-md max-w-full h-auto"
                    style={{ maxHeight: '600px' }}
                  />
                  {currentQuote && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="flex-1">{currentQuote}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <canvas 
                  ref={canvasRef} 
                  className="rounded-lg shadow-md" 
                  style={{maxWidth: '100%', height: 'auto'}} 
                  width={800} 
                  height={800}
                ></canvas>
              )}
            </div>
          </div>

          <div className="w-full mt-4">
            <div className="text-sm font-medium flex items-center gap-2">
              <span>AI-Generated Layouts</span>
              {variants.length > 0 && variants[0]?.template === 'generative' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                  AI-Powered
                </span>
              )}
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {variants.length ? variants.map(v => {
                const quote = v.generativeLayout?.textOverlay?.quote || v.generativeLayout?.textOverlay?.text;
                return (
                  <button 
                    key={v.id} 
                    onClick={() => renderVariantToCanvas(v)} 
                    className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs disabled:opacity-50 flex flex-col items-start"
                    disabled={loading}
                    title={v.description}
                  >
                    <span>Layout {v.layout+1}</span>
                    {quote && (
                      <span className="text-[10px] text-indigo-600 mt-0.5 max-w-[120px] truncate font-medium">
                        "{quote}"
                      </span>
                    )}
                    {v.description && !quote && (
                      <span className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate">
                        {v.description}
                      </span>
                    )}
                  </button>
                );
              }) : (
                <div className="text-xs text-slate-400">No layouts. Click Generate AI Layouts.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Output & inspector */}
        <div className="col-span-3 bg-white rounded-2xl p-4 shadow">
          <h3 className="font-medium mb-2">Inspector</h3>
          <div className="text-sm text-slate-600 mb-3">Selected Asset</div>
          <div className="mb-4">
            {selectedAssetId ? (()=>{
              const sel = assets.find(a=>a.id===selectedAssetId);
              if (!sel) return <div className="text-xs text-slate-400">Select an asset in the left panel.</div>;
              return (
                <div className="flex items-center gap-3">
                  <img src={sel.src} alt={sel.name} className="w-20 h-20 object-cover rounded" />
                  <div>
                    <div className="font-medium text-sm truncate max-w-[100px]">{sel.name}</div>
                    <div className="text-xs text-slate-500">{sel.type}</div>
                  </div>
                </div>
              )
            })() : <div className="text-xs text-slate-400">None selected.</div>}
          </div>

          <div>
            <h4 className="font-medium">Preview Controls</h4>
            <div className="mt-2 text-xs text-slate-500">Toggle features to see changes.</div>
            <div className="mt-3 space-y-2">
              <button 
                onClick={() => { setBgRemove(!bgRemove); }} 
                className="w-full px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                disabled={loading}
              >
                Toggle BG Remove
              </button>
              <button 
                onClick={() => { setPaletteSync(!paletteSync); }} 
                className="w-full px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-50"
                disabled={loading}
              >
                Toggle Palette Sync
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium">Export & Integrations</h4>
            <div className="mt-2 text-xs text-slate-500">
              Export optimized creatives for different platforms.
            </div>
            
            <div className="mt-3 space-y-2">
              <button 
                onClick={exportCanvas} 
                className="w-full px-3 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 text-sm"
                disabled={loading || !currentRenderedImage}
              >
                Download PNG (Original)
              </button>

              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-medium mb-2 text-slate-600">Platform Exports</div>
                
                <div className="space-y-1">
                  <button 
                    onClick={() => exportForPlatform('meta', 'square')} 
                    className="w-full px-2 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 text-xs"
                    disabled={loading || !currentRenderedImage}
                  >
                    Meta Square (1080x1080)
                  </button>
                  
                  <button 
                    onClick={() => exportForPlatform('meta', 'story')} 
                    className="w-full px-2 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 text-xs"
                    disabled={loading || !currentRenderedImage}
                  >
                    Meta Story (1080x1920)
                  </button>
                  
                  <button 
                    onClick={() => exportForPlatform('google', 'banner')} 
                    className="w-full px-2 py-1.5 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 text-xs"
                    disabled={loading || !currentRenderedImage}
                  >
                    Google Banner (728x90)
                  </button>
                  
                  <button 
                    onClick={() => exportForPlatform('amazon', 'main')} 
                    className="w-full px-2 py-1.5 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 text-xs"
                    disabled={loading || !currentRenderedImage}
                  >
                    Amazon Main (1000x1000)
                  </button>
                  
                  <button 
                    onClick={batchExport} 
                    className="w-full px-2 py-1.5 rounded bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 text-xs font-medium"
                    disabled={loading || !currentRenderedImage}
                  >
                    Batch Export All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded p-4 shadow text-sm">
          <strong>Notes:</strong> This is a full-stack application with backend API for image processing.
          Background removal uses simulated logic — integrate with remove.bg API or similar service for production.
          Layout generation and compliance checks run on the server.
        </div>
      </div>
    </div>
  );
}

