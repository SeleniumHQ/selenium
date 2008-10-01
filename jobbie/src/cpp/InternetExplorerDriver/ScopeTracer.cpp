#include "StdAfx.h"

#include "ScopeTracer.h"

#include "InternetExplorerDriver.h"
#include "utils.h"

using namespace std;

int ScopeTracer::gCounter = 0;
 
ScopeTracer::ScopeTracer(LPCSTR name) 
{
	counter = ++gCounter;
	safeIO::CoutA(name, true, counter);
}

ScopeTracer::~ScopeTracer()
{
	safeIO::CoutA(".", true, -counter);
}

CScopeCaller::CScopeCaller(DataMarshaller& p, bool releaseOnDestructor) : 
	 pData(&p) , m_releaseOnDestructor(releaseOnDestructor)
{
}

CScopeCaller::~CScopeCaller(void) 
{
	if(m_releaseOnDestructor) {
		pData->resetInputs(); 
		safeIO::CoutA("Release data.sync", true);
		SetEvent(pData->synchronization_flag_);
	}
}

