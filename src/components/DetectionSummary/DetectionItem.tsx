import React from 'react';
import { motion } from 'framer-motion';
import { Video, AlertTriangle } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { formatTimestamp } from '../../utils/validation';
import { Detection } from '../../types';

interface DetectionItemProps {
  detection: Detection;
  index: number;
}

const DetectionItem: React.FC<DetectionItemProps> = ({ detection, index }) => {
  const { seekToDetection, currentTime } = useVideo();
  
  const getObjectTypeColor = (objectType: string): string => {
    switch(objectType) {
      case 'person':
        return 'bg-blue-500';
      case 'gun':
        return 'bg-red-500';
      case 'knife':
        return 'bg-orange-500';
      case 'drugs':
        return 'bg-purple-500';
      case 'deadbody':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  const getObjectTypeIcon = (objectType: string) => {
    if (objectType === 'gun' || objectType === 'knife') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };
  
  const isActive = Math.abs(currentTime - detection.timestamp) < 1;
  
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-white dark:bg-dark-700 rounded-md p-3 shadow-sm border ${
        isActive ? 'border-primary-500' : 'border-transparent'
      } hover:border-primary-300 transition-colors cursor-pointer`}
      onClick={() => seekToDetection(detection.id)}
    >
      <div className="flex items-start">
        <div 
          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md mr-3 text-white ${getObjectTypeColor(detection.objectType)}`}
        >
          {getObjectTypeIcon(detection.objectType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h4 className="font-medium text-sm capitalize">
                {detection.objectType}
              </h4>
              <span className="ml-2 text-xs bg-gray-200 dark:bg-dark-600 px-1.5 py-0.5 rounded">
                {Math.round(detection.confidence * 100)}%
              </span>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                seekToDetection(detection.id);
              }}
              className="flex items-center text-xs text-primary-500 hover:text-primary-600"
            >
              <Video className="h-3 w-3 mr-1" />
              <span>{formatTimestamp(detection.timestamp)}</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {detection.description}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

export default DetectionItem;