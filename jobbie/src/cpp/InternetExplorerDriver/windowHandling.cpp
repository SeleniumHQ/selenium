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

#include "stdafx.h"
#include "logging.h"
#include "windowHandling.h"

#include <SHLGUID.h>

using namespace std;

bool isIeServerWindow(HWND hwnd) 
{
	// 15 = "Internet Explorer_Server\0"
	char name[25];
	if (GetClassNameA(hwnd, name, 25) == 0) {
		return true;
	}

	if (strcmp("Internet Explorer_Server", name) != 0) {
		return true;
	}

	return false;
}

BOOL CALLBACK findServerWindows(HWND hwnd, LPARAM arg) 
{
	HRESULT hr = CoInitialize(NULL);
	if (FAILED(hr)) {
		LOG(WARN) << "Coinitialization failed: " << hr;
		return TRUE;
	}

	// http://support.microsoft.com/kb/249232	
	HINSTANCE library = LoadLibrary(L"oleacc.dll");
	if (!library) {
		LOG(WARN) << "No oleacc library";
		return TRUE;
	}

   UINT nMsg = RegisterWindowMessageW(L"WM_HTML_GETOBJECT");
   LRESULT lresult;
   if (SendMessageTimeoutA(hwnd, nMsg, 0L, 0L, SMTO_ABORTIFHUNG, 1000, (PDWORD_PTR)&lresult) == 0) {
	   LOG(WARN) << "Timed out sending message for html object";
	   FreeLibrary(library);
	   return TRUE;
   }
   LPFNOBJECTFROMLRESULT object = reinterpret_cast<LPFNOBJECTFROMLRESULT>(GetProcAddress(library, "ObjectFromLresult"));
   if (!object) {
	   LOG(WARN) << "Unable to begin to access document from window handle";
	   FreeLibrary(library);
	   return TRUE;
   }

   CComPtr<IHTMLDocument2> document;
   (* object)(lresult, IID_IHTMLDocument2, 0, reinterpret_cast<void **>(&document));
   if (!document) {
	   LOG(DEBUG) << "Unable to access document from window handle";
	   FreeLibrary(library);
	   return TRUE;
   } 

   CComPtr<IHTMLWindow2> window;
   if (!SUCCEEDED(document->get_parentWindow(&window))) {
	   LOG(WARN) << "Unable to access parent window from window handle";
	   FreeLibrary(library);
	   return TRUE;
   }

	// http://support.microsoft.com/kb/257717
	CComQIPtr<IServiceProvider> provider(window);
	if (!provider) {
		LOG(INFO) << "Cannot extract service provider";
		FreeLibrary(library);
		return TRUE;
	}
	CComPtr<IServiceProvider> childProvider;
	hr = provider->QueryService(SID_STopLevelBrowser, IID_IServiceProvider, reinterpret_cast<void **>(&childProvider));
	if (FAILED(hr)) {
		LOG(WARN) << "Cannot extract service provider from top-level";
		FreeLibrary(library);
		return TRUE;
	}
	IWebBrowser2* browser;
	hr = childProvider->QueryService(SID_SWebBrowserApp, IID_IWebBrowser2, reinterpret_cast<void **>(&browser));

	if (SUCCEEDED(hr)) {
		((vector<IWebBrowser2*>*)arg)->push_back(browser);
	}

	FreeLibrary(library);
	return TRUE;
}

BOOL CALLBACK findTopLevelWindows(HWND hwnd, LPARAM arg)
{
	// Could this be an IE instance?
	// 8 == "IeFrame\0"
	// 21 == "Shell DocObject View\0";
	char name[21];
	if (GetClassNameA(hwnd, name, 21) == 0) {
	// No match found. Skip
		return TRUE;
	}
	
	if (strcmp("IEFrame", name) != 0 && strcmp("Shell DocObject View", name) != 0) {
		return TRUE;
	}

	EnumChildWindows(hwnd, findServerWindows, arg);

	return TRUE;
}

BOOL CALLBACK findTopLevelWindowFrames(HWND hwnd, LPARAM arg) 
{
		// Could this be an IE instance?
	// 8 == "IeFrame\0"
	// 21 == "Shell DocObject View\0";
	char name[21];
	if (GetClassNameA(hwnd, name, 21) == 0) {
	// No match found. Skip
		return TRUE;
	}
	
	if (strcmp("IEFrame", name) != 0 && strcmp("Shell DocObject View", name) != 0) {
		return TRUE;
	}

	((vector<HWND>*)arg)->push_back(hwnd);

	return TRUE;
}

void getBrowsers(vector<IWebBrowser2*>* allBrowsers)
{
	EnumWindows(findTopLevelWindows, (LPARAM)allBrowsers);
}

void getTopLevelWindows(std::vector<HWND>* allWindows) 
{
	EnumWindows(findTopLevelWindowFrames, (LPARAM) allWindows);
}