import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { validateVideo, DEFAULT_CONSTRAINTS, formatFileSize } from '../../utils/validation';
import { useVideo } from '../../context/VideoContext';
import { detectionService } from '../../services/detectionService';
import { v4 as uuidv4 } from 'uuid';

const UploadZone: React.FC = () => {
  const [uploadState, setUploadState] = useState<'idle' | 'validating' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { setCurrentVideo, addToHistory, setDetections } = useVideo();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadState('validating');
    setProgress(10);
    
    try {
      // Validate the video file
      const validationResult = await validateVideo(file);
      
      if (!validationResult.valid) {
        setUploadState('error');
        setErrorMessage(validationResult.errors.join(', '));
        return;
      }
      
      setUploadState('processing');
      setProgress(30);
      
      // Create a URL for the video
      const videoUrl = URL.createObjectURL(file);
      
      // Generate a thumbnail (in a real app, this would be done server-side)
      // For demo, we'll use a placeholder
      const thumbnail = "https://images.pexels.com/photos/247676/pexels-photo-247676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
      
      // Create a video object
      const video = {
        id: uuidv4(),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        url: videoUrl,
        thumbnail,
        uploadDate: new Date(),
        duration: validationResult.metadata?.duration || 0,
        resolution: `${validationResult.metadata?.width}x${validationResult.metadata?.height}`,
        fps: validationResult.metadata?.fps || 0,
        fileSize: file.size,
        tags: ['unclassified']
      };
      
      setProgress(50);
      
      // Simulate processing time
      setTimeout(async () => {
        try {
          // Analyze video for detections
          const detections = await detectionService.analyzeVideo(video);
          
          // Update tags based on detections
          const detectionTypes = Array.from(new Set(detections.map(d => d.objectType)));
          video.tags = detectionTypes;
          
          // Update state
          setCurrentVideo(video);
          addToHistory(video);
          setDetections(detections);
          setUploadState('success');
          setProgress(100);
        } catch (error) {
          setUploadState('error');
          setErrorMessage('Failed to process video');
        }
      }, 2000);
    } catch (error) {
      setUploadState('error');
      setErrorMessage('An unexpected error occurred');
    }
  }, [setCurrentVideo, addToHistory, setDetections]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4']
    },
    maxFiles: 1
  });

  const renderUploadState = () => {
    switch (uploadState) {
      case 'idle':
        return (
          <div className="text-center">
            <motion.div 
              animate={{ scale: isDragActive ? 1.1 : 1 }} 
              className="flex justify-center mb-4"
            >
              <Upload className="h-16 w-16 text-primary-500" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Upload Security Video</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Drag & drop or click to select an MP4 video file
            </p>
            <div className="bg-gray-100 dark:bg-dark-700 p-3 rounded-md">
              <h4 className="font-medium mb-2">Requirements:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Duration: ≤ 5 minutes</li>
                <li>• FPS: ≤ 30</li>
                <li>• Format: MP4</li>
              </ul>
            </div>
          </div>
        );
        
      case 'validating':
        return (
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <AlertCircle className="h-16 w-16 text-primary-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Validating Video</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Checking duration and frame rate...
            </p>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5 mb-4">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        );
        
      case 'processing':
        return (
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="h-16 w-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Processing Video</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Analyzing footage for object detection...
            </p>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2.5 mb-4">
              <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Upload Successful</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your video has been processed and is ready for review.
            </p>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <XCircle className="h-16 w-16 text-danger mx-auto" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Upload Failed</h3>
            <p className="text-danger mb-4">{errorMessage}</p>
            <button
              onClick={() => setUploadState('idle')}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl w-full mx-auto"
    >
      <div
        {...(uploadState === 'idle' ? getRootProps() : {})}
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 
          isDragReject ? 'border-danger bg-danger-50 dark:bg-danger-900/10' : 
          'border-gray-300 dark:border-dark-500'
        } transition-colors`}
      >
        {uploadState === 'idle' && <input {...getInputProps()} />}
        {renderUploadState()}
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-3">What happens after upload?</h4>
        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
          <li>Video is validated against duration and FPS requirements</li>
          <li>Object detection algorithms identify items of interest (weapons, drugs, etc.)</li>
          <li>Timestamps are generated for quick navigation to important moments</li>
          <li>Analysis data is presented in an interactive summary panel</li>
        </ol>
      </div>
    </motion.div>
  );
};

export default UploadZone;