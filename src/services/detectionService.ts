import { Detection, Video } from '../types';

// Mock detection data generator
const generateMockDetections = (video: Video): Detection[] => {
  const detectionTypes = ['person', 'gun', 'knife', 'drugs', 'deadbody', 'other'] as const;
  const detectionCount = Math.floor(Math.random() * 10) + 5; // 5-15 detections
  const detections: Detection[] = [];

  for (let i = 0; i < detectionCount; i++) {
    const objectType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    const timestamp = Math.random() * video.duration;
    
    let description = '';
    switch (objectType) {
      case 'person':
        description = 'Person detected in frame';
        break;
      case 'gun':
        description = 'Black pistol held in right hand';
        break;
      case 'knife':
        description = 'Kitchen knife visible on table';
        break;
      case 'drugs':
        description = 'White powder substance in clear bag';
        break;
      case 'deadbody':
        description = 'Unresponsive person on floor';
        break;
      default:
        description = 'Unknown object detected';
    }

    detections.push({
      id: `${objectType}-${i + 1}`,
      objectType: objectType,
      timestamp,
      boundingBox: {
        x: Math.random() * 0.8,
        y: Math.random() * 0.8,
        width: Math.random() * 0.3 + 0.1,
        height: Math.random() * 0.3 + 0.1
      },
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      description
    });
  }

  // Sort by timestamp
  return detections.sort((a, b) => a.timestamp - b.timestamp);
};

export const detectionService = {
  analyzeVideo: async (video: Video): Promise<Detection[]> => {
    // Simulate API call with processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return generateMockDetections(video);
  },
  
  getDetectionJSON: (detections: Detection[]): string => {
    return JSON.stringify(detections, null, 2);
  },
  
  downloadDetectionData: (detections: Detection[], videoTitle: string): void => {
    const jsonString = detectionService.getDetectionJSON(detections);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle.replace(/\s+/g, '_')}_detections.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};