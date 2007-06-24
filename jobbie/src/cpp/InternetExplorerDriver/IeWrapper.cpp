#include "StdAfx.h"
#include "IeWrapper.h"
#include "utils.h"
#include <iostream>
#include <jni.h>
#include <comutil.h>
#include <comdef.h>
#include <stdlib.h>
#include <string>

#include "atlbase.h"
#include "atlstr.h"

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
	ie->Release();
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

const wchar_t* IeWrapper::getCurrentUrl() 
{
	CComQIPtr<IHTMLDocument2, &__uuidof(IHTMLDocument2)> doc = getDocument();
	CComBSTR url;
	doc->get_URL(&url);

	return bstr2wchar(url);
}

const wchar_t* IeWrapper::getTitle() 
{
	CComBSTR title;
	IHTMLDocument2 *doc = getDocument();
	doc->get_title(&title);
	doc->Release();

	return bstr2wchar(title);
}

void IeWrapper::get(const wchar_t *url)
{
	CComVariant spec(url);
	CComVariant dummy;

	ie->Navigate2(&spec, &dummy, &dummy, &dummy, &dummy);
	waitForNavigateToFinish();
}

ElementWrapper* IeWrapper::selectElementById(const wchar_t *elementId) 
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

ElementWrapper* IeWrapper::selectElementByLink(const wchar_t *elementLink)
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

void IeWrapper::waitForNavigateToFinish() 
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

	IHTMLDocument2* doc = getDocument();
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

void IeWrapper::waitForDocumentToComplete(IHTMLDocument2* doc)
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
	ppDisp->Release();
	throw "Cannot locate document as IHTMLDocument2";
}

IHTMLDocument3* IeWrapper::getDocument3() 
{
	IDispatch* ppDisp = NULL;
	ie->get_Document(&ppDisp);

	IHTMLDocument3* htmlDoc3 = NULL;

	if (ppDisp != NULL)
    {
		if (!FAILED(ppDisp->QueryInterface(__uuidof(IHTMLDocument3), (LPVOID *)&htmlDoc3))) {
			ppDisp->Release();
			return htmlDoc3;
		}
	}
	ppDisp->Release();
	throw "Cannot locate document as IHTMLDocument3";
}