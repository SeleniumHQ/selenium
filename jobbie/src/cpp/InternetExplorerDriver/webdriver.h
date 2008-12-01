#pragma once

#include <wchar.h>

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

// String manipulation functions
EXPORT int wdStringLength(StringWrapper* string, int* length);
EXPORT int wdFreeString(StringWrapper* string);
EXPORT int wdCopyString(StringWrapper* source, int length, wchar_t* dest);

// Element manipulation functions
EXPORT int wdFreeElement(WebElement* element);

// Driver manipulation functions


// WebDriver functions
EXPORT int wdNewDriverInstance(WebDriver** result);
EXPORT int wdFreeDriver(WebDriver* driver);

EXPORT int wdGet(WebDriver* driver, wchar_t* url);
EXPORT int wdClose(WebDriver* driver);
EXPORT int wdSetVisible(WebDriver* driver, int value);

EXPORT int wdGetCurrentUrl(WebDriver* driver, StringWrapper** result);
EXPORT int wdGetTitle(WebDriver* driver, StringWrapper** result);

// Element functions
EXPORT int wdeSendKeys(WebElement* element, const wchar_t* text);

// Element locating functions
EXPORT int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result);

#ifdef __cplusplus
}
#endif