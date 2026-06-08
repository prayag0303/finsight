import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CSVUpload({ onSuccess, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success(data.message);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">{uploading ? '⏳' : '📤'}</div>
        {uploading ? (
          <p className="text-slate-600 dark:text-slate-300 font-medium">Uploading & processing...</p>
        ) : isDragActive ? (
          <p className="text-primary-600 dark:text-primary-400 font-medium">Drop the CSV file here</p>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-200 font-medium">Drag & drop a CSV file here</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">or click to select</p>
          </>
        )}
      </div>

      {result && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">✅ Import Complete</p>
          <p className="text-emerald-700 dark:text-emerald-400">Imported: {result.imported} transactions</p>
          {result.skipped > 0 && <p className="text-slate-500 dark:text-slate-400">Skipped: {result.skipped} rows</p>}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Supported CSV formats:</p>
        <p>• Date, Description, Amount, Type (Debit/Credit)</p>
        <p>• Date, Description, Debit, Credit</p>
        <p>• Standard bank export formats (HDFC, ICICI, SBI, etc.)</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary w-full">Close</button>
      </div>
    </div>
  );
}
