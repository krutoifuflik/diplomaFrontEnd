import React, { useState } from 'react';
import { Download, Filter, ArrowUpDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVideo } from '../../context/VideoContext';
import { formatTimestamp } from '../../utils/validation';
import { detectionService } from '../../services/detectionService';
import DetectionItem from './DetectionItem';

type SortBy = 'timestamp' | 'type' | 'confidence';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'person' | 'gun' | 'knife' | 'drugs' | 'deadbody' | 'other';

const SummaryPanel: React.FC = () => {
  const { detections, currentVideo } = useVideo();
  const [sortBy, setSortBy] = useState<SortBy>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // Get unique detection types for filter
  const detectionTypes = Array.from(new Set(detections.map(d => d.objectType)));
  
  // Filter and sort detections
  const filteredDetections = detections.filter(detection => 
    filterType === 'all' || detection.objectType === filterType
  );
  
  const sortedDetections = [...filteredDetections].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = a.timestamp - b.timestamp;
        break;
      case 'type':
        comparison = a.objectType.localeCompare(b.objectType);
        break;
      case 'confidence':
        comparison = b.confidence - a.confidence;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const handleDownloadJSON = () => {
    if (!currentVideo) return;
    detectionService.downloadDetectionData(detections, currentVideo.title);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-800">
      <div className="border-b border-gray-200 dark:border-dark-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detection Summary</h2>
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1 text-sm text-primary-500 hover:text-primary-600"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON</span>
          </button>
        </div>
        
        {detections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-1 text-sm bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded">
              <Filter className="h-3 w-3" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="bg-transparent border-none focus:ring-0 text-sm p-0"
              >
                <option value="all">All Types</option>
                {detectionTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-1 text-sm bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-transparent border-none focus:ring-0 text-sm p-0"
              >
                <option value="timestamp">Time</option>
                <option value="type">Type</option>
                <option value="confidence">Confidence</option>
              </select>
              <button onClick={toggleSortOrder}>
                <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}
        
        <div className="text-sm">
          <p>
            <span className="font-medium">Video:</span> {currentVideo?.title}
          </p>
          <p>
            <span className="font-medium">Duration:</span> {formatTimestamp(currentVideo?.duration || 0)}
          </p>
          <p>
            <span className="font-medium">Total Detections:</span> {detections.length}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
            <div className="mb-4">
              <Filter className="h-12 w-12 opacity-30" />
            </div>
            <p className="text-lg font-medium mb-2">No Detections Found</p>
            <p className="text-sm">
              No objects were detected in this video. Try uploading a different video or adjusting detection settings.
            </p>
          </div>
        ) : (
          <motion.ul 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {sortedDetections.map((detection, index) => (
              <DetectionItem key={detection.id} detection={detection} index={index} />
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;