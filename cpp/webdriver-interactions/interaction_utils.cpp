/*
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements. See the NOTICE file
distributed with this work for additional information
regarding copyright ownership. The SFC licenses this file
to you under the Apache License, Version 2.0 (the "License");
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
#include "interaction_utils.h"

#include <atlbase.h>
#include <atlstr.h>
#include <atlwin.h>
#include <ctime>

void wait(long millis)
{
	clock_t end = clock() + millis;
	do {
        MSG msg;
		if (PeekMessage( &msg, NULL, 0, 0, PM_REMOVE)) {
			TranslateMessage(&msg); 
			DispatchMessage(&msg); 
		}
		Sleep(0);
	} while (clock() < end);
}

void waitWithoutMsgPump(long millis)
{
	Sleep(millis);
}

// "Internet Explorer_Server" + 1
#define LONGEST_NAME 25

HWND getChildWindow(HWND hwnd, LPCTSTR name)
{
	TCHAR pszClassName[LONGEST_NAME];
	HWND hwndtmp = GetWindow(hwnd, GW_CHILD);
	while (hwndtmp != NULL) {
		::GetClassName(hwndtmp, pszClassName, LONGEST_NAME);
		if (lstrcmp(pszClassName, name) == 0) {
			return hwndtmp;
		}
		hwndtmp = GetWindow(hwndtmp, GW_HWNDNEXT);
	}
	return NULL;
}