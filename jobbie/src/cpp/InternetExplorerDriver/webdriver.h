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

#pragma once

#include <wchar.h>

#include "errorcodes.h"

#define EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

struct WebDriver;
typedef struct WebDriver WebDriver;

struct WebElement;
typedef struct WebElement WebElement;

struct ScriptArgs;
typedef struct ScriptArgs ScriptArgs;

struct ScriptResult;
typedef struct ScriptResult ScriptResult;

struct StringWrapper;
typedef struct StringWrapper StringWrapper;

struct ElementCollection;
typedef struct ElementCollection ElementCollection;

struct StringCollection;
typedef struct StringCollection StringCollection;

// Memory management functions
EXPORT int wdNewDriverInstance(WebDriver** result);
EXPORT int wdFreeDriver(WebDriver* driver);
EXPORT int wdeFreeElement(WebElement* element);
EXPORT int wdFreeElementCollection(ElementCollection* collection, int alsoFreeElements);
EXPORT int wdFreeStringCollection(StringCollection* collection);
EXPORT int wdFreeScriptArgs(ScriptArgs* scriptArgs);
EXPORT int wdFreeScriptResult(ScriptResult* scriptResult);

// WebDriver functions
EXPORT int wdNewDriverInstance(WebDriver** result);
EXPORT int wdFreeDriver(WebDriver* driver);

EXPORT int wdGet(WebDriver* driver, const wchar_t* url);
EXPORT int wdGoBack(WebDriver* driver);
EXPORT int wdGoForward(WebDriver* driver);
EXPORT int wdRefresh(WebDriver* driver);
EXPORT int wdClose(WebDriver* driver);
EXPORT int wdGetVisible(WebDriver* driver, int* visible);
EXPORT int wdSetVisible(WebDriver* driver, int value);

EXPORT int wdGetCurrentUrl(WebDriver* driver, StringWrapper** result);
EXPORT int wdGetTitle(WebDriver* driver, StringWrapper** result);
EXPORT int wdGetPageSource(WebDriver* driver, StringWrapper** result);

EXPORT int wdGetCookies(WebDriver* driver, StringWrapper** result);
EXPORT int wdAddCookie(WebDriver* driver, const wchar_t* cookie);
EXPORT int wdDeleteCookie(WebDriver* driver, const wchar_t* cookieName);

EXPORT int wdSwitchToActiveElement(WebDriver* driver, WebElement** result);
EXPORT int wdSwitchToWindow(WebDriver* driver, const wchar_t* name);
EXPORT int wdSwitchToFrame(WebDriver* driver, const wchar_t* path);
EXPORT int wdWaitForLoadToComplete(WebDriver* driver);

EXPORT int wdGetAllWindowHandles(WebDriver* driver, StringCollection** handles);
EXPORT int wdGetCurrentWindowHandle(WebDriver* driver, StringWrapper** handle);

// Element functions
EXPORT int wdeClick(WebElement* element);
EXPORT int wdeGetAttribute(WebDriver* driver, WebElement* element, const wchar_t* string, StringWrapper** result);
EXPORT int wdeGetValueOfCssProperty(WebElement* element, const wchar_t* name, StringWrapper** result);
EXPORT int wdeGetText(WebElement* element, StringWrapper** result);
EXPORT int wdeGetTagName(WebElement* element, StringWrapper** result);
EXPORT int wdeIsSelected(WebElement* element, int* result);
EXPORT int wdeSetSelected(WebElement* element);
EXPORT int wdeToggle(WebElement* element, int* result);
EXPORT int wdeIsEnabled(WebElement* element, int* result);
EXPORT int wdeIsDisplayed(WebElement* element, int* result);
EXPORT int wdeSendKeys(WebElement* element, const wchar_t* text);
EXPORT int wdeClear(WebElement* element);
EXPORT int wdeSubmit(WebElement* element);

EXPORT int wdeGetDetailsOnceScrolledOnToScreen(WebElement* element, HWND* hwnd, long* x, long* y, long* width, long* height);
EXPORT int wdeGetLocation(WebElement* element, long* x, long* y);
EXPORT int wdeGetSize(WebElement* element, long* width, long* height);

// Element locating functions
EXPORT int wdFindElementById(WebDriver* driver, WebElement* element, const wchar_t* id, WebElement** result);
EXPORT int wdFindElementsById(WebDriver* driver, WebElement* element, const wchar_t* id, ElementCollection** result);

EXPORT int wdFindElementByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, WebElement** result);
EXPORT int wdFindElementsByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, ElementCollection** result);

EXPORT int wdFindElementByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result);
EXPORT int wdFindElementsByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result);
EXPORT int wdFindElementByPartialLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result);
EXPORT int wdFindElementsByPartialLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result);

EXPORT int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result);
EXPORT int wdFindElementsByName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result);

EXPORT int wdFindElementByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result);
EXPORT int wdFindElementsByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result);

EXPORT int wdFindElementByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, WebElement** result);
EXPORT int wdFindElementsByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, ElementCollection** result);

// Javascript executing fu
EXPORT int wdNewScriptArgs(ScriptArgs** scriptArgs, int maxLength);
EXPORT int wdAddStringScriptArg(ScriptArgs* scriptArgs, const wchar_t* arg);
EXPORT int wdAddBooleanScriptArg(ScriptArgs* scriptArgs, int trueOrFalse);
EXPORT int wdAddNumberScriptArg(ScriptArgs* scriptArgs, long number);
EXPORT int wdAddDoubleScriptArg(ScriptArgs* scriptArgs, double number);
EXPORT int wdAddElementScriptArg(ScriptArgs* scriptArgs, WebElement* element);
EXPORT int wdExecuteScript(WebDriver* driver, const wchar_t* script, ScriptArgs* scriptArgs, ScriptResult** scriptResultRef);
EXPORT int wdGetScriptResultType(WebDriver* driver, ScriptResult* result, int* type);
EXPORT int wdGetStringScriptResult(ScriptResult* result, StringWrapper** wrapper);
EXPORT int wdGetNumberScriptResult(ScriptResult* result, long* value);
EXPORT int wdGetDoubleScriptResult(ScriptResult* result, double* value);
EXPORT int wdGetBooleanScriptResult(ScriptResult* result, int* value);
EXPORT int wdGetElementScriptResult(ScriptResult* result, WebDriver* driver, WebElement** element);
EXPORT int wdGetArrayLengthScriptResult(WebDriver* driver, ScriptResult* result, int* length);
EXPORT int wdGetArrayItemFromScriptResult(WebDriver* driver,
                                          ScriptResult* result, int index,
                                          ScriptResult** arrayItem);


// Element collection functions
EXPORT int wdcGetElementCollectionLength(ElementCollection* collection, int* length);
EXPORT int wdcGetElementAtIndex(ElementCollection* collection, int index, WebElement** result);
EXPORT int wdcGetStringCollectionLength(StringCollection* collection, int* length);
EXPORT int wdcGetStringAtIndex(StringCollection* collection, int index, StringWrapper** result);


// String manipulation functions
EXPORT int wdStringLength(StringWrapper* string, int* length);
EXPORT int wdFreeString(StringWrapper* string);
EXPORT int wdCopyString(StringWrapper* source, int length, wchar_t* dest);

// Things that should be interactions
EXPORT int wdeMouseDownAt(HWND hwnd, long windowX, long windowY);
EXPORT int wdeMouseUpAt(HWND hwnd, long windowX, long windowY);
EXPORT int wdeMouseMoveTo(HWND hwnd, long duration, long fromX, long fromY, long toX, long toY);

// Screenshot capturing
EXPORT int wdCaptureScreenshotAsBase64(WebDriver* driver, StringWrapper** result);

EXPORT int wdSetImplicitWaitTimeout(WebDriver* driver, long timeoutInMillis);

#ifdef __cplusplus
}
#endif
