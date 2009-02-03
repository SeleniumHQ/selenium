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

struct StringWrapper;
typedef struct StringWrapper StringWrapper;

struct ElementCollection;
typedef struct ElementCollection ElementCollection;

// Memory management functions
EXPORT int wdNewDriverInstance(WebDriver** result);
EXPORT int wdFreeDriver(WebDriver* driver);
EXPORT int wdeFreeElement(WebElement* element);


// WebDriver functions
EXPORT int wdNewDriverInstance(WebDriver** result);
EXPORT int wdFreeDriver(WebDriver* driver);

EXPORT int wdGet(WebDriver* driver, const wchar_t* url);
EXPORT int wdGoBack(WebDriver* driver);
EXPORT int wdGoForward(WebDriver* driver);
EXPORT int wdClose(WebDriver* driver);
EXPORT int wdSetVisible(WebDriver* driver, int value);

EXPORT int wdGetCurrentUrl(WebDriver* driver, StringWrapper** result);
EXPORT int wdGetTitle(WebDriver* driver, StringWrapper** result);
EXPORT int wdGetPageSource(WebDriver* driver, StringWrapper** result);

EXPORT int wdGetCookies(WebDriver* driver, StringWrapper** result);
EXPORT int wdAddCookie(WebDriver* driver, const wchar_t* cookie);

EXPORT int wdSwitchToFrame(WebDriver* driver, const wchar_t* path);
EXPORT int wdWaitForLoadToComplete(WebDriver* driver);

// Element functions
EXPORT int wdeClick(WebElement* element);
EXPORT int wdeGetAttribute(WebElement* element, const wchar_t* string, StringWrapper** result);
EXPORT int wdeGetText(WebElement* element, StringWrapper** result);
EXPORT int wdeIsDisplayed(WebElement* element, int* result);
EXPORT int wdeSendKeys(WebElement* element, const wchar_t* text);
EXPORT int wdeSubmit(WebElement* element);


// Element locating functions
EXPORT int wdFindElementById(WebDriver* driver, WebElement* element, const wchar_t* id, WebElement** result);
EXPORT int wdFindElementsById(WebDriver* driver, WebElement* element, const wchar_t* id, ElementCollection** result);

EXPORT int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result);
EXPORT int wdFindElementsByName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result);

EXPORT int wdFindElementByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, WebElement** result);
EXPORT int wdFindElementsByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, ElementCollection** result);

EXPORT int wdFindElementByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result);
EXPORT int wdFindElementsByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result);

EXPORT int wdFindElementByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, WebElement** result);
EXPORT int wdFindElementsByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, ElementCollection** result);


// Element collection functions
EXPORT int wdcGetCollectionLength(ElementCollection* collection, int* length);
EXPORT int wdcGetElementAtIndex(ElementCollection* collection, int index, WebElement** result);


// String manipulation functions
EXPORT int wdStringLength(StringWrapper* string, int* length);
EXPORT int wdFreeString(StringWrapper* string);
EXPORT int wdCopyString(StringWrapper* source, int length, wchar_t* dest);


// Bridging function, as we migrate to the New World
class InternetExplorerDriver;
int nastyBridgingFunction(InternetExplorerDriver* driver, WebDriver** toReturn);
int nastyBridgingFunction2(WebDriver* toReturn);

#ifdef __cplusplus
}
#endif
