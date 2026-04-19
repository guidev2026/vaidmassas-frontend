export default function Button({ children, variant = 'primary', type = 'button', onClick, disabled }) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    danger:  'bg-red-100 text-red-700 hover:bg-red-200',
    ghost:   'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}