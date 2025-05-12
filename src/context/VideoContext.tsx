import React, { createContext, useContext, useState, useRef } from 'react';
import { Detection, Video } from '../types';

interface VideoContextType {
  currentVideo: Video | null;
  videoHistory: Video[];
  detections: Detection[];
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  currentTime: number;
  setCurrentVideo: (video: Video | null) => void;
  addToHistory: (video: Video) => void;
  removeFromHistory: (id: string) => void;
  setDetections: (detections: Detection[]) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekToTime: (time: number) => void;
  seekToDetection: (detectionId: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [videoHistory, setVideoHistory] = useState<Video[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const addToHistory = (video: Video) => {
    setVideoHistory(prev => {
      // Check if video already exists in history
      const exists = prev.some(v => v.id === video.id);
      if (exists) return prev;
      
      // Add to beginning of history
      return [video, ...prev];
    });
  };

  const removeFromHistory = (id: string) => {
    setVideoHistory(prev => prev.filter(video => video.id !== id));
    if (currentVideo?.id === id) {
      setCurrentVideo(null);
      setDetections([]);
    }
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekToDetection = (detectionId: string) => {
    const detection = detections.find(d => d.id === detectionId);
    if (detection && videoRef.current) {
      seekToTime(detection.timestamp);
      if (!isPlaying) {
        playVideo();
      }
    }
  };

  return (
    <VideoContext.Provider 
      value={{
        currentVideo,
        videoHistory,
        detections,
        videoRef,
        isPlaying,
        currentTime,
        setCurrentVideo,
        addToHistory,
        removeFromHistory,
        setDetections,
        playVideo,
        pauseVideo,
        seekToTime,
        seekToDetection
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};