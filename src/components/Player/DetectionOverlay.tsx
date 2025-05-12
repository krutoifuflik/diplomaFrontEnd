import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVideo } from '../../context/VideoContext';

const DetectionOverlay: React.FC = () => {
  const { detections, currentTime, videoRef, seekToDetection } = useVideo();
  const [visibleDetections, setVisibleDetections] = useState<string[]>([]);
  
  // Get video dimensions
  const videoWidth = videoRef.current?.clientWidth || 0;
  const videoHeight = videoRef.current?.clientHeight || 0;
  
  // Time window in seconds for when a detection is visible
  const DETECTION_VISIBILITY_WINDOW = 2;
  
  // Update visible detections based on current time
  useEffect(() => {
    const visible = detections.filter(detection => {
      return (
        currentTime >= detection.timestamp && 
        currentTime <= detection.timestamp + DETECTION_VISIBILITY_WINDOW
      );
    }).map(d => d.id);
    
    setVisibleDetections(visible);
  }, [detections, currentTime]);
  
  const getDetectionColor = (objectType: string) => {
    switch (objectType) {
      case 'person': return 'border-blue-500 bg-blue-500/20';
      case 'gun': return 'border-red-500 bg-red-500/20';
      case 'knife': return 'border-orange-500 bg-orange-500/20';
      case 'drugs': return 'border-purple-500 bg-purple-500/20';
      case 'deadbody': return 'border-gray-500 bg-gray-500/20';
      default: return 'border-yellow-500 bg-yellow-500/20';
    }
  };
  
  const getDetectionLabel = (objectType: string) => {
    switch (objectType) {
      case 'person': return 'Person';
      case 'gun': return 'Weapon - Gun';
      case 'knife': return 'Weapon - Knife';
      case 'drugs': return 'Contraband';
      case 'deadbody': return 'Deceased';
      default: return 'Unknown';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections
        .filter(detection => visibleDetections.includes(detection.id))
        .map(detection => {
          const { x, y, width, height } = detection.boundingBox;
          
          return (
            <motion.div
              key={detection.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute border-2 ${getDetectionColor(detection.objectType)} rounded-md flex flex-col items-center justify-center`}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
            >
              <div className={`absolute -top-7 left-0 px-2 py-0.5 text-xs text-white rounded ${getDetectionColor(detection.objectType).split(' ')[0].replace('border-', 'bg-')}`}>
                {getDetectionLabel(detection.objectType)} ({Math.round(detection.confidence * 100)}%)
              </div>
            </motion.div>
          );
        })}
    </div>
  );
};

export default DetectionOverlay;