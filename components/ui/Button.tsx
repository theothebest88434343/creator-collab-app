type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean
  }
  
  export function Button({ children, loading, className = '', ...props }: Props) {
    return (
      <button
        {...props}
        disabled={loading || props.disabled}
        className={`flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {loading ? 'Loading...' : children}
      </button>
    )
  }