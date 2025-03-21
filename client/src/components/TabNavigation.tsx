import { Tab } from "../types";

interface TabNavigationProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="flex space-x-4" aria-label="Tabs">
        <button
          onClick={() => onChangeTab("cookies")}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${
            activeTab === "cookies"
              ? "text-primary-600 border-primary-500"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
          }`}
        >
          Cookie Manager
        </button>
        
        <button
          onClick={() => onChangeTab("security")}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${
            activeTab === "security"
              ? "text-primary-600 border-primary-500"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
          }`}
        >
          Security
        </button>
        
        <button
          onClick={() => onChangeTab("help")}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${
            activeTab === "help"
              ? "text-primary-600 border-primary-500"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
          }`}
        >
          Help
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;
