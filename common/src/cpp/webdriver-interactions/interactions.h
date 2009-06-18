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

#ifndef interactions_h
#define interactions_h

#include "interaction_utils.h"
#include <wchar.h>

#define EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

// Keyboard interactions
EXPORT boolean sendKeysToFileUploadAlert(HWND alertHwnd, const wchar_t* value);
EXPORT void sendKeys(HWND directInputTo, const wchar_t* value, int timePerKey);

// Mouse interactions
EXPORT LRESULT clickAt(HWND directInputTo, long x, long y);
EXPORT LRESULT mouseDownAt(HWND directInputTo, long x, long y);
EXPORT LRESULT mouseUpAt(HWND directInputTo, long x, long y);
EXPORT LRESULT mouseMoveTo(HWND directInputTo, long duration, long fromX, long fromY, long toX, long toY);

#ifdef __cplusplus
}
#endif
#endif
