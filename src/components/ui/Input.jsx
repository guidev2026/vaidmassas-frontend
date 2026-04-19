export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <input
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-orange-400 focus:border-orange-400
          ${error ? 'border-red-400' : 'border-zinc-300'}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}