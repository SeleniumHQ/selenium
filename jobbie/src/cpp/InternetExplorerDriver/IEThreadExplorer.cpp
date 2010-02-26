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
#include "ScreenshotCapture.h"

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
	HRESULT hr = doc->get_URL(&url);
	if (FAILED(hr)) {
//	HRLO(WARN, hr) << "Unable to get current URL";
		ret = L"";
		return;
	}
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
		_com_error e = _com_error(hr);
		 _com_issue_error( hr );
	}}
	catch (_com_error &e)
	 {
	  LOG(WARN) << "COM Error" << " J[" << hex << GetCurrentThreadId() << "]" << endl;
	  LOG(WARN) << "Message = " << e.ErrorMessage() << endl;

	  if ( e.ErrorInfo() )
		 LOG(WARN) << e.Description() << endl;

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
		res = L"";
		return;
	}

	CComPtr<IHTMLElement> docElement;
	HRESULT hr = doc->get_documentElement(&docElement);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get document element from page";
		res = L"";
		return;
	}
	
	CComBSTR html;
	hr = docElement->get_outerHTML(&html);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Have document element but cannot read source.";
		res = L"";
		return;
	}

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
	HRESULT hr = doc->get_title(&title);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get document title";
		res = L"";
		return;
	}
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

	CComVariant out;
	int result = executeScript(data.input_string_, data.input_safe_array_, &out);
	data.error_code = result;

	if( VT_DISPATCH == out.vt )
	{
		CComQIPtr<IHTMLElement> element(out.pdispVal);
		if(element)
		{
			IHTMLElement* &pDom = * (IHTMLElement**) &(out.pdispVal);
			element.CopyTo(&pDom);
		}
	}
	data.output_variant_ = out;
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
	HRESULT hr = parent->contains(child, &toReturn);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot determine if parent contains child node";
		return false;
	}

	return toReturn == VARIANT_TRUE;
}

void IeThread::OnCloseWindow(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	NO_THREAD_COMMON
	if (FAILED(pBody->ieThreaded->Stop())) {
	    LOG(INFO) << "Unable to stop IE instance";
	}
        HRESULT hr = pBody->ieThreaded->Quit();
	if (FAILED(hr)) {
	    LOGHR(WARN, hr) << "Unable to quit IE instance.";
	}
}

void IeThread::OnCaptureScreenshot(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	captureScreenshot(data.output_string_);
}

void IeThread::captureScreenshot(std::wstring& res)
{
  HRESULT hr;

  ScreenshotCapture screenshotCapture(pBody->ieThreaded);
  CComPtr<IHTMLDocument2> doc;
  getDocument(&doc);
  if (!doc) {
    LOG(WARN) << "Unable to get document reference";
    return;
  }
  hr = screenshotCapture.CaptureBrowser(doc);
  if (FAILED(hr)) {
    // Problem capturing browser window.
    LOG(WARN) << "Capturing the browser failed";
    res = L"";
    return;
  }
  hr = screenshotCapture.GetBase64Data(res);
  if (FAILED(hr)) {
    // Problem getting base64 data.
    res = L"";
  }
}

void IeThread::OnGetScriptResultObjectType(WPARAM w, LPARAM lp)
{
  SCOPETRACER
  ON_THREAD_COMMON(data)

  data.output_string_ = getStriptResultObjectType(data.input_variant_);
}

std::wstring IeThread::getStriptResultObjectType(CComVariant* scriptResult)
{
  CComQIPtr<IHTMLElementCollection> isCol(scriptResult->pdispVal);
  if (isCol) {
    return L"HtmlCollection";
  }

  CComQIPtr<IHTMLElement> isElem(scriptResult->pdispVal);
  if (isElem) {
    return L"HtmlElement";
  }

  // Other possible interfaces: IHTMLFrameBase, IHTMLFrameElement
  // The distinction is not important for now.

  CComPtr<ITypeInfo> typeinfo;
  HRESULT getTypeInfoRes = scriptResult->pdispVal->GetTypeInfo(0, LOCALE_USER_DEFAULT, &typeinfo);
  TYPEATTR* typeAttr;
  CComBSTR name;
  if (SUCCEEDED(getTypeInfoRes) && SUCCEEDED(typeinfo->GetTypeAttr(&typeAttr))
    && SUCCEEDED(typeinfo->GetDocumentation(-1, &name, 0, 0, 0))) {
    // If the name is JScriptTypeInfo then *assume* this is a Javascript array.
    // Note that Javascript can return functions which will have the same
    // type - the only way to be sure is to run some more Javascript code to
    // see if this object has a length attribute. This does not seem necessary
    // now.
    // (For future reference, GUID is {C59C6B12-F6C1-11CF-8835-00A0C911E8B2})
    typeinfo->ReleaseTypeAttr(typeAttr);
    if (name == L"JScriptTypeInfo") {
      return L"JavascriptArray";
    }
  }

  return L"Unknown";
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
