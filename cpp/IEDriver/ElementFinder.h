#ifndef WEBDRIVER_IE_ELEMENTFINDER_H_
#define WEBDRIVER_IE_ELEMENTFINDER_H_

#include <string>
#include <vector>

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Session;

class ElementFinder {
public:
	ElementFinder();
	virtual ~ElementFinder(void);
	virtual int FindElement(Session* session, ElementHandle parent_wrapper, const std::wstring& mechanism, const std::wstring& criteria, Json::Value *found_element);
	virtual int FindElements(Session* session, ElementHandle parent_wrapper, const std::wstring& mechanism, const std::wstring& criteria, Json::Value *found_elements);

private:
	int FindElementByCssSelector(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_element);
	int ElementFinder::FindElementsByCssSelector(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_elements);
	int FindElementByXPath(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_element);
	int FindElementsByXPath(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_elements);
	int InjectXPathEngine(BrowserHandle browser_wrapper);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
