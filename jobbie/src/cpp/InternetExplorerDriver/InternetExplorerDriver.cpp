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

	currentFrame = -1;

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
	ie->Quit();
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

const wchar_t* InternetExplorerDriver::getCurrentUrl() 
{
	IHTMLDocument2* doc = getDocument();

	if (!doc) {
		wchar_t* toReturn = new wchar_t[2];
		wcscpy_s(toReturn, 1, L"");
		return toReturn;
	}
	CComBSTR url;
	doc->get_URL(&url);
	doc->Release();

	return bstr2wchar(url);
}

const wchar_t* InternetExplorerDriver::getTitle() 
{
	CComBSTR title;
	IHTMLDocument2 *doc = getDocument();
	doc->get_title(&title);
	doc->Release();

	return bstr2wchar(title);
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
	IHTMLDocument3 *doc = getDocument3();
	IHTMLElement* element = NULL;
	BSTR id = SysAllocString(elementId);
	doc->getElementById(id, &element);
	doc->Release();
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
	IHTMLDocument2 *doc = getDocument();
	IHTMLElementCollection* linkCollection;
	doc->get_links(&linkCollection);
	doc->Release();

	long linksLength;
	linkCollection->get_length(&linksLength);

	for (int i = 0; i < linksLength; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		IDispatch* dispatch;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		linkCollection->item(idx, zero, &dispatch);
		VariantClear(&idx);
		VariantClear(&zero);

		IHTMLElement* element;
		dispatch->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
		dispatch->Release();

		BSTR linkText;
		element->get_innerText(&linkText);

		const wchar_t *converted = bstr2wchar(linkText);
		SysFreeString(linkText);

		if (wcscmp(elementLink, converted) == 0) {
			delete converted;
			IHTMLDOMNode* linkNode;
			element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&linkNode);
			element->Release();
			linkCollection->Release();
			ElementWrapper* toReturn = new ElementWrapper(this, linkNode);
			linkNode->Release();
			return toReturn;
		}
		delete converted;
		element->Release();
	}
	linkCollection->Release();
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
	BSTR state;
	doc->get_readyState(&state);
	wchar_t* currentState = bstr2wchar(state);

	while (wcscmp(L"complete", currentState) != 0) {
		Sleep(50);
		SysFreeString(state);
		delete currentState;
		doc->get_readyState(&state);
		currentState = bstr2wchar(state);
	}

	SysFreeString(state);
	delete currentState;
}

void InternetExplorerDriver::switchToFrame(int frameIndex) 
{
	currentFrame = frameIndex;
}

const wchar_t* InternetExplorerDriver::getCookies()
{
	IHTMLDocument2 *doc = getDocument();

	if (!doc) {
		wchar_t* toReturn = new wchar_t[2];
		wcscpy_s(toReturn, 1, L"");
		return toReturn;
	}

	BSTR cookie;
	doc->get_cookie(&cookie);

	doc->Release();
	return bstr2wchar(cookie);
}

void InternetExplorerDriver::addCookie(const wchar_t *cookieString)
{
	IHTMLDocument2 *doc = getDocument();
	BSTR cookie = SysAllocString(cookieString);

	doc->put_cookie(cookie);

	SysFreeString(cookie);
	doc->Release();
}

IHTMLDocument2* InternetExplorerDriver::getDocument() 
{
	IDispatch* dispatch;
	if (!SUCCEEDED(ie->get_Document(&dispatch))) {
		return NULL;
	}

	IHTMLDocument2* doc = NULL;
	dispatch->QueryInterface(__uuidof(IHTMLDocument2), (void**)&doc);
	dispatch->Release();

	CComQIPtr<IHTMLFramesCollection2> frames;
	doc->get_frames(&frames);

	long length = 0;
	frames->get_length(&length);

	if (!length) {
		currentFrame = -1;
		return doc;
	}

	if (currentFrame == -1) {
		IHTMLDocument3* doc3 = getDocument3();
		IHTMLElementCollection* bodyTags;

		BSTR bodyTagName = SysAllocString(L"BODY");
		doc3->getElementsByTagName(bodyTagName, &bodyTags);
		SysFreeString(bodyTagName);

		long numberOfBodyTags = 0;
		bodyTags->get_length(&numberOfBodyTags);
	
		if (numberOfBodyTags)
			return doc;

		currentFrame = 0;
	}

	VARIANT index;
	VariantInit(&index);
	index.vt = VT_I4;
	index.lVal = currentFrame;
	VARIANT result;
	VariantInit(&result);
	frames->item(&index, &result);
	VariantClear(&index);

	CComQIPtr<IHTMLWindow2, &__uuidof(IHTMLWindow2)> win;
	win = result.pdispVal;
	VariantClear(&result);

	// Clear the reference to the top frame's doc reference and return the frame's
	doc->Release();
	win->get_document(&doc);
	return doc;
}

IHTMLDocument3* InternetExplorerDriver::getDocument3() 
{
	CComPtr<IDispatch> dispatch = NULL;
	ie->get_Document(&dispatch);
	IHTMLDocument3* doc = NULL;
	dispatch->QueryInterface(__uuidof(IHTMLDocument3), (void**)&doc);
	return doc;
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
