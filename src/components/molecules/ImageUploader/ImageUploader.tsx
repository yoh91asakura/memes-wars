import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploadProgress, ImageValidationResult } from '../../../models/CardImage';
import { ImageUploadService, UploadOptions, UploadResult } from '../../../services/ImageUploadService';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Progress } from '../../atoms/Progress';
import './ImageUploader.css';

interface ImageUploaderProps {
  cardId: string;
  playerId: string;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: ImageUploadProgress) => void;
  allowedFormats?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
  testId?: string;
  // Upload options
  replacePrevious?: boolean;
  visibility?: 'public' | 'private';
  compress?: boolean;
  quality?: number;
  generateWebP?: boolean;
  retryAttempts?: number;
}

type UploadState = 'idle' | 'validating' | 'uploading' | 'processing' | 'completed' | 'error';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  cardId,
  playerId,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  allowedFormats = ['image/png', 'image/jpeg', 'image/webp'],
  maxSizeBytes = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  className = '',
  testId,
  replacePrevious = false,
  visibility = 'private',
  compress = true,
  quality = 85,
  generateWebP = true,
  retryAttempts = 3
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<ImageUploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadServiceRef = useRef(new ImageUploadService());

  // Reset state
  const resetState = useCallback(() => {
    setUploadState('idle');
    setProgress(null);
    setUploadResult(null);
    setError(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setValidationResult(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Validate file
  const validateFile = useCallback(async (file: File): Promise<ImageValidationResult> => {
    try {
      setUploadState('validating');
      const result = await uploadServiceRef.current.validateImageFile(file);
      setValidationResult(result);
      return result;
    } catch (error) {
      const validationError: ImageValidationResult = {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        fileSize: file.size,
        fileName: file.name,
        mimeType: file.type,
        warnings: []
      };
      setValidationResult(validationError);
      return validationError;
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    resetState();
    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Validate file
    const validation = await validateFile(file);
    
    if (!validation.valid) {
      setUploadState('error');
      setError(validation.errors.join(', '));
      return;
    }

    setUploadState('idle');
  }, [resetState, validateFile]);

  // Start upload
  const startUpload = useCallback(async () => {
    if (!selectedFile || !validationResult?.valid) return;

    try {
      setUploadState('uploading');
      setError(null);
      
      // Create abort controller
      abortControllerRef.current = new AbortController();

      const options: UploadOptions = {
        cardId,
        playerId,
        file: selectedFile,
        onProgress: (progressData) => {
          setProgress(progressData);
          onUploadProgress?.(progressData);
        },
        signal: abortControllerRef.current.signal,
        replacePrevious,
        visibility,
        compress,
        quality,
        generateWebP,
        retryAttempts,
        metadata: {
          source: 'manual_upload',
          tags: ['custom'],
          description: `Custom image for card ${cardId}`
        }
      };

      const result = await uploadServiceRef.current.uploadCardImage(options);
      
      setUploadResult(result);
      setUploadState('completed');
      onUploadComplete?.(result);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setUploadState('idle');
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setUploadState('error');
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [
    selectedFile,
    validationResult,
    cardId,
    playerId,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    replacePrevious,
    visibility,
    compress,
    quality,
    generateWebP,
    retryAttempts
  ]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploadState('idle');
    setProgress(null);
  }, []);

  // File input change handler
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [handleFileSelect]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`image-uploader ${disabled ? 'image-uploader--disabled' : ''} ${className}`.trim()} data-testid={testId}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFormats.join(',')}
        onChange={handleInputChange}
        className="image-uploader__input"
        aria-label="Select image file"
      />

      {/* Drop zone */}
      <div
        className={`image-uploader__dropzone ${dragActive ? 'image-uploader__dropzone--active' : ''} ${uploadState !== 'idle' ? 'image-uploader__dropzone--busy' : ''}`.trim()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={uploadState === 'idle' ? openFileDialog : undefined}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
      >
        <AnimatePresence mode="wait">
          {/* Idle state */}
          {uploadState === 'idle' && !selectedFile && (
            <motion.div
              key="idle"
              className="image-uploader__content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Icon name="upload" size="2xl" color="muted" />
              <Text variant="h5" color="muted" align="center">
                Drop your image here or click to browse
              </Text>
              <Text variant="caption" color="muted" align="center">
                Supports PNG, JPEG, WebP • Max {formatFileSize(maxSizeBytes)}
              </Text>
            </motion.div>
          )}

          {/* File selected */}
          {uploadState === 'idle' && selectedFile && validationResult?.valid && (
            <motion.div
              key="selected"
              className="image-uploader__preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="image-uploader__preview-image"
                />
              )}
              <div className="image-uploader__file-info">
                <Text variant="subtitle" weight="medium">{selectedFile.name}</Text>
                <Text variant="caption" color="muted">{formatFileSize(selectedFile.size)}</Text>
              </div>
              <div className="image-uploader__actions">
                <Button variant="primary" onClick={startUpload} disabled={disabled}>
                  <Icon name="upload" size="sm" />
                  Upload Image
                </Button>
                <Button variant="ghost" onClick={resetState}>
                  <Icon name="close" size="sm" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Uploading state */}
          {(uploadState === 'validating' || uploadState === 'uploading' || uploadState === 'processing') && (
            <motion.div
              key="uploading"
              className="image-uploader__uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="image-uploader__progress-container">
                <Icon name="upload" size="xl" className="image-uploader__progress-icon" />
                <Text variant="h5" align="center">
                  {uploadState === 'validating' && 'Validating image...'}
                  {uploadState === 'uploading' && 'Uploading image...'}
                  {uploadState === 'processing' && 'Processing image...'}
                </Text>
                
                {progress && (
                  <>
                    <Progress 
                      value={progress.percentage} 
                      className="image-uploader__progress-bar"
                      variant="primary"
                    />
                    <div className="image-uploader__progress-details">
                      <Text variant="caption" color="muted">
                        {progress.currentOperation}
                      </Text>
                      {progress.speed && (
                        <Text variant="caption" color="muted">
                          {Math.round(progress.speed)} KB/s
                        </Text>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <Button variant="ghost" onClick={cancelUpload} className="image-uploader__cancel">
                <Icon name="close" size="sm" />
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Completed state */}
          {uploadState === 'completed' && uploadResult && (
            <motion.div
              key="completed"
              className="image-uploader__completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Icon name="check-circle" size="xl" color="success" />
              <Text variant="h5" color="success" align="center">
                Upload Successful!
              </Text>
              <div className="image-uploader__result-details">
                <Text variant="caption" color="muted">
                  File size: {formatFileSize(uploadResult.fileSize)}
                </Text>
                <Text variant="caption" color="muted">
                  Dimensions: {uploadResult.dimensions.width} × {uploadResult.dimensions.height}
                </Text>
                <Text variant="caption" color="muted">
                  Upload time: {Math.round(uploadResult.uploadStats.totalTime)}ms
                </Text>
              </div>
              <Button variant="ghost" onClick={resetState}>
                <Icon name="upload" size="sm" />
                Upload Another
              </Button>
            </motion.div>
          )}

          {/* Error state */}
          {uploadState === 'error' && (
            <motion.div
              key="error"
              className="image-uploader__error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Icon name="alert-circle" size="xl" color="error" />
              <Text variant="h5" color="error" align="center">
                Upload Failed
              </Text>
              <Text variant="body" color="error" align="center" className="image-uploader__error-message">
                {error}
              </Text>
              <div className="image-uploader__error-actions">
                <Button variant="primary" onClick={selectedFile ? startUpload : resetState}>
                  <Icon name="refresh" size="sm" />
                  {selectedFile ? 'Retry' : 'Try Again'}
                </Button>
                <Button variant="ghost" onClick={resetState}>
                  <Icon name="close" size="sm" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation warnings */}
      {validationResult?.warnings && validationResult.warnings.length > 0 && (
        <div className="image-uploader__warnings">
          {validationResult.warnings.map((warning, index) => (
            <div key={index} className="image-uploader__warning">
              <Icon name="alert-triangle" size="sm" color="warning" />
              <Text variant="caption" color="warning">{warning}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;