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

private:

	bool isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child);
	void getDocument3(const IHTMLDOMNode* extractFrom, IHTMLDocument3** pdoc);
	void getDocument2(const IHTMLDOMNode* extractFrom, IHTMLDocument2** pdoc);

	void tryNotifyNavigCompleted();
	void tryTransferEventReleaserToNotifyNavigCompleted(CScopeCaller *pSC, bool setETNWNC=true);

	IHTMLEventObj* newEventObject(IHTMLElement *pElement);
	void fireEvent(IHTMLElement *pElement, IHTMLEventObj*, const OLECHAR*);
	void fireEvent(IHTMLElement *pElement, IHTMLDOMNode* fireFrom, IHTMLEventObj*, const OLECHAR*);

	static void collapsingAppend(std::wstring& s, const std::wstring& s2);
	static std::wstring collapseWhitespace(CComBSTR &text);
	static bool isBlockLevel(IHTMLDOMNode *node);
	static void getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted);

protected:
	void getTextAreaValue(IHTMLElement *pElement, std::wstring& res);
	HWND getHwnd();

	void getDocument(IHTMLDocument2** pOutDoc);
	void getDocument3(IHTMLDocument3** pOutDoc);

	void executeScript(const wchar_t *script, SAFEARRAY* args, VARIANT *result, bool tryAgain = true);
	bool isCheckbox(IHTMLElement *pElement);
	bool isRadio(IHTMLElement *pElement);
	void getAttribute(IHTMLElement *pElement, LPCWSTR name, std::wstring& res);
	bool isSelected(IHTMLElement *pElement);
	bool isEnabled(IHTMLElement *pElement);
	void click(IHTMLElement *pElement, CScopeCaller *pSC=NULL);
	void getValue(IHTMLElement *pElement, std::wstring& res);
	void getValueOfCssProperty(IHTMLElement *pElement, LPCWSTR propertyName, std::wstring& res);
	void getText(IHTMLElement *pElement, std::wstring& res);
	void getTitle(std::wstring& res);
	void submit(IHTMLElement *pElement, CScopeCaller *pSC); // =NULL);
	void findParentForm(IHTMLElement *pElement, IHTMLFormElement **pform);
	std::vector<ElementWrapper*>* getChildrenWithTagName(IHTMLElement *pElement, LPCWSTR tagName) ;
	void waitForDocumentToComplete(IHTMLDocument2* doc);
	bool addEvaluateToDocument(const IHTMLDOMNode* node, int count);
	void findCurrentFrame(IHTMLWindow2 **result);
	void getDefaultContentFromDoc(IHTMLWindow2 **result, IHTMLDocument2* doc);

	bool getEval(IHTMLDocument2* doc, DISPID* evalId, bool* added);
	void removeScript(IHTMLDocument2* doc);
	bool createAnonymousFunction(IDispatch* scriptEngine, DISPID evalId, const wchar_t *script, VARIANT* result);

          void OnStartIE(WPARAM, LPARAM);
          void OnGetFramesCollection(WPARAM, LPARAM);
          void OnSwitchToFrame(WPARAM, LPARAM);
          void OnExecuteScript(WPARAM, LPARAM);
          void OnGetActiveElement(WPARAM, LPARAM);

		  void OnElementIsDisplayed(WPARAM, LPARAM);
		  void OnElementIsEnabled(WPARAM, LPARAM);
		  void OnElementGetX(WPARAM, LPARAM);
		  void OnElementGetY(WPARAM, LPARAM);
		  void OnElementGetHeight(WPARAM, LPARAM);
		  void OnElementGetWidth(WPARAM, LPARAM);
		  
		  void OnElementGetAttribute(WPARAM, LPARAM);
		  void OnElementGetValue(WPARAM, LPARAM);
		  void OnElementSendKeys(WPARAM, LPARAM);
		  void OnElementClear(WPARAM, LPARAM);
		  void OnElementIsSelected(WPARAM, LPARAM);
		  void OnElementSetSelected(WPARAM, LPARAM);
		  void OnElementGetValueOfCssProp(WPARAM, LPARAM);
		  void OnElementGetText(WPARAM, LPARAM);
		  void OnElementClick(WPARAM, LPARAM);
		  void OnElementSubmit(WPARAM, LPARAM);
		  void OnElementGetChildrenWithTagName(WPARAM, LPARAM);

		  void OnGetVisible(WPARAM, LPARAM);
		  void OnSetVisible(WPARAM, LPARAM);
		  void OnGetCurrentUrl(WPARAM, LPARAM);
		  void OnGetTitle(WPARAM, LPARAM);
		  void OnGetUrl(WPARAM, LPARAM);
		  void OnGoForward(WPARAM, LPARAM);
		  void OnGoBack(WPARAM, LPARAM);
		  void OnSelectElementByXPath(WPARAM, LPARAM);
		  void OnSelectElementsByXPath(WPARAM, LPARAM);
		  void OnSelectElementById(WPARAM, LPARAM);
		  void OnSelectElementsById(WPARAM, LPARAM);
		  void OnSelectElementByLink(WPARAM, LPARAM);
		  void OnSelectElementsByLink(WPARAM, LPARAM);
		  void OnSelectElementByName(WPARAM, LPARAM);
		  void OnSelectElementsByName(WPARAM, LPARAM);
		  void OnSelectElementByClassName(WPARAM, LPARAM);
		  void OnSelectElementsByClassName(WPARAM, LPARAM);
		  void OnGetCookies(WPARAM, LPARAM);
		  void OnAddCookie(WPARAM, LPARAM);
		  void OnWaitForNavigationToFinish(WPARAM, LPARAM);
		  
		  void OnElementRelease(WPARAM, LPARAM);

		  void OnQuitIE(WPARAM, LPARAM);

public:
	DataMarshaller& getCmdData() {return pBody->m_CmdData;}
};


