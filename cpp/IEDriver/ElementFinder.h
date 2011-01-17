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
	ElementFinder(void);
	virtual ~ElementFinder(void);
	int FindElement(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, ElementWrapper **found_element);
	int FindElements(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, std::vector<ElementWrapper*> *found_elements);

protected:
	virtual int FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element);
	virtual int FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements);
	void GetHtmlDocument3(BrowserWrapper *browser, IHTMLDocument3 **doc3);
	void ExtractHtmlDocument2FromDomNode(const IHTMLDOMNode* extraction_node, IHTMLDocument2** doc);
	void ExtractHtmlDocument3FromDomNode(const IHTMLDOMNode* extraction_node, IHTMLDocument3** doc);
	bool IsOrUnder(const IHTMLDOMNode* root, IHTMLElement* child);
	bool IsUnder(const IHTMLDOMNode* root, IHTMLElement* child);
	std::wstring StripTrailingWhitespace(std::wstring input);

private:
	int GetParentElement(BrowserWrapper *browser, ElementWrapper *parent_wrapper, IHTMLElement **parent_element);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
