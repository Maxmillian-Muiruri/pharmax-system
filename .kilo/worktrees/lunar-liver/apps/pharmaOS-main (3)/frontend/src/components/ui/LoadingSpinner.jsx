export default function LoadingSpinner({ size = 'md', fullScreen = false }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-teal-600 ${sizes.lg} mx-auto`} />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-teal-600 ${sizes[size]}`} />
  )
}
