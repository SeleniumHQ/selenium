#include "stdafx.h"
#include "webdriver.h"
#include "finder.h"
#include "InternetExplorerDriver.h"
#include "utils.h"
#include <stdio.h>
#include <vector>

struct WebDriver {
    InternetExplorerDriver *ie;
};

struct WebElement {
	ElementWrapper *element;
};

struct StringWrapper {
	wchar_t *text;
};

struct ElementCollection {
	std::vector<ElementWrapper*> elements;
};

extern "C"
{

// String manipulation functions
int wdStringLength(StringWrapper* string, int* length)
{
	if (!string) {
		cerr << "No string to get length of" << endl;
		*length = -1;
		return -1;
	}
	if (!string->text) {
		cerr << "No underlying string to get length of" << endl;
		*length = -1;
		return -2;
	}
	size_t len = wcslen(string->text);
	*length = (int) len + 1;

	return 0;
}

int wdFreeString(StringWrapper* string)
{
	if (!string) {
		return  -1;
	}

	if (string->text) delete[] string->text;
	delete string;
	return 0;
}

int wdCopyString(StringWrapper* source, int size, wchar_t* dest)
{
	if (!source) {
		cerr << "No source wrapper" << endl;
		return -1;
	}

	if (!source->text) {
		cerr << "No source text" << endl;
		return -2;
	}

	wcscpy_s(dest, size, source->text);
	return 0;
}

// Element manipulation functions
int wdFreeElement(WebElement* element)
{
	if (!element)
		return -1;

	if (element->element) delete element->element;
	delete element;
	return 0;
}

// Driver manipulation functions
int wdFreeDriver(WebDriver* driver)
{
	if (!driver || !driver->ie) return -1;
	driver->ie->close();
    delete driver->ie;
    delete driver;
	return 0;
}

WebDriver* webdriver_newDriverInstance()
{
//	startCom();
    WebDriver *driver = new WebDriver();
   
    driver->ie = new InternetExplorerDriver();
	driver->ie->setVisible(true);

    return driver;
}

int webdriver_get(WebDriver* driver, wchar_t* url)
{
	if (!driver || !driver->ie) return -1;
	driver->ie->get(url);
	return 0;
}

int webdriver_close(WebDriver* driver)
{
	if (!driver || !driver->ie) return -1;
	driver->ie->close();
	return 0;
}

int webdriver_getCurrentUrl(WebDriver* driver, StringWrapper** result)
{
	if (!driver || !driver->ie) return -1;

	driver->ie->getCurrentUrl();

	const std::wstring originalString(driver->ie->getCurrentUrl());
	size_t length = originalString.length() + 1;
	wchar_t* toReturn = new wchar_t[length];

	wcscpy_s(toReturn, length, originalString.c_str());

	StringWrapper* res = new StringWrapper();
	res->text = toReturn;
	
	*result = res;

	return 0;
}

int wdeSendKeys(WebElement* element, const wchar_t* text)
{
	if (!element || !element->element) {
		return -1;
	}

	element->element->sendKeys(text);

	return 0;
}

int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result)
{
	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByName(elem, name);
	} catch (std::wstring& ) {
		return -1;
	}

	if (!wrapper) {
		return -2;
	}

	WebElement* toReturn = new WebElement();
	toReturn->element = wrapper;

	*result = toReturn;
	return 0;
}
}