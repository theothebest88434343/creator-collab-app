type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
  }
  
  export function Input({ label, id, ...props }: Props) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          id={id}
          {...props}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    )
  }