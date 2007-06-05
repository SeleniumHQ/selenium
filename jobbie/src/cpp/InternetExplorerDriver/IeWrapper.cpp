#include "StdAfx.h"
#include "IeWrapper.h"
#include "utils.h"
#include <iostream>
#include <jni.h>
#include <comutil.h>
#include <comdef.h>
//#include <afxdisp.h>

using namespace std;

IeWrapper::IeWrapper()
{
	if (!SUCCEEDED(CoCreateInstance(CLSID_InternetExplorer, NULL, CLSCTX_LOCAL_SERVER, IID_IWebBrowser2, (void**)&ie))) 
	{
		throw "Cannot create InternetExplorer instance";
	}
}

IeWrapper::~IeWrapper()
{
}

bool IeWrapper::getVisible()
{
	VARIANT_BOOL visible;
	ie->get_Visible(&visible);
	return visible == VARIANT_TRUE;
}

void IeWrapper::setVisible(bool isVisible) 
{
	if (isVisible)
		ie->put_Visible(VARIANT_TRUE);
	else 
		ie->put_Visible(VARIANT_FALSE);
}

const char* IeWrapper::getCurrentUrl() 
{
	IHTMLDocument2 *doc = getDocument();
	CComBSTR url;
	doc->get_URL(&url);
	return bstr2char(url);
}

const char* IeWrapper::getTitle() 
{
	BSTR title;
	IHTMLDocument2 *doc = getDocument();
	doc->get_title(&title);
	doc->Release();
	return bstr2char(title);
}

void IeWrapper::get(const char *url)
{
	CComVariant spec(url);
	CComVariant dummy;

	ie->Navigate2(&spec, &dummy, &dummy, &dummy, &dummy);
	waitForNavigateToFinish();
}

ElementWrapper* IeWrapper::selectElementById(const char *elementId) 
{
	IHTMLDocument3 *doc = getDocument3();
	IHTMLElement* element = NULL;
	doc->getElementById(_bstr_t(elementId), &element);
	doc->Release();
	
	if (element != NULL) {
		IHTMLDOMNode* node = NULL;
		element->QueryInterface(__uuidof(IHTMLDOMNode), (void **)&node);
		element->Release();
		return new ElementWrapper(node);
	}

	throw "Cannot find element";
}

void IeWrapper::waitForNavigateToFinish() 
{
	VARIANT_BOOL busy;
	ie->get_Busy(&busy);
	while (busy == VARIANT_TRUE) {
		Sleep(10);
		ie->get_Busy(&busy);
	}

	READYSTATE readyState;
	ie->get_ReadyState(&readyState);
	while (readyState != tagREADYSTATE::READYSTATE_COMPLETE) {
		Sleep(20);
		ie->get_ReadyState(&readyState);
	}
}

IHTMLDocument2* IeWrapper::getDocument() 
{
	IDispatch* ppDisp = NULL;
	ie->get_Document(&ppDisp);

	IHTMLDocument2* htmlDoc2 = NULL;

	if (ppDisp != NULL)
    {
		if (!FAILED(ppDisp->QueryInterface(IID_IHTMLDocument2, (LPVOID *)&htmlDoc2))) {
			ppDisp->Release();
			return htmlDoc2;
		}
	}
	throw "Cannot locate document as IHTMLDocument2";
}

IHTMLDocument3* IeWrapper::getDocument3() 
{
	IDispatch* ppDisp = NULL;
	ie->get_Document(&ppDisp);

	IHTMLDocument3* htmlDoc3 = NULL;

	if (ppDisp != NULL)
    {
		if (!FAILED(ppDisp->QueryInterface(IID_IHTMLDocument3, (LPVOID *)&htmlDoc3))) {
			ppDisp->Release();
			return htmlDoc3;
		}
	}
	throw "Cannot locate document as IHTMLDocument3";
}