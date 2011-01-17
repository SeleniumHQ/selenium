#ifndef WEBDRIVER_IE_FINDBYCLASSNAMEELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYCLASSNAMEELEMENTFINDER_H_

#include "BrowserManager.h"

namespace webdriver {

class FindByClassNameElementFinder : public ElementFinder {
public:
	FindByClassNameElementFinder(void) {
	}

	virtual ~FindByClassNameElementFinder(void) {
	}

protected:
	int FindByClassNameElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument2> doc2;
		this->ExtractHtmlDocument2FromDomNode(node, &doc2);
		if (!doc2) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> all_nodes;
		if (!SUCCEEDED(doc2->get_all(&all_nodes))) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IUnknown> unknown;
		if (!SUCCEEDED(all_nodes->get__newEnum(&unknown))) {
			return ENOSUCHELEMENT;
		}
		CComQIPtr<IEnumVARIANT> enumerator(unknown);
		if (!enumerator) {
			return ENOSUCHELEMENT;
		}

		CComVariant var;
		CComBSTR name_read;
		if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
			return ENOSUCHELEMENT;
		}

		const int exact_length = (int) wcslen(criteria.c_str());
		wchar_t *next_token, seps[] = L" ";

		for (CComPtr<IDispatch> disp;
			 disp = V_DISPATCH(&var); 
			 enumerator->Next(1, &var, NULL)) 
		{
			// We are iterating through all the DOM elements
			CComQIPtr<IHTMLElement> curr(disp);
			if (!curr) continue;

			curr->get_className(&name_read);
			if(!name_read) continue;

			std::wstring class_name;
			class_name = this->StripTrailingWhitespace((BSTR)name_read);

			for ( wchar_t *token = wcstok_s(&class_name[0], seps, &next_token);
				  token;
				  token = wcstok_s( NULL, seps, &next_token) )
			{
				__int64 length_read = next_token - token;
				if(*next_token != NULL) length_read--;
				if(exact_length != length_read) continue;
				if(0 != wcscmp(criteria.c_str(), token)) continue;
				if(!this->IsOrUnder(node, curr)) continue;
				// Woohoo, we found it
				curr.CopyTo(found_element);
				return SUCCESS;
			}
		}

		return ENOSUCHELEMENT;
	}

	int FindByClassNameElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements) {
		CComQIPtr<IHTMLDOMNode> node(parent_element);
		if (!node) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IHTMLDocument2> doc2;
		this->ExtractHtmlDocument2FromDomNode(node, &doc2);
		if (!doc2) {
			return ENOSUCHDOCUMENT;
		}

		CComPtr<IHTMLElementCollection> all_nodes;
		if (!SUCCEEDED(doc2->get_all(&all_nodes))) {
			return ENOSUCHELEMENT;
		}

		CComPtr<IUnknown> unknown;
		if (!SUCCEEDED(all_nodes->get__newEnum(&unknown))) {
			return ENOSUCHELEMENT;
		}

		CComQIPtr<IEnumVARIANT> enumerator(unknown);
		if (!enumerator) {
			return ENOSUCHELEMENT;
		}

		CComVariant var;
		CComBSTR name_read;
		if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
			return ENOSUCHELEMENT;
		}

		const int exactLength = (int) wcslen(criteria.c_str());
		wchar_t *next_token, seps[] = L" ";

		for (CComPtr<IDispatch> disp;
			 disp = V_DISPATCH(&var); 
			 enumerator->Next(1, &var, NULL)) {
			// We are iterating through all the DOM elements
			CComQIPtr<IHTMLElement> curr(disp);
			if (!curr) continue;

			curr->get_className(&name_read);
			if(!name_read) continue;

			std::wstring class_name;
			class_name = this->StripTrailingWhitespace((BSTR)name_read);

			for ( wchar_t *token = wcstok_s(&class_name[0], seps, &next_token);
				  token;
				  token = wcstok_s( NULL, seps, &next_token) )
			{
				__int64 length_read = next_token - token;
				if(*next_token != NULL) length_read--;
				if(exactLength != length_read) continue;
				if(0 != wcscmp(criteria.c_str(), token)) continue;
				if(!this->IsOrUnder(node, curr)) continue;
				// Woohoo, we found it
				IHTMLElement *dom_element = NULL;
				curr.CopyTo(&dom_element);
				found_elements->push_back(dom_element);
			}
		}
		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYCLASSNAMEELEMENTFINDER_H_
