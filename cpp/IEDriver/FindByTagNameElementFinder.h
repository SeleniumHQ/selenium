#ifndef WEBDRIVER_IE_FINDBYTAGNAMEELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYTAGNAMEELEMENTFINDER_H_

#include "BrowserManager.h"

namespace webdriver {

class FindByTagNameElementFinder : public ElementFinder {
public:
	FindByTagNameElementFinder(void) {
	}

	virtual ~FindByTagNameElementFinder(void) {
	}

protected:
	int FindByTagNameElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		// Will use getElementsByTagName to get the elements,
		// so need the root document pointer for an IHTMLDocument3/
		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);

		CComPtr<IHTMLDocument3> root_doc;
		doc.QueryInterface<IHTMLDocument3>(&root_doc);
		if (!root_doc) 
		{
			return ENOSUCHDOCUMENT;
		}
		
		CComPtr<IHTMLElementCollection> elements;
		if (!SUCCEEDED(root_doc->getElementsByTagName(CComBSTR(criteria.c_str()), &elements))) {
			return ENOSUCHELEMENT;
		}

		if (!elements) {
			return ENOSUCHELEMENT;
		}

		long length;
		if (!SUCCEEDED(elements->get_length(&length))) {
			return ENOSUCHELEMENT;
		}

		CComQIPtr<IHTMLDOMNode> node(parent_element);

		for (int i = 0; i < length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(elements->item(idx, zero, &dispatch))) {
				continue;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			if (!element) {
				element;
			}

			// Check to see if the element is contained return if it is
			if (this->IsOrUnder(node, element)) {
				element.CopyTo(found_element);
				return SUCCESS;
			}
		}

		return ENOSUCHELEMENT;
	}

	int FindByTagNameElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements) {
		// Will use getElementsByTagName to get the elements,
		// so need the root document pointer for an IHTMLDocument3
		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);

		CComPtr<IHTMLDocument3> root_doc;
		doc.QueryInterface<IHTMLDocument3>(&root_doc);
		if (!root_doc) 
		{
			return ENOSUCHDOCUMENT;
		}
		
		CComPtr<IHTMLElementCollection> elements;
		if (!SUCCEEDED(root_doc->getElementsByTagName(CComBSTR(criteria.c_str()), &elements))) {
			return ENOSUCHELEMENT;
		}

		if (!elements) {
			return ENOSUCHELEMENT;
		}

		long length;
		if (!SUCCEEDED(elements->get_length(&length))) {
			return ENOSUCHELEMENT;
		}

		CComQIPtr<IHTMLDOMNode> node(parent_element);

		for (int i = 0; i < length; i++) {
			CComVariant idx;
			idx.vt = VT_I4;
			idx.lVal = i;
			CComVariant zero;
			zero.vt = VT_I4;
			zero.lVal = 0;
			CComPtr<IDispatch> dispatch;
			if (!SUCCEEDED(elements->item(idx, zero, &dispatch))) {
				continue;
			}

			CComQIPtr<IHTMLElement> element(dispatch);
			if (!element) {
				continue;
			}

			if (this->IsUnder(node, element)) {
				IHTMLElement *dom_element = NULL;
				element.CopyTo(&dom_element);
				found_elements->push_back(dom_element);
			}
		}

		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYTAGNAMEELEMENTFINDER_H_
