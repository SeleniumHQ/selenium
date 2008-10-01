#include "stdafx.h"
#include "utils.h"

extern wchar_t* XPATHJS[];

using namespace std;


void IeThread::OnSelectElementById(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	IHTMLElement* &pDom = data.output_html_element_;
	const wchar_t *elementId= data.input_string_;

	pDom = NULL;
	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument3> doc;
	getDocument3(node, &doc);

	if (!doc) 
	{
		errorKind = 1;
		return;
	}
 
	CComPtr<IHTMLElement> element;
	CComBSTR id(elementId);
	doc->getElementById(id, &element);

	if(NULL == element) return;
	
	CComVariant value;
	element->getAttribute(CComBSTR(L"id"), 0, &value);
	if (wcscmp( comvariant2cw(value), elementId)==0) 
	{
		if (isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}

	CComQIPtr<IHTMLDocument2> doc2(doc);

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);
	long length = 0;
	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	enumerator->Next(1, &var, NULL);

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{
		CComQIPtr<IHTMLElement> curr(disp);
		if (curr) 
		{
			CComVariant value;
			curr->getAttribute(CComBSTR(L"id"), 0, &value);
			if (wcscmp( comvariant2cw(value), elementId)==0) 
			{
				if (isOrUnder(node, curr)) {
					curr.CopyTo(&pDom);
					return;
				}
			}
		}
	}	
}

void IeThread::OnSelectElementsById(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *elementId= data.input_string_;

	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);

	if (!doc2) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);

	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	enumerator->Next(1, &var, NULL);

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{ // We are iterating through all the DOM elements
		CComQIPtr<IHTMLElement> curr(disp);
		if (!curr) continue;

		CComVariant value;
		curr->getAttribute(CComBSTR(L"id"), 0, &value);
		if (wcscmp( comvariant2cw(value), elementId)==0 && isOrUnder(node, curr)) 
		{
			IHTMLElement *pDom = NULL;
			curr.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}

void IeThread::OnSelectElementByLink(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	IHTMLElement* &pDom = data.output_html_element_;
	const wchar_t *elementLink= data.input_string_;

	pDom = NULL;
	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}


	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> linkCollection;
	doc->get_links(&linkCollection);
	
	long linksLength;
	linkCollection->get_length(&linksLength);

	for (int i = 0; i < linksLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		linkCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR linkText;
		element->get_innerText(&linkText);

		if (wcscmp(combstr2cw(linkText),elementLink)==0 && isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}
}

void IeThread::OnSelectElementsByLink(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *elementLink= data.input_string_;

	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);

	if (!doc2) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> linkCollection;
	doc2->get_links(&linkCollection);
	
	long linksLength;
	linkCollection->get_length(&linksLength);

	for (int i = 0; i < linksLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		linkCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR linkText;
		element->get_innerText(&linkText);

		if (wcscmp(combstr2cw(linkText),elementLink)==0 && isOrUnder(node, element)) {
			IHTMLElement *pDom = NULL;
			element.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}

void IeThread::OnSelectElementByName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_; 
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	IHTMLElement* &pDom = data.output_html_element_; 
	const wchar_t *elementName= data.input_string_; 

	pDom = NULL;
	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name(elementName);
	doc->get_all(&elementCollection);
	
	long elementsLength;
	elementCollection->get_length(&elementsLength);

	for (int i = 0; i < elementsLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR nameText;
		CComVariant value;
		element->getAttribute(CComBSTR(L"name"), 0, &value);
		if (wcscmp( comvariant2cw(value), elementName)==0 && isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}
}


void IeThread::OnSelectElementsByName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *elementName= data.input_string_;

	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name(elementName);
	doc->get_all(&elementCollection);
	
	long elementsLength;
	elementCollection->get_length(&elementsLength);

	for (int i = 0; i < elementsLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR nameText;
		CComVariant value;
		element->getAttribute(CComBSTR(L"name"), 0, &value);
		if (wcscmp( comvariant2cw(value), elementName)==0 && isOrUnder(node, element)) {
			IHTMLElement *pDom = NULL;
			element.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}


void IeThread::OnSelectElementByClassName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_; 
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	IHTMLElement* &pDom = data.output_html_element_; 
	const wchar_t *elementClassName= data.input_string_; 

	pDom = NULL;
	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);
	if (!doc2) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);

	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	CComBSTR nameRead;
	enumerator->Next(1, &var, NULL);

	const int exactLength = (int) wcslen(elementClassName);
	wchar_t *next_token, seps[] = L" ";

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{ // We are iterating through all the DOM elements
		CComQIPtr<IHTMLElement> curr(disp);
		if (!curr) continue;

		curr->get_className(&nameRead);
		if(!nameRead) continue;

		for ( wchar_t *token = wcstok_s(nameRead, seps, &next_token);
			  token;
			  token = wcstok_s( NULL, seps, &next_token) )
		{
			__w64 int lengthRead = next_token - token;
			if(*next_token!=NULL) lengthRead--;
			if(exactLength != lengthRead) continue;
			if(0!=wcscmp(elementClassName, token)) continue;
			if(!isOrUnder(node, curr)) continue;
			// Woohoo, we found it
			curr.CopyTo(&pDom);
			return;
		}
	}
}

void IeThread::OnSelectElementsByClassName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *elementClassName= data.input_string_;

	errorKind = 0;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = 1;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);
	if (!doc2) 
	{
		errorKind = 1;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);

	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	CComBSTR nameRead;
	enumerator->Next(1, &var, NULL);

	const int exactLength = (int) wcslen(elementClassName);
	wchar_t *next_token, seps[] = L" ";

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{ // We are iterating through all the DOM elements
		CComQIPtr<IHTMLElement> curr(disp);
		if (!curr) continue;

		curr->get_className(&nameRead);
		if(!nameRead) continue;

		for ( wchar_t *token = wcstok_s(nameRead, seps, &next_token);
			  token;
			  token = wcstok_s( NULL, seps, &next_token) )
		{
			__w64 int lengthRead = next_token - token;
			if(*next_token!=NULL) lengthRead--;
			if(exactLength != lengthRead) continue;
			if(0!=wcscmp(elementClassName, token)) continue;
			if(!isOrUnder(node, curr)) continue;
			// Woohoo, we found it
			IHTMLElement *pDom = NULL;
			curr.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}
