#ifndef JOBBIE_IETHREADDATA_H_
#define JOBBIE_IETHREADDATA_H_

#include "IeSink.h"
#include "DataMarshaller.h"

class IeThreadData
{
public:
	IeThreadData(void);
	IeSink mSink;
	CComQIPtr<IWebBrowser2> ieThreaded;

	std::wstring pathToFrame;

	DataMarshaller	  m_CmdData;

public:
	~IeThreadData(void);
};

#define ON_THREAD_COMMON(dataMarshaller) \
	DataMarshaller& dataMarshaller = getCmdData(); \
	dataMarshaller.resetOutputs(); \
	CScopeCaller SC(dataMarshaller); 

#endif // JOBBIE_IETHREADDATA_H_
