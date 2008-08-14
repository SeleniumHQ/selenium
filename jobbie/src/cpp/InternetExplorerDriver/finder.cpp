#include "StdAfx.h"
#include "utils.h"
#include <exdispid.h>
#include <iostream>
#include <jni.h>
#include <comutil.h>
#include <comdef.h>
#include <stdlib.h>
#include <string>
#include <activscp.h>
#include "atlbase.h"
#include "atlstr.h"
#include "jsxpath.h"

using namespace std;

void getDocument2(InternetExplorerDriver* ie, const IHTMLDOMNode* extractFrom, IHTMLDocument2** pdoc) {
	if (!extractFrom) {
		ie->getDocument(pdoc);
		return;
	}

	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extractFrom));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument2> doc(dispatch);
	*pdoc = doc.Detach();
}

void getDocument3(InternetExplorerDriver* ie, const IHTMLDOMNode* extractFrom, IHTMLDocument3** pdoc) {
	if (!extractFrom) {
		ie->getDocument3(pdoc);
		return;
	}

	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extractFrom));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument3> doc(dispatch);
	*pdoc = doc.Detach();
}

bool isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child) 
{
	if (!root)
		return true;

	CComQIPtr<IHTMLElement> parent(const_cast<IHTMLDOMNode*>(root));
	VARIANT_BOOL toReturn;
	parent->contains(child, &toReturn);

	return toReturn == VARIANT_TRUE;
}

void findElementById(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* findThis)
{
	CComPtr<IHTMLDocument3> doc;
	getDocument3(ie, node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElement> element;
	BSTR id = SysAllocString(findThis);
	doc->getElementById(id, &element);
	SysFreeString(id);
	
	if (element != NULL) {
		CComVariant value;
		element->getAttribute(CComBSTR(L"id"), 0, &value);
		std::wstring converted = variant2wchar(value);
		if (converted == findThis)
		{
			if (isOrUnder(node, element)) {
				element.QueryInterface(result);
				return;
			}
			// Fall through
		}

		CComQIPtr<IHTMLDocument2> doc2(doc);

		CComPtr<IHTMLElementCollection> allNodes;
		doc2->get_all(&allNodes);
		long length = 0;
		CComPtr<IUnknown> unknown;
		allNodes->get__newEnum(&unknown);
		CComQIPtr<IEnumVARIANT> enumerator(unknown);

		VARIANT var;
		VariantInit(&var);
		enumerator->Next(1, &var, NULL);
		IDispatch *disp;
		disp = V_DISPATCH(&var);

		while (disp) 
		{
			CComQIPtr<IHTMLElement> curr(disp);
			disp->Release();
			if (curr) 
			{
				CComVariant value;
				curr->getAttribute(CComBSTR(L"id"), 0, &value);
				std::wstring converted = variant2wchar(value);
				if (findThis == converted) 
				{
					if (isOrUnder(node, curr)) {
						curr.QueryInterface(result);
						return;
					}
				}
			}

			VariantInit(&var);
			enumerator->Next(1, &var, NULL);
			disp = V_DISPATCH(&var);
		}
	}
}

void findElementsById(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t *id)
{
	CComPtr<IHTMLDocument2> doc2;
	getDocument2(ie, node, &doc2);

	if (!doc2) 
		return;
		
	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);
	long length = 0;
	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	VARIANT var;
	VariantInit(&var);
	enumerator->Next(1, &var, NULL);
	IDispatch *disp;
	disp = V_DISPATCH(&var);

	while (disp) 
	{
		CComQIPtr<IHTMLElement> curr(disp);
		disp->Release();
		if (curr) 
		{
			CComVariant value;
			curr->getAttribute(CComBSTR(L"id"), 0, &value);
			std::wstring converted = variant2wchar(value);
			if (id == converted && isOrUnder(node, curr)) 
			{
				CComQIPtr<IHTMLDOMNode> node(curr);
				toReturn->push_back(new ElementWrapper(ie, node));
			}
		}

		VariantInit(&var);
		enumerator->Next(1, &var, NULL);
		disp = V_DISPATCH(&var);
	}
}

void findElementByName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* elementName)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name = SysAllocString(elementName);
	doc->get_all(&elementCollection);
	
	long elementsLength;
	elementCollection->get_length(&elementsLength);

	for (int i = 0; i < elementsLength; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR nameText;
		CComVariant value;
		element->getAttribute(CComBSTR(L"name"), 0, &value);
		std::wstring converted = variant2wchar(value);

		if (wcscmp(elementName, converted.c_str()) == 0 && isOrUnder(node, element)) {
			element.QueryInterface(result);
			return;
		}
	}
}

void findElementsByName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* elementName)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElementCollection> elementCollection;
	CComBSTR name = SysAllocString(elementName);
	doc->get_all(&elementCollection);

	long elementsLength;
	elementCollection->get_length(&elementsLength);

	for (int i = 0; i < elementsLength; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR nameText;
		CComVariant value;
		element->getAttribute(CComBSTR(L"name"), 0, &value);
		std::wstring converted = variant2wchar(value);
		if (elementName == converted && isOrUnder(node, element)) {
			CComQIPtr<IHTMLDOMNode> elementNode(element);
			toReturn->push_back(new ElementWrapper(ie, elementNode));
		}
	}
}

void findElementByClassName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name)
{
	CComPtr<IHTMLDocument2> doc2;
	getDocument2(ie, node, &doc2);

	if (!doc2) 
		return;

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);

	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	CComBSTR nameRead;
	enumerator->Next(1, &var, NULL);

	const int exactLength = (int) wcslen(name);
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
			if(0!=wcscmp(name, token)) continue;
			if(!isOrUnder(node, curr)) continue;

			// Woohoo, we found it
			curr.QueryInterface(result);
			return;
		}
	}
}

void findElementsByClassName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name)
{
	CComPtr<IHTMLDocument2> doc2;
	getDocument2(ie, node, &doc2);

	if (!doc2) 
		return;

	CComPtr<IHTMLElementCollection> allNodes;
	doc2->get_all(&allNodes);

	CComPtr<IUnknown> unknown;
	allNodes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);

	CComVariant var;
	CComBSTR nameRead;
	enumerator->Next(1, &var, NULL);

	const int exactLength = (int) wcslen(name);
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
			if(0!=wcscmp(name, token)) continue;
			if(!isOrUnder(node, curr)) continue;
			// Woohoo, we found it
			CComQIPtr<IHTMLDOMNode> node(curr);
			
			toReturn->push_back(new ElementWrapper(ie, node));
		}
	}

	return;
}

void findElementByLinkText(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* text)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElementCollection> linkCollection;
	doc->get_links(&linkCollection);
	
	long linksLength;
	linkCollection->get_length(&linksLength);

	for (int i = 0; i < linksLength; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		linkCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR linkText;
		element->get_innerText(&linkText);

		std::wstring converted = bstr2wstring(linkText);
		if (converted == text && isOrUnder(node, element)) {
			element.QueryInterface(result);
			return;
		}
	}
}

void findElementsByLinkText(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* text)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElementCollection> linkCollection;
	doc->get_links(&linkCollection);
	
	long linksLength;
	linkCollection->get_length(&linksLength);

	for (int i = 0; i < linksLength; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		CComPtr<IDispatch> dispatch;
		linkCollection->item(idx, zero, &dispatch);

		CComQIPtr<IHTMLElement> element(dispatch);

		CComBSTR linkText;
		element->get_innerText(&linkText);

		std::wstring converted = bstr2wstring(linkText);
		if (converted == text && isOrUnder(node, element)) {
			CComQIPtr<IHTMLDOMNode> linkNode(element);
			toReturn->push_back(new ElementWrapper(ie, linkNode));
		}
	}
}

bool addEvaluateToDocument(const IHTMLDOMNode* node, InternetExplorerDriver* ie, int count)
{
	// Is there an evaluate method on the document?
	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	if (!doc) {
		cerr << "No HTML document found" << endl;
		return false;
	}

	CComPtr<IDispatch> evaluate;
	DISPID dispid;
	OLECHAR FAR* szMember = L"__webdriver_evaluate";
    HRESULT hr = doc->GetIDsOfNames(IID_NULL, &szMember, 1, LOCALE_USER_DEFAULT, &dispid);
	if (SUCCEEDED(hr)) {
		return true;
	}

	// Create it if necessary
	CComPtr<IHTMLWindow2> win;
	doc->get_parentWindow(&win);
	
	std::wstring script;
	for (int i = 0; XPATHJS[i]; i++) {
		script += XPATHJS[i];
	}
	
	ie->executeScript(script.c_str(), NULL, NULL);
	
	hr = doc->GetIDsOfNames(IID_NULL, &szMember, 1, LOCALE_USER_DEFAULT, &dispid);
	if (FAILED(hr)) {
		cerr << "After attempting to add the xpath engine, the evaluate method is still missing" << endl;
		if (count < 1) {
			return addEvaluateToDocument(node, ie, ++count);
		}
	
		return false;
	}
	return true;
}

void findElementByXPath(IHTMLDOMNode** res, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* xpath)
{
	if (!addEvaluateToDocument(node, ie, 0)) {
		cerr << "Could not add evaluate to document" << endl;
		return;
	}

	std::wstring expr;
	if (node)
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res.snapshotItem(0);};})();";
	else
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res.snapshotItem(0);};})();";

	CComVariant result;
	CComBSTR expression = CComBSTR(xpath);

	SAFEARRAY* args;
	if (node) {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
		long index = 1;
		VARIANT dest2;
		CComQIPtr<IHTMLElement> element(const_cast<IHTMLDOMNode*>(node));
		dest2.vt = VT_DISPATCH;
		dest2.pdispVal = element;
		SafeArrayPutElement(args, &index, &dest2);
	} else {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	}
	
	long index = 0;
	VARIANT dest;
	dest.vt = VT_BSTR;
	dest.bstrVal = expression;
	SafeArrayPutElement(args, &index, &dest);
		
	ie->executeScript(expr.c_str(), args, &result);

	if (result.vt == VT_DISPATCH) {
		CComQIPtr<IHTMLElement> e(result.pdispVal);
		
		if (e && isOrUnder(node, e)) {
			e.QueryInterface(res);
			return;
		}
	}
}

void findElementsByXPath(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* xpath)
{
	if (!addEvaluateToDocument(node, ie, 0))
		return;

	std::wstring expr;
	if (node)
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res;};})();";
	else
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res;};})();";

	CComVariant result;
	CComBSTR expression = CComBSTR(xpath);
	SAFEARRAY* args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	
	long index = 1;
	VARIANT dest2;
	CComQIPtr<IHTMLElement> element(const_cast<IHTMLDOMNode*>(node));
	dest2.vt = VT_DISPATCH;
	dest2.pdispVal = element;
	SafeArrayPutElement(args, &index, &dest2);

	index = 0;
	VARIANT dest;
	dest.vt = VT_BSTR;
	dest.bstrVal = expression;
	SafeArrayPutElement(args, &index, &dest);
	
	ie->executeScript(expr.c_str(), args, &result);

	// At this point, the result should contain a JS array of nodes.
	if (result.vt != VT_DISPATCH) {
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(ie, node, &doc);

	CComPtr<IDispatch> scriptEngine;
	doc->get_Script(&scriptEngine);

	CComPtr<IDispatch> jsArray = result.pdispVal;
	DISPID shiftId;
	OLECHAR FAR* szMember = L"iterateNext";
	result.pdispVal->GetIDsOfNames(IID_NULL, &szMember, 1, LOCALE_USER_DEFAULT, &shiftId);

	DISPID lengthId;
	szMember = L"snapshotLength";
	result.pdispVal->GetIDsOfNames(IID_NULL, &szMember, 1, LOCALE_USER_DEFAULT, &lengthId);

	DISPPARAMS parameters = {0};
    parameters.cArgs = 0;
	EXCEPINFO exception;

	CComVariant lengthResult;
	result.pdispVal->Invoke(lengthId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &parameters, &lengthResult, &exception, 0);

	long length = lengthResult.lVal;

	for (int i = 0; i < length; i++) {
		CComVariant shiftResult;
		result.pdispVal->Invoke(shiftId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &parameters, &shiftResult, &exception, 0);
		if (shiftResult.vt == VT_DISPATCH) {
			CComQIPtr<IHTMLDOMNode> node(shiftResult.pdispVal);
			toReturn->push_back(new ElementWrapper(ie, node));
		}
	}
}