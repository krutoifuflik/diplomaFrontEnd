import React, { useState } from 'react';
import { Clock, Filter, Search, X } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { motion } from 'framer-motion';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onTagSelect }) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
        <Filter className="h-4 w-4 mr-1" />
        Filter by tag
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-500'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { videoHistory, currentVideo, setCurrentVideo, removeFromHistory } = useVideo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags from video history
  const allTags = Array.from(new Set(videoHistory.flatMap(video => video.tags)));
  
  // Filter videos based on search and tags
  const filteredVideos = videoHistory.filter(video => {
    const matchesSearch = searchTerm === '' || video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => video.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
  
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="w-64 border-r border-gray-200 dark:border-dark-600 h-full overflow-hidden flex flex-col bg-gray-50 dark:bg-dark-800">
      <div className="p-4 border-b border-gray-200 dark:border-dark-600">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary-500" />
          Video History
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        {allTags.length > 0 && (
          <TagFilter 
            tags={allTags} 
            selectedTags={selectedTags} 
            onTagSelect={handleTagSelect} 
          />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic text-sm">
            No videos in history
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredVideos.map(video => (
              <motion.li 
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-md overflow-hidden cursor-pointer group ${
                  currentVideo?.id === video.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div 
                  onClick={() => setCurrentVideo(video)}
                  className="flex flex-col"
                >
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-24 object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {video.resolution} • {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-dark-700">
                    <h3 className="text-sm font-medium line-clamp-1">{video.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {video.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-dark-600 rounded">
                          {tag}
                        </span>
                      ))}
                      {video.tags.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-dark-600 rounded">
                          +{video.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromHistory(video.id)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from history"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;