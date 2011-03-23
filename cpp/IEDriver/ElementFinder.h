#ifndef WEBDRIVER_IE_ELEMENTFINDER_H_
#define WEBDRIVER_IE_ELEMENTFINDER_H_

#include <string>
#include <vector>

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class Session;

class ElementFinder
{
public:
	ElementFinder(std::wstring locator);
	virtual ~ElementFinder(void);
	virtual int FindElement(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_element);
	virtual int FindElements(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_elements);

private:
	std::wstring locator_;
};

typedef std::tr1::shared_ptr<ElementFinder> ElementFinderHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
