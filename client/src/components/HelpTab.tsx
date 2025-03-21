import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const HelpTab: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  const faqs: FAQItem[] = [
    {
      question: "How secure is the cookie export?",
      answer: "Cookie exports can be encrypted with AES-256 if you enable encryption in the Security tab. For added security, you can also password-protect your exported files."
    },
    {
      question: "Why can't I import some cookies?",
      answer: "Cookies with special prefixes (like __Host-) require specific security settings and may not import properly for security reasons. Also, some cookies are HttpOnly or have other restrictions that prevent them from being imported."
    },
    {
      question: "Is my data sent to any server?",
      answer: "No. FISABytes operates locally within your browser and never sends your cookie data to any external servers. All operations happen directly in your browser for maximum privacy and security."
    },
    {
      question: "What happens to expired cookies?",
      answer: "When importing cookies, FISABytes preserves the original expiration dates if they are still valid. If a cookie's expiration date has passed, it will be created as a session cookie instead."
    },
    {
      question: "Can I edit cookies directly?",
      answer: "The current version doesn't support direct cookie editing. This feature is planned for future releases. For now, you can export cookies, modify the JSON file, and import it back."
    }
  ];
  
  const toggleFAQ = (index: number) => {
    if (expandedFAQ === index) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(index);
    }
  };
  
  return (
    <div>
      {/* FAQ Section */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Frequently Asked Questions</h3>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
              <button 
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={expandedFAQ === index ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                  />
                </svg>
              </button>
              
              <div className={`text-xs text-gray-600 mt-2 ${expandedFAQ === index ? "" : "hidden"}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 mx-auto mb-2">
          <path d="M12.8 24C19.8692 24 25.6 18.6274 25.6 12C25.6 5.37258 19.8692 0 12.8 0C5.73075 0 0 5.37258 0 12C0 18.6274 5.73075 24 12.8 24Z" fill="#4F46E5"/>
          <path d="M6.4 8H19.2V16H6.4V8Z" fill="white"/>
          <path d="M35.184 24V8.64H39.392V20.448H47.392V24H35.184ZM49.5445 24V8.64H53.7525V24H49.5445ZM64.8475 24.336C63.1675 24.336 61.6955 24.0427 60.4315 23.456C59.1675 22.8693 58.1835 22.048 57.4795 20.992C56.7755 19.936 56.3835 18.7147 56.3035 17.328H60.7555C60.8355 18.1387 61.1755 18.7893 61.7755 19.28C62.3755 19.7707 63.1355 20.016 64.0555 20.016C65.0395 20.016 65.7862 19.8133 66.2955 19.408C66.8048 19.0027 67.0595 18.496 67.0595 17.888C67.0595 17.3173 66.8742 16.864 66.5035 16.528C66.1328 16.1707 65.6742 15.8933 65.1275 15.696C64.5808 15.4773 63.8155 15.2373 62.8315 14.976C61.5035 14.6053 60.4155 14.2347 59.5675 13.864C58.7195 13.472 57.9835 12.896 57.3595 12.136C56.7355 11.3547 56.4235 10.3173 56.4235 9.024C56.4235 7.2373 57.0795 5.81333 58.3915 4.752C59.7035 3.66933 61.4635 3.128 63.6715 3.128C65.9435 3.128 67.7302 3.66933 69.0315 4.752C70.3542 5.81333 71.0688 7.25067 71.1755 9.064H66.5835C66.5302 8.36267 66.2315 7.8 65.6875 7.352C65.1648 6.88267 64.4395 6.648 63.5115 6.648C62.7115 6.648 62.0742 6.84 61.5995 7.224C61.1248 7.58667 60.8875 8.08267 60.8875 8.712C60.8875 9.41333 61.1968 9.95733 61.8155 10.344C62.4555 10.7307 63.4395 11.128 64.7675 11.536C66.0742 11.9653 67.1408 12.3573 67.9675 12.712C68.8155 13.0667 69.5515 13.6267 70.1755 14.392C70.7995 15.136 71.1115 16.1307 71.1115 17.376C71.1115 18.368 70.8635 19.28 70.3675 20.112C69.8715 20.944 69.1275 21.6053 68.1355 22.096C67.1435 22.5867 66.1008 22.9147 64.9435 23.088C64.5728 23.1307 64.1808 23.2 63.7675 23.296C63.3755 23.3707 63.0475 23.3813 62.7835 23.328C62.5408 23.2747 62.4342 23.248 62.4635 23.248H64.8475V24.336ZM77.1353 24L71.0553 8.64H75.5272L79.5192 19.504L83.2713 8.64H87.5113L81.4313 24H77.1353ZM92.6781 24V8.64H101.654C103.387 8.64 104.752 9.056 105.75 9.888C106.747 10.6987 107.246 11.8347 107.246 13.296C107.246 14.7573 106.747 15.904 105.75 16.736C104.752 17.5467 103.387 17.952 101.654 17.952H96.8861V24H92.6781ZM96.8861 14.448H100.742C101.323 14.448 101.779 14.3093 102.11 14.032C102.44 13.7333 102.606 13.328 102.606 12.816C102.606 12.3253 102.44 11.9413 102.11 11.664C101.779 11.3653 101.323 11.216 100.742 11.216H96.8861V14.448ZM114.834 24V16.16L108.594 8.64H113.618L117.09 13.296L120.562 8.64H125.586L119.346 16.16V24H114.834Z" fill="#4F46E5"/>
        </svg>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Need help or support?</h3>
        <p className="text-xs text-gray-600 mb-3">Visit our Shopee store or contact support</p>
        
        <a 
          href="https://shopee.com.my/fisa_trading" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Visit Shopee Store
        </a>
      </div>
    </div>
  );
};

export default HelpTab;
