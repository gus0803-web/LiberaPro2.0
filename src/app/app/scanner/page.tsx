'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Upload, FileText, Download, Printer, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function ScannerPage() {
  const { language } = useTheme();
  const isEs = language === 'es';
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImageSrc(event.target?.result as string);
            setExtractedText('');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const runOCR = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        imageSrc,
        isEs ? 'spa' : 'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      setExtractedText(result.data.text);
    } catch (error) {
      console.error('OCR Error:', error);
      alert(isEs ? 'Hubo un error extrayendo el texto.' : 'There was an error extracting the text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Scanner-LiberaPro-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const printText = () => {
    if (!extractedText) return;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    const title = isEs ? 'Texto Extraído' : 'Extracted Text';
    const content = extractedText.replace(/\n/g, '<br/>');
    printWindow.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial;padding:24px;color:#111;}pre{white-space:pre-wrap;font-size:16px;line-height:1.6;}</style></head><body><h1>${title}</h1><hr/><pre>${content}</pre></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" onPaste={handlePaste}>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {isEs ? 'Escáner OCR' : 'OCR Scanner'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          {isEs
            ? 'Pega o sube la imagen de un documento, planeación o libro y la IA extraerá el texto por ti.'
            : 'Paste or upload an image of a document, lesson plan, or book and AI will extract the text for you.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Input */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {imageSrc ? (
              <div className="space-y-4 w-full">
                <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="Document to scan" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
                  >
                    {isEs ? 'Cambiar Imagen' : 'Change Image'}
                  </button>
                  <button
                    onClick={runOCR}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isEs ? `Escaneando... ${progress}%` : `Scanning... ${progress}%`}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {isEs ? 'Extraer Texto' : 'Extract Text'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-12 h-12 mb-4 text-slate-400" />
                <p className="font-semibold text-slate-700 mb-1">
                  {isEs ? 'Haz clic para subir imagen' : 'Click to upload image'}
                </p>
                <p className="text-sm">
                  {isEs ? 'O presiona Ctrl+V / Cmd+V para pegar' : 'Or press Ctrl+V / Cmd+V to paste'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: OCR Results */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isEs ? 'Texto Extraído' : 'Extracted Text'}
              </h3>
              {extractedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadText}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    title={isEs ? 'Descargar' : 'Download'}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={printText}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    title={isEs ? 'Imprimir' : 'Print'}
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {extractedText ? (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full flex-1 min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>{isEs ? 'El texto aparecerá aquí...' : 'Text will appear here...'}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
