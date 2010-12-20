#ifndef WEBDRIVER_IE_FINDBYNAMEELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYNAMEELEMENTFINDER_H_

#include "BrowserManager.h"

namespace webdriver {

class FindByNameElementFinder : public ElementFinder {
public:
	FindByNameElementFinder(void) {
	}

	virtual ~FindByNameElementFinder(void) {
	}

protected:
	int FindByNameElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument2> doc;
		this->ExtractHtmlDocument2FromDomNode(node, &doc);
		if (!doc) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> element_collection;
		CComBSTR name(criteria.c_str());
		if (!SUCCEEDED(doc->get_all(&element_collection))) {
			return ENOSUCHELEMENT;
		}
		
		long elements_length;
		if (!SUCCEEDED(element_collection->get_length(&elements_length))) {
			return ENOSUCHELEMENT;
		}

		for (int i = 0; i < elements_length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(element_collection->item(idx, zero, &dispatch)))
			{
				continue;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			CComVariant value;
			if (!element) {
				continue;
			}
			if (!SUCCEEDED(element->getAttribute(CComBSTR(L"name"), 0, &value))) {
				continue;
			}

			if (wcscmp(browser->ConvertVariantToWString(&value).c_str(), criteria.c_str()) == 0 && this->IsOrUnder(node, element)) {
				element.CopyTo(found_element);
				return SUCCESS;
			}
		}

		return ENOSUCHELEMENT;
	}

	int FindByNameElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument2> doc;
		this->ExtractHtmlDocument2FromDomNode(node, &doc);
		if (!doc) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> element_collection;
		CComBSTR name(criteria.c_str());
		if (!SUCCEEDED(doc->get_all(&element_collection))) {
			return ENOSUCHELEMENT;
		}
		
		long elements_length;
		if (!SUCCEEDED(element_collection->get_length(&elements_length))) {
			return ENOSUCHELEMENT;
		}

		for (int i = 0; i < elements_length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(element_collection->item(idx, zero, &dispatch))) {
				continue;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			if (!element) {
				continue;
			}

			CComVariant value;
			if (!SUCCEEDED(element->getAttribute(CComBSTR(L"name"), 0, &value))) {
				continue;
			}

			if (wcscmp(browser->ConvertVariantToWString(&value).c_str(), criteria.c_str()) == 0 && this->IsOrUnder(node, element)) {
				IHTMLElement *dom_element = NULL;
				element.CopyTo(&dom_element);
				found_elements->push_back(dom_element);
			}
		}
		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYNAMEELEMENTFINDER_H_
