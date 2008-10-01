#ifndef utils_h
#define utils_h

#include <iostream>
#include <string>
#include <jni.h>


#include "InternetExplorerDriver.h"


// #define __VERBOSING_DLL__

#ifndef __VERBOSING_DLL__
#   define SCOPETRACER
#else
#   define SCOPETRACER	ScopeTracer D(__FUNCTION__);
#endif


#define TRY  try 

#define SEND_MESSAGE_WITH_MARSHALLED_DATA(message, input_field) \
	DataMarshaller& data = prepareCmData(input_field); \
	sendThreadMsg(message, data);

#define SEND_MESSAGE_ABOUT_ELEM(message) \
	DataMarshaller& data = prepareCmData(pElem, input_string); \
	sendThreadMsg(message, data);


void throwRunTimeException(JNIEnv *, LPCWSTR msg);
void throwNoSuchFrameException(JNIEnv *, LPCWSTR message);
void throwNoSuchElementException(JNIEnv *, LPCWSTR msg);
void throwUnsupportedOperationException(JNIEnv *, LPCWSTR msg);

jobject newJavaInternetExplorerDriver(JNIEnv *, InternetExplorerDriver* driver);

void wait(long millis);
void waitWithoutMsgPump(long millis);

jstring lpcw2jstring(JNIEnv *env, LPCWSTR text, int size = -1);

LPCWSTR combstr2cw(CComBSTR& from);
LPCWSTR bstr2cw(BSTR& from);
LPCWSTR comvariant2cw(CComVariant& toConvert);
void wstring2string(const std::wstring& inp, std::string &out);
void cw2string(LPCWSTR inp, std::string &out);
inline jstring bstr2jstring(JNIEnv *env, BSTR& from) {return lpcw2jstring(env, bstr2cw(from));}

long getLengthOf(SAFEARRAY* ary);


char* ConvertLPCWSTRToLPSTR (LPCWSTR lpwszStrIn);
void ConvertLPCWSTRToLPSTR (LPCWSTR lpwszStrIn, std::string &out);
bool on_catchAllExceptions();

#define END_TRY_CATCH_ANY  catch (...) \
	{ \
	safeIO::CoutA("CException caught in dll", true); \
	on_catchAllExceptions(); }

class safeIO
{
public:
	safeIO();
	CComCriticalSection m_cs_out;
	static void CoutL(LPCWSTR str, bool showThread = false, int cc=0);
	static void CoutA(LPCSTR str, bool showThread = false, int cc=0);
};

extern safeIO gSafe;

#endif

