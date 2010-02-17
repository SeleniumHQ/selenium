/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include "stdafx.h"
#include "errorcodes.h"
#include "utils.h"

using namespace std;

void IeThread::OnSelectElementById(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	int &errorKind = data.error_code;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	IHTMLElement* &pDom = data.output_html_element_;
	const wchar_t *elementId= data.input_string_;

	pDom = NULL;
	errorKind = SUCCESS;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument3> doc;
	getDocument3(node, &doc);

	if (!doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}
 
	CComPtr<IHTMLElement> element;
	CComBSTR id(elementId);
	if (!SUCCEEDED(doc->getElementById(id, &element))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	if(NULL == element) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	CComVariant value;
	if (!SUCCEEDED(element->getAttribute(CComBSTR(L"id"), 0, &value))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	if (wcscmp(comvariant2cw(value), elementId)==0) 
	{
		if (isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}

	CComQIPtr<IHTMLDocument2> doc2(doc);
	if (!doc2) {
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	if (!SUCCEEDED(doc2->get_all(&allNodes))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	long length = 0;
	CComPtr<IUnknown> unknown;
	if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComQIPtr<IEnumVARIANT> enumerator(unknown);
	if (!enumerator) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComVariant var;
	if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{
		CComQIPtr<IHTMLElement> curr(disp);
		if (curr)
		{
			CComVariant value;
			if (!SUCCEEDED(curr->getAttribute(CComBSTR(L"id"), 0, &value))) {
				continue;
			}
			if (wcscmp( comvariant2cw(value), elementId)==0) 
			{
				if (isOrUnder(node, curr)) {
					curr.CopyTo(&pDom);
					return;
				}
			}
		}
	}	

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsById(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
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
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);

	if (!doc2) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	if (!SUCCEEDED(doc2->get_all(&allNodes))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IUnknown> unknown;
	if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	CComQIPtr<IEnumVARIANT> enumerator(unknown);
	if (!enumerator) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComVariant var;
	enumerator->Next(1, &var, NULL);

	for (CComPtr<IDispatch> disp;
		 disp = V_DISPATCH(&var); 
		 enumerator->Next(1, &var, NULL)) 
	{ // We are iterating through all the DOM elements
		CComQIPtr<IHTMLElement> curr(disp);
		if (!curr) continue;

		CComVariant value;
		if (!SUCCEEDED(curr->getAttribute(CComBSTR(L"id"), 0, &value))) {
			continue;
		}
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
	int &errorKind = data.error_code;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	IHTMLElement* &pDom = data.output_html_element_;
	const wchar_t *elementLink = StripTrailingWhitespace((wchar_t *)data.input_string_);

	pDom = NULL;
	errorKind = SUCCESS;

	CComPtr<IHTMLDocument3> root_doc;
	getDocument3(&root_doc);

	/// Start from root DOM by default
	if(!inputElement)
	{
		if (!root_doc) 
		{
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		CComQIPtr<IHTMLDocument2> bodyDoc(root_doc);
		if (bodyDoc) {
			bodyDoc->get_body(&inputElement);
		}
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	CComQIPtr<IHTMLElement2> element2(inputElement);
	if (!element2 || !node)
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> elements;
	if (!SUCCEEDED(element2->getElementsByTagName(CComBSTR("A"), &elements))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long linksLength;
	if (!SUCCEEDED(elements->get_length(&linksLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < linksLength; i++) {
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

		CComBSTR linkText;
		if (!SUCCEEDED(element->get_innerText(&linkText))) {
			continue;
		}

		if (wcscmp(StripTrailingWhitespace((wchar_t *)combstr2cw(linkText)),elementLink)==0 && isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsByLink(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *elementLink = StripTrailingWhitespace((wchar_t *)data.input_string_);

	errorKind = SUCCESS;

	CComPtr<IHTMLDocument3> root_doc;
	getDocument3(&root_doc);

	/// Start from root DOM by default
	if(!inputElement)
	{
		if (!root_doc) 
		{
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		CComQIPtr<IHTMLDocument2> bodyDoc(root_doc);
		if (bodyDoc) {
			bodyDoc->get_body(&inputElement);
		}
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	CComQIPtr<IHTMLElement2> element2(inputElement);
	if (!element2 || !node)
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> elements;
	if (!SUCCEEDED(element2->getElementsByTagName(CComBSTR("A"), &elements))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long linksLength;
	if (!SUCCEEDED(elements->get_length(&linksLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < linksLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		if (!SUCCEEDED(elements->item(idx, zero, &dispatch))) {
			errorKind = ENOSUCHELEMENT;
			return;
		}

		CComQIPtr<IHTMLElement> element(dispatch);
		if (!element) {
			continue;
		}

		CComBSTR linkText;
		element->get_innerText(&linkText);

		if (wcscmp(StripTrailingWhitespace((wchar_t *)combstr2cw(linkText)),elementLink)==0 && isOrUnder(node, element)) {
			IHTMLElement *pDom = NULL;
			element.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}

void IeThread::OnSelectElementByPartialLink(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	int &errorKind = data.error_code;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	IHTMLElement* &pDom = data.output_html_element_;
	const wchar_t *elementLink = data.input_string_;

	pDom = NULL;
	errorKind = SUCCESS;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = -ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}


	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> linkCollection;
	if (!SUCCEEDED(doc->get_links(&linkCollection))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long linksLength;
	if (!SUCCEEDED(linkCollection->get_length(&linksLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < linksLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		if (!SUCCEEDED(linkCollection->item(idx, zero, &dispatch))) {
			continue;
		}

		CComQIPtr<IHTMLElement> element(dispatch);
		if (!element) {
			continue;
		}

		CComBSTR linkText;
		element->get_innerText(&linkText);

		if (wcsstr(combstr2cw(linkText),elementLink) && isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			return;
		}
	}

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsByPartialLink(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
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
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);

	if (!doc2) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> linkCollection;
	if (!SUCCEEDED(doc2->get_links(&linkCollection))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long linksLength;
	if (!SUCCEEDED(linkCollection->get_length(&linksLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < linksLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		if (!SUCCEEDED(linkCollection->item(idx, zero, &dispatch))) {
			continue;
		}

		CComQIPtr<IHTMLElement> element(dispatch);
		if (!element) {
			continue;
		}

		CComBSTR linkText;
		element->get_innerText(&linkText);

		if (wcsstr(combstr2cw(linkText),elementLink) && isOrUnder(node, element)) {
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
	int &errorKind = data.error_code; 
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
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
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name(elementName);
	if (!SUCCEEDED(doc->get_all(&elementCollection))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long elementsLength;
	if (!SUCCEEDED(elementCollection->get_length(&elementsLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < elementsLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		if (!SUCCEEDED(elementCollection->item(idx, zero, &dispatch))) {
			continue;
		}

		CComQIPtr<IHTMLElement> element(dispatch);
		CComBSTR nameText;
		CComVariant value;
		if (!element) {
			continue;
		}
		if (!SUCCEEDED(element->getAttribute(CComBSTR(L"name"), 0, &value))) {
			continue;
		}

		if (wcscmp(comvariant2cw(value), elementName)==0 && isOrUnder(node, element)) {
			element.CopyTo(&pDom);
			errorKind = SUCCESS;
			return;
		}
	}

	errorKind = ENOSUCHELEMENT;
}


void IeThread::OnSelectElementsByName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
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
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);
	if (!doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name(elementName);
	if (!SUCCEEDED(doc->get_all(&elementCollection))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	
	long elementsLength;
	if (!SUCCEEDED(elementCollection->get_length(&elementsLength))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	for (int i = 0; i < elementsLength; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		if (!SUCCEEDED(elementCollection->item(idx, zero, &dispatch))) {
			continue;
		}

		CComQIPtr<IHTMLElement> element(dispatch);
		if (!element) {
			continue;
		}

		CComBSTR nameText;
		CComVariant value;
		if (!SUCCEEDED(element->getAttribute(CComBSTR(L"name"), 0, &value))) {
			continue;
		}

		if (wcscmp( comvariant2cw(value), elementName)==0 && isOrUnder(node, element)) {
			IHTMLElement *pDom = NULL;
			element.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}

void IeThread::OnSelectElementByTagName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	int &errorKind = data.error_code; 
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	IHTMLElement* &pDom = data.output_html_element_; 
	const wchar_t *tagName = data.input_string_; 

	pDom = NULL;
	errorKind = SUCCESS;

	CComPtr<IHTMLDocument3> root_doc;
	getDocument3(&root_doc);
	if (!root_doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}
	
	CComPtr<IHTMLElementCollection> elements;
	if (!SUCCEEDED(root_doc->getElementsByTagName(CComBSTR(tagName), &elements))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	if (!elements)
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	long length;
	if (!SUCCEEDED(elements->get_length(&length))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);

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
		if (isOrUnder(node, element))
		{
			element.CopyTo(&pDom);
			return;
		}
	}

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsByTagName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	const wchar_t *tagName = data.input_string_;

	errorKind = 0;

	/// Start from root DOM by default
	CComPtr<IHTMLDocument3> root_doc;
	getDocument3(&root_doc);
	if (!root_doc) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}
	
	CComPtr<IHTMLElementCollection> elements;
	if (!SUCCEEDED(root_doc->getElementsByTagName(CComBSTR(tagName), &elements))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	if (!elements)
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	long length;
	if (!SUCCEEDED(elements->get_length(&length))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);

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

		if (isOrUnder(node, element)) {
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
	int &errorKind = data.error_code;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
	IHTMLElement* &pDom = data.output_html_element_; 
	const wchar_t *elementClassName= data.input_string_; 

	pDom = NULL;
	errorKind = SUCCESS;

	/// Start from root DOM by default
	if(!inputElement)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);
	if (!doc2) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	if (!SUCCEEDED(doc2->get_all(&allNodes))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IUnknown> unknown;
	if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	CComQIPtr<IEnumVARIANT> enumerator(unknown);
	if (!enumerator) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComVariant var;
	CComBSTR nameRead;
	if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

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

    nameRead = StripTrailingWhitespace(nameRead);

		for ( wchar_t *token = wcstok_s(nameRead, seps, &next_token);
			  token;
			  token = wcstok_s( NULL, seps, &next_token) )
		{
			__int64 lengthRead = next_token - token;
			if(*next_token!=NULL) lengthRead--;
			if(exactLength != lengthRead) continue;
			if(0!=wcscmp(elementClassName, token)) continue;
			if(!isOrUnder(node, curr)) continue;
			// Woohoo, we found it
			curr.CopyTo(&pDom);
			return;
		}
	}

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsByClassName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	long &errorKind = data.output_long_;
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);
	checkValidDOM(inputElement);
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
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IHTMLDocument2> doc2;
	getDocument2(node, &doc2);
	if (!doc2) 
	{
		errorKind = ENOSUCHDOCUMENT;
		return;
	}

	CComPtr<IHTMLElementCollection> allNodes;
	if (!SUCCEEDED(doc2->get_all(&allNodes))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComPtr<IUnknown> unknown;
	if (!SUCCEEDED(allNodes->get__newEnum(&unknown))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}
	CComQIPtr<IEnumVARIANT> enumerator(unknown);
	if (!enumerator) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

	CComVariant var;
	CComBSTR nameRead;
	if (!SUCCEEDED(enumerator->Next(1, &var, NULL))) {
		errorKind = ENOSUCHELEMENT;
		return;
	}

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

    nameRead = StripTrailingWhitespace(nameRead);

		for ( wchar_t *token = wcstok_s(nameRead, seps, &next_token);
			  token;
			  token = wcstok_s( NULL, seps, &next_token) )
		{
			__int64 lengthRead = next_token - token;
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
