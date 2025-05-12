import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import MainContent from '../components/Layout/MainContent';
import { VideoProvider } from '../context/VideoContext';
import { LoginModal } from '../components/Auth/LoginModal';

const Dashboard: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <VideoProvider>
      <div className="flex flex-col h-screen">
        <Header onLoginClick={() => setShowLoginModal(true)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </VideoProvider>
  );
};

export default Dashboard;