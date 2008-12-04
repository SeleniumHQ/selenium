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

// Element collection functions
EXPORT int wdcGetCollectionLength(ElementCollection* collection, int* length);
EXPORT int wdcGetElementAtIndex(ElementCollection* collection, int index, WebElement** result);

// Element manipulation functions
EXPORT int wdeFreeElement(WebElement* element);

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


#ifdef __cplusplus
}
#endif