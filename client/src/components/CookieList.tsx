import { useState } from "react";
import { Cookie } from "../types";

interface CookieListProps {
  cookies: Cookie[];
}

const CookieList: React.FC<CookieListProps> = ({ cookies }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Format the expiration date
  const formatExpiration = (expirationDate?: number): string => {
    if (!expirationDate) return "Session";
    
    const expDate = new Date(expirationDate * 1000);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };
  
  // Truncate long values
  const truncateValue = (value: string, maxLength = 50): string => {
    return value.length > maxLength
      ? `${value.substring(0, maxLength)}...`
      : value;
  };
  
  // Determine security badge
  const getSecurityBadge = (cookie: Cookie) => {
    if (cookie.secure && cookie.httpOnly) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-success-50 text-success-600 font-medium">
          Secure + HttpOnly
        </span>
      );
    }
    
    if (cookie.secure) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-success-50 text-success-600 font-medium">
          Secure
        </span>
      );
    }
    
    if (cookie.httpOnly) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
          HttpOnly
        </span>
      );
    }
    
    return null;
  };
  
  // Display cookies
  const displayedCookies = showAll ? cookies : cookies.slice(0, 2);
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center text-sm font-semibold text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Cookie Details
        </h3>
        
        <button 
          className="text-xs font-medium text-primary-500 hover:text-primary-600"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {displayedCookies.map((cookie, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800 truncate">{cookie.name}</span>
              {getSecurityBadge(cookie)}
            </div>
            
            <div className="text-xs text-gray-500 mb-2">
              <span className="inline-block mr-2">{cookie.domain}</span>
              <span className="inline-block">Expires: {formatExpiration(cookie.expirationDate)}</span>
            </div>
            
            <div className="code-area bg-gray-50 p-2 rounded text-xs text-gray-600 font-mono break-all">
              {truncateValue(cookie.value)}
            </div>
          </div>
        ))}
        
        {!showAll && cookies.length > 2 && (
          <div 
            className="text-center py-2 text-xs text-primary-500 cursor-pointer hover:underline"
            onClick={() => setShowAll(true)}
          >
            Show {cookies.length - 2} more cookies...
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieList;
