interface StatusSectionProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onDismiss?: () => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  type,
  title,
  message,
  onDismiss
}) => {
  const typeStyles = {
    success: {
      bg: "bg-success-50",
      border: "border-success-500",
      text: "text-success-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      bg: "bg-error-50",
      border: "border-error-500",
      text: "text-error-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      bg: "bg-warning-50",
      border: "border-warning-500",
      text: "text-warning-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };
  
  const style = typeStyles[type];
  
  return (
    <div className={`mb-4 p-3 ${style.bg} border ${style.border} rounded-lg ${style.text} text-sm relative`}>
      <div className="flex items-start">
        {style.icon}
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs mt-1">{message}</p>
        </div>
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusSection;
