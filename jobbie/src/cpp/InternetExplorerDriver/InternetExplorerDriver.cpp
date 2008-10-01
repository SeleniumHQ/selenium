#include "StdAfx.h"
#include "utils.h"
#include "InternalCustomMessage.h"
#include "jsxpath.h"

using namespace std;

InternetExplorerDriver::InternetExplorerDriver() : p_IEthread(NULL)
{
	SCOPETRACER
	speed = 0;
	
	p_IEthread = ThreadFactory();
	p_IEthread->pIED = this;

	ResetEvent(p_IEthread->sync_LaunchIE);
	p_IEthread->PostThreadMessageW(_WD_START, 0, 0);
	WaitForSingleObject(p_IEthread->sync_LaunchIE, 60000);

	closeCalled = false;
}

InternetExplorerDriver::InternetExplorerDriver(InternetExplorerDriver *other)
{
	ScopeTracer D(("Constructor_from_other"));
	this->p_IEthread = other->p_IEthread;
}

InternetExplorerDriver::~InternetExplorerDriver()
{
	SCOPETRACER
	close();
}

IeThread* InternetExplorerDriver::ThreadFactory()
{
	SCOPETRACER
	static IeThread* gThread = NULL;
	if(!gThread) 
	{
		// Spawning the GUI worker thread, which will instantiate the ActiveX component
		gThread = p_IEthread = new IeThread();
		p_IEthread->hThread = CreateThread (NULL, 0, (DWORD (__stdcall *)(LPVOID)) (IeThread::runProcessStatic), 
					(void *)p_IEthread, 0, NULL);

		p_IEthread->pIED = this;
		ResetEvent(p_IEthread->sync_LaunchThread);
		ResumeThread(p_IEthread->hThread); 
		WaitForSingleObject(p_IEthread->sync_LaunchThread, 60000);
	}

	return gThread;
}

void InternetExplorerDriver::close()
{
	SCOPETRACER
	if (closeCalled)
		return;

	closeCalled = true;

	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_QUIT_IE,)
}

bool InternetExplorerDriver::getVisible()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETVISIBLE,)
	return data.output_bool_;
}

void InternetExplorerDriver::setVisible(bool isVisible) 
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_SETVISIBLE, (int)isVisible)
}

LPCWSTR InternetExplorerDriver::getCurrentUrl()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETCURRENTURL,)
	return data.output_string_.c_str();
}

LPCWSTR InternetExplorerDriver::getTitle()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETTITLE,)
	return data.output_string_.c_str();
}

void InternetExplorerDriver::get(const wchar_t *url)
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETURL, url)
}

void InternetExplorerDriver::goForward() 
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GOFORWARD,)
}

void InternetExplorerDriver::goBack()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GOBACK,)
}

ElementWrapper* InternetExplorerDriver::getActiveElement()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETACTIVEELEMENT,)

	if(!data.output_bool_) return NULL;
	
	return new ElementWrapper(this, data.output_html_element_);
}

ElementWrapper* InternetExplorerDriver::selectElementByXPath(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYXPATH)

	if(data.output_long_ || !data.output_html_element_) {std::wstring Err(L"Cannot find element by Xpath"); throw Err;}
	
	return new ElementWrapper(this, data.output_html_element_);
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByXPath(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYXPATH)

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	if(data.output_long_) {std::wstring Err(L"Cannot find elements by Xpath"); throw Err;}

	std::vector<IHTMLElement*>& allElems = data.output_list_html_element_;
	std::vector<IHTMLElement*>::const_iterator cur, end = allElems.end();
	for(cur = allElems.begin();cur < end; cur++)
	{
		IHTMLElement* elem = *cur;
		toReturn->push_back(new ElementWrapper(this, elem));
	}
	return toReturn;
}

ElementWrapper* InternetExplorerDriver::selectElementById(IHTMLElement *pElem, const wchar_t *input_string) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYID)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find element by Id"); throw Err;}
	if(NULL == data.output_html_element_) {std::wstring Err(L"Cannot find element by Id"); throw Err;}

	return new ElementWrapper(this, data.output_html_element_);	
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsById(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYID)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find elements by Id"); throw Err;}

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	std::vector<IHTMLElement*>& allElems = data.output_list_html_element_;
	std::vector<IHTMLElement*>::const_iterator cur, end = allElems.end();
	for(cur = allElems.begin();cur < end; cur++)
	{
		IHTMLElement* elem = *cur;
		toReturn->push_back(new ElementWrapper(this, elem));
	}
	return toReturn;
}

ElementWrapper* InternetExplorerDriver::selectElementByLink(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYLINK)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find element by Link"); throw Err;}
	if(NULL == data.output_html_element_) {std::wstring Err(L"Cannot find element by Link"); throw Err;}

	return new ElementWrapper(this, data.output_html_element_);	
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByLink(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYLINK)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find elements by Link"); throw Err;}

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	std::vector<IHTMLElement*>& allElems = data.output_list_html_element_;
	std::vector<IHTMLElement*>::const_iterator cur, end = allElems.end();
	for(cur = allElems.begin();cur < end; cur++)
	{
		IHTMLElement* elem = *cur;
		toReturn->push_back(new ElementWrapper(this, elem));
	}
	return toReturn;
}

ElementWrapper* InternetExplorerDriver::selectElementByName(IHTMLElement *pElem, const wchar_t *input_string) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYNAME)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find element by Name"); throw Err;}
	if(NULL == data.output_html_element_) {std::wstring Err(L"Cannot find element by Name"); throw Err;}
	
	return new ElementWrapper(this, data.output_html_element_);
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByName(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYNAME)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find elements by Name"); throw Err;}

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	std::vector<IHTMLElement*>& allElems = data.output_list_html_element_;
	std::vector<IHTMLElement*>::const_iterator cur, end = allElems.end();
	for(cur = allElems.begin();cur < end; cur++)
	{
		IHTMLElement* elem = *cur;
		toReturn->push_back(new ElementWrapper(this, elem));
	}
	return toReturn;
}

ElementWrapper* InternetExplorerDriver::selectElementByClassName(IHTMLElement *pElem, const wchar_t *input_string) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYCLASSNAME)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find element by ClassName"); throw Err;}
	if(NULL == data.output_html_element_) {std::wstring Err(L"Cannot find element by ClassName"); throw Err;}
	
	return new ElementWrapper(this, data.output_html_element_);
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByClassName(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYCLASSNAME)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find elements by ClassName"); throw Err;}

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	std::vector<IHTMLElement*>& allElems = data.output_list_html_element_;
	std::vector<IHTMLElement*>::const_iterator cur, end = allElems.end();
	for(cur = allElems.begin();cur < end; cur++)
	{
		IHTMLElement* elem = *cur;
		toReturn->push_back(new ElementWrapper(this, elem));
	}
	return toReturn;
}

void InternetExplorerDriver::waitForNavigateToFinish() 
{
	SCOPETRACER
	DataMarshaller& data = prepareCmData();
	p_IEthread->m_EventToNotifyWhenNavigationCompleted = data.synchronization_flag_;
	sendThreadMsg(_WD_WAITFORNAVIGATIONTOFINISH, data);
}

bool InternetExplorerDriver::switchToFrame(LPCWSTR pathToFrame) 
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_SWITCHTOFRAME, pathToFrame)
	return data.output_bool_;
}

LPCWSTR InternetExplorerDriver::getCookies()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETCOOKIES,)
	return data.output_string_.c_str();
}

void InternetExplorerDriver::addCookie(const wchar_t *cookieString)
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_ADDCOOKIE, cookieString)
}



CComVariant& InternetExplorerDriver::executeScript(const wchar_t *script, SAFEARRAY* args, bool tryAgain)
{
	SCOPETRACER
	DataMarshaller& data = prepareCmData(script);
	data.input_safe_array_ = args;
	sendThreadMsg(_WD_EXECUTESCRIPT, data);
	return data.output_variant_;
}

void InternetExplorerDriver::setSpeed(int speed)
{
	this->speed = speed;
}

int InternetExplorerDriver::getSpeed()
{
	return speed;
}


/////////////////////////////////////////////////////////////

bool InternetExplorerDriver::sendThreadMsg(UINT msg, DataMarshaller& data)
{
	ResetEvent(data.synchronization_flag_);
	// NOTE(alexis.j.vuillemin): do not do here data.resetOutputs()
	//   it has to be performed FROM the worker thread (see ON_THREAD_COMMON).
	p_IEthread->PostThreadMessageW(msg, 0, 0);
	DWORD res = WaitForSingleObject(data.synchronization_flag_, 60000);
	if(WAIT_TIMEOUT == res)
	{
		safeIO::CoutA("Unexpected TIME OUT as a request from a calling thread did not complete after 1 min.");
		p_IEthread->m_EventToNotifyWhenNavigationCompleted = NULL;
	}
	return true;
}

inline DataMarshaller& InternetExplorerDriver::prepareCmData()
{
	return commandData();
}

DataMarshaller& InternetExplorerDriver::prepareCmData(LPCWSTR str)
{
	DataMarshaller& data = prepareCmData();
	data.input_string_ = str;
	return data;
}

DataMarshaller& InternetExplorerDriver::prepareCmData(IHTMLElement *pElem, LPCWSTR str)
{
	DataMarshaller& data = prepareCmData(str);
	data.input_html_element_ = pElem;
	return data;
}

DataMarshaller& InternetExplorerDriver::prepareCmData(int v)
{
	DataMarshaller& data = prepareCmData();
	data.input_long_ = (long) v;
	return data;
}

