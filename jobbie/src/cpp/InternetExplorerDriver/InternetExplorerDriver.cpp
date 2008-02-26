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

#include "atlbase.h"
#include "atlstr.h"

using namespace std;

long invokeCount = 0;
long queryCount = 0;

InternetExplorerDriver::InternetExplorerDriver()
{
	if (!SUCCEEDED(CoCreateInstance(CLSID_InternetExplorer, NULL, CLSCTX_LOCAL_SERVER, IID_IWebBrowser2, (void**)&ie))) 
	{
		throw "Cannot create InternetExplorer instance";
	}

	closeCalled = false;
	currentFrame = -1;

	bringToFront();
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

ElementWrapper* InternetExplorerDriver::selectElementById(const wchar_t *elementId) 
{
	CComPtr<IHTMLDocument3> doc;
	getDocument3(&doc);

	IHTMLElement* element = NULL;
	BSTR id = SysAllocString(elementId);
	doc->getElementById(id, &element);
	SysFreeString(id);
	
	if (element != NULL) {
		IHTMLDOMNode* node = NULL;
		element->QueryInterface(__uuidof(IHTMLDOMNode), (void **)&node);
		element->Release();
		ElementWrapper* toReturn = new ElementWrapper(this, node);
		node->Release();
		return toReturn;
	}

	throw "Cannot find element";
}

ElementWrapper* InternetExplorerDriver::selectElementByLink(const wchar_t *elementLink)
{
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
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
		if (converted == elementLink) {
			CComQIPtr<IHTMLDOMNode> linkNode(element);
			return new ElementWrapper(this, linkNode);
		}
	}

	throw "Cannot find element";
}

void InternetExplorerDriver::waitForNavigateToFinish() 
{
	VARIANT_BOOL busy;
	ie->get_Busy(&busy);
	while (busy == VARIANT_TRUE) {
		Sleep(100);
		ie->get_Busy(&busy);
	}

	READYSTATE readyState;
	ie->get_ReadyState(&readyState);
	while (readyState != READYSTATE_COMPLETE) {
		Sleep(50);
		ie->get_ReadyState(&readyState);
	}

	CComPtr<IDispatch> dispatch = NULL;
	ie->get_Document(&dispatch);
	IHTMLDocument2* doc = NULL;
	dispatch->QueryInterface(__uuidof(IHTMLDocument2), (void**)&doc);
	
	waitForDocumentToComplete(doc);

	IHTMLFramesCollection2* frames = NULL;
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

			IHTMLWindow2* window;
			result.pdispVal->QueryInterface(__uuidof(IHTMLWindow2), (void**)&window);

			IHTMLDocument2* frameDoc;
			window->get_document(&frameDoc);

			waitForDocumentToComplete(frameDoc);

			frameDoc->Release();
			window->Release();
			VariantClear(&result);
		}

		VariantClear(&index);
		frames->Release();
	}

	doc->Release();
}

void InternetExplorerDriver::waitForDocumentToComplete(IHTMLDocument2* doc)
{
	CComBSTR state;
	doc->get_readyState(&state);
	std::wstring currentState = bstr2wstring(state);

	while (currentState != L"complete") {
		Sleep(50);
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

void InternetExplorerDriver::bringToFront() 
{
	setVisible(true);
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

IeEventSink::IeEventSink(IWebBrowser2* ie) 
{
	this->ie = ie;
	this->ie->AddRef();

//	HRESULT hr = AtlAdvise(this->ie, (IUnknown*) this, DIID_DWebBrowserEvents2, &eventSinkCookie);
}

IeEventSink::~IeEventSink() 
{
//	AtlUnadvise(ie, DIID_DWebBrowserEvents2, eventSinkCookie);
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
