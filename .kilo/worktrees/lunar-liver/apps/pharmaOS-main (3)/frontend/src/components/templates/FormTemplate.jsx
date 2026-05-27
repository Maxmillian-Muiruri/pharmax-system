import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../layout/PageWrapper'
import Card from '../ui/Card'

/**
 * FormTemplate: A master component for creating PharmaOS-style form pages.
 * Handles the 3-column layout and standard action buttons (Save / Back).
 */
export default function FormTemplate({ 
  title, 
  subtitle, 
  onSubmit, 
  onBack, 
  children,
  loading = false
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <PageWrapper>
      <Card 
        title={title} 
        subtitle={subtitle}
        className="border-none shadow-sm max-w-5xl mx-auto"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              form="master-form"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save & Publish
            </button>
          </div>
        }
      >
        <form 
          id="master-form" 
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
          className="space-y-6"
        >
          {/* 3-Column Grid for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
          </div>
        </form>
      </Card>
    </PageWrapper>
  )
}

/**
 * FormField: A sub-component for standardized input labeling and styling.
 */
export function FormField({ label, required, children, error }) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export function FormInput(props) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2 bg-gray-50 border ${props.error ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400 transition-shadow ${props.className || ''}`}
    />
  )
}

export function FormSelect(props) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2 bg-gray-50 border ${props.error ? 'border-red-300' : 'border-gray-200'} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary transition-shadow cursor-pointer ${props.className || ''}`}
    >
      {props.children}
    </select>
  )
}
