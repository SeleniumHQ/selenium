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

#ifndef utils_h
#define utils_h

#include <iostream>
#include <string>

#include "interaction_utils.h"
#include "InternetExplorerDriver.h"
#include "logging.h"


// #define __VERBOSING_DLL__

#ifndef __VERBOSING_DLL__
#   define SCOPETRACER
#else
#   define SCOPETRACER	ScopeTracer D(__FUNCTION__);
#endif


#define TRY  try 

#define BASE_TEN_BASE 10
#define MAX_DIGITS_OF_NUMBER 22

#define SEND_MESSAGE_WITH_MARSHALLED_DATA(message, input_field) \
	DataMarshaller& data = prepareCmData(input_field); \
	sendThreadMsg(message, data);

#define SEND_MESSAGE_ABOUT_ELEM(message) \
	DataMarshaller& data = prepareCmData(pElem, input_string); \
	sendThreadMsg(message, data);

struct StringWrapper;
typedef struct StringWrapper StringWrapper;
LPCWSTR combstr2cw(CComBSTR& from);
LPCWSTR bstr2cw(BSTR& from);
LPCWSTR comvariant2cw(CComVariant& toConvert);
void cw2string(LPCWSTR inp, std::string &out);
void AppendValue(std::wstring& dest, long value);
BSTR CopyBSTR(const BSTR& inp);

long getLengthOf(SAFEARRAY* ary);

bool checkValidDOM(IHTMLElement* r);

char* ConvertLPCWSTRToLPSTR (LPCWSTR lpwszStrIn);

wchar_t *StripTrailingWhitespace(wchar_t *str);

#define END_TRY_CATCH_ANY  catch(std::wstring& message) \
	{ \
		throwRunTimeException(env, message.c_str()); \
	} \
	catch (...) \
	{ \
	safeIO::CoutA("CException caught in dll", true); \
	throwRunTimeException(env, L"Unhandled exception caught in calling thread."); }

class safeIO
{
public:
	safeIO();
	CComCriticalSection m_cs_out;
	static void CoutL(LPCWSTR str, bool showThread = true, int cc=0);
	static void CoutA(LPCSTR str, bool showThread = true, int cc=0);
	static void CoutLong(long value);
	static void CoutW(std::wstring& str, bool showThread = true, int cc=0);
};

extern safeIO* gSafe;

#endif

