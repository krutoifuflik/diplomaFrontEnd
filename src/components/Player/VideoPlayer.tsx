import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVideo } from '../../context/VideoContext';
import { formatDuration } from '../../utils/validation';
import DetectionOverlay from './DetectionOverlay';

const VideoPlayer: React.FC = () => {
  const { 
    currentVideo, 
    videoRef, 
    isPlaying, 
    currentTime, 
    playVideo, 
    pauseVideo, 
    seekToTime 
  } = useVideo();
  
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle video loading
  useEffect(() => {
    if (!videoRef.current) return;
    
    const handleLoadedData = () => {
      setIsLoading(false);
      if (isPlaying) {
        videoRef.current?.play().catch(() => pauseVideo());
      }
    };
    
    videoRef.current.addEventListener('loadeddata', handleLoadedData);
    return () => {
      videoRef.current?.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoRef, isPlaying, pauseVideo]);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const handleMouseMove = () => resetTimeout();
    
    document.addEventListener('mousemove', handleMouseMove);
    resetTimeout();
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying]);
  
  // Update progress when currentTime changes
  useEffect(() => {
    if (currentVideo && currentVideo.duration > 0) {
      setProgress((currentTime / currentVideo.duration) * 100);
    }
  }, [currentTime, currentVideo]);
  
  // Update time tracking
  useEffect(() => {
    if (!videoRef.current) return;
    
    const updateTime = () => seekToTime(videoRef.current?.currentTime || 0);
    
    videoRef.current.addEventListener('timeupdate', updateTime);
    
    return () => {
      videoRef.current?.removeEventListener('timeupdate', updateTime);
    };
  }, [videoRef, seekToTime]);
  
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        pauseVideo();
      } else {
        await videoRef.current?.play();
        playVideo();
      }
    } catch (error) {
      console.error('Error playing video:', error);
      pauseVideo();
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !currentVideo) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * currentVideo.duration;
    seekToTime(newTime);
    videoRef.current.currentTime = newTime;
  };
  
  const handleSeekClickTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !currentVideo) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = position * currentVideo.duration;
    seekToTime(newTime);
    videoRef.current.currentTime = newTime;
  };
  
  const handleDownload = () => {
    if (!currentVideo) return;
    
    const a = document.createElement('a');
    a.href = currentVideo.url;
    a.download = currentVideo.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!currentVideo) return null;

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden"
        onClick={handlePlayPause}
      >
        <video
          ref={videoRef}
          src={currentVideo.url}
          className="max-h-full max-w-full"
          onEnded={() => pauseVideo()}
          playsInline
        />
        
        <DetectionOverlay />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        )}
        
        {!isPlaying && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute"
          >
            <Play className="h-16 w-16 text-white opacity-80" />
          </motion.div>
        )}
      </div>
      
      <div 
        className={`relative bg-dark-800 px-4 py-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="relative h-1 mb-3 cursor-pointer" onClick={handleSeekClickTrack}>
          <div className="absolute top-0 left-0 h-1 w-full bg-gray-600 rounded"></div>
          <div 
            className="absolute top-0 left-0 h-1 bg-primary-500 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePlayPause}
              className="text-white hover:text-primary-500 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-primary-500 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-primary-500"
              />
            </div>
            
            <div className="text-sm text-white">
              {formatDuration(currentTime)} / {formatDuration(currentVideo.duration)}
            </div>
          </div>
          
          <div>
            <button 
              onClick={handleDownload}
              className="text-white hover:text-primary-500 transition-colors"
              aria-label="Download video"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute opacity-0 top-0 left-0 w-full cursor-pointer h-1"
          style={{ zIndex: 10 }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;