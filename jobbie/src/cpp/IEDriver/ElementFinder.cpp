#include "StdAfx.h"
#include "BrowserManager.h"

namespace webdriver {

ElementFinder::ElementFinder(void) {
}

ElementFinder::~ElementFinder(void) {
}

int ElementFinder::FindElement(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, ElementWrapper **found_element) {
	BrowserWrapper *browser;
	int status_code = manager->GetCurrentBrowser(&browser);
	if (status_code == SUCCESS) {
		IHTMLElement *parent_element;
		status_code = this->GetParentElement(browser, parent_wrapper, &parent_element);
		if (status_code == SUCCESS) {
			IHTMLElement *element;
			status_code = this->FindElementInternal(browser, parent_element, criteria, &element);
			if (status_code == SUCCESS) {
				ElementWrapper *wrapper;
				manager->AddManagedElement(element, &wrapper);
				*found_element = wrapper;
			}
		}
	}
	return status_code;
}

int ElementFinder::FindElements(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, std::vector<ElementWrapper*> *found_elements) {
	BrowserWrapper *browser;
	int status_code = manager->GetCurrentBrowser(&browser);
	if (status_code == SUCCESS) {
		IHTMLElement *parent_element;
		status_code = this->GetParentElement(browser, parent_wrapper, &parent_element);
		if (status_code == SUCCESS) {
			std::vector<IHTMLElement*> raw_elements;
			status_code = this->FindElementsInternal(browser, parent_element, criteria, &raw_elements);
			std::vector<IHTMLElement*>::iterator begin = raw_elements.begin();
			std::vector<IHTMLElement*>::iterator end = raw_elements.end();
			for (std::vector<IHTMLElement*>::iterator it = begin; it != end; ++it) {
				ElementWrapper *wrapper;
				manager->AddManagedElement(*it, &wrapper);
				found_elements->push_back(wrapper);
			}
		}
	}
	return status_code;
}

int ElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **element) {
	return ENOSUCHELEMENT;
}

int ElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *elements) {
	return ENOSUCHELEMENT;
}

void ElementFinder::GetHtmlDocument3(BrowserWrapper *browser, IHTMLDocument3 **doc3) {
	CComPtr<IHTMLDocument2> doc;
	browser->GetDocument(&doc);

	CComQIPtr<IHTMLDocument3> doc3_qi_pointer(doc);
	if (doc3_qi_pointer) {
		*doc3 = doc3_qi_pointer.Detach();
	}
}

void ElementFinder::ExtractHtmlDocument3FromDomNode(const IHTMLDOMNode* extraction_node, IHTMLDocument3** doc) {
	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extraction_node));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument3> doc_qi_pointer(dispatch);
	*doc = doc_qi_pointer.Detach();
}

void ElementFinder::ExtractHtmlDocument2FromDomNode(const IHTMLDOMNode* extraction_node, IHTMLDocument2** doc) {
	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extraction_node));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument2> doc_qi_pointer(dispatch);
	*doc = doc_qi_pointer.Detach();
}

int ElementFinder::GetParentElement(BrowserWrapper *browser, ElementWrapper *parent_wrapper, IHTMLElement **parent_element) {
	int status_code = SUCCESS;
	if (parent_wrapper != NULL) {
		*parent_element = parent_wrapper->element();
	} else {
		// No parent element specified, so get the root document
		// element as the parent element.
		CComPtr<IHTMLDocument3> root_doc;
		this->GetHtmlDocument3(browser, &root_doc);
		if (!root_doc) {
			status_code = ENOSUCHDOCUMENT;
		} else {
			root_doc->get_documentElement(parent_element);
		}
	}

	return status_code;
}

bool ElementFinder::IsOrUnder(const IHTMLDOMNode* root, IHTMLElement* child)  {
	CComQIPtr<IHTMLElement> parent(const_cast<IHTMLDOMNode*>(root));

	if (!parent) {
		return true;
	}

	VARIANT_BOOL to_return;
	HRESULT hr = parent->contains(child, &to_return);
	if (FAILED(hr)) {
		// LOGHR(WARN, hr) << "Cannot determine if parent contains child node";
		return false;
	}

	return to_return == VARIANT_TRUE;
}

bool ElementFinder::IsUnder(const IHTMLDOMNode* root, IHTMLElement* child) {
	CComQIPtr<IHTMLDOMNode> child_node(child);
	return this->IsOrUnder(root, child) && root != child_node;
}

std::wstring ElementFinder::StripTrailingWhitespace(std::wstring input) {
	// TODO: make the whitespace finder more comprehensive.
	std::wstring whitespace = L" \t\n\f\v\r";
	if (input.length() == 0) {
		return input; 
	}

	size_t pos = input.find_last_not_of(whitespace); 
	if ((pos + 1) == input.length() || pos == std::string::npos) {
		return input; 
	}

	return input.substr(0, (pos + 1)); 
}

} // namespace webdriver