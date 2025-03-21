interface CookieSummaryProps {
  stats: {
    total: number;
    secure: number;
    httpOnly: number;
    thirdParty: number;
  };
}

const CookieSummary: React.FC<CookieSummaryProps> = ({ stats }) => {
  return (
    <div className="mb-4">
      <h3 className="flex items-center text-sm font-semibold text-gray-700 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Cookie Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Cookies</span>
            <span className="text-sm font-semibold">{stats.total}</span>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Secure Cookies</span>
            <span className="text-sm font-semibold">{stats.secure}</span>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">HttpOnly</span>
            <span className="text-sm font-semibold">{stats.httpOnly}</span>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Third-Party</span>
            <span className="text-sm font-semibold">{stats.thirdParty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSummary;
