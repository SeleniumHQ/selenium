// IEThread.cpp : implementation file
//

#include "stdafx.h"
#include <comdef.h>

#include "IEThread.h"

#include "utils.h"

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

void IeThread::OnAddCookie(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	CComBSTR cookie(data.input_string_);

	CComPtr<IHTMLDocument2> doc;
	getDocument(&doc);

	doc->put_cookie(cookie);
}

void IeThread::OnWaitForNavigationToFinish(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	waitForNavigateToFinish();
}

void IeThread::OnExecuteScript(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)

	// TODO/MAYBE
	// the input WebElement(s) may need to have their IHTMLElement QI-converted into IHTMLDOMNode

	executeScript(data.input_string_, data.input_safe_array_, &(data.output_variant_));

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
	long &errorKind = data.output_long_;
	IHTMLElement* &pDom = data.output_html_element_; 
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);

	pDom = NULL;
	errorKind = 0;

	const bool inputElementWasNull = (!inputElement);

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
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res.snapshotItem(0);};})();";
	else
		expr += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res.snapshotItem(0);};})();";

	CComVariant result;
	CComBSTR expression = CComBSTR(data.input_string_);

	SAFEARRAY* args = NULL;
	if (!inputElementWasNull) {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
		long index = 1;
		CComVariant dest2;   
		CComQIPtr<IHTMLElement> element(const_cast<IHTMLDOMNode*>((IHTMLDOMNode*)node));
		dest2.vt = VT_DISPATCH;
		dest2.pdispVal = element;
		SafeArrayPutElement(args, &index, &dest2);
	} else {
		args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	}

	long index = 0;
	CComVariant dest;   
	dest.vt = VT_BSTR;
	dest.bstrVal = expression;
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
}

void IeThread::OnSelectElementsByXPath(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_COMMON(data)
	CComPtr<IHTMLElement> inputElement(data.input_html_element_);
	long &errorKind = data.output_long_;
	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;

	errorKind = 0;

	const bool inputElementWasNull = (!inputElement);

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
	CComVariant dest2;
	CComQIPtr<IHTMLElement> element(const_cast<IHTMLDOMNode*>((IHTMLDOMNode*)node));
	dest2.vt = VT_DISPATCH;
	dest2.pdispVal = element;
	SafeArrayPutElement(args, &index, &dest2);

	index = 0;
	CComVariant dest;
	dest.vt = VT_BSTR;
	dest.bstrVal = expression;
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

bool IeThread::isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child) 
{
	CComQIPtr<IHTMLElement> parent(const_cast<IHTMLDOMNode*>(root));
	VARIANT_BOOL toReturn;
	parent->contains(child, &toReturn);

	return toReturn == VARIANT_TRUE;
}

void IeThread::OnQuitIE(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	pBody->ieThreaded->Stop();
	pBody->ieThreaded->Quit();
	pBody->ieThreaded.Release();
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


