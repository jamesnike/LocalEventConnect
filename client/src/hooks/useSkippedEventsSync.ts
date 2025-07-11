import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

interface SkippedEventSync {
  eventId: number;
  timestamp: number;
}

class SkippedEventsSyncManager {
  private pendingSkips: SkippedEventSync[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isAuthenticated = false;

  start(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    if (this.syncInterval) return; // Already running

    // Sync every 5 seconds
    this.syncInterval = setInterval(() => {
      this.syncPendingSkips();
    }, 5000);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  addSkippedEvent(eventId: number) {
    if (!this.isAuthenticated) return;
    
    // Check if this event is already in pending list
    const existingIndex = this.pendingSkips.findIndex(skip => skip.eventId === eventId);
    if (existingIndex !== -1) {
      // Update timestamp
      this.pendingSkips[existingIndex].timestamp = Date.now();
    } else {
      // Add new skip
      this.pendingSkips.push({
        eventId,
        timestamp: Date.now()
      });
    }
  }

  private async syncPendingSkips() {
    if (!this.isAuthenticated || this.pendingSkips.length === 0) return;

    const skipsToSync = [...this.pendingSkips];
    console.log(`Syncing ${skipsToSync.length} skipped events to database`);

    try {
      // Send all pending skips in batch
      const promises = skipsToSync.map(skip => 
        fetch(`/api/events/${skip.eventId}/skip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const results = await Promise.allSettled(promises);
      
      // Remove successfully synced skips
      const successfulSkips = results.map((result, index) => ({
        skip: skipsToSync[index],
        success: result.status === 'fulfilled' && 
                 (result.value as Response).ok
      }));

      // Keep only failed skips for retry
      this.pendingSkips = this.pendingSkips.filter(skip => {
        const syncResult = successfulSkips.find(s => s.skip.eventId === skip.eventId);
        return syncResult && !syncResult.success;
      });

      const syncedCount = successfulSkips.filter(s => s.success).length;
      const failedCount = skipsToSync.length - syncedCount;

      console.log(`Background sync: ${syncedCount} skipped events synced, ${failedCount} failed`);

    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  // Force sync all pending skips immediately
  async forceSyncAll() {
    if (this.pendingSkips.length > 0) {
      await this.syncPendingSkips();
    }
  }
}

// Global instance
const syncManager = new SkippedEventsSyncManager();

export function useSkippedEventsSync() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const prevAuthStatus = useRef(isAuthenticated);

  useEffect(() => {
    // Start sync when authenticated
    if (isAuthenticated && !prevAuthStatus.current) {
      syncManager.start(isAuthenticated);
    }

    // Stop sync when unauthenticated
    if (!isAuthenticated && prevAuthStatus.current) {
      syncManager.stop();
    }

    prevAuthStatus.current = isAuthenticated;

    // Cleanup on unmount
    return () => {
      syncManager.stop();
    };
  }, [isAuthenticated]);

  // Force sync before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncManager.forceSyncAll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    addSkippedEvent: (eventId: number) => syncManager.addSkippedEvent(eventId),
    forceSyncAll: () => syncManager.forceSyncAll()
  };
}