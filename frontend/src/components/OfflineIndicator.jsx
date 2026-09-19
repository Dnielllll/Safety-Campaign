import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BANNER_HEIGHT = 44; // px height of the offline banner

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedCampaigns, setCachedCampaigns] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 User went online');
      setIsOnline(true);
      document.body.style.paddingTop = '0px';
    };
    const handleOffline = () => {
      console.log('🔴 User went offline');
      setIsOnline(false);
      document.body.style.paddingTop = `${BANNER_HEIGHT}px`;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Log initial state
    console.log('🌐 Initial online status:', navigator.onLine);

    // Set initial padding if offline
    if (!navigator.onLine) {
      console.log('🔴 Setting offline padding initially');
      document.body.style.paddingTop = `${BANNER_HEIGHT}px`;
    }

    // Load cached campaigns count
    loadCachedCampaigns();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.body.style.paddingTop = '0px';
    };
  }, []);

  const loadCachedCampaigns = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_CACHED_CAMPAIGNS'
      }, [channel.port1]);
      
      channel.port2.onmessage = (event) => {
        setCachedCampaigns(event.data.campaignIds || []);
      };
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    
    try {
      await fetch(window.location.origin + '/manifest.json', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      window.location.reload();
    } catch (error) {
      setIsRetrying(false);
    }
  };

  if (isOnline) {
    return (
      <>
        {/* Online Status Indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </div>

        {/* Offline Campaign Counter */}
        {cachedCampaigns.length > 0 && (
          <div className="fixed bottom-4 left-4 z-50">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Download className="h-3 w-3 mr-1" />
              {cachedCampaigns.length} Campaigns Available Offline
            </Badge>
          </div>
        )}

        {/* DEBUG: Force offline button for testing */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => {
              console.log('🔴 Forcing offline mode for testing');
              setIsOnline(false);
              document.body.style.paddingTop = `${BANNER_HEIGHT}px`;
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-2 py-1 rounded"
          >
            Test Offline
          </button>
        </div>
      </>
    );
  }

  // Offline state
  return (
    <>
      {/* Fixed banner at the very top - body padding pushes everything else down */}
      <div 
        className="fixed top-0 left-0 right-0 bg-orange-500 text-white"
        style={{ zIndex: 9999, height: `${BANNER_HEIGHT}px` }}
      >
        <div className="flex items-center justify-center gap-3 px-4 h-full">
          <WifiOff className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">
            You're offline — Connect to the internet
          </span>
          <button 
            onClick={handleRetryConnection}
            disabled={isRetrying}
            className="ml-2 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking...' : 'Try Again'}
          </button>
        </div>
      </div>

      {/* Offline Campaign Counter */}
      {cachedCampaigns.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Download className="h-3 w-3 mr-1" />
            {cachedCampaigns.length} Campaigns Available Offline
          </Badge>
        </div>
      )}
    </>
  );
}