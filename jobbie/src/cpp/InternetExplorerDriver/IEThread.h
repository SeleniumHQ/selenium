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

#pragma once

#include "IEThreadData.h"
#include "scopeTracer.h"

#define WM_KICKIDLE         0x036A  // (params unused) causes idles to kick in

// IeThread
class ElementWrapper;
class InternetExplorerDriver;

class IeThread
{
public:
	IeThread();           // protected constructor used by dynamic creation
	virtual ~IeThread();

public:

	void PostThreadMessageW(UINT msg, WPARAM wp, LPARAM lp) {::PostThreadMessageW( threadID, msg, wp , lp);}

	MSG curMsg;

	virtual BOOL InitInstance();
	virtual int ExitInstance();

	IeThreadData* pBody;

	static HWND m_HeartBeatListener;
	UINT_PTR m_HeartBeatTimerID;
	UINT_PTR m_NavigationCompletionTimerID;

	void startNavigationCompletionTimer();
	void stopNavigationCompletionTimer();


	HANDLE hThread;
	DWORD threadID;

	static int runProcessStatic(void *);
	int runProcess();

	void setVisible(bool isVisible);
	HWND bringToFront();

	void waitForNavigateToFinish();

	EventHandler sync_LaunchThread;
	EventHandler sync_LaunchIE;

	HANDLE			  m_EventToNotifyWhenNavigationCompleted;

	InternetExplorerDriver* pIED;

	BOOL CustomInternalPreTranslateMessage(MSG* pMsg);
	BOOL CustomInternalPumpMessage();
	BOOL DispatchThreadMessageEx(MSG* pMsg);

	int ieRelease;

private:

	bool isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child);
	void getDocument3(const IHTMLDOMNode* extractFrom, IHTMLDocument3** pdoc);
	void getDocument2(const IHTMLDOMNode* extractFrom, IHTMLDocument2** pdoc);

	void getAllBrowsers(std::vector<IWebBrowser2*>* browsers);

	void tryNotifyNavigCompleted();
	void tryTransferEventReleaserToNotifyNavigCompleted(CScopeCaller *pSC, bool setETNWNC=true);

	void newEventObject(IHTMLElement *pElement, CComPtr<IHTMLEventObj>& r_eventObject);
	void fireEvent(IHTMLElement *pElement, IHTMLEventObj*, LPCWSTR);
	void fireEvent(IHTMLElement *pElement, IHTMLDOMNode* fireFrom, IHTMLEventObj*, LPCWSTR);

	static void collapsingAppend(std::wstring& s, const std::wstring& s2);
	static std::wstring collapseWhitespace(CComBSTR &text);
	static bool isBlockLevel(IHTMLDOMNode *node);
	static void getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted);

protected:
	void getTextAreaValue(IHTMLElement *pElement, std::wstring& res);
	HWND getHwnd();

	void getDocument(IHTMLDocument2** pOutDoc);
	void getDocument3(IHTMLDocument3** pOutDoc);

	int executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT* result, bool tryAgain = true);
	bool isCheckbox(IHTMLElement *pElement);
	bool isRadio(IHTMLElement *pElement);
	void getTagName(IHTMLElement *pElement, std::wstring& res);
	bool isSelected(IHTMLElement *pElement);
	static int isNodeDisplayed(IHTMLDOMNode *element, bool* displayed);
	static int isDisplayed(IHTMLElement *element, bool* displayed);
	bool isStillBusy();
	bool isEnabled(IHTMLElement *pElement);
	int getLocationWhenScrolledIntoView(IHTMLElement *pElement, HWND* hwnd, long *x, long *y, long *w, long *h);
	int click(IHTMLElement *pElement, CScopeCaller *pSC=NULL);
	void getValueOfCssProperty(IHTMLElement *pElement, LPCWSTR propertyName, std::wstring& res);
	void getText(IHTMLElement *pElement, std::wstring& res);
	void getPageSource(std::wstring& res);
	void getTitle(std::wstring& res);
	void submit(IHTMLElement *pElement, CScopeCaller *pSC); // =NULL);
	void findParentForm(IHTMLElement *pElement, IHTMLFormElement **pform);
	std::vector<ElementWrapper*>* getChildrenWithTagName(IHTMLElement *pElement, LPCWSTR tagName) ;
	int waitForDocumentToComplete(IHTMLDocument2* doc);
	void findCurrentFrame(IHTMLWindow2 **result);
	void getDefaultContentFromDoc(IHTMLWindow2 **result, IHTMLDocument2* doc);

	bool getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added);
	void removeScript(IHTMLDocument2* doc);
	bool createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result);
  void captureScreenshot(std::wstring& res);
  std::wstring getStriptResultObjectType(CComVariant* scriptResult);

          void OnStartIE(WPARAM, LPARAM);
          void OnGetFramesCollection(WPARAM, LPARAM);
          void OnSwitchToFrame(WPARAM, LPARAM);
          void OnExecuteScript(WPARAM, LPARAM);
          void OnGetActiveElement(WPARAM, LPARAM);
		  void OnCloseWindow(WPARAM, LPARAM);
		  void OnSwitchToWindow(WPARAM, LPARAM);

		  void OnElementIsDisplayed(WPARAM, LPARAM);
		  void OnElementIsEnabled(WPARAM, LPARAM);
		  void OnElementGetLocationOnceScrolledIntoView(WPARAM, LPARAM);
		  void OnElementGetLocation(WPARAM, LPARAM);
		  void OnElementGetHeight(WPARAM, LPARAM);
		  void OnElementGetWidth(WPARAM, LPARAM);

		  void OnIsElementFresh(WPARAM, LPARAM);
		  void OnElementGetTagName(WPARAM, LPARAM);
		  void OnElementSendKeys(WPARAM, LPARAM);
		  void OnElementClear(WPARAM, LPARAM);
		  void OnElementIsSelected(WPARAM, LPARAM);
		  void OnElementSetSelected(WPARAM, LPARAM);
		  void OnElementToggle(WPARAM, LPARAM);
		  void OnElementGetValueOfCssProp(WPARAM, LPARAM);
		  void OnElementGetText(WPARAM, LPARAM);
		  void OnElementClick(WPARAM, LPARAM);
		  void OnElementSubmit(WPARAM, LPARAM);
		  void OnElementGetChildrenWithTagName(WPARAM, LPARAM);

		  void OnGetVisible(WPARAM, LPARAM);
		  void OnSetVisible(WPARAM, LPARAM);
		  void OnGetCurrentUrl(WPARAM, LPARAM);
		  void OnGetPageSource(WPARAM, LPARAM);
		  void OnGetTitle(WPARAM, LPARAM);
		  void OnGetUrl(WPARAM, LPARAM);
		  void OnGoForward(WPARAM, LPARAM);
		  void OnGoBack(WPARAM, LPARAM);
		  void OnGetHandle(WPARAM, LPARAM);
		  void OnGetHandles(WPARAM, LPARAM);
		  void OnSelectElementById(WPARAM, LPARAM);
		  void OnSelectElementsById(WPARAM, LPARAM);
		  void OnSelectElementByLink(WPARAM, LPARAM);
		  void OnSelectElementsByLink(WPARAM, LPARAM);
		  void OnSelectElementByPartialLink(WPARAM, LPARAM);
		  void OnSelectElementsByPartialLink(WPARAM, LPARAM);
		  void OnSelectElementByName(WPARAM, LPARAM);
		  void OnSelectElementsByName(WPARAM, LPARAM);
		  void OnSelectElementByTagName(WPARAM, LPARAM);
		  void OnSelectElementsByTagName(WPARAM, LPARAM);
		  void OnSelectElementByClassName(WPARAM, LPARAM);
		  void OnSelectElementsByClassName(WPARAM, LPARAM);
		  void OnGetCookies(WPARAM, LPARAM);
		  void OnAddCookie(WPARAM, LPARAM);
		  void OnWaitForNavigationToFinish(WPARAM, LPARAM);
      void OnCaptureScreenshot(WPARAM, LPARAM);
      void OnGetScriptResultObjectType(WPARAM, LPARAM);

		  void OnElementRelease(WPARAM, LPARAM);

public:
	DataMarshaller& getCmdData() {return pBody->m_CmdData;}
};



