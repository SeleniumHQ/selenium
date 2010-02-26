/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

#include "StdAfx.h"
#include "utils.h"
#include "InternalCustomMessage.h"
#include "errorcodes.h"
#include "logging.h"
#include <mshtml.h>
#include <SHLGUID.h>

using namespace std;
IeThread* g_IE_Thread = NULL;

InternetExplorerDriver::InternetExplorerDriver() : p_IEthread(NULL)
{
	if (NULL == gSafe) {
		gSafe = new safeIO();
	}
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
	if(!g_IE_Thread) 
	{
		// Spawning the GUI worker thread, which will instantiate the ActiveX component
		g_IE_Thread = p_IEthread = new IeThread();
		p_IEthread->hThread = CreateThread (NULL, 0, (DWORD (__stdcall *)(LPVOID)) (IeThread::runProcessStatic), 
					(void *)p_IEthread, 0, NULL);

		p_IEthread->pIED = this;
		ResetEvent(p_IEthread->sync_LaunchThread);
		ResumeThread(p_IEthread->hThread); 
		WaitForSingleObject(p_IEthread->sync_LaunchThread, 60000);
	}

	return g_IE_Thread;
}

void InternetExplorerDriver::close()
{
	SCOPETRACER
	if (closeCalled) {
		return;
	}

	closeCalled = true;

	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_CLOSEWINDOW,)
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

LPCWSTR InternetExplorerDriver::getPageSource()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETPAGESOURCE,)
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

std::wstring InternetExplorerDriver::getHandle()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GET_HANDLE,);
	return data.output_string_.c_str();
}

std::vector<std::wstring> InternetExplorerDriver::getAllHandles() 
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GET_HANDLES,);
	return data.output_list_string_;
}

ElementWrapper* InternetExplorerDriver::getActiveElement()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETACTIVEELEMENT,)
	
	return new ElementWrapper(this, data.output_html_element_);
}

int InternetExplorerDriver::selectElementById(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYID)

	if (data.error_code != SUCCESS) { return data.error_code; }

	*element = new ElementWrapper(this, data.output_html_element_);	
	return SUCCESS;
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

int InternetExplorerDriver::selectElementByLink(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYLINK)

	if (data.error_code == SUCCESS) { 
		*element = new ElementWrapper(this, data.output_html_element_);
	}

	return data.error_code;
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByPartialLink(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYPARTIALLINK)

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

int InternetExplorerDriver::selectElementByPartialLink(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYPARTIALLINK)

	if (data.error_code == SUCCESS) { 
		*element = new ElementWrapper(this, data.output_html_element_);
	}

	return data.error_code;
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

int InternetExplorerDriver::selectElementByName(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYNAME)

	if (data.error_code == SUCCESS) { 
		*element = new ElementWrapper(this, data.output_html_element_);
	}

	return data.error_code;
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

int InternetExplorerDriver::selectElementByTagName(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYTAGNAME)

	if (data.error_code == SUCCESS) { 
		*element = new ElementWrapper(this, data.output_html_element_);
	}

	return data.error_code;
}

std::vector<ElementWrapper*>* InternetExplorerDriver::selectElementsByTagName(IHTMLElement *pElem, const wchar_t *input_string)
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTSBYTAGNAME)

	if(1 == data.output_long_) {std::wstring Err(L"Cannot find elements by tag name"); throw Err;}

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

int InternetExplorerDriver::selectElementByClassName(IHTMLElement *pElem, const wchar_t *input_string, ElementWrapper** element) 
{
	SCOPETRACER
	SEND_MESSAGE_ABOUT_ELEM(_WD_SELELEMENTBYCLASSNAME)

	if (data.error_code == SUCCESS) { 
		*element = new ElementWrapper(this, data.output_html_element_);
	}

	return data.error_code;
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

int InternetExplorerDriver::switchToWindow(LPCWSTR name)
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_SWITCHWINDOW, name)
	
	if (data.error_code == SUCCESS) {
		closeCalled = false;
	}

	return data.error_code;
}

LPCWSTR InternetExplorerDriver::getCookies()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETCOOKIES,)
	return data.output_string_.c_str();
}

int InternetExplorerDriver::addCookie(const wchar_t *cookieString)
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_ADDCOOKIE, cookieString)

	return data.error_code;
}



int InternetExplorerDriver::executeScript(const wchar_t *script, SAFEARRAY* args, CComVariant* result, bool tryAgain)
{
	SCOPETRACER
	DataMarshaller& data = prepareCmData(script);
	data.input_safe_array_ = args;
	sendThreadMsg(_WD_EXECUTESCRIPT, data);

	*result = data.output_variant_;

	return data.error_code;
}

void InternetExplorerDriver::setSpeed(int speed)
{
	this->speed = speed;
}

int InternetExplorerDriver::getSpeed()
{
	return speed;
}

LPCWSTR InternetExplorerDriver::captureScreenshotAsBase64()
{
	SCOPETRACER
	SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_CAPTURESCREENSHOT,)
	return data.output_string_.c_str();
}

LPCWSTR InternetExplorerDriver::getScriptResultType(CComVariant* result)
{
  SCOPETRACER
  SEND_MESSAGE_WITH_MARSHALLED_DATA(_WD_GETSCRIPTRESULTOBJECTTYPE, result)
  return data.output_string_.c_str();
}

/////////////////////////////////////////////////////////////

bool InternetExplorerDriver::sendThreadMsg(UINT msg, DataMarshaller& data)
{
	ResetEvent(data.synchronization_flag_);
	// NOTE(alexis.j.vuillemin): do not do here data.resetOutputs()
	//   it has to be performed FROM the worker thread (see ON_THREAD_COMMON).
	p_IEthread->PostThreadMessageW(msg, 0, 0);
	DWORD res = WaitForSingleObject(data.synchronization_flag_, 120000);
	data.resetInputs();
	if(WAIT_TIMEOUT == res)
	{
		safeIO::CoutA("Unexpected TIME OUT.");
		p_IEthread->m_EventToNotifyWhenNavigationCompleted = NULL;
		std::wstring Err(L"Error: had to TIME OUT as a request to the worker thread did not complete after 2 min.");
		if(p_IEthread->m_HeartBeatListener != NULL)
		{
			PostMessage(p_IEthread->m_HeartBeatListener, _WD_HB_CRASHED, 0 ,0 );
		}
		throw Err;
	}
	if(data.exception_caught_)
	{
		safeIO::CoutA("Caught exception from worker thread.");
		p_IEthread->m_EventToNotifyWhenNavigationCompleted = NULL;
		std::wstring Err(data.output_string_);
		throw Err;
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

DataMarshaller& InternetExplorerDriver::prepareCmData(CComVariant *pDispatch)
{
  DataMarshaller& data = prepareCmData();
  data.input_variant_ = pDispatch;
  return data;
}
