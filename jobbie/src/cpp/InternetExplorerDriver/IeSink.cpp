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

// IeSink.cpp : implementation file
//
#include "stdafx.h"
#include "IeSink.h"
#include "utils.h"
#include "InternetExplorerDriver.h"
#include "InternalCustomMessage.h"

using namespace std;

// IeSink

IeSink::IeSink() : p_Thread(NULL)
{
}

IeSink::~IeSink()
{
}

// IeSink message handlers

void __stdcall IeSink::BeforeNavigate2(IDispatch * pObject, VARIANT * pvarUrl, VARIANT * pvarFlags, VARIANT * pvarTargetFrame,
VARIANT * pvarData, VARIANT * pvarHeaders, VARIANT_BOOL * pbCancel)
{
	safeIO::CoutA("In IeSink::BeforeNavigate2", true);
};


void __stdcall IeSink::OnQuit()
{
	SCOPETRACER
	DataMarshaller& dataMarshaller = p_Thread->getCmdData();
	dataMarshaller.resetOutputs();
	CScopeCaller SC(dataMarshaller); 
	ConnectionUnAdvise();
}



void __stdcall IeSink::DocumentComplete(IDispatch *pDisp,VARIANT *URL)
{
	SCOPETRACER
	if(p_Thread->m_EventToNotifyWhenNavigationCompleted)
	{
		safeIO::CoutA("sending _WD_WAITFORNAVIGATIONTOFINISH", true);
		p_Thread->PostThreadMessageW(_WD_WAITFORNAVIGATIONTOFINISH , 0, 0);
	}
}

void __stdcall IeSink::DownloadBegin()
{
	safeIO::CoutA("in DownloadBegin", true);
}

void __stdcall IeSink::DownloadComplete()
{
	SCOPETRACER
	if(p_Thread->m_EventToNotifyWhenNavigationCompleted)
	{
		safeIO::CoutA("sending _WD_WAITFORNAVIGATIONTOFINISH", true);
		p_Thread->PostThreadMessageW(_WD_WAITFORNAVIGATIONTOFINISH , 0, 0);
	}
}

void IeSink::ConnectionAdvise()
{
	SCOPETRACER

	LOG(DEBUG) << "Advising connection: " << p_Thread << "   " << p_Thread->pBody->ieThreaded << endl;

	CComQIPtr<IDispatch> dispatcher(p_Thread->pBody->ieThreaded);
	CComPtr<IUnknown> univ(dispatcher);

	if (!univ) {
		LOG(WARN) << "No dispatcher created when attempting to connect to IE instance";
	}

	if (FAILED(this->DispEventAdvise(univ))) {
		LOG(WARN) << "Failed to advise new connection. Restarting the IE driver is recommended.";
	}	
}

void IeSink::ConnectionUnAdvise()
{
	SCOPETRACER

	if (!p_Thread && p_Thread->pBody) {
		LOG(DEBUG) << "Unable to disconnect from IE instance";
		return;
	}
	CComQIPtr<IDispatch> dispatcher(p_Thread->pBody->ieThreaded);
	if (!dispatcher) {
		LOG(DEBUG) << "No dispatcher located for IE instance";
		return;
	}
	CComPtr<IUnknown> univ(dispatcher);
	if (!univ) {
		LOG(DEBUG) << "Unable to unadvise the IE instance";
		return;
	}
	this->DispEventUnadvise(univ);
}
