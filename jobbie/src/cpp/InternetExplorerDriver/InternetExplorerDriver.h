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

	void setSpeed(int speed);
	int getSpeed();

	ElementWrapper* getActiveElement();
	ElementWrapper* selectElementByXPath(const wchar_t *xpath);
	std::vector<ElementWrapper*>* selectElementsByXPath(const wchar_t *xpath);
	ElementWrapper* selectElementById(const wchar_t *elementId);
	std::vector<ElementWrapper*>* selectElementsById(const wchar_t *id);
	ElementWrapper* selectElementByLink(const wchar_t *elementLink);
	std::vector<ElementWrapper*>* selectElementsByLink(const wchar_t *linkText);
	ElementWrapper* selectElementByName(const wchar_t *elementName);
	std::vector<ElementWrapper*>* selectElementsByName(const wchar_t *name);
	ElementWrapper* selectElementByClassName(const wchar_t *elementClassName);
	std::vector<ElementWrapper*>* selectElementsByClassName(const wchar_t *name);
	void getDocument(IHTMLDocument2 **pdoc);
	void getDocument3(IHTMLDocument3 **pdoc);

	void waitForNavigateToFinish();
	void switchToFrame(int frameIndex);

	std::wstring getCookies();
	void addCookie(const wchar_t *cookieString);

	HWND getHwnd();

	void executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT *result, bool tryAgain = true);

private:
	bool getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added);
	void removeScript(IHTMLDocument2* doc);
	bool addEvaluateToDocument(int count);
	bool createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result);
	void waitForDocumentToComplete(IHTMLDocument2* doc);

	IeEventSink* sink;
	CComQIPtr<IWebBrowser2, &__uuidof(IWebBrowser2)> ie;
	long currentFrame;
	int speed;

	bool closeCalled;
};

class IeEventSink : public IDispatch {
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
