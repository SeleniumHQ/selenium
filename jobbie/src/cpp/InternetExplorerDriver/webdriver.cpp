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

#define END_TRY  catch(std::wstring& m) \
	{ \
		wcerr << m.c_str() << endl; \
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

struct ScriptArgs {
	LONG currentIndex;
	int maxLength;
	SAFEARRAY* args;
};

struct ScriptResult {
	VARIANT result;
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

int wdGetVisible(WebDriver* driver, int* value) 
{
	if (!driver || !driver->ie) return -ENOSUCHDRIVER;

	try {
		*value = driver->ie->getVisible() ? 1 : 0;
		return SUCCESS;
	} END_TRY;
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

int wdSwitchToActiveElement(WebDriver* driver, WebElement** result)
{
        if (!driver || !driver->ie) return -ENOSUCHDRIVER;

		try {
			ElementWrapper* element = driver->ie->getActiveElement();

			if (!element)
					return -ENOSUCHELEMENT;

			WebElement* toReturn = new WebElement();
			toReturn->element = element;
			*result = toReturn;

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
		int res = element->element->click();

		return res;
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

int wdeGetValueOfCssProperty(WebElement* element, const wchar_t* name, StringWrapper** result)
{
	if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
        const std::wstring originalString(element->element->getValueOfCssProperty(name));
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
		return element->element->setSelected();
	} END_TRY;
}

int wdeToggle(WebElement* element, int* result)
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		bool toggled;
		int res = element->element->toggle(&toggled);

		if (res != SUCCESS) {
			return res;
		}
		*result = toggled ? 1 : 0;
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
		return element->element->sendKeys(text);
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

int wdeGetDetailsOnceScrolledOnToScreen(WebElement* element, HWND* hwnd, long* x, long* y, long* width, long* height)
{
    if (!element || !element->element) { return -ENOSUCHELEMENT; }

	try {
		element->element->getLocationWhenScrolledIntoView(hwnd, x, y);
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

int wdeGetSize(WebElement* element, long* width, long* height)
{
        if (!element || !element->element) { return -ENOSUCHELEMENT; }

		try {
			*width = element->element->getWidth();
			*height = element->element->getHeight();

			return SUCCESS;
		} END_TRY;
}

int wdFindElementById(WebDriver* driver, WebElement* element, const wchar_t* id, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementById(elem, id, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;
		return SUCCESS;
	} END_TRY;
}

int wdFindElementsById(WebDriver* driver, WebElement* element, const wchar_t* id, ElementCollection** result) 
{
	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsById(elem, id);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementByName(elem, name, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;
		return SUCCESS;
	} END_TRY;
}

int wdFindElementsByName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result)
{
	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsByName(elem, name);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementByClassName(elem, className, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;
		return SUCCESS;
	} END_TRY;
}

int wdFindElementsByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, ElementCollection** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsByClassName(elem, className);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementByLink(elem, linkText, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;
		return SUCCESS;
	} END_TRY;
}

int wdFindElementsByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsByLink(elem, linkText);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementByTagName(elem, name, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementsByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsByTagName(elem, name);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, WebElement** result)
{
	if (!driver || !driver->ie) { return -ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		ElementWrapper* wrapper;
		int res = ie->selectElementByXPath(elem, xpath, &wrapper);

		if (res != SUCCESS) {
			return res;
		}

		WebElement* toReturn = new WebElement();
		toReturn->element = wrapper;

		*result = toReturn;
		return SUCCESS;
	} END_TRY;
}

int wdFindElementsByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, ElementCollection** result)
{
	CComPtr<IHTMLDOMNode> res;

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		collection->elements = driver->ie->selectElementsByXPath(elem, xpath);

		*result = collection;

		return SUCCESS;
	} END_TRY;
}


int wdNewScriptArgs(ScriptArgs** scriptArgs, int maxLength) 
{
	ScriptArgs* args = new ScriptArgs();
	args->currentIndex = 0;
	args->maxLength = maxLength;

	SAFEARRAYBOUND bounds;
	bounds.cElements = maxLength;
	bounds.lLbound = 0;
	args->args = SafeArrayCreate(VT_VARIANT, 1, &bounds);

	*scriptArgs = args;
	return SUCCESS;
}

int wdAddStringScriptArg(ScriptArgs* scriptArgs, const wchar_t* arg) 
{
	std::wstring value(arg);

	VARIANT dest;
	dest.vt = VT_BSTR;
	dest.bstrVal = SysAllocString(arg);

	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdAddBooleanScriptArg(ScriptArgs* scriptArgs, int trueOrFalse) 
{
	VARIANT dest;
	dest.vt = VT_BOOL;
	dest.boolVal = trueOrFalse == 1;
	
	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdAddNumberScriptArg(ScriptArgs* scriptArgs, long number)
{
	VARIANT dest;
	dest.vt = VT_I4;
	dest.lVal = (LONG) number;	

	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdAddElementScriptArg(ScriptArgs* scriptArgs, WebElement* element)
{
	VARIANT dest;
	dest.vt = VT_DISPATCH;
	dest.pdispVal = element->element->getWrappedElement();

	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdExecuteScript(WebDriver* driver, const wchar_t* script, ScriptArgs* scriptArgs, ScriptResult** scriptResultRef) 
{
	VARIANT result = driver->ie->executeScript(script, scriptArgs->args);

	ScriptResult* toReturn = new ScriptResult();
	toReturn->result = result;
	*scriptResultRef = toReturn;

	return SUCCESS;
}

int wdGetScriptResultType(ScriptResult* result, int* type) 
{
	if (!result) { return -ENOSCRIPTRESULT; }

	switch (result->result.vt) {
		case VT_BSTR:
			*type = 1;
			break;

		case VT_I4:
		case VT_I8:
			*type = 2;
			break;

		case VT_BOOL:
			*type = 3;
			break;

		case VT_DISPATCH:
			*type = 4;
			break;
			// Fall through

		case VT_EMPTY:
			*type = 5;
			break;

		case VT_USERDEFINED:
			*type = 6;
			break;

		default:
			return -EUNKNOWNSCRIPTRESULT;
	}

	return SUCCESS;
}

int wdGetStringScriptResult(ScriptResult* result, StringWrapper** wrapper)
{
	if (!result) { return -ENOSCRIPTRESULT; }

	StringWrapper* toReturn = new StringWrapper();

	BSTR val = result->result.bstrVal;

	if (!val) {
		toReturn->text = new wchar_t[1];
		wcscpy_s(toReturn->text, 1, L"");
	} else {
		UINT length = SysStringLen(val);
		toReturn->text = new wchar_t[length + 1];
		wcscpy_s(toReturn->text, length + 1, val);
	}

	*wrapper = toReturn;
	return SUCCESS;
}

int wdGetNumberScriptResult(ScriptResult* result, long* value)
{
	if (!result) { return -ENOSCRIPTRESULT; }

	*value = result->result.lVal;

	return SUCCESS;
}

int wdGetBooleanScriptResult(ScriptResult* result, int* value) 
{
	if (!result) { return -ENOSCRIPTRESULT; }

	*value = result->result.boolVal == VARIANT_TRUE ? 1 : 0;

	return SUCCESS;
}

int wdGetElementScriptResult(ScriptResult* result, WebDriver* driver, WebElement** element)
{
	if (!result) { return -ENOSCRIPTRESULT; }

	IHTMLElement *node = (IHTMLElement*) result->result.pdispVal;
	WebElement* toReturn = new WebElement();
	toReturn->element = new ElementWrapper(driver->ie, node);

	*element = toReturn;

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