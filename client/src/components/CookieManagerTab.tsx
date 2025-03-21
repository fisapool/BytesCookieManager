import { useEffect, useState } from "react";
import WebsiteInfo from "./WebsiteInfo";
import ActionButtons from "./ActionButtons";
import StatusSection from "./StatusSection";
import CookieSummary from "./CookieSummary";
import CookieList from "./CookieList";
import Tips from "./Tips";
import { Website, StatusMessage } from "../types";
import { useToast } from '@chakra-ui/react'; // Assuming Chakra UI for toasts


interface CookieManagerTabProps {
  website: Website | null;
  isLoading: boolean;
  onExport: () => Promise<void>;
  onImport: (data: any) => Promise<void>; // Added data parameter
}

const CookieManagerTab: React.FC<CookieManagerTabProps> = ({
  website,
  isLoading,
  onExport,
  onImport
}) => {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const { toast } = useToast();

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
  const handleImport = async (data: any) => {
    try {
      const result = await onImport(data); // Pass data to onImport
      if (result && result.success) { // Check for success property
        toast({
          title: "Success!",
          description: `Successfully imported ${result.metadata.imported} cookies`,
          status: "success", // Assuming Chakra UI toast
          duration: 5000,
          isClosable: true,
        });
      } else if (result && !result.success) {
          toast({
            title: "Import Failed",
            description: result.error || "Unknown error during import",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
      }
    } catch (error) {
      console.error('Error importing cookies:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error during import",
        status: "error",
        duration: 5000,
        isClosable: true,
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