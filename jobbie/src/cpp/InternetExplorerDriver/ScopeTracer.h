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
