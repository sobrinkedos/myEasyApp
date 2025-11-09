import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface ImageUploadProps {
  value?: string | File;
  onChange: (file: File | null) => void;
  onError?: (error: string) => void;
  maxSize?: number; // em MB
  acceptedFormats?: string[];
  showPreview?: boolean;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  maxSize = 5, // 5MB padrão
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gerar preview da imagem
  const generatePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!acceptedFormats.includes(file.type)) {
      return `Formato não suportado. Use: ${acceptedFormats.map((f) => f.split('/')[1]).join(', ')}`;
    }

    // Validar tamanho
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
    }

    return null;
  };

  // Processar arquivo
  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      if (onError) onError(error);
      return;
    }

    // Simular upload com progresso
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onChange(file);
          generatePreview(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Handler de seleção de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Handler de drag and drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Remover imagem
  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Abrir seletor de arquivo
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Obter URL do preview
  const getPreviewUrl = (): string | null => {
    if (preview) return preview;
    if (typeof value === 'string') return value;
    return null;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className={clsx('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Área de upload */}
      {!previewUrl && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={clsx(
            'relative border-2 border-dashed rounded-lg',
            'transition-all duration-200',
            'cursor-pointer',
            {
              'border-neutral-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-400':
                !isDragging && !disabled,
              'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20':
                isDragging,
              'opacity-50 cursor-not-allowed': disabled,
            }
          )}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Upload
              className={clsx('w-12 h-12 mb-4', {
                'text-neutral-400 dark:text-neutral-600': !isDragging,
                'text-primary-500': isDragging,
              })}
            />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')} até {maxSize}MB
            </p>
          </div>

          {/* Barra de progresso */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-neutral-900/90 rounded-lg"
              >
                <div className="w-3/4">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-sm text-center mt-2 text-neutral-600 dark:text-neutral-400">
                    Enviando... {progress}%
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Preview da imagem */}
      {showPreview && previewUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700"
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover"
          />

          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={handleClick}
              disabled={disabled}
              className="p-3 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title="Trocar imagem"
            >
              <ImageIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="p-3 bg-white dark:bg-neutral-800 rounded-lg hover:bg-error-light dark:hover:bg-error-dark/20 transition-colors"
              title="Remover imagem"
            >
              <X className="w-5 h-5 text-error-DEFAULT" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
