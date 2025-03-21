interface TipsProps {
  expanded?: boolean;
}

const Tips: React.FC<TipsProps> = ({ expanded = false }) => {
  const tips = [
    {
      text: "Use Export to save all cookies from the current site",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "Cookies with __Host- prefix require special security flags",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "Enable encryption in the Security tab for added protection",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "For security, cookie files are not encrypted by default",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];
  
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Tips</h3>
      
      <ul className="text-xs text-gray-600 space-y-2">
        {tips.slice(0, expanded ? tips.length : 2).map((tip, index) => (
          <li key={index} className="flex items-start">
            {tip.icon}
            {tip.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tips;
