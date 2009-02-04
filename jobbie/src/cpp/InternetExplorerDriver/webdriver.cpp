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
#include "webdriver.h"
#include "finder.h"
#include "InternetExplorerDriver.h"
#include "utils.h"
#include <stdio.h>
#include <string>
#include <vector>

#define END_TRY  catch(std::wstring&) \
	{ \
		return -EEXPECTEDERROR; \
	} \
	catch (...) \
	{ \
	safeIO::CoutA("CException caught in dll", true); \
	return -EUNHANDLEDERROR; }


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
	std::vector<ElementWrapper*>* elements;
};

InternetExplorerDriver* openIeInstance = NULL;

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

	return SUCCESS;
}

int wdFreeString(StringWrapper* string)
{
	if (!string) {
		return  -ENOSTRING;
	}

	if (string->text) delete[] string->text;
	delete string;

	return SUCCESS;
}

int wdCopyString(StringWrapper* source, int size, wchar_t* dest)
{
	if (!source) {
		cerr << "No source wrapper" << endl;
		return -ENOSTRING;
	}

	if (!source->text) {
		cerr << "No source text" << endl;
		return -ENOSTRING;
	}

	wcscpy_s(dest, size, source->text);
	return SUCCESS;
}

// Collection manipulation functions
int wdcGetCollectionLength(ElementCollection* collection, int* length)
{
	if (!collection || !collection->elements) return -ENOCOLLECTION;

	*length = (int) collection->elements->size();

	return SUCCESS;
}

int wdcGetElementAtIndex(ElementCollection* collection, int index, WebElement** result)
{
	if (!collection || !collection->elements) return -ENOCOLLECTION;

	
	std::vector<ElementWrapper*>::const_iterator cur = collection->elements->begin();
	cur += index;

	WebElement* element = new WebElement();
	element->element = *cur;
	*result = element;

	return SUCCESS;
}

// Element manipulation functions
int wdeFreeElement(WebElement* element)
{
	if (!element)
		return -1;

	if (element->element) delete element->element;
	delete element;

	return SUCCESS;
}

// Driver manipulation functions
int wdFreeDriver(WebDriver* driver)
{
	if (!driver || !driver->ie) return -1;
	driver->ie->close();
    delete driver->ie;
    delete driver;

	return SUCCESS;
}

int wdNewDriverInstance(WebDriver** result)
{
	TRY
	{
	    WebDriver *driver = new WebDriver();
   
		driver->ie = new InternetExplorerDriver();
		driver->ie->setVisible(true);

		openIeInstance = driver->ie;

		*result = driver;

		return SUCCESS;
	}
	END_TRY

	return -ENOSUCHDRIVER;
}

int wdGet(WebDriver* driver, const wchar_t* url)
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->get(url);

		return SUCCESS;
	} END_TRY;
}

int wdGoBack(WebDriver* driver)
{
    if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->goBack();
		return SUCCESS;
	} END_TRY;
}

int wdGoForward(WebDriver* driver) 
{
    if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->goForward();
		return SUCCESS;
	} END_TRY;
}

int wdClose(WebDriver* driver)
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->close();

		return SUCCESS;
	} END_TRY
}

int wdSetVisible(WebDriver* driver, int value) 
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->setVisible(value != 0);
	} END_TRY;

	return SUCCESS;
}

int wdGetCurrentUrl(WebDriver* driver, StringWrapper** result)
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->getCurrentUrl());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdGetTitle(WebDriver* driver, StringWrapper** result)
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->getTitle());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdGetPageSource(WebDriver* driver, StringWrapper** result)
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->getPageSource());
        size_t length = originalString.length() + 1;
        wchar_t* toReturn = new wchar_t[length];

        wcscpy_s(toReturn, length, originalString.c_str());

        StringWrapper* res = new StringWrapper();
        res->text = toReturn;
        
        *result = res;

		return SUCCESS;
	} END_TRY;
}

int wdGetCookies(WebDriver* driver, StringWrapper** result)
{ 
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->getCookies());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;

		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdAddCookie(WebDriver* driver, const wchar_t* cookie)
{
    if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->addCookie(cookie);

		return SUCCESS;
	} END_TRY;
}

int wdSwitchToFrame(WebDriver* driver, const wchar_t* path)
{
    if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		return driver->ie->switchToFrame(path) ? SUCCESS : -ENOSUCHFRAME;
	} END_TRY;
}

int wdWaitForLoadToComplete(WebDriver* driver) 
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		driver->ie->waitForNavigateToFinish();
		return SUCCESS;
	} END_TRY;
}

int wdeClick(WebElement* element)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->click();

		return SUCCESS;
	} END_TRY;	
}

int wdeGetAttribute(WebElement* element, const wchar_t* name, StringWrapper** result)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		const std::wstring originalString(element->element->getAttribute(name));
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdeGetText(WebElement* element, StringWrapper** result)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		const std::wstring originalString(element->element->getText());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdeGetElementName(WebElement* element, StringWrapper** result)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		const std::wstring originalString(element->element->getElementName());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
	    
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdeIsSelected(WebElement* element, int* result)
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		*result = element->element->isSelected() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeSetSelected(WebElement* element)
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->setSelected();

		return SUCCESS;
	} END_TRY;
}

int wdeToggle(WebElement* element, int* result)
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		*result = element->element->toggle() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeIsEnabled(WebElement* element, int* result) 
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		*result = element->element->isEnabled() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeIsDisplayed(WebElement* element, int* result)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		*result = element->element->isDisplayed() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeSendKeys(WebElement* element, const wchar_t* text)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->sendKeys(text);

		return SUCCESS;
	} END_TRY;
}

int wdeClear(WebElement* element) 
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->clear();
		return SUCCESS;
	} END_TRY;
}

int wdeSubmit(WebElement* element)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->submit();
		return SUCCESS;
	} END_TRY;	
}

int wdeGetLocation(WebElement* element, long* x, long* y)
{
        if (!element || !element->element) { return -ENOSUCHELEMENT; }

		try {
			element->element->getLocation(x, y);

			return SUCCESS;
		} END_TRY;
}

int wdFindElementById(WebDriver* driver, WebElement* element, const wchar_t* id, WebElement** result)
{
	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementById(elem, id);
	} catch (std::wstring& ) {
		return -1;
	}

	if (!wrapper) {
		return -2;
	}

	WebElement* toReturn = new WebElement();
	toReturn->element = wrapper;

	*result = toReturn;

	return SUCCESS;
}

int wdFindElementsById(WebDriver* driver, WebElement* element, const wchar_t* id, ElementCollection** result) 
{
	return -ENOTIMPLEMENTED;
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
	return SUCCESS;
}

int wdFindElementsByName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result)
{
	return -ENOTIMPLEMENTED;
}

int wdFindElementByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, WebElement** result)
{
	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByClassName(elem, className);
	} catch (std::wstring& ) {
		return -1;
	}

	if (!wrapper) {
		return -2;
	}

	WebElement* toReturn = new WebElement();
	toReturn->element = wrapper;

	*result = toReturn;
	
	return SUCCESS;
}

int wdFindElementsByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, ElementCollection** result)
{
	return -ENOTIMPLEMENTED;
}

int wdFindElementByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result)
{
	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByLink(elem, linkText);
	} catch (std::wstring& ) {
		return -1;
	}

	if (!wrapper) {
		return -2;
	}

	WebElement* toReturn = new WebElement();
	toReturn->element = wrapper;

	*result = toReturn;

	return SUCCESS;
}

int wdFindElementsByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result)
{
	return -ENOTIMPLEMENTED;
}

int wdFindElementByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, WebElement** result)
{
	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByXPath(elem, xpath);
	} catch (std::wstring& ) {
		return -1;
	}

	if (!wrapper) {
		return -2;
	}

	WebElement* toReturn = new WebElement();
	toReturn->element = wrapper;

	*result = toReturn;

	return SUCCESS;
}

int wdFindElementsByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, ElementCollection** result)
{
	ElementCollection* collection = new ElementCollection();
	collection->elements = driver->ie->selectElementsByXPath(NULL, xpath);

	*result = collection;

	return SUCCESS;
}

// Never use me. Except when converting JNI code to call webdriver.h functions
int nastyBridgingFunction(InternetExplorerDriver* driver, WebDriver** toReturn)
{
	WebDriver *d = new WebDriver();
	d->ie = driver;
	*toReturn = d;

	return SUCCESS;
}

int nastyBridgingFunction2(WebDriver* toReturn) 
{
	delete toReturn;

	return SUCCESS;
}

int nastyBridgingFunction3(ElementWrapper* wrapper, WebElement** toReturn)
{
	WebElement *e = new WebElement();
	e->element = wrapper;
	*toReturn = e;

	return SUCCESS;
}

int nastyBridgingFunction4(WebElement* toReturn) 
{
	delete toReturn;

	return SUCCESS;
}

}