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

#include "stdafx.h"

#include <ctime>
#include <ctype.h>

#include "utils.h"
#include "logging.h"
#include "webdriver.h"

using namespace std;

safeIO* gSafe = NULL;

LPCWSTR comvariant2cw(CComVariant& toConvert) 
{
	VARTYPE type = toConvert.vt;

	switch(type) {
		case VT_BOOL:
			return toConvert.boolVal == VARIANT_TRUE ? 	L"true":L"false";

		case VT_BSTR:
			return bstr2cw(toConvert.bstrVal);
    
    case VT_I4: {
      wchar_t *buffer = (wchar_t *)malloc(sizeof(wchar_t) * MAX_DIGITS_OF_NUMBER);
      _i64tow_s(toConvert.lVal, buffer, MAX_DIGITS_OF_NUMBER, BASE_TEN_BASE);
      return buffer;
    }

    case VT_EMPTY:
			return L"";

		case VT_NULL:
			// TODO(shs96c): This should really return NULL.
			return L"";

		// This is lame
		case VT_DISPATCH:
			return L"";
	}
	return L"";
}

BSTR CopyBSTR(const BSTR& inp)
{
	if (inp != NULL)
	{
		return ::SysAllocStringByteLen((char*)inp, ::SysStringByteLen(inp));
	}
	return ::SysAllocStringByteLen(NULL, 0);
}


LPCWSTR combstr2cw(CComBSTR& from) 
{
	if (!from.operator BSTR()) {
		return L"";
	}

	return (LPCWSTR) from.operator BSTR();
}

LPCWSTR bstr2cw(BSTR& from) 
{
	if (!from) {
		return L"";
	}

	return (LPCWSTR) from;
}

long getLengthOf(SAFEARRAY* ary)
{
	if (!ary)
		return 0;

	long lower = 0;
	SafeArrayGetLBound(ary, 1, &lower);
	long upper = 0;
	SafeArrayGetUBound(ary, 1, &upper);
	return 1 + upper - lower;
}

/*
bool on_catchAllExceptions()
{
	safeIO::CoutA("Exception caught in dll", true);
	// Do nothing for the moment.
	return true;
}
*/

safeIO::safeIO()
{
	m_cs_out.Init();
	// LOG::File("C:/tmp/test.log");
	LOG::Level("INFO");
	LOG::Limit(10000000);
}

void safeIO::CoutW(std::wstring& str, bool showThread, int cc)
{
	safeIO::CoutL(str.c_str(), showThread, cc);
}

void safeIO::CoutL(LPCWSTR str, bool showThread, int cc)
{
	std::string output_str;
	cw2string(str, output_str);

	safeIO::CoutA(output_str.c_str(), showThread, cc);
}

void safeIO::CoutA(LPCSTR str, bool showThread, int cc)
{
#ifdef __VERBOSING_DLL__
	if (!gSafe) return;
	gSafe->m_cs_out.Lock();
	if(showThread)
	{
		DWORD thrID = GetCurrentThreadId();
		if(cc>0)
		{
			LOG(INFO) << "[0x" << hex << thrID << "] "  << " (" << cc << ") " << str;
		}
		else if(cc<0)
		{
			LOG(INFO) << "[0x" << hex << thrID << "] "  << " (" << (-cc) << ") " << str;
		}
		else
		{
			LOG(INFO) << "[0x" << hex << thrID << "] "  << str;
		}
	}
	else
	{
		LOG(INFO) << str;
	}
	gSafe->m_cs_out.Unlock();
#endif
}

void AppendValue(std::wstring& dest, long value)
{
	wstringstream st;
	st << value;
	dest += st.str();
}


void safeIO::CoutLong(long value)
{
#ifdef __VERBOSING_DLL__
	if (!gSafe) return;
	gSafe->m_cs_out.Lock();
	LOG(INFO) << value << " Hex=" << hex << value;
	gSafe->m_cs_out.Unlock();
#endif
}


char* ConvertLPCWSTRToLPSTR (LPCWSTR lpwszStrIn)
{
  LPSTR pszOut = NULL;
  if (lpwszStrIn != NULL)
  {
	int nInputStrLen = (int) wcslen (lpwszStrIn);

	// Double NULL Termination
	int nOutputStrLen = WideCharToMultiByte (CP_ACP, 0, lpwszStrIn, nInputStrLen, NULL, 0, 0, 0) + 2;
	pszOut = new char [nOutputStrLen];

	if (pszOut)
	{
	  memset (pszOut, 0x00, nOutputStrLen);
	  WideCharToMultiByte(CP_ACP, 0, lpwszStrIn, nInputStrLen, pszOut, nOutputStrLen, 0, 0);
	}
  }
  return pszOut;
}

wchar_t *StripTrailingWhitespace(wchar_t *instr) {
  size_t len = wcslen(instr);
  wchar_t *str = new wchar_t[len + 1];
  wcsncpy_s(str, len + 1, instr, len);
  str[len] = 0;
  
  for (size_t i = len - 1; i >= 0; --i) {
    if (iswspace(str[i])) {
      str[i] = 0;
    } else {
      break;
    }
  }
  return str;
} 

void cw2string(LPCWSTR inp, std::string &out)
{
	LPSTR pszOut = ConvertLPCWSTRToLPSTR (inp);
	if(!pszOut)
	{
		out = "";
		return;
	}
	out = pszOut;
	delete [] pszOut;
} 

bool checkValidDOM(IHTMLElement* r) {
	if(r != NULL) return true;
	safeIO::CoutA("IHTMLElement is null");
	return false;
}
