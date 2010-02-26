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
//

#include "stdafx.h"
#include <comutil.h>

#include "errorcodes.h"
#include "logging.h"

#include "utils.h"
#include "InternalCustomMessage.h"
#include "EventReleaser.h"
#include "windows.h"

using namespace std;
extern IeThread* g_IE_Thread;

// IeThread

IeThread::IeThread() :  pBody(NULL), pIED(NULL), hThread(NULL), threadID(0), m_HeartBeatTimerID(0),
    m_NavigationCompletionTimerID(0)
{
	SCOPETRACER

	m_HeartBeatListener = NULL;
	m_EventToNotifyWhenNavigationCompleted = NULL;

	HKEY key;
	if (RegOpenKeyEx(HKEY_LOCAL_MACHINE, L"software\\microsoft\\internet explorer", 0L,  KEY_READ, &key) == ERROR_SUCCESS) {
		char value[32];
		DWORD type = REG_SZ;
		DWORD size = 32;

		 if (RegQueryValueEx(key, L"version", NULL, &type, (LPBYTE)&value, &size) == ERROR_SUCCESS) {
			 ieRelease = atoi(value);
		 }
	}
    RegCloseKey(key);

	m_HeartBeatListener = FindWindow(NULL, L"__WebdriverHeartBeatListener__");
}

IeThread::~IeThread()
{
	SCOPETRACER
}


#define CUSTOM_MESSAGE_MAP(a,b) \
	if (a == msg) { \
	std::wstring& error = dataMarshaller.output_string_; \
	try {b(pMsg->lParam, pMsg->wParam);} \
	catch(std::wstring& content) { \
		safeIO::CoutA("in catch1, content = "); \
		dataMarshaller.exception_caught_ = true; \
		error = L"Error in ["; \
		error += L#b; \
		error += L"] "; \
		error += content; \
		safeIO::CoutW(error); \
	}\
	catch(...) { \
		safeIO::CoutA("in catch2"); \
		dataMarshaller.exception_caught_ = true; \
		error = L"Unhandled exception thrown in "; \
		error += L#b; \
		safeIO::CoutW(error); \
	}\
	return TRUE;}

HWND IeThread::m_HeartBeatListener = 0;

BOOL IeThread::DispatchThreadMessageEx(MSG* pMsg)
{
	if (pMsg->message <= WM_USER) return FALSE;
	if (pMsg->message > (WM_USER+100)) return FALSE;

	const UINT msg = pMsg->message;

	DataMarshaller& dataMarshaller = getCmdData();
	CScopeCaller SC(dataMarshaller);
	// NOTE(alexis.j.vuillemin): 
	// This is just a hacky way to have this CScopeCaller supplied to the called methods,
	// so that they can optionally turn off its m_releaseOnDestructor flag.
	dataMarshaller.scope_caller_ = &SC; 

	CUSTOM_MESSAGE_MAP ( _WD_START, OnStartIE )
    CUSTOM_MESSAGE_MAP ( _WD_SWITCHTOFRAME, OnSwitchToFrame )
    CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISDISPLAYED, OnElementIsDisplayed )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISENABLED, OnElementIsEnabled )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETLOCATIONONCESCROLLEDINTOVIEW, OnElementGetLocationOnceScrolledIntoView )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETLOCATION, OnElementGetLocation )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETHEIGHT, OnElementGetHeight )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETWIDTH, OnElementGetWidth )

	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETTAGNAME, OnElementGetTagName )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SENDKEYS, OnElementSendKeys )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_CLEAR, OnElementClear )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISSELECTED, OnElementIsSelected )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SETSELECTED, OnElementSetSelected )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_TOGGLE, OnElementToggle )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETVALUEOFCSSPROP, OnElementGetValueOfCssProp )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETTEXT, OnElementGetText )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_CLICK, OnElementClick )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SUBMIT, OnElementSubmit )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETCHILDRENWTAGNAME, OnElementGetChildrenWithTagName )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_RELEASE, OnElementRelease )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISFRESH, OnIsElementFresh )

	CUSTOM_MESSAGE_MAP ( _WD_GETVISIBLE, OnGetVisible )
	CUSTOM_MESSAGE_MAP ( _WD_SETVISIBLE, OnSetVisible )
	CUSTOM_MESSAGE_MAP ( _WD_GETCURRENTURL, OnGetCurrentUrl )
	CUSTOM_MESSAGE_MAP ( _WD_GETPAGESOURCE, OnGetPageSource )
	CUSTOM_MESSAGE_MAP ( _WD_GETTITLE, OnGetTitle )
	CUSTOM_MESSAGE_MAP ( _WD_GETURL, OnGetUrl )
	CUSTOM_MESSAGE_MAP ( _WD_GOFORWARD, OnGoForward )
	CUSTOM_MESSAGE_MAP ( _WD_GOBACK, OnGoBack )
	CUSTOM_MESSAGE_MAP ( _WD_GET_HANDLE, OnGetHandle )
	CUSTOM_MESSAGE_MAP ( _WD_GET_HANDLES, OnGetHandles )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYID, OnSelectElementById )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYID, OnSelectElementsById )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYLINK, OnSelectElementByLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYLINK, OnSelectElementsByLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYPARTIALLINK, OnSelectElementByPartialLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYPARTIALLINK, OnSelectElementsByPartialLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYNAME, OnSelectElementByName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYNAME, OnSelectElementsByName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYTAGNAME, OnSelectElementByTagName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYTAGNAME, OnSelectElementsByTagName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYCLASSNAME, OnSelectElementByClassName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYCLASSNAME, OnSelectElementsByClassName )
	CUSTOM_MESSAGE_MAP ( _WD_GETCOOKIES, OnGetCookies )
	CUSTOM_MESSAGE_MAP ( _WD_ADDCOOKIE, OnAddCookie )

	CUSTOM_MESSAGE_MAP ( _WD_WAITFORNAVIGATIONTOFINISH, OnWaitForNavigationToFinish )
	CUSTOM_MESSAGE_MAP ( _WD_EXECUTESCRIPT, OnExecuteScript )
	CUSTOM_MESSAGE_MAP ( _WD_GETACTIVEELEMENT, OnGetActiveElement )
	CUSTOM_MESSAGE_MAP ( _WD_CLOSEWINDOW, OnCloseWindow )
	CUSTOM_MESSAGE_MAP ( _WD_SWITCHWINDOW, OnSwitchToWindow )
	CUSTOM_MESSAGE_MAP ( _WD_CAPTURESCREENSHOT, OnCaptureScreenshot )
	CUSTOM_MESSAGE_MAP ( _WD_GETSCRIPTRESULTOBJECTTYPE, OnGetScriptResultObjectType)

	 return FALSE;
}

int IeThread::runProcessStatic(void *pThis)
{
	SCOPETRACER
	return ((IeThread*)(pThis))->runProcess();
}

int IeThread::runProcess()
{
	try{
	SCOPETRACER
	InitInstance();

	// This will create the message pump
	::PeekMessage(&curMsg, NULL, WM_USER, WM_USER, PM_NOREMOVE);

	SetEvent(sync_LaunchThread);

	bool quitASAP = false;

	// acquire and dispatch messages until a WM_QUIT message is received.
	while(!quitASAP)
	{
		::PeekMessage(&curMsg, NULL, NULL, NULL, PM_NOREMOVE);

		do
		{
			// pump message, but quit on WM_QUIT
			if (!CustomInternalPumpMessage())
			{
				quitASAP = true;
			}
		} while (::PeekMessage(&curMsg, NULL, NULL, NULL, PM_NOREMOVE));
	}
	} catch(...) {
		int gotcha = 9;
	}
	return ExitInstance();
}

VOID CALLBACK HeartBeatTimer(HWND hwnd, UINT uMsg, UINT_PTR idEvent, DWORD dwTime) 
{
	if(IeThread::m_HeartBeatListener != NULL)
	{
		PostMessage(IeThread::m_HeartBeatListener, _WD_HB_BEAT, 0, 0);
	}
}

VOID CALLBACK NavigationCompletionTimer(HWND hwnd, UINT uMsg, UINT_PTR idEvent, DWORD dwTime) 
{
	SCOPETRACER
	safeIO::CoutA("g_IE_Thread =");
	safeIO::CoutLong((long)(LONG_PTR)g_IE_Thread);
	if(!g_IE_Thread) return;
	if(idEvent != g_IE_Thread->m_NavigationCompletionTimerID)
	{
		safeIO::CoutLong((long)idEvent);
		safeIO::CoutLong((long)(g_IE_Thread->m_NavigationCompletionTimerID));
		return;
	}
	g_IE_Thread->waitForNavigateToFinish();
}

BOOL IeThread::InitInstance()
{
	SCOPETRACER
	threadID = GetCurrentThreadId();
	pBody = new IeThreadData();

	pBody->m_CmdData.output_string_.resize(5000);

	CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);

	if(m_HeartBeatListener != NULL)
	{
		PostMessage(m_HeartBeatListener, _WD_HB_START, 0, 0);
		m_HeartBeatTimerID = SetTimer(NULL, 0, 40000, HeartBeatTimer);
	}

	return TRUE;
}

int IeThread::ExitInstance()
{
	SCOPETRACER

	if(m_HeartBeatListener != NULL)
	{
		if (m_HeartBeatTimerID)
		{
			KillTimer( NULL, m_HeartBeatTimerID);
			m_HeartBeatListener = 0;
		}
		PostMessage(m_HeartBeatListener, _WD_HB_STOP, 0, 0);
	}
	stopNavigationCompletionTimer();

	delete pBody;
	pBody = NULL;
	try{
	CoUninitialize();
	}
	catch(...)
	{
	}
	return 0;
}

BOOL IeThread::CustomInternalPreTranslateMessage(MSG* pMsg)
{
	// if this is a thread-message, short-circuit this function
	if (pMsg->hwnd == NULL && DispatchThreadMessageEx(pMsg))
		return TRUE;

	return FALSE;   // no special processing
}

BOOL IeThread::CustomInternalPumpMessage()
{
	if (!::GetMessage(&curMsg, NULL, NULL, NULL))
	{
		// Note: prevents calling message loop things in 'ExitInstance'
		// will never be decremented
		return FALSE;
	}

  	if (curMsg.message != WM_KICKIDLE && !CustomInternalPreTranslateMessage(&curMsg))
	{
		::TranslateMessage(&curMsg);
		::DispatchMessage(&curMsg);
	}
  return TRUE;
}

void IeThread::OnStartIE(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	NO_THREAD_COMMON
	EventReleaser er(sync_LaunchIE);
	if (pBody->ieThreaded) {
		// TODO(simon): There's no way that this should be necessary.
		// but it is when starting and quitting IE in a tight loop
		LOG(DEBUG) << "IE instance already set. Clearing";
		pBody->ieThreaded.Release();
	} 
	HRESULT hr = pBody->ieThreaded.CoCreateInstance(CLSID_InternetExplorer, NULL, CLSCTX_LOCAL_SERVER);

	safeIO::CoutA("Has instanciated IE. Multithreaded version.");

	if (!SUCCEEDED(hr))
	{
		std::wstring Err(L"Cannot create InternetExplorer instance, hr =");
		AppendValue(Err, hr); 
		safeIO::CoutW(Err, true);
		if(m_HeartBeatListener != NULL) 
		{
			PostMessage(m_HeartBeatListener, _WD_HB_CRASHED, 0 ,0 );
		}
 		throw Err;
	}

	pBody->mSink.p_Thread = this;
	pBody->mSink.ConnectionAdvise();
}

void IeThread::startNavigationCompletionTimer()
{
	SCOPETRACER
	if(m_NavigationCompletionTimerID) return;
	stopNavigationCompletionTimer();
	m_NavigationCompletionTimerID = SetTimer(NULL, 0, 300, NavigationCompletionTimer);
}

void IeThread::stopNavigationCompletionTimer()
{
	SCOPETRACER
	if(!m_NavigationCompletionTimerID) return;
	KillTimer(NULL, m_NavigationCompletionTimerID);
	m_NavigationCompletionTimerID = 0;
}

void IeThread::setVisible(bool isVisible)
{
	SCOPETRACER
	if (isVisible)
		pBody->ieThreaded->put_Visible(VARIANT_TRUE);
	else
		pBody->ieThreaded->put_Visible(VARIANT_FALSE);
}

HWND IeThread::bringToFront()
{
	SCOPETRACER
	setVisible(true);
	HWND hWnd;
	pBody->ieThreaded->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hWnd));

	SetActiveWindow(hWnd);
	SetFocus(hWnd);

	return hWnd;
}

void IeThread::getDocument(IHTMLDocument2** pdoc)
{
	SCOPETRACER
	CComPtr<IHTMLWindow2> window;
	findCurrentFrame(&window);

	if (window) {
		HRESULT hr = window->get_document(pdoc);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot get document";
		}
	}
}

void IeThread::getDefaultContentFromDoc(IHTMLWindow2 **result, IHTMLDocument2* doc)
{
	SCOPETRACER
	CComQIPtr<IHTMLFramesCollection2> frames;
	HRESULT hr = doc->get_frames(&frames);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get frames from document";
		return;
	}

	if (frames == NULL) {
		hr = doc->get_parentWindow(result);
		if (FAILED(hr)) 
			LOGHR(WARN, hr) << "Unable to get parent window.";
		return;
	}

	long length = 0;
	hr = frames->get_length(&length);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot determine length of frames";
	}

	if (!length) {
		hr = doc->get_parentWindow(result);
		if (FAILED(hr)) 
			LOGHR(WARN, hr) << "Unable to get parent window.";
		return;
	}

	CComPtr<IHTMLDocument3> doc3;
	hr = doc->QueryInterface(&doc3);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Have document, but it's not the right type";
		hr = doc->get_parentWindow(result);
		if (FAILED(hr)) 
			LOGHR(WARN, hr) << "Unable to get parent window.";
		return;
	}

	CComPtr<IHTMLElementCollection> bodyTags;
	CComBSTR bodyTagName(L"BODY");
	hr = doc3->getElementsByTagName(bodyTagName, &bodyTags);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot locate body";
		return;
	}

	long numberOfBodyTags = 0;
	hr = bodyTags->get_length(&numberOfBodyTags);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to establish number of tags seen";
	}

	if (numberOfBodyTags) {
		// Not in a frameset. Return the current window
		hr = doc->get_parentWindow(result);
		if (FAILED(hr)) 
			LOGHR(WARN, hr) << "Unable to get parent window.";
		return;
	}

	CComVariant index;
	index.vt = VT_I4;
	index.lVal = 0;

	CComVariant frameHolder;
	hr = frames->item(&index, &frameHolder);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get frame at index 0";
	}

	frameHolder.pdispVal->QueryInterface(__uuidof(IHTMLWindow2), (void**) result);
}


void IeThread::findCurrentFrame(IHTMLWindow2 **result)
{
	SCOPETRACER
	// Frame location is from _top. This is a good start
	CComPtr<IDispatch> dispatch;
	HRESULT hr = pBody->ieThreaded->get_Document(&dispatch);
	if (FAILED(hr)) {
		LOGHR(DEBUG, hr) << "Unable to get document";
		return;
	}

	CComPtr<IHTMLDocument2> doc;
	hr = dispatch->QueryInterface(&doc);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Have document but cannot cast";
	}

	// If the current frame path is null or empty, find the default content
	// The default content is either the first frame in a frameset or the body
	// of the current _top doc, even if there are iframes.

	if ( 0 == wcscmp(L"", pBody->pathToFrame.c_str()))
	{
		getDefaultContentFromDoc(result, doc);
		if (result) {
			return;
		} else {
			cerr << "Cannot locate default content." << endl;
			// What can we do here?
			return;
		}
	}

	// Otherwise, tokenize the current frame and loop, finding the
	// child frame in turn
	size_t len = pBody->pathToFrame.length() + 1;
	wchar_t *path = new wchar_t[len];
	wcscpy_s(path, len, pBody->pathToFrame.c_str());
	wchar_t *next_token;
	CComQIPtr<IHTMLWindow2> interimResult;
	for (wchar_t* fragment = wcstok_s(path, L".", &next_token);
		 fragment;
		 fragment = wcstok_s(NULL, L".", &next_token))
	{
		if (!doc) { break; } // This is seriously Not Good but what can you do?

		CComQIPtr<IHTMLFramesCollection2> frames;
		doc->get_frames(&frames);

		if (frames == NULL) { break; } // pathToFrame does not match. Exit.

		long length = 0;
		frames->get_length(&length);
		if (!length) { break; } // pathToFrame does not match. Exit.

		CComBSTR frameName(fragment);
		CComVariant index;
		// Is this fragment a number? If so, the index will be a VT_I4
		int frameIndex = _wtoi(fragment);
		if (frameIndex > 0 || wcscmp(L"0", fragment) == 0) {
			index.vt = VT_I4;
			index.lVal = frameIndex;
		} else {
			// Alternatively, it's a name
			frameName.CopyTo(&index);
		}

		// Find the frame
		CComVariant frameHolder;
		hr = frames->item(&index, &frameHolder);

		interimResult.Release();
		if (!FAILED(hr)) {
			interimResult = frameHolder.pdispVal;
		}

		if (!interimResult) { break; } // pathToFrame does not match. Exit.

		// TODO: Check to see if a collection of frames were returned. Grab the 0th element if there was.

		// Was there only one result? Next time round, please.
		CComQIPtr<IHTMLWindow2> window(interimResult);
		if (!window) { break; } // pathToFrame does not match. Exit.

		doc.Detach();
		window->get_document(&doc);
	}

	if (interimResult)
		*result = interimResult.Detach();
	delete[] path;
}


void IeThread::getDocument3(IHTMLDocument3** pOutDoc)
{
	SCOPETRACER

	CComPtr<IHTMLDocument2> doc2;
	getDocument(&doc2);
	if (!doc2) {	
		return;
	}

	CComQIPtr<IHTMLDocument3> doc(doc2);
	if (doc)
		*pOutDoc = doc.Detach();
}


bool IeThread::getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added)
{
	SCOPETRACER
	CComPtr<IDispatch> scriptEngine;
	doc->get_Script(&scriptEngine);

	OLECHAR FAR* evalName = L"eval";
    HRESULT hr = scriptEngine->GetIDsOfNames(IID_NULL, &evalName, 1, LOCALE_USER_DEFAULT, evalId);
	if (FAILED(hr)) {
		*added = true;
		// Start the script engine by adding a script tag to the page
		CComPtr<IHTMLElement> scriptTag;
		hr = doc->createElement(L"span", &scriptTag);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Failed to create span tag";
		}
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

void IeThread::removeScript(IHTMLDocument2* doc)
{
	CComQIPtr<IHTMLDocument3> doc3(doc);

	if (!doc3)
		return;

	CComPtr<IHTMLElement> element;
	CComBSTR id(L"__webdriver_private_span");
	HRESULT hr = doc3->getElementById(id, &element);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot find the script tag. Bailing.";
		return;
	}

	CComQIPtr<IHTMLDOMNode> elementNode(element);

	if (elementNode) {
		CComPtr<IHTMLElement> body;
		hr = doc->get_body(&body);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot locate body of document";
			return;
		}
		CComQIPtr<IHTMLDOMNode> bodyNode(body);
		if (!bodyNode) {
			LOG(WARN) << "Cannot cast body to a standard html node";
			return;
		}
		CComPtr<IHTMLDOMNode> removed;
		hr = bodyNode->removeChild(elementNode, &removed);
		if (FAILED(hr)) {
			LOGHR(DEBUG, hr) << "Cannot remove child node. Shouldn't matter. Bailing";
		}
	}
}

bool IeThread::createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result)
{
	CComVariant script_variant(script);
	DISPPARAMS parameters = {0};
    memset(&parameters, 0, sizeof parameters);
	parameters.cArgs      = 1;
	parameters.rgvarg     = &script_variant;
	parameters.cNamedArgs = 0;

	EXCEPINFO exception;
	memset(&exception, 0, sizeof exception);

	HRESULT hr = scriptEngine->Invoke(evalId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &parameters, result, &exception, 0);
	if (FAILED(hr)) {
	  if (DISP_E_EXCEPTION == hr) {
		  LOGHR(INFO, hr) << "Exception message was: " << _bstr_t(exception.bstrDescription) << ": " << _bstr_t(script);
	  } else {
		  LOGHR(DEBUG, hr) << "Failed to compile: " << script;
	}

  	  if (result) {
		  result->vt = VT_USERDEFINED;
		  result->bstrVal = CopyBSTR(exception.bstrDescription);
	  }

	  return false;
	}

	return true;
}


int IeThread::executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT* result, bool tryAgain)
{
	SCOPETRACER

	VariantClear(result);

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);
	if (!doc) {
		LOG(WARN) << "Unable to get document reference";
		return EUNEXPECTEDJSERROR;
	}

	CComPtr<IDispatch> scriptEngine;
	HRESULT hr = doc->get_Script(&scriptEngine);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot obtain script engine";
		return EUNEXPECTEDJSERROR;
	}

	DISPID evalId;
	bool added;
	bool ok = getEval(doc, &evalId, &added);

	if (!ok) {
		LOG(WARN) << "Unable to locate eval method";
		if (added) { removeScript(doc); }
		return EUNEXPECTEDJSERROR;
	}

	CComVariant tempFunction;
	if (!createAnonymousFunction(scriptEngine, evalId, script, &tempFunction)) {
		// Debug level since this is normally the point we find out that 
		// a page refresh has occured. *sigh*
		LOG(DEBUG) << "Cannot create anonymous function: " << _bstr_t(script) << endl;
		if (added) { removeScript(doc); }
		return EUNEXPECTEDJSERROR;
	}

	if (tempFunction.vt != VT_DISPATCH) {
		// No return value that we care about
		VariantClear(result);
		result->vt = VT_EMPTY;
		if (added) { removeScript(doc); }
		return SUCCESS;
	}

	// Grab the "call" method out of the returned function
	DISPID callid;
	OLECHAR FAR* szCallMember = L"call";
    hr = tempFunction.pdispVal->GetIDsOfNames(IID_NULL, &szCallMember, 1, LOCALE_USER_DEFAULT, &callid);
	if (FAILED(hr)) {
		if (added) { removeScript(doc); }
		LOGHR(DEBUG, hr) << "Cannot locate call method on anonymous function: " << _bstr_t(script) << endl;
		return EUNEXPECTEDJSERROR;
	}

	DISPPARAMS callParameters = { 0 };
	memset(&callParameters, 0, sizeof callParameters);
	int nargs = getLengthOf(args);
	callParameters.cArgs = nargs + 1;

	CComPtr<IHTMLWindow2> win;
	hr = doc->get_parentWindow(&win);
	if (FAILED(hr)) {
		if (added) { removeScript(doc); }
		LOGHR(WARN, hr) << "Cannot get parent window";
		return EUNEXPECTEDJSERROR;
	}
	_variant_t *vargs = new _variant_t[nargs + 1];
	VariantCopy(&(vargs[nargs]), &CComVariant(win));

	long index;
    for (int i = 0; i < nargs; i++)
    {
		index = i;
		CComVariant v;
		SafeArrayGetElement(args, &index, (void*) &v);
		VariantCopy(&(vargs[nargs - 1 - i]), &v);
    }

	callParameters.rgvarg = vargs;

	EXCEPINFO exception;
	memset(&exception, 0, sizeof exception);
	hr = tempFunction.pdispVal->Invoke(callid, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &callParameters, 
		result,
		&exception, 0);
	if (FAILED(hr)) {
	  CComBSTR errorDescription(exception.bstrDescription);
	  if (DISP_E_EXCEPTION == hr) {
		  LOG(INFO) << "Exception message was: " << _bstr_t(exception.bstrDescription);
	  } else {
		  LOGHR(DEBUG, hr) << "Failed to execute: " << _bstr_t(script);
		  if (added) { removeScript(doc); }
		  return EUNEXPECTEDJSERROR;
	  }
	  
	  VariantClear(result);
	  result->vt = VT_USERDEFINED;
	  result->bstrVal = CopyBSTR(exception.bstrDescription);
	  wcout << _bstr_t(exception.bstrDescription) << endl;
	}

	if (added) { removeScript(doc); }

	delete[] vargs;

	return SUCCESS;
}


HWND IeThread::getHwnd()
{
	SCOPETRACER
	HWND hWnd = NULL;
	pBody->ieThreaded->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hWnd));

	DWORD ieWinThreadId = GetWindowThreadProcessId(hWnd, NULL);
    DWORD currThreadId = GetCurrentThreadId();
    if( ieWinThreadId != currThreadId )
    {
		AttachThreadInput(currThreadId, ieWinThreadId, true);
    }

	SetActiveWindow(hWnd);

	if( ieWinThreadId != currThreadId )
    {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
    }

	return hWnd;
}

bool IeThread::isStillBusy()
{
	VARIANT_BOOL busy;
 
	HRESULT hr = pBody->ieThreaded->get_Busy(&busy);
	if (FAILED(hr)) {
		return true;
	}
	return (busy == VARIANT_TRUE);
}

void IeThread::waitForNavigateToFinish()
{
	static bool alreadyInsideWFNTF = false;
	if(alreadyInsideWFNTF)
	{
		safeIO::CoutA("Already INSIDE waitForNavigateToFinish", true);
		return;
	}

	SCOPETRACER
	alreadyInsideWFNTF = true;
	CScopeSetter<bool> S(&alreadyInsideWFNTF, false);

	HRESULT hr;

	if (isStillBusy())
	{
		safeIO::CoutA("still busy", true);
		startNavigationCompletionTimer();
		return;
	}

	safeIO::CoutA("IE is not busy", true);

	READYSTATE readyState;
	hr = pBody->ieThreaded->get_ReadyState(&readyState);
	if (FAILED(hr)) {
		LOGHR(DEBUG, hr) << "Unable to get ready state";
		startNavigationCompletionTimer();
		return;
	}
	int counter = 0;
	if(readyState != READYSTATE_COMPLETE)
	{
		safeIO::CoutLong(readyState);
		startNavigationCompletionTimer();
		return;
	}

	safeIO::CoutA("IE is READY", true);

	CComPtr<IDispatch> dispatch;
	hr = pBody->ieThreaded->get_Document(&dispatch);
	if (FAILED(hr)) {
		LOGHR(DEBUG, hr) << "Unable to get document";
		startNavigationCompletionTimer();
		return;
	}
	CComQIPtr<IHTMLDocument2> doc(dispatch);
	if (!doc) {
		LOG(DEBUG) << "Document obtained but cannot cast";
		startNavigationCompletionTimer();
		return;
	}

	if (0==waitForDocumentToComplete(doc)) 
	{
		safeIO::CoutA("doc not complete yet", true);
		startNavigationCompletionTimer();
		return;
	}

	CComPtr<IHTMLFramesCollection2> frames;
	hr = doc->get_frames(&frames);
	if (FAILED(hr)) {
		LOGHR(DEBUG, hr) << "Unable to obtain frames";
		startNavigationCompletionTimer();
		return;
	}

	if (frames != NULL) {
		long framesLength = 0;
		hr = frames->get_length(&framesLength);
		if (FAILED(hr)) {
			LOGHR(DEBUG, hr) << "Frame length is unknown";
			startNavigationCompletionTimer();
			return;
		}

		CComVariant index;
		index.vt = VT_I4;

		for (long i = 0; i < framesLength; i++) {
			index.lVal = i;
			CComVariant result;
			hr = frames->item(&index, &result);
			if (FAILED(hr)) {
				LOGHR(DEBUG, hr) << "Cannot obtain frame at index: " << i;
				startNavigationCompletionTimer();
				return;
			}

			CComQIPtr<IHTMLWindow2> window(result.pdispVal);
			if (!window) {
				LOG(DEBUG) << "Window at frame index " << i << " is not HTML. Skipping.";
				continue;
			}
			CComPtr<IHTMLDocument2> frameDoc;
			hr = window->get_document(&frameDoc);
			if (FAILED(hr)) {
				LOGHR(DEBUG, hr) << "No document in subframe though one expected";
				startNavigationCompletionTimer();
				return;
			}

			if (0==waitForDocumentToComplete(frameDoc))
			{
				safeIO::CoutA("frame not complete yet", true);
				startNavigationCompletionTimer();
				return;
			}
		}
	}

	tryNotifyNavigCompleted();
}

// returns 1 if it is complete, 0 if incomplete.
int IeThread::waitForDocumentToComplete(IHTMLDocument2* doc)
{
	SCOPETRACER
	CComBSTR state;

	if (!doc) {
		// There's no way to tell what's meant to happen. Bail
		return 1;
	}

	HRESULT hr = doc->get_readyState(&state);
	hr = doc->get_readyState(&state);
	if (FAILED(hr)) {
		LOGHR(DEBUG, hr) << "Unable to obtain document's ready state";
		return 0;
	}
	if ( _wcsicmp( combstr2cw(state) , L"complete") != 0) {
		// Still NOT complete
		safeIO::CoutL(combstr2cw(state), true);
		return 0;
	}

	return 1;
}

void IeThread::tryNotifyNavigCompleted()
{
	SCOPETRACER

	stopNavigationCompletionTimer();
	if(m_EventToNotifyWhenNavigationCompleted)
	{
		HANDLE h = m_EventToNotifyWhenNavigationCompleted;
		safeIO::CoutA("Release EventToNotifyWhenNavigationCompleted", true);
		m_EventToNotifyWhenNavigationCompleted = NULL;
		SetEvent(h);
	}
}


void IeThread::tryTransferEventReleaserToNotifyNavigCompleted(CScopeCaller *pSC, bool setETNWNC)
{
	SCOPETRACER
	if(!pSC) return;

	CScopeCaller& sc = *pSC;
	sc.m_releaseOnDestructor = !setETNWNC;
	m_EventToNotifyWhenNavigationCompleted = (setETNWNC) ? sc.getSync() : NULL;
}


