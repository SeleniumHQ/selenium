#pragma once
#ifndef InternetExplorerDriver_h
#define InternetExplorerDriver_h

#include <Exdisp.h>
#include <mshtml.h>
#include <string>
#include "ElementWrapper.h"

class ElementWrapper;
class IeEventSink;

class InternetExplorerDriver
{
public:
	InternetExplorerDriver();
	InternetExplorerDriver(InternetExplorerDriver* other);
	~InternetExplorerDriver();

	void close();

	bool getVisible();
	void setVisible(bool isShown);

	const wchar_t* getCurrentUrl();

	const wchar_t* getTitle();
	void get(const wchar_t* url);
	void goForward();
	void goBack();

	ElementWrapper* selectElementById(const wchar_t *elementId);
	ElementWrapper* selectElementByLink(const wchar_t *elementLink);
	IHTMLDocument2* getDocument();

	void waitForNavigateToFinish();
	void switchToFrame(int frameIndex);

	const wchar_t* getCookies();
	void addCookie(const wchar_t *cookieString);

private:
	void waitForDocumentToComplete(IHTMLDocument2* doc);
	IeEventSink* sink;
	IHTMLDocument3* getDocument3();
	CComQIPtr<IWebBrowser2, &__uuidof(IWebBrowser2)> ie;
	long currentFrame;
};

class IeEventSink : public IDispatch
{
public:
	IeEventSink(IWebBrowser2* ie);
	~IeEventSink();

   // IUnknown
    STDMETHODIMP QueryInterface(REFIID interfaceId, void **pointerToObj);
    STDMETHODIMP_(ULONG) AddRef();
    STDMETHODIMP_(ULONG) Release();

	// IDispatch interface
	STDMETHODIMP Invoke(DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags,
                                   DISPPARAMS* pDispParams, VARIANT* pvarResult, EXCEPINFO*  pExcepInfo, UINT* puArgErr);

	STDMETHODIMP GetIDsOfNames(REFIID riid,  LPOLESTR* names, UINT numNames, LCID localeContextId, DISPID* dispatchIds);

	STDMETHODIMP GetTypeInfoCount(UINT* pctinfo);
	STDMETHODIMP GetTypeInfo(UINT typeInfoId, LCID localeContextId, ITypeInfo** pointerToTypeInfo);

private:
	IWebBrowser2* ie;
	DWORD eventSinkCookie;
};

#endif