#ifndef WEBDRIVER_IE_FINDBYPARTIALLINKTEXTELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYPARTIALLINKTEXTELEMENTFINDER_H_

#include "BrowserManager.h"

namespace webdriver {

class FindByPartialLinkTextElementFinder : public ElementFinder {
public:
	FindByPartialLinkTextElementFinder(void) {
	}

	virtual ~FindByPartialLinkTextElementFinder(void) {
	}

protected:
	int FindByPartialLinkTextElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		CComQIPtr<IHTMLElement2> element2(parent_element);
		if (!element2 || !node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLElementCollection> elements;
		if (!SUCCEEDED(element2->getElementsByTagName(CComBSTR("A"), &elements))) {
			return ENOSUCHELEMENT;
		}
		
		long links_length;
		if (!SUCCEEDED(elements->get_length(&links_length))) {
			return ENOSUCHELEMENT;
		}

		for (int i = 0; i < links_length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(elements->item(idx, zero, &dispatch))) {
				// The page is probably reloading, but you never know. Continue looping
				continue;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			if (!element) {
				// Deeply unusual
				continue;
			}

			CComBSTR link_text;
			if (!SUCCEEDED(element->get_innerText(&link_text))) {
				continue;
			}

			std::wstring link_text_string((BSTR)link_text);
			if (wcsstr(link_text_string.c_str(), criteria.c_str()) && this->IsOrUnder(node, element)) {
				element.CopyTo(found_element);
				return SUCCESS;
			}
		}

		return ENOSUCHELEMENT;
	}

	int FindByPartialLinkTextElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		CComQIPtr<IHTMLElement2> element2(parent_element);
		if (!element2 || !node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLElementCollection> elements;
		if (!SUCCEEDED(element2->getElementsByTagName(CComBSTR("A"), &elements))) {
			return ENOSUCHELEMENT;
		}
		
		long links_length;
		if (!SUCCEEDED(elements->get_length(&links_length)))
		{
			return ENOSUCHELEMENT;
		}

		for (int i = 0; i < links_length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(elements->item(idx, zero, &dispatch))) {
				return ENOSUCHELEMENT;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			if (!element) {
				continue;
			}

			CComBSTR link_text;
			element->get_innerText(&link_text);

			std::wstring link_text_string((BSTR)link_text);
			if (wcsstr(link_text_string.c_str(), criteria.c_str()) && this->IsOrUnder(node, element)) {
				IHTMLElement *dom_element = NULL;
				element.CopyTo(&dom_element);
				found_elements->push_back(dom_element);
			}
		}
		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYPARTIALLINKTEXTELEMENTFINDER_H_
