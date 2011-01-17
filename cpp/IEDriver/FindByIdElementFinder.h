#ifndef WEBDRIVER_IE_FINDBYIDELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYIDELEMENTFINDER_H_

#include "BrowserManager.h"

namespace webdriver {

class FindByIdElementFinder : public ElementFinder {
public:
	FindByIdElementFinder(void) {
	}

	virtual ~FindByIdElementFinder(void) {
	}

protected:
	int FindByIdElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument3> doc;
		this->ExtractHtmlDocument3FromDomNode(node, &doc);

		if (!doc) {
			return ENOSUCHDOCUMENT;
		}
	 
		CComPtr<IHTMLElement> element;
		CComBSTR id(criteria.c_str());
		if (!SUCCEEDED(doc->getElementById(id, &element))) {
			return ENOSUCHELEMENT;
		}

		if(NULL == element) {
			return ENOSUCHELEMENT;
		}
		
		CComVariant value;
		if (!SUCCEEDED(element->getAttribute(CComBSTR(L"id"), 0, &value))) {
			return ENOSUCHELEMENT;
		}

		if (wcscmp(browser->ConvertVariantToWString(&value).c_str(), criteria.c_str()) == 0) {
			if (this->IsOrUnder(node, element)) {
				element.CopyTo(found_element);
				return SUCCESS;
			}
		}

		CComQIPtr<IHTMLDocument2> doc2(doc);
		if (!doc2) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> allNodes;
		if (!SUCCEEDED(doc2->get_all(&allNodes))) {
			return ENOSUCHELEMENT;
		}

		long length = 0;
		CComPtr<IUnknown> unknown;
		if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
			return ENOSUCHELEMENT;
		}

		CComQIPtr<IEnumVARIANT> enumerator(unknown);
		if (!enumerator) {
			return ENOSUCHELEMENT;
		}

		CComVariant var;
		if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
			return ENOSUCHELEMENT;
		}

		for (CComPtr<IDispatch> disp;
			 disp = V_DISPATCH(&var); 
			 enumerator->Next(1, &var, NULL)) {
			CComQIPtr<IHTMLElement> curr(disp);
			if (curr)
			{
				CComVariant currrent_element_id_value;
				if (!SUCCEEDED(curr->getAttribute(CComBSTR(L"id"), 0, &currrent_element_id_value))) {
					continue;
				}
				if (wcscmp(browser->ConvertVariantToWString(&currrent_element_id_value).c_str(), criteria.c_str()) == 0) {
					if (this->IsOrUnder(node, curr)) {
						curr.CopyTo(found_element);
						return SUCCESS;
					}
				}
			}
		}	

		return ENOSUCHELEMENT;
	}

	int FindByIdElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument2> doc2;
		this->ExtractHtmlDocument2FromDomNode(node, &doc2);

		if (!doc2) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> allNodes;
		if (!SUCCEEDED(doc2->get_all(&allNodes))) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IUnknown> unknown;
		if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
			return ENOSUCHELEMENT;
		}

		CComQIPtr<IEnumVARIANT> enumerator(unknown);
		if (!enumerator) {
			return ENOSUCHELEMENT;
		}

		CComVariant var;
		enumerator->Next(1, &var, NULL);

		for (CComPtr<IDispatch> disp;
			 disp = V_DISPATCH(&var); 
			 enumerator->Next(1, &var, NULL)) { 
			// We are iterating through all the DOM elements
			CComQIPtr<IHTMLElement> curr(disp);
			if (!curr) {
				continue;
			}

			CComVariant value;
			if (!SUCCEEDED(curr->getAttribute(CComBSTR(L"id"), 0, &value))) {
				continue;
			}

			if (wcscmp(browser->ConvertVariantToWString(&value).c_str(), criteria.c_str()) == 0 && this->IsOrUnder(node, curr)) {
				IHTMLElement *dom_element = NULL;
				curr.CopyTo(&dom_element);
				found_elements->push_back(dom_element);
			}
		}

		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYIDELEMENTFINDER_H_
