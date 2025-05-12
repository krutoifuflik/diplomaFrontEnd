import React from 'react';
import UploadZone from '../Upload/UploadZone';
import VideoPlayer from '../Player/VideoPlayer';
import DetectionSummary from '../DetectionSummary/SummaryPanel';
import { useVideo } from '../../context/VideoContext';

const MainContent: React.FC = () => {
  const { currentVideo } = useVideo();

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {currentVideo ? (
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-2/3 h-full overflow-hidden flex flex-col">
            <VideoPlayer />
          </div>
          <div className="md:w-1/3 h-full overflow-hidden border-l border-gray-200 dark:border-dark-600">
            <DetectionSummary />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <UploadZone />
        </div>
      )}
    </div>
  );
};

export default MainContent;