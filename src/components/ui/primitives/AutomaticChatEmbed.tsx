'use client';

import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

export default function AutomaticChatEmbed() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const restoreChatbot = () => {
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 group animate-pulse"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            !
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-[420px] h-[620px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">UniqueIIT Research Center Assistant</h3>
                <p className="text-xs text-blue-100">Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <button
                  onClick={minimizeChatbot}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Minimize chat"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={isMinimized ? restoreChatbot : toggleChatbot}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={isMinimized ? "Restore chat" : "Close chat"}
              >
                {isMinimized ? (
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                ) : (
                  <XMarkIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Iframe Container */}
              <div className="w-full h-[560px] rounded-b-2xl overflow-hidden">
                <iframe
                  src="https://automatic.chat/chats/cmes7kmez003yeep64bbdfq2x"
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    borderBottomLeftRadius: '16px',
                    borderBottomRightRadius: '16px'
                  }}
                  title="UniqueIIT Research Center Assistant"
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
