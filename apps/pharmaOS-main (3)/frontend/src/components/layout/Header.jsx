export default function Header({ title, action }) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{title}</h1>
      </div>
      {action && (
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          {action}
        </div>
      )}
    </header>
  )
}
