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

// IEThread.cpp : implementation file


#include "stdafx.h"
#include <comdef.h>

#include "IEThread.h"

#include "errorcodes.h"
#include "utils.h"
#include "windowHandling.h"
#include "InternalCustomMessage.h"

extern wchar_t* XPATHJS[];

using namespace std;


void IeThread::OnGetVisible(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	VARIANT_BOOL visible;
	pBody->ieThreaded->get_Visible(&visible);

	data.output_bool_ = (visible == VARIANT_TRUE);
}

void IeThread::OnSetVisible(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	const long& isVisible = data.input_long_;

	if (isVisible)
		pBody->ieThreaded->put_Visible(VARIANT_TRUE);
	else 
		pBody->ieThreaded->put_Visible(VARIANT_FALSE);
}

void IeThread::OnGetCurrentUrl(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	std::wstring& ret = data.output_string_;

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	if (!doc) {
		ret = L"";
		return;
	}

	CComBSTR url;
	doc->get_URL(&url);
	ret = combstr2cw(url);
}


void IeThread::OnGetUrl(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	const wchar_t* url = data.input_string_; 

	CComVariant spec(url);
	CComVariant dummy;
	tryTransferEventReleaserToNotifyNavigCompleted(&SC);
	HRESULT hr = pBody->ieThreaded->Navigate2(&spec, &dummy, &dummy, &dummy, &dummy);

	pBody->pathToFrame = L"";

	try{
	if(FAILED(hr))
	{
		 _com_issue_error( hr );
	}}
	catch (_com_error &e)
	 {
	  cerr << "COM Error" << " J[" << hex << GetCurrentThreadId() << "]" << endl;
	  cerr << "Message = " << e.ErrorMessage() << endl;

		  if ( e.ErrorInfo() )
			 cerr << e.Description() << endl;

		tryTransferEventReleaserToNotifyNavigCompleted(&SC, false);
	 }

	// In the nominal case, the next part of the code to be traversed is:
	// IeSink::DocumentComplete()
	// then IeThread::waitForNavigateToFinish()
}

void IeThread::OnGetPageSource(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	getPageSource(data.output_string_);
}

void IeThread::getPageSource(std::wstring& res)
{
	CComPtr<IHTMLDocument3> doc;
	getDocument3(&doc);
	
	if (!doc) {
		return;
	}

	CComPtr<IHTMLElement> docElement;
	doc->get_documentElement(&docElement);
	
	CComBSTR html;
	docElement->get_outerHTML(&html);

	res = combstr2cw(html);
}

void IeThread::OnGetTitle(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	getTitle(data.output_string_);
}

void IeThread::getTitle(std::wstring& res)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	
	if (!doc) 
	{
		res = std::wstring(L"");
		return;
	}

	CComBSTR title;
	doc->get_title(&title);
	res = combstr2cw(title);
}

void IeThread::OnGoForward(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	tryTransferEventReleaserToNotifyNavigCompleted(&SC);
	HRESULT hr = pBody->ieThreaded->GoForward();
	if (!SUCCEEDED(hr)) 
	{
		tryTransferEventReleaserToNotifyNavigCompleted(&SC, false);
	}
}

void IeThread::OnGoBack(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	tryTransferEventReleaserToNotifyNavigCompleted(&SC);
	HRESULT hr = pBody->ieThreaded->GoBack();
	if (!SUCCEEDED(hr)) 
	{
		tryTransferEventReleaserToNotifyNavigCompleted(&SC, false);
	}
}

void IeThread::OnGetHandle(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data);

	HWND hwnd;
	pBody->ieThreaded->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hwnd));

	// Let's hope we fit into 8 characters
	wchar_t buffer[9];
	swprintf_s(buffer, 9, L"%08X", (long long) hwnd);
	std::wstring& ret = data.output_string_;  
	ret.append(buffer);
}

std::wstring getWindowHandle(IWebBrowser2* browser)
{
	HWND hwnd;
	browser->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hwnd));

	// Let's hope we fit into 8 characters
	wchar_t buffer[9];
	swprintf_s(buffer, 9, L"%08X", (long long) hwnd);
	return std::wstring(buffer);
}

void IeThread::OnGetHandles(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	// Iterate over all the windows
	std::vector<IWebBrowser2*> browsers;
	getAllBrowsers(&browsers);
	for (vector<IWebBrowser2*>::iterator curr = browsers.begin();
		 curr != browsers.end();
		 curr++) {
			 data.output_list_string_.push_back(getWindowHandle(*curr));
			 (*curr)->Release();
	}

	data.error_code = SUCCESS;
}

void IeThread::OnGetActiveElement(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	IHTMLElement* &pDom = data.output_html_element_; 
	pDom = NULL;

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	if (!doc) {
		return;
	}

	CComPtr<IHTMLElement> element;
	doc->get_activeElement(&element);

	if (!element) {
		// Grab the body instead
		doc->get_body(&element);
	}

	if (element)
		element.CopyTo(&pDom);
}

void IeThread::OnGetCookies(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	std::wstring& ret = data.output_string_;  

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	if (!doc) {
		ret = L"";
		return;
	}

	CComBSTR cookie;
	doc->get_cookie(&cookie);

	ret = combstr2cw(cookie); 
}

bool isHtmlPage(IHTMLDocument2* doc) 
{
	CComBSTR type;
	if (!SUCCEEDED(doc->get_mimeType(&type))) 
	{
		return false;
	}

	if (!SUCCEEDED(type.ToLower())) 
	{
		return false;
	}

	return wcsstr(combstr2cw(type), L"html") != NULL;
}

void IeThread::OnAddCookie(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	CComBSTR cookie(data.input_string_);

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	if (!doc) 
	{
		data.output_string_ = L"Unable to locate document";
		data.exception_caught_ = true;
		return;
	}

	if (!isHtmlPage(doc)) 
	{
		data.output_string_ = L"Document is not an HTML page";
		data.error_code = ENOSUCHDOCUMENT;
		return;
	}

	if (!SUCCEEDED(doc->put_cookie(cookie))) 
	{
		data.output_string_ = L"Unable to add cookie to page";
		data.exception_caught_ = true;
	}
}

void IeThread::OnWaitForNavigationToFinish(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	NO_THREAD_COMMON
	waitForNavigateToFinish();
}

void IeThread::OnExecuteScript(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	// TODO/MAYBE
	// the input WebElement(s) may need to have their IHTMLElement QI-converted into IHTMLDOMNode

	executeScript(data.input_string_, data.input_safe_array_, &data.output_variant_);

	if( VT_DISPATCH == data.output_variant_.vt )
	{
		CComQIPtr<IHTMLElement> element(data.output_variant_.pdispVal);
		if(element)
		{
			IHTMLElement* &pDom = * (IHTMLElement**) &(data.output_variant_.pdispVal);
			element.CopyTo(&pDom);
		}
	}
}

void IeThread::OnSelectElementByXPath(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	int &errorKind = data.error_code;
	IHTMLElement* &pDom = data.output_html_element_; 
	const bool inputElementWasNull = (!data.input_html_element_);
	CComQIPtr<IHTMLElement> inputElement(data.input_html_element_);

	pDom = NULL;
	errorKind = SUCCESS;

	/// Start from root DOM by default
	if(inputElementWasNull)
	{
		CComPtr<IHTMLDocument3> root_doc;
		getDocument3(&root_doc);
		if (!root_doc) 
		{
			errorKind = ENOSUCHDOCUMENT;
			return;
		}
		root_doc->get_documentElement(&inputElement);
	} else 
	{
		checkValidDOM(inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = ENOSUCHELEMENT;
		return;
	}

	////////////////////////////////////////////////////
	bool evalToDocument = addEvaluateToDocument(node, 0);
	if (!evalToDocument) 
	{
		errorKind = EUNEXPECTEDJSERROR;
		return;
	}


	std::wstring expr;
	if (!inputElementWasNull)
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res.snapshotItem(0);};})();";
	else
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res.snapshotItem(0);};})();";

	CComVariant result;
	CComBSTR expression = CComBSTR(data.input_string_);

	SAFEARRAY* args = NULL;
	if (!inputElementWasNull) {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
		long index = 1;
		CComQIPtr<IHTMLElement> element(const_cast<IHTMLDOMNode*>((IHTMLDOMNode*)node));
		CComVariant dest2((IDispatch*) element);
		SafeArrayPutElement(args, &index, &dest2);
	} else {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	}

	long index = 0;
	CComVariant dest(expression);   
	SafeArrayPutElement(args, &index, &dest);
		
	executeScript(expr.c_str(), args, &result);

	if (result.vt == VT_DISPATCH) {
		CComQIPtr<IHTMLElement> e(result.pdispVal);
		
		if (e && isOrUnder(node, e))
		{
			e.CopyTo(&pDom);
			return; 
		}
	}

	errorKind = ENOSUCHELEMENT;
}

void IeThread::OnSelectElementsByXPath(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	const bool inputElementWasNull = (!data.input_html_element_);
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	long &errorKind = data.output_long_;
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;

	errorKind = 0;

	/// Start from root DOM by default
	if(inputElementWasNull)
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
	else
	{
		checkValidDOM(inputElement);
	}

	CComQIPtr<IHTMLDOMNode> node(inputElement);
	if (!node) 
	{
		errorKind = 1;
		return;
	}

	////////////////////////////////////////////////////
	bool evalToDocument = addEvaluateToDocument(node, 0);
	if (!evalToDocument) 
	{
		errorKind = 2;
		return;
	}

	std::wstring expr;
	if (!inputElementWasNull)
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res;};})();";
	else
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res;};})();";

	CComVariant result;
	CComBSTR expression = CComBSTR(data.input_string_);
	SAFEARRAY* args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	
	long index = 1;
	CComVariant dest2((IDispatch*) inputElement);
	SafeArrayPutElement(args, &index, &dest2);

	index = 0;
	CComVariant dest(expression);
	SafeArrayPutElement(args, &index, &dest);
	
	executeScript(expr.c_str(), args, &result);

	// At this point, the result should contain a JS array of nodes.
	if (result.vt != VT_DISPATCH) {
		errorKind = 3;
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);

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
			CComQIPtr<IHTMLElement> elem(shiftResult.pdispVal);
			IHTMLElement *pDom = NULL;
			elem.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}

void IeThread::getDocument3(const IHTMLDOMNode* extractFrom, IHTMLDocument3** pdoc) {
	if (!extractFrom) {
		getDocument3(pdoc);
		return;
	}
	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extractFrom));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument3> doc(dispatch);
	*pdoc = doc.Detach();
}

void IeThread::getDocument2(const IHTMLDOMNode* extractFrom, IHTMLDocument2** pdoc) {

	if (!extractFrom) {
		getDocument(pdoc);
		return;
	}

	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extractFrom));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument2> doc(dispatch);
	*pdoc = doc.Detach();
}

void IeThread::getAllBrowsers(std::vector<IWebBrowser2*>* browsers)
{
	getBrowsers(browsers);
}

bool IeThread::isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child) 
{
	CComQIPtr<IHTMLElement> parent(const_cast<IHTMLDOMNode*>(root));

	if (!parent)
		return true;

	VARIANT_BOOL toReturn;
	parent->contains(child, &toReturn);

	return toReturn == VARIANT_TRUE;
}

void IeThread::OnCloseWindow(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	NO_THREAD_COMMON
	if (FAILED(pBody->ieThreaded->Stop())) {
	    LOG(INFO) << "Unable to stop IE instance";
	}
	if (FAILED(pBody->ieThreaded->Quit())) {
	    LOG(WARN) << "Unable to quit IE instance.";
	}
}

bool browserMatches(const wchar_t* name, IWebBrowser2* browser)
{
	CComPtr<IDispatch> dispatch;
	HRESULT hr = browser->get_Document(&dispatch);
	if (FAILED(hr)) {
		return false;
	}
	CComQIPtr<IHTMLDocument2> doc(dispatch);
	if (!doc) {
		return false;
	}

	CComPtr<IHTMLWindow2> window;
	hr = doc->get_parentWindow(&window);
	if (FAILED(hr)) {
		return false;
	}

	CComBSTR windowName;
	window->get_name(&windowName);

	if (windowName == name) {
		return true;
	}

	std::wstring handle = getWindowHandle(browser);

	return handle == name;
}

void IeThread::OnSwitchToWindow(WPARAM w, LPARAM lp) 
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	LPCWSTR name = data.input_string_;

	// Find the window
	std::vector<IWebBrowser2*> browsers;
	CComPtr<IWebBrowser2> instance;
	getAllBrowsers(&browsers);
	for (vector<IWebBrowser2*>::iterator curr = browsers.begin();
		 curr != browsers.end();
		 curr++) {
			 if (!instance && browserMatches(name, *curr)) {
				 instance = *curr;
			 }
			 (*curr)->Release();
	}

	if (!instance) {
		data.error_code = ENOSUCHWINDOW;
		return;
	}

	// Assuming we found it, release the current instance
	pBody->mSink.ConnectionUnAdvise();
	
	// And attach ourselves
	// TODO(simon): Are these next two lines doing exactly the same thing?
	pBody->ieThreaded = instance;
	pBody->mSink.p_Thread->pBody = pBody;
	pBody->mSink.ConnectionAdvise();
	if (false) {
		LOG(WARN) << "Failed to advise new connection";
	}
	
	CComQIPtr<IDispatch> dispatcher(pBody->ieThreaded);
	if (!dispatcher) {
		LOG(WARN) << "No dispathcer after switching";
		return;
	}

	data.error_code = SUCCESS;
}

void IeThread::OnSwitchToFrame(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	data.output_bool_ = true;

	LPCWSTR destFrame = data.input_string_;

	pBody->pathToFrame = destFrame;

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	if (!doc)
		pBody->pathToFrame = L"";
	
	data.output_bool_ = (doc != NULL);
}


