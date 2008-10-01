// IEThread.cpp : implementation file
//

#include "stdafx.h"
#include <comutil.h>

#include "logging.h"

#include "utils.h"
#include "InternalCustomMessage.h"
#include "EventReleaser.h"

using namespace std;
extern wchar_t* XPATHJS[];

// IeThread

IeThread::IeThread() :  pBody(NULL), pIED(NULL), hThread(NULL), threadID(0)
{
	SCOPETRACER

	m_EventToNotifyWhenNavigationCompleted = NULL;
}

IeThread::~IeThread()
{
	SCOPETRACER
}


#define CUSTOM_MESSAGE_MAP(a,b) \
	if(a == msg) {b(pMsg->lParam, pMsg->wParam); return TRUE;}

BOOL IeThread::DispatchThreadMessageEx(MSG* pMsg)
{
	if (pMsg->message <= WM_USER) return FALSE;
	if (pMsg->message > (WM_USER+100)) return FALSE;

	const UINT msg = pMsg->message;

	CUSTOM_MESSAGE_MAP ( _WD_START, OnStartIE )
    CUSTOM_MESSAGE_MAP ( _WD_SWITCHTOFRAME, OnSwitchToFrame )
    CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISDISPLAYED, OnElementIsDisplayed )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISENABLED, OnElementIsEnabled )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETX, OnElementGetX )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETY, OnElementGetY )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETHEIGHT, OnElementGetHeight )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETWIDTH, OnElementGetWidth )

	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETATTRIBUTE, OnElementGetAttribute )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETVALUE, OnElementGetValue )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SENDKEYS, OnElementSendKeys )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_CLEAR, OnElementClear )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_ISSELECTED, OnElementIsSelected )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SETSELECTED, OnElementSetSelected )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETVALUEOFCSSPROP, OnElementGetValueOfCssProp )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETTEXT, OnElementGetText )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_CLICK, OnElementClick )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_SUBMIT, OnElementSubmit )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_GETCHILDRENWTAGNAME, OnElementGetChildrenWithTagName )
	CUSTOM_MESSAGE_MAP ( _WD_ELEM_RELEASE, OnElementRelease )

	CUSTOM_MESSAGE_MAP ( _WD_GETVISIBLE, OnGetVisible )
	CUSTOM_MESSAGE_MAP ( _WD_SETVISIBLE, OnSetVisible )
	CUSTOM_MESSAGE_MAP ( _WD_GETCURRENTURL, OnGetCurrentUrl )
	CUSTOM_MESSAGE_MAP ( _WD_GETTITLE, OnGetTitle )
	CUSTOM_MESSAGE_MAP ( _WD_GETURL, OnGetUrl )
	CUSTOM_MESSAGE_MAP ( _WD_GOFORWARD, OnGoForward )
	CUSTOM_MESSAGE_MAP ( _WD_GOBACK, OnGoBack )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYXPATH, OnSelectElementByXPath )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYXPATH, OnSelectElementsByXPath )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYID, OnSelectElementById )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYID, OnSelectElementsById )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYLINK, OnSelectElementByLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYLINK, OnSelectElementsByLink )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYNAME, OnSelectElementByName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYNAME, OnSelectElementsByName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTBYCLASSNAME, OnSelectElementByClassName )
	CUSTOM_MESSAGE_MAP ( _WD_SELELEMENTSBYCLASSNAME, OnSelectElementsByClassName )
	CUSTOM_MESSAGE_MAP ( _WD_GETCOOKIES, OnGetCookies )
	CUSTOM_MESSAGE_MAP ( _WD_ADDCOOKIE, OnAddCookie )

	CUSTOM_MESSAGE_MAP ( _WD_WAITFORNAVIGATIONTOFINISH, OnWaitForNavigationToFinish )
	CUSTOM_MESSAGE_MAP ( _WD_EXECUTESCRIPT, OnExecuteScript )
	CUSTOM_MESSAGE_MAP ( _WD_GETACTIVEELEMENT, OnGetActiveElement )
	CUSTOM_MESSAGE_MAP ( _WD_QUIT_IE, OnQuitIE )

	 return FALSE;
}

int IeThread::runProcessStatic(void *pThis)
{
	SCOPETRACER
	return ((IeThread*)(pThis))->runProcess();
}

int IeThread::runProcess()
{
	SCOPETRACER
	InitInstance();

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
	return ExitInstance();
}

BOOL IeThread::InitInstance()
{
	SCOPETRACER
	threadID = GetCurrentThreadId(); 
	pBody = new IeThreadData;

	pBody->m_CmdData.output_string_.resize(5000);

	CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
	
	return TRUE;
}

int IeThread::ExitInstance()
{
	SCOPETRACER
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
	EventReleaser er(sync_LaunchIE);
	HRESULT hr = pBody->ieThreaded.CoCreateInstance(CLSID_InternetExplorer, NULL, CLSCTX_LOCAL_SERVER);

	LOG(INFO) << "Has instanciated IE. Multithreaded version." ;

	if (!SUCCEEDED(hr)) 
	{
		std::wstring Err(L"Cannot create InternetExplorer instance"); 
		throw Err;
	}

	pBody->mSink.p_Thread = this;
	pBody->mSink.ConnectionAdvise();

	bringToFront();
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

	if (window)
		window->get_document(pdoc);
}

void IeThread::getDefaultContentFromDoc(IHTMLWindow2 **result, IHTMLDocument2* doc)
{
	SCOPETRACER
	CComQIPtr<IHTMLFramesCollection2> frames;
	doc->get_frames(&frames);

	if (frames == NULL) {
		doc->get_parentWindow(result);
		return;
	}

	long length = 0;
	frames->get_length(&length);

	if (!length) {
		doc->get_parentWindow(result);
		return;
	}

	CComQIPtr<IHTMLDocument3> doc3(doc);

	CComPtr<IHTMLElementCollection> bodyTags;
	CComBSTR bodyTagName(L"BODY");
	doc3->getElementsByTagName(bodyTagName, &bodyTags);

	long numberOfBodyTags = 0;
	bodyTags->get_length(&numberOfBodyTags);

	if (numberOfBodyTags) {
		// Not in a frameset. Return the current window
		doc->get_parentWindow(result);
		return;
	}

	CComVariant index;
	index.vt = VT_I4;
	index.lVal = 0;
	
	CComVariant frameHolder;
	frames->item(&index, &frameHolder);

	frameHolder.pdispVal->QueryInterface(__uuidof(IHTMLWindow2), (void**) result);
}


void IeThread::findCurrentFrame(IHTMLWindow2 **result)
{
	SCOPETRACER
	// Frame location is from _top. This is a good start
	CComPtr<IDispatch> dispatch;
	pBody->ieThreaded->get_Document(&dispatch);
	if (!dispatch)
		return;

	CComQIPtr<IHTMLDocument2> doc(dispatch);

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
			index.vt = VT_BSTR;
			index.bstrVal = frameName;
		}
		
		// Find the frame
		CComVariant frameHolder;
		frames->item(&index, &frameHolder);

		interimResult.Release();
		interimResult = frameHolder.pdispVal;

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
	
	CComQIPtr<IHTMLDocument3> doc(doc2);
	*pOutDoc = doc.Detach();
}


bool IeThread::getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added) 
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

void IeThread::removeScript(IHTMLDocument2* doc)
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

bool IeThread::createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result)
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


void IeThread::executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT *result, bool tryAgain)
{
	SCOPETRACER
	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	CComPtr<IDispatch> scriptEngine;
	doc->get_Script(&scriptEngine);

	DISPID evalId;
	bool added;
	bool ok = getEval(doc, &evalId, &added);

	if (!ok) {
		wcerr << L"Unable to locate eval method" << endl;
		return;
	}

	CComVariant tempFunction;
	if (!createAnonymousFunction(scriptEngine, evalId, script, &tempFunction)) {
		wcerr << L"Cannot create anonymous function: " << script << endl;
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
		wcerr << L"Cannot locate call method on anonymous function: " << script << endl;
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
		  wcerr << L"Exception message was: " << exception.bstrDescription << endl;
	  } else {
		  wcerr << L"Failed to execute: " << script << endl;
	  }
	  
	  if (result) {
		  result->vt = VT_USERDEFINED;
		  result->bstrVal = exception.bstrDescription;
	  }
	}

	if (added) { removeScript(doc); }

	delete[] vargs;
}


HWND IeThread::getHwnd() 
{
	SCOPETRACER
	HWND hWnd;
	pBody->ieThreaded->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hWnd));

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
	VARIANT_BOOL busy;


	HRESULT hr;

	pBody->ieThreaded->get_Busy(&busy);
	if(busy == VARIANT_TRUE)
	{
		safeIO::CoutA("still busy", true);
		return;
	}


	safeIO::CoutA("IE is not busy", true);

	READYSTATE readyState;
	pBody->ieThreaded->get_ReadyState(&readyState);
	int counter = 0;
	if(readyState != READYSTATE_COMPLETE)
	{
		safeIO::CoutA("not ready yet", true);
		return;
	}

	safeIO::CoutA("IE is READY", true);

	CComPtr<IDispatch> dispatch;
	pBody->ieThreaded->get_Document(&dispatch);
	CComQIPtr<IHTMLDocument2> doc(dispatch);
	
	waitForDocumentToComplete(doc);

	CComPtr<IHTMLFramesCollection2> frames;
	hr = doc->get_frames(&frames);


	if (frames != NULL) {
		long framesLength = 0;
		frames->get_length(&framesLength);

		CComVariant index;
		index.vt = VT_I4;

		for (long i = 0; i < framesLength; i++) {
			index.lVal = i;
			CComVariant result;
			frames->item(&index, &result);

			CComQIPtr<IHTMLWindow2> window(result.pdispVal);
			CComPtr<IHTMLDocument2> frameDoc;
			window->get_document(&frameDoc);

			waitForDocumentToComplete(frameDoc);
		}
	}

	tryNotifyNavigCompleted();
}

void IeThread::waitForDocumentToComplete(IHTMLDocument2* doc)
{
	SCOPETRACER
	CComBSTR state;
	HRESULT hr = doc->get_readyState(&state);


	int counter = 0;
	while ( _wcsicmp( combstr2cw(state) , L"complete") != 0) {
		counter++;
		waitWithoutMsgPump(50);
		state.Empty();
		hr = doc->get_readyState(&state);
		if(counter>60 && !SUCCEEDED(hr))
		{
			safeIO::CoutA("Error: failed to call get_readyState", true);
			break;
		}
	}
}

bool IeThread::addEvaluateToDocument(const IHTMLDOMNode* node, int count)
{
	SCOPETRACER
	
	// Is there an evaluate method on the document?
	CComPtr<IHTMLDocument2> doc;
	getDocument2(node, &doc);

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
	executeScript(script.c_str(), NULL, NULL);
	
	hr = doc->GetIDsOfNames(IID_NULL, &szMember, 1, LOCALE_USER_DEFAULT, &dispid);
	if (FAILED(hr)) {
		cerr << "After attempting to add the xpath engine, the evaluate method is still missing" << endl;
		if (count < 1) {
			return addEvaluateToDocument(node, ++count);
		}
	
		return false;
	}
	return true;
}

void IeThread::tryNotifyNavigCompleted()
{
	SCOPETRACER
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


