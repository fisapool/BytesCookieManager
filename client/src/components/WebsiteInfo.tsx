import { useEffect, useState } from "react";
import { Website } from "../types";
import { LogoDetector } from "../lib/LogoDetector";

interface WebsiteInfoProps {
  website: Website | null;
  isLoading: boolean;
}

const WebsiteInfo: React.FC<WebsiteInfoProps> = ({ website, isLoading }) => {
  const [logoInfo, setLogoInfo] = useState<{
    url?: string;
    initial: string;
    color: string;
  }>({
    initial: "F",
    color: "#4F46E5",
  });
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (website) {
        const logoDetector = new LogoDetector();
        const logo = await logoDetector.getLogoForDomain(
          website.url,
          website.favicon
        );
        setLogoInfo(logo);
      }
    };
    
    fetchLogo();
  }, [website]);
  
  if (isLoading) {
    return (
      <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!website) {
    return (
      <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div 
            className="logo-initial mr-3 rounded-lg"
            style={{
              backgroundColor: logoInfo.color,
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {logoInfo.initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 truncate">No website detected</h2>
            <p className="text-xs text-gray-500">Please navigate to a website first</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center">
        <div className="relative mr-3">
          {logoInfo.url ? (
            <img 
              src={logoInfo.url} 
              alt={`${website.name} logo`} 
              className="w-10 h-10 rounded-lg object-contain bg-white"
              onError={(e) => {
                // If image fails to load, show initial
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const initialDiv = document.createElement("div");
                  initialDiv.className = "logo-initial rounded-lg";
                  initialDiv.style.backgroundColor = logoInfo.color;
                  initialDiv.style.width = "40px";
                  initialDiv.style.height = "40px";
                  initialDiv.style.display = "flex";
                  initialDiv.style.alignItems = "center";
                  initialDiv.style.justifyContent = "center";
                  initialDiv.style.color = "white";
                  initialDiv.style.fontWeight = "600";
                  initialDiv.style.fontSize = "18px";
                  initialDiv.textContent = logoInfo.initial;
                  parent.appendChild(initialDiv);
                }
              }}
            />
          ) : (
            <div 
              className="logo-initial rounded-lg"
              style={{
                backgroundColor: logoInfo.color,
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              {logoInfo.initial}
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            website.cookies.length > 0 
              ? "bg-success-500" 
              : "bg-gray-400"
          }`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-800 truncate">{website.name}</h2>
          <p className="text-xs text-gray-500">
            {website.cookies.length} {website.cookies.length === 1 ? "cookie" : "cookies"} detected
          </p>
        </div>
        
        <div className="ml-2 flex-shrink-0">
          {website.cookies.some(c => c.secure) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600">
              Secure
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteInfo;
