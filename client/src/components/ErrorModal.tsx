import { ErrorInfo } from "../types";

interface ErrorModalProps {
  show: boolean;
  error: ErrorInfo | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ show, error, onClose }) => {
  if (!show || !error) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Error Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-error-50 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-800">
                {error.title || "Error"}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {typeof error.message === 'string' ? error.message : 
                 typeof error.message === 'object' ? JSON.stringify(error.message) : 
                 "An error occurred"}
              </p>
            </div>
          </div>
          
          {error.details && (
            <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Technical Details</h5>
              <pre className="code-area text-xs text-gray-600 whitespace-pre-wrap break-all">
                {typeof error.details === 'string' ? error.details : 
                 typeof error.details === 'object' ? JSON.stringify(error.details, null, 2) : 
                 String(error.details)}
              </pre>
            </div>
          )}
          
          {/* Show operation and timestamp if available */}
          {(error.operation || error.timestamp) && (
            <div className="mt-3 text-xs text-gray-500">
              {error.operation && <span>Operation: {error.operation}</span>}
              {error.timestamp && <span className="ml-2">
                Time: {new Date(error.timestamp).toLocaleTimeString()}
              </span>}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
