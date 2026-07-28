import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Brain, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MedicalReports = () => {
  const { backendUrl, token } = useContext(AppContext);
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const getAbnormalStatus = () => {
    if (!analysis || !analysis.abnormal_levels) return false;
    if (Array.isArray(analysis.abnormal_levels)) {
      if (analysis.abnormal_levels.length === 0) return false;
      if (analysis.abnormal_levels.length === 1 && String(analysis.abnormal_levels[0]).toLowerCase() === 'none') return false;
      return true;
    }
    if (typeof analysis.abnormal_levels === 'object' && analysis.abnormal_levels !== null) {
      return Object.keys(analysis.abnormal_levels).length > 0;
    }
    const str = String(analysis.abnormal_levels).trim().toLowerCase();
    return str !== '' && str !== 'none';
  };

  const isAbnormal = getAbnormalStatus();

  const getSpecialistLink = () => {
    if (!analysis || !analysis.recommended_specialist) return '/doctors';
    const recSpec = String(analysis.recommended_specialist).toLowerCase();
    const availableSpecialties = [
      'general physician',
      'gynecologist',
      'dermatologist',
      'pediatricians',
      'neurologist',
      'gastroenterologist'
    ];
    const matched = availableSpecialties.find(spec => recSpec.includes(spec));
    if (matched) {
      const casingMap = {
        'general physician': 'General physician',
        'gynecologist': 'Gynecologist',
        'dermatologist': 'Dermatologist',
        'pediatricians': 'Pediatricians',
        'neurologist': 'Neurologist',
        'gastroenterologist': 'Gastroenterologist'
      };
      return `/doctors/${casingMap[matched]}`;
    }
    return '/doctors';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setAnalysis(null);
    } else {
      toast.error("Unsupported file format! Please upload a PDF or an Image (PNG/JPG).");
    }
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;
    if (!token) {
      toast.warning("Please log in to analyze your medical reports.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Uploading document to secure servers...");
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step transition simulations for visual flair
      setTimeout(() => setLoadingStep("Extracting report text & data..."), 1200);
      setTimeout(() => setLoadingStep("Analyzing metrics with AI Clinical Engines..."), 2500);

      const { data } = await axios.post(
        `${backendUrl}/api/user/summarize-report`,
        formData,
        { headers: { token, 'Content-Type': 'multipart/form-data' } }
      );

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Analysis Completed Successfully!");
      } else {
        toast.error(data.message || "Failed to analyze document.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred during parsing.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const clearFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className='min-h-[80vh] py-6 px-4 md:px-0 font-sans'>
      
      {/* Header */}
      <div className='flex flex-col items-center text-center max-w-2xl mx-auto mb-10'>
        <div className='bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 mb-3'>
          <Brain size={14} /> AI Powered Diagnostic Support
        </div>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 tracking-tight'>AI Medical Report Summarizer</h1>
        <p className='text-gray-500 mt-2.5 text-sm md:text-base leading-relaxed'>
          Upload blood panels, lab metrics, or prescriptions. Our multi-modal AI extracts data, explains terminology, flags abnormal values, and routes you to the correct doctor.
        </p>
      </div>

      {!analysis && !isLoading ? (
        /* Upload Container */
        <div className='max-w-xl mx-auto'>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : file 
                ? 'border-green-400 bg-green-50/10' 
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50/50'
            }`}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleChange}
              accept=".pdf, .png, .jpg, .jpeg"
            />
            
            <UploadCloud size={48} className={file ? 'text-green-500' : dragActive ? 'text-primary' : 'text-gray-400'} />
            
            <label htmlFor="file-upload" className="cursor-pointer mt-4 flex flex-col items-center">
              <span className="text-sm font-semibold text-primary hover:underline">
                {file ? 'Change selected file' : 'Click to upload a document'}
              </span>
              <span className="text-xs text-gray-400 mt-1">or drag and drop here</span>
            </label>
            
            <p className="text-[11px] text-gray-400 mt-4">Supported formats: PDF, PNG, JPG, JPEG (Max 10MB)</p>

            {file && (
              <div className='mt-6 p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3 w-full shadow-sm max-w-sm'>
                <FileText className='text-primary shrink-0' size={20} />
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold text-gray-700 truncate'>{file.name}</p>
                  <p className='text-[10px] text-gray-400'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className='flex gap-3 mt-6'>
              <button 
                onClick={clearFile}
                className='flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all'
              >
                Clear File
              </button>
              <button 
                onClick={uploadAndAnalyze}
                className='flex-[2] py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md shadow-primary/20 transition-all'
              >
                Analyze Report
              </button>
            </div>
          )}
        </div>
      ) : isLoading ? (
        /* Loading Area */
        <div className='flex flex-col items-center justify-center py-20 max-w-md mx-auto'>
          <div className='relative flex items-center justify-center mb-6'>
            <div className='w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin'></div>
            <Brain className='absolute text-primary animate-pulse' size={24} />
          </div>
          <p className='text-sm font-semibold text-gray-700 animate-pulse'>{loadingStep}</p>
          <p className='text-xs text-gray-400 mt-2 text-center'>This may take up to a few seconds as the AI reads the layout.</p>
        </div>
      ) : (
        /* Result Screen: Split Layout */
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start'>
          
          {/* Left panel: File detail & actions */}
          <div className='lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4'>
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-150'>
              <FileText className='text-primary shrink-0' size={24} />
              <div className='min-w-0'>
                <p className='text-xs font-bold text-gray-700 truncate'>{file?.name}</p>
                <p className='text-[10px] text-gray-400'>{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            <div className='border-t pt-4 flex flex-col gap-2.5'>
              <button 
                onClick={clearFile}
                className='w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-95 shadow-md shadow-primary/20 transition-all'
              >
                Upload New Report
              </button>
            </div>
          </div>

          {/* Right panel: AI analysis details */}
          <div className='lg:col-span-8 flex flex-col gap-6'>
            
            {/* Key Findings Card */}
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
              <div className='flex items-center gap-2 mb-3 text-primary'>
                <CheckCircle size={20} />
                <h3 className='font-bold text-gray-800'>Key Clinical Findings</h3>
              </div>
              <p className='text-sm text-gray-600 leading-relaxed'>{analysis?.key_findings}</p>
            </div>

            {/* Abnormal Levels / Warnings Card */}
            <div className={`p-6 rounded-2xl border shadow-sm ${
              isAbnormal
                ? 'bg-red-50/30 border-red-100'
                : 'bg-green-50/20 border-green-100'
            }`}>
              <div className='flex items-center gap-2 mb-3'>
                {isAbnormal ? (
                  <>
                    <AlertTriangle className='text-red-500' size={20} />
                    <h3 className='font-bold text-red-800'>Abnormal Levels Detected</h3>
                  </>
                ) : (
                  <>
                    <CheckCircle className='text-green-500' size={20} />
                    <h3 className='font-bold text-green-800'>No Abnormal Metrics Flagged</h3>
                  </>
                )}
              </div>
              <div className={`text-sm leading-relaxed ${
                isAbnormal
                  ? 'text-red-700 font-medium'
                  : 'text-green-700'
              }`}>
                {Array.isArray(analysis?.abnormal_levels) ? (
                  <ul className='list-disc pl-5 flex flex-col gap-2'>
                    {analysis.abnormal_levels.map((item, idx) => {
                      if (typeof item === 'object' && item !== null) {
                        return (
                          <li key={idx} className='text-sm list-none border-b border-red-100/20 pb-2 last:border-0 last:pb-0'>
                            <span className='font-bold text-red-800'>{item.parameter || item.name || 'Metric'}: </span>
                            <span className='text-red-700 font-medium'>{item.value || item.result} </span>
                            {item.ref_range && <span className='text-xs text-gray-500'>(Range: {item.ref_range}) </span>}
                            {item.note && <span className='ml-1 text-[10px] font-bold text-red-600 bg-red-100/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider'>{item.note}</span>}
                          </li>
                        );
                      }
                      return (
                        <li key={idx} className='text-sm'>{String(item)}</li>
                      );
                    })}
                  </ul>
                ) : typeof analysis?.abnormal_levels === 'object' && analysis?.abnormal_levels !== null ? (
                  <div className='flex flex-col gap-2'>
                    {Object.entries(analysis.abnormal_levels).map(([key, value], idx) => (
                      <div key={idx} className='text-sm border-b border-red-100/20 pb-1 last:border-0 last:pb-0'>
                        <span className='font-bold text-red-800'>{key}: </span>
                        <span className='text-red-700'>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  analysis?.abnormal_levels
                )}
              </div>
            </div>

            {/* Terminology Explanation Card */}
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
              <h3 className='font-bold text-gray-800 mb-4'>Medical Jargon Explained</h3>
              <div className='text-sm text-gray-600 leading-relaxed'>
                {Array.isArray(analysis?.terms_explained) ? (
                  <ul className='list-disc pl-5 flex flex-col gap-2'>
                    {analysis.terms_explained.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : typeof analysis?.terms_explained === 'object' && analysis?.terms_explained !== null ? (
                  <div className='flex flex-col gap-3'>
                    {Object.entries(analysis.terms_explained).map(([key, value], idx) => (
                      <div key={idx} className='border-b border-gray-50 pb-2 last:border-0 last:pb-0'>
                        <span className='font-bold text-gray-700'>{key}: </span>
                        <span className='text-gray-600'>{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='whitespace-pre-line'>{analysis?.terms_explained}</div>
                )}
              </div>
            </div>

            {/* Verified Clinical References Card (RAG Citations) */}
            {analysis?.clinical_references && analysis.clinical_references.length > 0 && (
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <h3 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
                  <Brain className='text-[#5f6FFF]' size={20} /> Verified Clinical References & Citations
                </h3>
                <div className='flex flex-col gap-4'>
                  {analysis.clinical_references.map((ref, idx) => (
                    <div key={idx} className='p-4 bg-gray-50/50 border border-gray-100 rounded-xl flex flex-col gap-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='font-bold text-gray-800 text-sm'>{ref.parameter}</span>
                        {ref.source_url && (
                          <a 
                            href={ref.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className='text-primary hover:underline text-xs flex items-center gap-1 font-semibold'
                          >
                            {ref.source_name || "Official Source"} <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className='text-xs text-gray-500'>
                        <span className='font-semibold text-gray-700'>Reference Range: </span>{ref.ref_range}
                      </div>
                      <div className='text-xs text-gray-600 leading-relaxed'>
                        <span className='font-semibold text-gray-700'>Significance: </span>{ref.significance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialist Recommendation Router (CORE PRODUCT LINK) */}
            <div className='bg-gradient-to-r from-[#5f6FFF]/10 to-[#5f6FFF]/5 p-6 rounded-2xl border border-[#5f6FFF]/20 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex-1'>
                <p className='text-xs text-primary font-bold tracking-wider uppercase'>Recommended Specialist</p>
                <h4 className='font-extrabold text-gray-800 text-lg mt-0.5'>{analysis?.recommended_specialist}</h4>
              </div>
              {analysis?.recommended_specialist && (
                <Link 
                  to={getSpecialistLink()}
                  className='shrink-0 bg-primary text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2'
                >
                  Book Specialist <ArrowRight size={16} />
                </Link>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MedicalReports;
