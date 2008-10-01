// IeSink.cpp : implementation file
//
#include "stdafx.h"
#include "IeSink.h"
#include "utils.h"
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


void IeSink::OnQuit()
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

void IeSink::DownloadBegin()
{
	safeIO::CoutA("in DownloadBegin", true);
}

void IeSink::DownloadComplete()
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
	CComQIPtr<IDispatch> dispatcher(p_Thread->pBody->ieThreaded);
	CComPtr<IUnknown> univ(dispatcher);
	this->DispEventAdvise(univ);
}

void IeSink::ConnectionUnAdvise()
{
	SCOPETRACER
	CComQIPtr<IDispatch> dispatcher(p_Thread->pBody->ieThreaded);
	CComPtr<IUnknown> univ(dispatcher);
	this->DispEventUnadvise(univ);
}
