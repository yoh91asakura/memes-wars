import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SyncStatus, SyncConflict, ConflictResolution } from '../../../models/SyncStatus';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Progress } from '../../atoms/Progress';
import { Badge } from '../../atoms/Badge';
import { Tooltip } from '../../atoms/Tooltip';
import { Modal } from '../../atoms/Modal';
import './SyncIndicator.css';

interface SyncIndicatorProps {
  syncStatus: SyncStatus;
  onSyncTrigger?: () => Promise<void>;
  onConflictResolve?: (conflict: SyncConflict, resolution: ConflictResolution) => Promise<void>;
  onRetrySync?: () => Promise<void>;
  onClearOfflineData?: () => Promise<void>;
  showDetailedStatus?: boolean;
  autoSync?: boolean;
  autoSyncInterval?: number;
  variant?: 'compact' | 'detailed' | 'floating';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  testId?: string;
}

type DetailModal = 'none' | 'status' | 'conflicts' | 'offline-data';

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  syncStatus,
  onSyncTrigger,
  onConflictResolve,
  onRetrySync,
  onClearOfflineData,
  showDetailedStatus = false,
  autoSync = false,
  autoSyncInterval = 30000, // 30 seconds
  variant = 'compact',
  position = 'bottom-right',
  className = '',
  testId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailModal, setDetailModal] = useState<DetailModal>('none');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [autoSyncTimer, setAutoSyncTimer] = useState<NodeJS.Timeout | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto sync setup
  useEffect(() => {
    if (autoSync && isOnline && onSyncTrigger && syncStatus.status === 'idle') {
      const timer = setInterval(() => {
        if (syncStatus.pendingChanges > 0) {
          onSyncTrigger();
        }
      }, autoSyncInterval);

      setAutoSyncTimer(timer);
      return () => clearInterval(timer);
    } else if (autoSyncTimer) {
      clearInterval(autoSyncTimer);
      setAutoSyncTimer(null);
    }
  }, [autoSync, isOnline, onSyncTrigger, syncStatus.status, syncStatus.pendingChanges, autoSyncInterval, autoSyncTimer]);

  // Sync status display logic
  const statusInfo = useMemo(() => {
    const { status, pendingChanges, conflicts, currentOperation, lastSync, lastError } = syncStatus;

    switch (status) {
      case 'idle':
        if (conflicts.length > 0) {
          return {
            icon: 'alert-triangle',
            color: 'warning',
            text: `${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''}`,
            description: 'Requires attention'
          };
        }
        if (pendingChanges > 0) {
          return {
            icon: isOnline ? 'cloud-upload' : 'wifi-off',
            color: isOnline ? 'warning' : 'muted',
            text: `${pendingChanges} pending`,
            description: isOnline ? 'Ready to sync' : 'Will sync when online'
          };
        }
        if (lastSync) {
          return {
            icon: 'check-circle',
            color: 'success',
            text: 'Synced',
            description: `Last: ${formatRelativeTime(lastSync)}`
          };
        }
        return {
          icon: 'cloud',
          color: 'muted',
          text: 'Ready',
          description: 'No pending changes'
        };

      case 'syncing':
        return {
          icon: 'refresh-cw',
          color: 'primary',
          text: 'Syncing',
          description: currentOperation?.currentItem || 'Synchronizing data...',
          progress: currentOperation?.progress
        };

      case 'error':
        return {
          icon: 'alert-circle',
          color: 'error',
          text: 'Sync failed',
          description: lastError || 'Unknown error occurred'
        };

      default:
        return {
          icon: 'help-circle',
          color: 'muted',
          text: 'Unknown',
          description: 'Unknown sync status'
        };
    }
  }, [syncStatus, isOnline]);

  // Handle sync trigger
  const handleSyncTrigger = useCallback(async () => {
    if (!onSyncTrigger || !isOnline) return;
    
    setLastSyncAttempt(new Date());
    try {
      await onSyncTrigger();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [onSyncTrigger, isOnline]);

  // Handle conflict resolution
  const handleConflictResolve = useCallback(async (conflict: SyncConflict, resolution: ConflictResolution) => {
    if (!onConflictResolve) return;
    
    try {
      await onConflictResolve(conflict, resolution);
    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  }, [onConflictResolve]);

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Render compact version
  if (variant === 'compact') {
    return (
      <Tooltip 
        content={`${statusInfo.text}${statusInfo.description ? ` • ${statusInfo.description}` : ''}`}
      >
        <button
          className={`sync-indicator sync-indicator--compact ${className}`.trim()}
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={testId}
          aria-label="Sync status"
        >
          <div className={`sync-indicator__icon sync-indicator__icon--${statusInfo.color}`}>
            <Icon 
              name={statusInfo.icon} 
              size="sm" 
              className={syncStatus.status === 'syncing' ? 'sync-indicator__icon--spinning' : ''}
            />
          </div>
          
          {syncStatus.pendingChanges > 0 && (
            <div className="sync-indicator__badge">
              {syncStatus.pendingChanges}
            </div>
          )}
          
          {!isOnline && (
            <div className="sync-indicator__offline-indicator">
              <Icon name="wifi-off" size="xs" />
            </div>
          )}
        </button>
      </Tooltip>
    );
  }

  // Render detailed or floating version
  return (
    <div 
      className={`sync-indicator sync-indicator--${variant} sync-indicator--${position} ${className}`.trim()}
      data-testid={testId}
    >
      {/* Main Status Display */}
      <div className="sync-indicator__main">
        <div className="sync-indicator__status">
          <div className={`sync-indicator__icon sync-indicator__icon--${statusInfo.color}`}>
            <Icon 
              name={statusInfo.icon} 
              size="sm" 
              className={syncStatus.status === 'syncing' ? 'sync-indicator__icon--spinning' : ''}
            />
          </div>
          
          <div className="sync-indicator__info">
            <Text variant="subtitle" weight="medium" className="sync-indicator__text">
              {statusInfo.text}
            </Text>
            <Text variant="caption" color="muted" className="sync-indicator__description">
              {statusInfo.description}
            </Text>
          </div>

          {/* Progress Bar */}
          {statusInfo.progress !== undefined && (
            <div className="sync-indicator__progress">
              <Progress value={statusInfo.progress} size="sm" variant="primary" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sync-indicator__actions">
          {/* Online/Offline Indicator */}
          <Badge 
            variant={isOnline ? 'success' : 'error'} 
            size="sm"
            className="sync-indicator__connection-badge"
          >
            <Icon name={isOnline ? 'wifi' : 'wifi-off'} size="xs" />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>

          {/* Conflicts Badge */}
          {syncStatus.conflicts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetailModal('conflicts')}
              className="sync-indicator__conflicts-button"
            >
              <Icon name="alert-triangle" size="sm" />
              {syncStatus.conflicts.length} conflict{syncStatus.conflicts.length !== 1 ? 's' : ''}
            </Button>
          )}

          {/* Pending Changes */}
          {syncStatus.pendingChanges > 0 && (
            <Tooltip content="Pending changes">
              <div className="sync-indicator__pending">
                <Icon name="clock" size="sm" />
                <Text variant="caption">{syncStatus.pendingChanges}</Text>
              </div>
            </Tooltip>
          )}

          {/* Sync Button */}
          {onSyncTrigger && isOnline && syncStatus.status !== 'syncing' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncTrigger}
              disabled={syncStatus.pendingChanges === 0}
            >
              <Icon name="refresh-cw" size="sm" />
              Sync
            </Button>
          )}

          {/* More Options */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDetailModal('status')}
          >
            <Icon name="more-horizontal" size="sm" />
          </Button>
        </div>
      </div>

      {/* Detailed Status Modal */}
      <Modal
        isOpen={detailModal === 'status'}
        onClose={() => setDetailModal('none')}
        title="Sync Status Details"
        size="md"
      >
        <div className="sync-indicator__modal-content">
          <div className="sync-indicator__status-details">
            <div className="sync-indicator__status-row">
              <Text variant="caption" color="muted">Status:</Text>
              <div className="sync-indicator__status-value">
                <Icon name={statusInfo.icon} size="sm" color={statusInfo.color} />
                <Text variant="body">{statusInfo.text}</Text>
              </div>
            </div>
            
            <div className="sync-indicator__status-row">
              <Text variant="caption" color="muted">Connection:</Text>
              <Badge variant={isOnline ? 'success' : 'error'} size="sm">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="sync-indicator__status-row">
              <Text variant="caption" color="muted">Pending changes:</Text>
              <Text variant="body">{syncStatus.pendingChanges}</Text>
            </div>
            
            <div className="sync-indicator__status-row">
              <Text variant="caption" color="muted">Conflicts:</Text>
              <Text variant="body">{syncStatus.conflicts.length}</Text>
            </div>
            
            {syncStatus.lastSync && (
              <div className="sync-indicator__status-row">
                <Text variant="caption" color="muted">Last sync:</Text>
                <Text variant="body">{formatRelativeTime(syncStatus.lastSync)}</Text>
              </div>
            )}
          </div>

          <div className="sync-indicator__modal-actions">
            {onSyncTrigger && isOnline && (
              <Button variant="primary" onClick={handleSyncTrigger}>
                <Icon name="refresh-cw" size="sm" />
                Sync Now
              </Button>
            )}
            
            {onRetrySync && syncStatus.status === 'error' && (
              <Button variant="secondary" onClick={onRetrySync}>
                <Icon name="rotate-ccw" size="sm" />
                Retry
              </Button>
            )}
            
            {onClearOfflineData && syncStatus.pendingChanges > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => setDetailModal('offline-data')}
                className="sync-indicator__danger-button"
              >
                <Icon name="trash" size="sm" />
                Clear Offline Data
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Conflicts Modal */}
      <Modal
        isOpen={detailModal === 'conflicts'}
        onClose={() => setDetailModal('none')}
        title={`Sync Conflicts (${syncStatus.conflicts.length})`}
        size="lg"
      >
        <div className="sync-indicator__conflicts-list">
          {syncStatus.conflicts.map((conflict) => (
            <div key={conflict.itemId} className="sync-indicator__conflict-item">
              <div className="sync-indicator__conflict-header">
                <Text variant="subtitle" weight="medium">
                  {conflict.itemType}: {conflict.itemId}
                </Text>
                <Text variant="caption" color="muted">
                  {new Date(conflict.occurredAt).toLocaleString()}
                </Text>
              </div>
              
              <Text variant="body" color="muted" className="sync-indicator__conflict-reason">
                {conflict.reason}
              </Text>
              
              <div className="sync-indicator__conflict-actions">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleConflictResolve(conflict, 'client')}
                >
                  Use Local
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleConflictResolve(conflict, 'server')}
                >
                  Use Server
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleConflictResolve(conflict, 'manual')}
                >
                  Resolve Manually
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Clear Offline Data Confirmation */}
      <Modal
        isOpen={detailModal === 'offline-data'}
        onClose={() => setDetailModal('none')}
        title="Clear Offline Data"
        size="sm"
      >
        <div className="sync-indicator__clear-data-content">
          <Text variant="body" className="sync-indicator__warning-text">
            This will permanently delete all pending changes that haven't been synced to the server.
          </Text>
          
          <Text variant="caption" color="muted">
            Pending changes: {syncStatus.pendingChanges}
          </Text>
          
          <div className="sync-indicator__clear-data-actions">
            <Button variant="ghost" onClick={() => setDetailModal('none')}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                if (onClearOfflineData) {
                  await onClearOfflineData();
                }
                setDetailModal('none');
              }}
            >
              Clear Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SyncIndicator;