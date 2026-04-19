export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-800 text-base">{title}</h2>
          <button onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}