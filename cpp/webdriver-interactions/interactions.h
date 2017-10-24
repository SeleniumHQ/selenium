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

#ifndef interactions_h
#define interactions_h

#ifdef _MSC_VER
#include "stdafx.h"
#include "interaction_utils.h"
#endif

#include <wchar.h>

#ifdef _MSC_VER
#define EXPORT __declspec(dllexport)
#define WD_RESULT LRESULT
#else
#define EXPORT
#define WD_RESULT int
#endif

#define WINDOW_HANDLE void*

// definitions for mouse buttons
// NOTE: These values correspond to GDK mouse button values.
// If these values are changed, native events for linux *will* be broken
// *unless* interactions_linux_mouse.cpp is updated.
#define MOUSEBUTTON_LEFT (1)
#define MOUSEBUTTON_MIDDLE (2)
#define MOUSEBUTTON_RIGHT (3)

#define WD_CLIENT_LEFT_MOUSE_BUTTON 0
#define WD_CLIENT_MIDDLE_MOUSE_BUTTON 1
#define WD_CLIENT_RIGHT_MOUSE_BUTTON 2

#ifdef __cplusplus
extern "C" {
#endif

// Keyboard interactions
EXPORT void sendKeys(WINDOW_HANDLE windowHandle, const wchar_t* value, int timePerKey);
EXPORT void releaseModifierKeys(WINDOW_HANDLE windowHandle, int timePerKey);
EXPORT bool pending_input_events();
EXPORT void stopPersistentEventFiring();
EXPORT void setEnablePersistentHover(bool enablePersistentHover);

// Mouse interactions
EXPORT WD_RESULT clickAt(WINDOW_HANDLE directInputTo, long x, long y, long button);
EXPORT WD_RESULT doubleClickAt(WINDOW_HANDLE directInputTo, long x, long y);
EXPORT WD_RESULT mouseDownAt(WINDOW_HANDLE directInputTo, long x, long y, long button);
EXPORT WD_RESULT mouseUpAt(WINDOW_HANDLE directInputTo, long x, long y, long button);
EXPORT WD_RESULT mouseMoveTo(WINDOW_HANDLE directInputTo, long duration, long fromX, long fromY, long toX, long toY);

#ifdef __cplusplus
}
#endif
#endif
