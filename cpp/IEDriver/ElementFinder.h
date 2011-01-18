#ifndef WEBDRIVER_IE_ELEMENTFINDER_H_
#define WEBDRIVER_IE_ELEMENTFINDER_H_

#include <string>
#include <vector>

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class BrowserManager;

class ElementFinder
{
public:
	ElementFinder(std::wstring locator);
	virtual ~ElementFinder(void);
	virtual int FindElement(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_element);
	virtual int FindElements(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_elements);

private:
	std::wstring locator_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
