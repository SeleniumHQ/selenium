#include "StdAfx.h"
#include "InternetExplorerDriver.h"
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

using namespace std;

long invokeCount = 0;
long queryCount = 0;

InternetExplorerDriver::InternetExplorerDriver()
{
	if (!SUCCEEDED(ie.CoCreateInstance(CLSID_InternetExplorer))) 
	{
		cerr << "Cannot create InternetExplorer instance" << endl;
		throw "Cannot create InternetExplorer instance";
	}

	closeCalled = false;
	currentFrame = -1;

	setVisible(true);
//	sink = new IeEventSink(ie);
}

InternetExplorerDriver::InternetExplorerDriver(InternetExplorerDriver *other)
{
	this->ie = other->ie;
}

InternetExplorerDriver::~InternetExplorerDriver()
{
//	delete sink;
}

void InternetExplorerDriver::close()
{
	if (closeCalled)
		return;

	ie->Quit();
	closeCalled = true;
}

bool InternetExplorerDriver::getVisible()
{
	VARIANT_BOOL visible;
	ie->get_Visible(&visible);
	return visible == VARIANT_TRUE;
}

void InternetExplorerDriver::setVisible(bool isVisible) 
{
	if (isVisible)
		ie->put_Visible(VARIANT_TRUE);
	else 
		ie->put_Visible(VARIANT_FALSE);
}

std::wstring InternetExplorerDriver::getCurrentUrl()
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	if (!doc) {
		return L"";
	}

	CComBSTR url;
	doc->get_URL(&url);
	return bstr2wstring(url);
}

std::wstring InternetExplorerDriver::getTitle()
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	CComBSTR title;
	doc->get_title(&title);

	return bstr2wstring(title);
}

void InternetExplorerDriver::get(const wchar_t *url)
{
	CComVariant spec(url);
	CComVariant dummy;

	ie->Navigate2(&spec, &dummy, &dummy, &dummy, &dummy);
	currentFrame = -1;
	waitForNavigateToFinish();
}

void InternetExplorerDriver::goForward() 
{
	ie->GoForward();
}

void InternetExplorerDriver::goBack()
{
	ie->GoBack();
}

void InternetExplorerDriver::setSpeed(int speed)
{
	this->speed = speed;
}

int InternetExplorerDriver::getSpeed()
{
	return speed;
}

ElementWrapper* InternetExplorerDriver::getActiveElement() 
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	CComPtr<IHTMLElement> element;
	doc->get_activeElement(&element);

	if (!element) {
		// Grab the body instead
		doc->get_body(&element);
	}

	if (!element)
		return NULL;  // Should never happen

	CComQIPtr<IHTMLDOMNode> node(element);
	return new ElementWrapper(this, node);
}

void InternetExplorerDriver::waitForNavigateToFinish() 
{
	VARIANT_BOOL busy;
	ie->get_Busy(&busy);
	while (busy == VARIANT_TRUE) {
		wait(100);
		ie->get_Busy(&busy);
	}

	READYSTATE readyState;
	ie->get_ReadyState(&readyState);
	while (readyState != READYSTATE_COMPLETE) {
		wait(50);
		ie->get_ReadyState(&readyState);
	}

	CComPtr<IDispatch> dispatch = NULL;
	ie->get_Document(&dispatch);

	CComQIPtr<IHTMLDocument2> doc(dispatch);
	
	if (!doc) {
		// Perhaps it's not an HTML page. Wait a tiny bit and return
		wait(200);
		return;
	}

	waitForDocumentToComplete(doc);

	CComPtr<IHTMLFramesCollection2> frames;
	doc->get_frames(&frames);

	if (frames != NULL) {
		long framesLength = 0;
		frames->get_length(&framesLength);

		VARIANT index;
		VariantInit(&index);
		index.vt = VT_I4;

		for (long i = 0; i < framesLength; i++) {
			index.lVal = i;
			VARIANT result;
			frames->item(&index, &result);

			if (result.vt != VT_DISPATCH) {
				// We should really use an event-based model
				wait(100);
				continue;
			}
				 
			CComQIPtr<IHTMLWindow2> window(result.pdispVal);
			VariantClear(&result);

			if (!window) {
				wait(150);
				continue;
			}

			CComPtr<IHTMLDocument2> frameDoc;
			window->get_document(&frameDoc);

			if (!frameDoc) {
				wait(150);
				continue;
			}

			waitForDocumentToComplete(frameDoc);
		}

		VariantClear(&index);
	}
}

void InternetExplorerDriver::waitForDocumentToComplete(IHTMLDocument2* doc)
{
	CComBSTR state;
	doc->get_readyState(&state);
	std::wstring currentState = bstr2wstring(state);

	while (currentState != L"complete") {
		wait(50);
		state.Empty();
		doc->get_readyState(&state);
		currentState = bstr2wstring(state);
	}
}

void InternetExplorerDriver::switchToFrame(int frameIndex) 
{
	currentFrame = frameIndex;
}

std::wstring InternetExplorerDriver::getCookies()
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	if (!doc) {
		return L"";
	}

	CComBSTR cookie;
	doc->get_cookie(&cookie);

	return bstr2wstring(cookie);
}

void InternetExplorerDriver::addCookie(const wchar_t *cookieString)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	CComBSTR cookie(cookieString);

	doc->put_cookie(cookie);
}

HWND InternetExplorerDriver::getHwnd() 
{
	HWND hWnd;
	ie->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hWnd));

	DWORD ieWinThreadId = GetWindowThreadProcessId(hWnd, NULL);
    DWORD currThreadId = GetCurrentThreadId();
    if( ieWinThreadId != currThreadId )
    {
		AttachThreadInput(currThreadId, ieWinThreadId, true);
    }

	SetActiveWindow(hWnd);
	SetFocus(hWnd);

	if( ieWinThreadId != currThreadId )
    {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
    }

	return hWnd;
}

void InternetExplorerDriver::getDocument(IHTMLDocument2 **pdoc)
{
	CComPtr<IDispatch> dispatch;
	ie->get_Document(&dispatch);
	
	if (!dispatch) {
		return;
	}

	CComQIPtr<IHTMLDocument2> doc(dispatch);
	CComQIPtr<IHTMLFramesCollection2> frames;
	doc->get_frames(&frames);

	if (frames == NULL) {
		*pdoc = doc.Detach();
		return;
	}

	long length = 0;
	frames->get_length(&length);

	if (!length) {
		currentFrame = -1;
		*pdoc = doc.Detach();
		return;
	}

	if (currentFrame == -1) {
		CComPtr<IHTMLDocument3> doc3;
		getDocument3(&doc3);

		CComPtr<IHTMLElementCollection> bodyTags;
		CComBSTR bodyTagName(L"BODY");
		doc3->getElementsByTagName(bodyTagName, &bodyTags);

		long numberOfBodyTags = 0;
		bodyTags->get_length(&numberOfBodyTags);
	
		if (numberOfBodyTags) {
			*pdoc = doc.Detach();
			return;
		}

		currentFrame = 0;
	}

	VARIANT index;
	index.vt = VT_I4;
	index.lVal = currentFrame;
	CComVariant result;
	frames->item(&index, &result);

	CComQIPtr<IHTMLWindow2> win(result.pdispVal);
	// Clear the reference to the top frame's doc reference and return the frame's
	doc.Release();
	win->get_document(&doc);
	*pdoc = doc.Detach();
}

void InternetExplorerDriver::getDocument3(IHTMLDocument3 **pdoc)
{
	CComPtr<IDispatch> dispatch;
	ie->get_Document(&dispatch);

	CComQIPtr<IHTMLDocument3> doc(dispatch);
	*pdoc = doc.Detach();
}

bool InternetExplorerDriver::getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added) 
{
	CComPtr<IDispatch> scriptEngine;
	doc->get_Script(&scriptEngine);

	OLECHAR FAR* evalName = L"eval";
    HRESULT hr = scriptEngine->GetIDsOfNames(IID_NULL, &evalName, 1, LOCALE_USER_DEFAULT, evalId);
	if (FAILED(hr)) { 
		*added = true;
		// Start the script engine by adding a script tag to the page
		CComPtr<IHTMLElement> scriptTag;
		doc->createElement(L"<span>", &scriptTag);
		CComBSTR addMe(L"<span id='__webdriver_private_span'>&nbsp;<script defer></script></span>");
		scriptTag->put_innerHTML(addMe);

		CComPtr<IHTMLElement> body;
		doc->get_body(&body);
		CComQIPtr<IHTMLDOMNode> node(body);
		CComQIPtr<IHTMLDOMNode> scriptNode(scriptTag);

		CComPtr<IHTMLDOMNode> generatedChild;
		node->appendChild(scriptNode, &generatedChild);

		scriptEngine.Release();
		doc->get_Script(&scriptEngine);
		hr = scriptEngine->GetIDsOfNames(IID_NULL, &evalName, 1, LOCALE_USER_DEFAULT, evalId);

		if (FAILED(hr)) {
			removeScript(doc);
			return false;
		}
	}

	return true;
}

void InternetExplorerDriver::removeScript(IHTMLDocument2* doc)
{
	CComQIPtr<IHTMLDocument3> doc3(doc);

	if (!doc3)
		return;

	CComPtr<IHTMLElement> element;
	CComBSTR id(L"__webdriver_private_span");
	doc3->getElementById(id, &element);
	
	CComQIPtr<IHTMLDOMNode> elementNode(element);

	if (elementNode) {
		CComPtr<IHTMLElement> body;
		doc->get_body(&body);
		CComQIPtr<IHTMLDOMNode> bodyNode(body);
		bodyNode->removeChild(elementNode, NULL);
	}
}

bool InternetExplorerDriver::createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result)
{
	CComVariant script_variant(script);
	DISPPARAMS parameters = {0};
    parameters.cArgs = 1;
    parameters.rgvarg = &script_variant;
	EXCEPINFO exception;

	HRESULT hr = scriptEngine->Invoke(evalId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &parameters, result, &exception, 0);
	if (FAILED(hr)) {
	  if (DISP_E_EXCEPTION == hr) {
		  wcerr << "Exception message was: " << exception.bstrDescription << endl;
	  } else {
		  wcerr << "Error code: " << GetLastError() << ". Failed to compile: " << script << endl;
	  }

  	  if (result) {
		  result->vt = VT_USERDEFINED;
		  result->bstrVal = exception.bstrDescription;
	  }

	  return false;
	}

	return true;
}

void InternetExplorerDriver::executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT *result, bool tryAgain)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	CComPtr<IDispatch> scriptEngine;
	doc->get_Script(&scriptEngine);

	DISPID evalId;
	bool added;
	bool ok = getEval(doc, &evalId, &added);
	
	if (!ok) {
		wcerr << "Unable to locate eval method" << endl;
		return;
	}

	CComVariant tempFunction;
	if (!createAnonymousFunction(scriptEngine, evalId, script, &tempFunction)) {
		wcerr << "Cannot create anonymous function: " << script << endl;
		if (added) { removeScript(doc); }
		return;
	}

	if (tempFunction.vt != VT_DISPATCH) {
		if (added) { removeScript(doc); }
		return;
	}

	// Grab the "call" method out of the returned function
	DISPID callid;
	OLECHAR FAR* szCallMember = L"call";
    HRESULT hr3 = tempFunction.pdispVal->GetIDsOfNames(IID_NULL, &szCallMember, 1, LOCALE_USER_DEFAULT, &callid);
	if (FAILED(hr3)) {
		wcerr << "Cannot locate call method on anonymous function: " << script << endl;
	}

	DISPPARAMS callParameters = { 0 };
	int nargs = getLengthOf(args);	  

	callParameters.cArgs = nargs + 1;

	CComPtr<IHTMLWindow2> win;
	doc->get_parentWindow(&win);
	_variant_t *vargs = new _variant_t[nargs + 1];
	vargs[nargs] = CComVariant(win);

	long index;
    for (int i = 0; i < nargs; i++)
    {
		index = i;
		CComVariant v;
		SafeArrayGetElement(args, &index, (void*) &v);
		vargs[nargs - 1 - i] = new _variant_t(v);
    }

	callParameters.rgvarg = vargs;

	EXCEPINFO exception;
	HRESULT hr4 = tempFunction.pdispVal->Invoke(callid, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &callParameters, result, &exception, 0);
	if (FAILED(hr4)) {
	  if (DISP_E_EXCEPTION == hr4) {
		  wcerr << "Exception message was: " << exception.bstrDescription << endl;
	  } else {
		  wcerr << "Failed to execute: " << script << endl;
	  }
	  
	  if (result) {
		  result->vt = VT_USERDEFINED;
		  result->bstrVal = exception.bstrDescription;
	  }
	}

	if (added) { removeScript(doc); }

	delete[] vargs;
}

IeEventSink::IeEventSink(IWebBrowser2* ie) 
{
	this->ie = ie;

	AtlAdvise(this->ie, (IUnknown*) this, DIID_DWebBrowserEvents2, &eventSinkCookie);
}

IeEventSink::~IeEventSink() 
{
	AtlUnadvise(ie, DIID_DWebBrowserEvents2, eventSinkCookie);
}

// IUnknown methods
STDMETHODIMP IeEventSink::QueryInterface(REFIID interfaceId, void **pointerToObj)
{
	queryCount++;
//	cout << "Querying interface: " << queryCount << endl;
    if (interfaceId == IID_IUnknown)
    {
        *pointerToObj = (IUnknown *)this;
        return S_OK;
    }
    else if (interfaceId == IID_IDispatch)
    {
        *pointerToObj = (IDispatch *)this;
        return S_OK;
    }

	*pointerToObj = NULL;
    return E_NOINTERFACE;
    
}

STDMETHODIMP_(ULONG) IeEventSink::AddRef()
{
    return 1;
}

STDMETHODIMP_(ULONG) IeEventSink::Release()
{
    return 1;
}


// IDispatch methods
STDMETHODIMP IeEventSink::Invoke(DISPID dispidMember,
                                     REFIID riid,
                                     LCID lcid, WORD wFlags,
                                     DISPPARAMS* pDispParams,
                                     VARIANT* pvarResult,
                                     EXCEPINFO*  pExcepInfo,
                                     UINT* puArgErr)
{
	invokeCount++;
//	cout << "Invoking: " << invokeCount << endl;

	if (!pDispParams)
		return E_INVALIDARG;

	switch (dispidMember) {
		case DISPID_PROGRESSCHANGE:
			break;

		case DISPID_BEFORENAVIGATE2:
//			cout << "Before navigate" << endl;
			break;

		case DISPID_NAVIGATECOMPLETE2:
//			cout << "Navigation complete" << endl;
			break;

		case DISPID_NEWWINDOW2:
//			cout << "New window event detected" << endl;
			// Check the argument's type
			/*
			if (pDispParams->rgvarg[0].vt == (VT_BYREF|VT_VARIANT)) {
				CComVariant varURL(*pDispParams->rgvarg[0].pvarVal);
				varURL.ChangeType(VT_BSTR);

			char str[100];   // Not the best way to do this.
			}
			*/
			break;    

		default:
			break;
	}

	return S_OK;
}

STDMETHODIMP IeEventSink::GetIDsOfNames(REFIID    riid,
                                                 LPOLESTR *names,
                                                 UINT      numNames,
                                                 LCID      localeContextId,
                                                 DISPID *  dispatchIds)
{
    return E_NOTIMPL;
}

STDMETHODIMP IeEventSink::GetTypeInfoCount(UINT* pctinfo)
{
    return E_NOTIMPL;
}

STDMETHODIMP IeEventSink::GetTypeInfo(UINT        typeInfoId,
                                               LCID        localeContextId,
                                               ITypeInfo** pointerToTypeInfo)
{
    return E_NOTIMPL;
}
