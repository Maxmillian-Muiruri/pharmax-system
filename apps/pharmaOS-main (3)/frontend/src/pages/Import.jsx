import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useToast } from '../context/ToastContext'
import { importApi } from '../services/api'

export default function Import() {
  const toast = useToast()
  const fileInputRef = useRef(null)
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setSelectedFile(file)
    parsePreview(file)
  }

  const parsePreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').slice(0, 6) // First 5 rows + header
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((h, i) => {
          row[h] = values[i] || ''
        })
        return row
      })
      setPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
      parsePreview(file)
    } else {
      toast.error('Please drop a CSV file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const res = await importApi.uploadCSV(selectedFile)
      setResult(res.data)
      toast.success(res.message || 'Import completed')
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview([])
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <PageWrapper title="Import Data">
      <div className="w-full max-w-4xl mx-auto px-0">
        {!result ? (
          <>
            {/* Upload Area */}
            <Card className="mb-4 sm:mb-6">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-12 text-center hover:border-teal-500 transition-colors"
              >
                <Upload size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  or click to browse (max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full sm:w-auto">
                  Browse Files
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={20} className="text-teal-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </Card>

            {/* Preview */}
            {preview.length > 0 && (
              <Card title="Preview (First 5 rows)" className="mb-4 sm:mb-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th key={key} className="px-3 sm:px-4 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="px-3 sm:px-4 py-2 text-gray-700 whitespace-nowrap truncate">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Action Button */}
            {selectedFile && (
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
                <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleUpload} loading={uploading} className="w-full sm:w-auto">
                  {uploading ? 'Importing...' : 'Confirm Import'}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Results */
          <Card>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h3>
              <p className="text-gray-500">
                {result.imported} products imported successfully
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                <p className="text-sm text-green-700">Imported</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                <p className="text-sm text-amber-700">Skipped</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                <p className="text-sm text-red-700">Errors</p>
              </div>
            </div>

            {(result.skipped > 0 || result.errors > 0) && result.details && (
              <div className="border-t pt-4 mb-6">
                {result.details.skipped?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} /> Skipped
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {result.details.skipped.map((item, idx) => (
                        <p key={idx} className="text-sm text-amber-700">
                          Row {item.row}: {item.name} - {item.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.details.errors?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} /> Errors
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {result.details.errors.map((err, idx) => (
                        <p key={idx} className="text-sm text-red-700">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleReset}>
                Import Another File
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
