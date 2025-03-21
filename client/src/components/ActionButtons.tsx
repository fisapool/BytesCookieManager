interface ActionButtonsProps {
  onExport: () => void;
  onImport: () => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExport,
  onImport,
  disabled = false
}) => {
  return (
    <div className="flex space-x-3 mb-5">
      <button
        onClick={onExport}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium transition duration-150 ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary-500 hover:bg-primary-600 text-white"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Cookies
      </button>
      
      <button
        onClick={onImport}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium transition duration-150 ${
          disabled
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import Cookies
      </button>
    </div>
  );
};

export default ActionButtons;
