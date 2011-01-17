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

#ifndef JOBBIE_SCOPETRACER_H_
#define JOBBIE_SCOPETRACER_H_

#include "DataMarshaller.h"

class ScopeTracer
{
public:
	ScopeTracer(LPCSTR name);

	static int gCounter;

	int counter;
public:
	~ScopeTracer();
};


template<class T> class CScopeSetter
{
	T* pointer;
	T value;
public:
	CScopeSetter(T* ptr, T v=0) : pointer(ptr) , value(v) {}
	~CScopeSetter() {if(pointer) *pointer = value;}
};

class CScopeCaller
{
private:
	DataMarshaller* pData;

public:
	CScopeCaller(DataMarshaller& p, bool m_releaseOnDestructor = true);
	bool m_releaseOnDestructor;

	HANDLE CScopeCaller::getSync() {return pData->synchronization_flag_;}

public:
	~CScopeCaller();
};

#endif // JOBBIE_SCOPETRACER_H_
