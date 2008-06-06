#pragma once
#ifndef InternetExplorerDriver_h
#define InternetExplorerDriver_h

#include <Exdisp.h>
#include <mshtml.h>
#include <string>
#include <vector>
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

	std::wstring getCurrentUrl();

	std::wstring getTitle();
	void get(const wchar_t* url);
	void goForward();
	void goBack();

	ElementWrapper* selectElementByXPath(const wchar_t *xpath);
	std::vector<ElementWrapper*>* selectElementsByXPath(const wchar_t *xpath);
	ElementWrapper* selectElementById(const wchar_t *elementId);
	ElementWrapper* selectElementByLink(const wchar_t *elementLink);
	ElementWrapper* selectElementByName(const wchar_t *elementName);
	ElementWrapper* selectElementByClassName(const wchar_t *elementClassName);
	void getDocument(IHTMLDocument2 **pdoc);

	void waitForNavigateToFinish();
	void switchToFrame(int frameIndex);

	std::wstring getCookies();
	void addCookie(const wchar_t *cookieString);

	HWND bringToFront();

	void executeScript(const wchar_t *script, VARIANT *result, bool tryAgain = true);

private:
	bool addEvaluateToDocument(int count);
	void waitForDocumentToComplete(IHTMLDocument2* doc);
	void getDocument3(IHTMLDocument3 **pdoc);

	IeEventSink* sink;
	CComQIPtr<IWebBrowser2, &__uuidof(IWebBrowser2)> ie;
	long currentFrame;

	bool closeCalled;
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
	CComPtr<IWebBrowser2> ie;
	DWORD eventSinkCookie;
};

#endif
