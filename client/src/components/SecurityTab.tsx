import { Settings } from "../types";

interface SecurityTabProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  settings,
  onUpdateSettings
}) => {
  const handleToggleEncryption = () => {
    onUpdateSettings({
      encryptionEnabled: !settings.encryptionEnabled
    });
  };
  
  const handleEncryptionMethodChange = (method: string) => {
    onUpdateSettings({
      encryptionMethod: method as "aes256" | "aes128"
    });
  };
  
  const handleTogglePasswordProtection = () => {
    onUpdateSettings({
      passwordEnabled: !settings.passwordEnabled
    });
  };
  
  const handleToggleSecurityValidation = () => {
    onUpdateSettings({
      validateSecurity: !settings.validateSecurity
    });
  };
  
  const handleToggleXSSDetection = () => {
    onUpdateSettings({
      detectXSS: !settings.detectXSS
    });
  };
  
  const handleToggleSameOrigin = () => {
    onUpdateSettings({
      enforceSameOrigin: !settings.enforceSameOrigin
    });
  };
  
  return (
    <div>
      {/* Encryption Options */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Encryption Settings</h3>
        
        <div className="space-y-3">
          {/* Encryption Toggle */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-800 block">Enable encryption</span>
              <span className="text-xs text-gray-500">Add extra security when exporting cookies</span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.encryptionEnabled}
                onChange={handleToggleEncryption}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          {/* Encryption Method */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-800 block mb-1">Encryption Method</span>
            
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="encryption-method" 
                  value="aes256" 
                  checked={settings.encryptionMethod === "aes256"}
                  onChange={() => handleEncryptionMethodChange("aes256")}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300" 
                />
                <span className="text-sm text-gray-700">AES-256 (Recommended)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input 
                  type="radio" 
                  name="encryption-method" 
                  value="aes128" 
                  checked={settings.encryptionMethod === "aes128"}
                  onChange={() => handleEncryptionMethodChange("aes128")}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300" 
                />
                <span className="text-sm text-gray-700">AES-128</span>
              </label>
            </div>
          </div>
          
          {/* Password Protection */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-800 block mb-1">Password Protection</span>
            <p className="text-xs text-gray-500 mb-2">Add a password to exported cookie files</p>
            
            <label className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={settings.passwordEnabled}
                onChange={handleTogglePasswordProtection}
                className="h-4 w-4 text-primary-500 focus:ring-primary-400 rounded border-gray-300" 
              />
              <span className="text-sm text-gray-700">Require password</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Validation Settings */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Validation Settings</h3>
        
        <div className="space-y-3">
          {/* Security Checks */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-800 block mb-1">Security Checks</span>
            
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.validateSecurity}
                  onChange={handleToggleSecurityValidation}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 rounded border-gray-300" 
                />
                <span className="text-sm text-gray-700">Validate cookie security flags</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.detectXSS}
                  onChange={handleToggleXSSDetection}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 rounded border-gray-300" 
                />
                <span className="text-sm text-gray-700">Detect suspicious content</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.enforceSameOrigin}
                  onChange={handleToggleSameOrigin}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-400 rounded border-gray-300" 
                />
                <span className="text-sm text-gray-700">Enforce same-origin restrictions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
