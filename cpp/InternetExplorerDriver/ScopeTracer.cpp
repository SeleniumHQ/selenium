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
		safeIO::CoutA("Release data.sync", true);
		SetEvent(pData->synchronization_flag_);
	}
}

