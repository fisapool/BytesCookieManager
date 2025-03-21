import { useEffect, useState } from "react";
import WebsiteInfo from "./WebsiteInfo";
import ActionButtons from "./ActionButtons";
import StatusSection from "./StatusSection";
import CookieSummary from "./CookieSummary";
import CookieList from "./CookieList";
import Tips from "./Tips";
import { Website, StatusMessage } from "../types";

interface CookieManagerTabProps {
  website: Website | null;
  isLoading: boolean;
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
}

const CookieManagerTab: React.FC<CookieManagerTabProps> = ({
  website,
  isLoading,
  onExport,
  onImport
}) => {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  
  // Reset status after a timeout
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Handle export click
  const handleExport = async () => {
    try {
      await onExport();
      setStatus({
        type: "success",
        title: "Success!",
        message: `${website?.cookies.length || 0} cookies exported successfully. File saved to downloads.`
      });
    } catch (error) {
      setStatus({
        type: "error",
        title: "Export Failed",
        message: error instanceof Error ? error.message : "Unknown error during export"
      });
    }
  };
  
  // Handle import click
  const handleImport = async () => {
    try {
      await onImport();
      // Status will be set by the parent component's callback
    } catch (error) {
      setStatus({
        type: "error",
        title: "Import Failed",
        message: error instanceof Error ? error.message : "Unknown error during import"
      });
    }
  };
  
  // Calculate cookie stats if website is available
  const cookieStats = website ? {
    total: website.cookies.length,
    secure: website.cookies.filter(c => c.secure).length,
    httpOnly: website.cookies.filter(c => c.httpOnly).length,
    thirdParty: website.cookies.filter(c => !c.domain.includes(website.url)).length
  } : null;

  return (
    <div>
      {/* Website Info */}
      <WebsiteInfo website={website} isLoading={isLoading} />
      
      {/* Action Buttons */}
      <ActionButtons 
        onExport={handleExport}
        onImport={handleImport}
        disabled={isLoading || !website}
      />
      
      {/* Status Section */}
      {status && (
        <StatusSection
          type={status.type}
          title={status.title}
          message={status.message}
          onDismiss={() => setStatus(null)}
        />
      )}
      
      {/* Cookie Summary */}
      {website && cookieStats && (
        <CookieSummary stats={cookieStats} />
      )}
      
      {/* Cookie List */}
      {website && website.cookies.length > 0 && (
        <CookieList cookies={website.cookies.slice(0, 10)} />
      )}
      
      {/* Tips */}
      <Tips />
    </div>
  );
};

export default CookieManagerTab;
