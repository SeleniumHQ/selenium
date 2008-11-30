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
EXPORT int wdFreeDriver(WebDriver* driver);

// WebDriver functions
EXPORT WebDriver* webdriver_newDriverInstance();
EXPORT int webdriver_deleteDriverInstance(WebDriver* handle);

EXPORT int webdriver_get(WebDriver* driver, wchar_t* url);
EXPORT int webdriver_close(WebDriver* driver);

EXPORT int webdriver_getCurrentUrl(WebDriver* driver, StringWrapper** result);

// Element functions
EXPORT int wdeSendKeys(WebElement* element, const wchar_t* text);

// Element locating functions
EXPORT int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result);

#ifdef __cplusplus
}
#endif