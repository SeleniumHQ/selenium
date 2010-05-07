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
#include "interactions.h"
#include "InternetExplorerDriver.h"
#include "logging.h"
#include "jsxpath.h"
#include "cookies.h"
#include "utils.h"
#include "IEReturnTypes.h"
#include "windowHandling.h"
#include <stdio.h>
#include <iostream>
#include <string>
#include <vector>

#define END_TRY  catch(std::wstring& m) \
	{ \
		if (m.find(L"TIME OUT") != std::wstring::npos) { return ETIMEOUT; } \
		wcerr << m.c_str() << endl; \
		LOG(WARN) << "Last error: " << GetLastError(); \
		return EEXPECTEDERROR; \
	} \
	catch (...) \
	{ \
	safeIO::CoutA("CException caught in dll", true); \
	return EUNHANDLEDERROR; }


struct WebDriver {
    InternetExplorerDriver *ie;
	long implicitWaitTimeout;
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
	CComVariant result;
};

struct StringWrapper {
	wchar_t *text;
};

struct ElementCollection {
	std::vector<ElementWrapper*>* elements;
};

struct StringCollection {
	std::vector<std::wstring>* strings;
};

InternetExplorerDriver* openIeInstance = NULL;

clock_t endAt(WebDriver* driver) {
	clock_t end = clock() + (driver->implicitWaitTimeout / 1000 * CLOCKS_PER_SEC);
	if (driver->implicitWaitTimeout > 0 && driver->implicitWaitTimeout < 1000) 
	{
		end += 1 * CLOCKS_PER_SEC;
	}

	return end;
}

int terminateIe() 
{
	std::vector<HWND> allWindows;
	getTopLevelWindows(&allWindows);

	// Wait until all open windows are gone. Common case, no worries
	while (allWindows.size() > 0) {
		allWindows.clear();
		getTopLevelWindows(&allWindows);
		for (vector<HWND>::iterator curr = allWindows.begin();
			curr != allWindows.end();
			curr++) {
			SendMessage(*curr, WM_CLOSE, NULL, NULL);
		}

		// Pause to allow IE to process the message. If we don't do this and
		// we're using IE 8, and "Restore previous session" is enabled (an
		// increasingly common state) then a modal system dialog will be 
		// displayed to the user. Not what we want.
		wait(500);
	}

	// If it's longer than this, we're on a very strange system
	wchar_t taskkillPath[256];
	if (!ExpandEnvironmentStrings(L"%SystemRoot%\\system32\\taskkill.exe", taskkillPath, 256)) 
	{
		cerr << "Unable to find taskkill application" << endl;
		return EUNHANDLEDERROR;
	}

	std::wstring args = L" /f /im iexplore.exe";
	STARTUPINFO startup_info;
	memset(&startup_info, 0, sizeof(startup_info));
	startup_info.cb = sizeof(startup_info);

	PROCESS_INFORMATION process_info;
	if (!CreateProcessW(taskkillPath, &args[0], NULL, NULL, false, DETACHED_PROCESS, NULL, NULL, &startup_info, &process_info)) 
	{
		cerr << "Could not execute taskkill. Bailing: " << GetLastError() << endl;
		return EUNHANDLEDERROR;
	}
	WaitForSingleObject(process_info.hProcess, INFINITE);
	CloseHandle(process_info.hThread);
	CloseHandle(process_info.hProcess);

	return SUCCESS;
}

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
		return  ENOSTRING;
	}

	if (string->text) delete[] string->text;
	delete string;

	return SUCCESS;
}

int wdCopyString(StringWrapper* source, int size, wchar_t* dest)
{
	if (!source) {
		cerr << "No source wrapper" << endl;
		return ENOSTRING;
	}

	if (!source->text) {
		cerr << "No source text" << endl;
		return ENOSTRING;
	}

	wcscpy_s(dest, size, source->text);
	return SUCCESS;
}

// Collection manipulation functions
int wdcGetElementCollectionLength(ElementCollection* collection, int* length)
{
	if (!collection || !collection->elements) return ENOCOLLECTION;

	*length = (int) collection->elements->size();

	return SUCCESS;
}

int wdcGetElementAtIndex(ElementCollection* collection, int index, WebElement** result)
{
	*result = NULL;
	if (!collection || !collection->elements) return ENOCOLLECTION;

	
	std::vector<ElementWrapper*>::const_iterator cur = collection->elements->begin();
	cur += index;

	WebElement* element = new WebElement();
	element->element = *cur;
	*result = element;

	return SUCCESS;
}

int wdcGetStringCollectionLength(StringCollection* collection, int* length)
{
	if (!collection) return ENOCOLLECTION;

	*length = (int) collection->strings->size();

	return SUCCESS;
}

int wdcGetStringAtIndex(StringCollection* collection, int index, StringWrapper** result)
{
	*result = NULL;
	if (!collection) return ENOCOLLECTION;

	std::vector<std::wstring>::const_iterator cur = collection->strings->begin();
	cur += index;

	StringWrapper* wrapper = new StringWrapper();
	size_t size = (*cur).length() + 1;
	wrapper->text = new wchar_t[size];
	wcscpy_s(wrapper->text, size, (*cur).c_str());
	*result = wrapper;

	return SUCCESS;
}

// Element manipulation functions
int wdeFreeElement(WebElement* element)
{
	if (!element)
		return ENOSUCHDRIVER;

	if (element->element) delete element->element;
	delete element;

	return SUCCESS;
}

int wdFreeElementCollection(ElementCollection* collection, int alsoFreeElements)
{
	if (!collection || !collection->elements) 
		return ENOSUCHCOLLECTION;

	if (alsoFreeElements) {
		std::vector<ElementWrapper*>::const_iterator cur = collection->elements->begin();
		std::vector<ElementWrapper*>::const_iterator end = collection->elements->end();

		while (cur != end) {
			delete *cur;
			cur++;
		}
	}

	delete collection->elements;
	delete collection;

	return SUCCESS;
}

int wdFreeStringCollection(StringCollection* collection)
{
	if (!collection || !collection->strings) 
		return ENOSUCHCOLLECTION;

	delete collection->strings;
	delete collection;

	return SUCCESS;
}

int wdFreeScriptArgs(ScriptArgs* scriptArgs)
{
	if (!scriptArgs || !scriptArgs->args) 
		return ENOSUCHCOLLECTION;

	SafeArrayDestroy(scriptArgs->args);
	delete scriptArgs;

	return SUCCESS;
}

int wdFreeScriptResult(ScriptResult* scriptResult)
{
	if (!scriptResult)
		return ENOCOLLECTION;

	VariantClear(&scriptResult->result);

	delete scriptResult;

	return SUCCESS;
}

// Driver manipulation functions
int wdFreeDriver(WebDriver* driver)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		terminateIe();
	} catch (...) {
		// Fine. We're quitting anyway.
	}
    delete driver->ie;
    delete driver;
	driver = NULL;

	// Let the IE COM instance fade away
	wait(4000);

	return SUCCESS;
}

int wdNewDriverInstance(WebDriver** result)
{
	*result = NULL;
	TRY
	{
		terminateIe();
/*
		wchar_t iePath[256];
		if (!ExpandEnvironmentStrings(L"%ProgramFiles%\\Internet Explorer\\iexplore.exe", iePath, 256)) 
		{
			cerr << "Unable to find IE" << endl;
			return EUNHANDLEDERROR;
		}

		memset(&startup_info, 0, sizeof(startup_info));
		startup_info.cb = sizeof(startup_info);
		args = L"about:blank";

		if (!CreateProcessW(iePath, &args[0], NULL, NULL, false, 0, NULL, NULL, &startup_info, &process_info)) 
		{
			cerr << "Could not execute IE. Bailing: " << GetLastError() << endl;
			return EUNHANDLEDERROR;
		}
*/

		WebDriver *driver = new WebDriver();
   
		driver->ie = new InternetExplorerDriver();
		driver->ie->setVisible(true);
		driver->implicitWaitTimeout = 0;

		openIeInstance = driver->ie;

		*result = driver;

		return SUCCESS;
	}
	END_TRY

	return ENOSUCHDRIVER;
}

int wdGet(WebDriver* driver, const wchar_t* url)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->get(url);
		driver->ie->waitForNavigateToFinish();

		return SUCCESS;
	} END_TRY;
}

int wdGoBack(WebDriver* driver)
{
    if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->goBack();
		return SUCCESS;
	} END_TRY;
}

int wdGoForward(WebDriver* driver) 
{
    if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->goForward();
		return SUCCESS;
	} END_TRY;
}

int wdRefresh(WebDriver* driver) 
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	StringWrapper* wrapper;
	int result = wdGetCurrentUrl(driver, &wrapper);
	if (result != SUCCESS) {
		return result;
	}
	result = wdGet(driver, wrapper->text);
	wdFreeString(wrapper);
	return result;
}

int wdClose(WebDriver* driver)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->close();

		return SUCCESS;
	} END_TRY
}

int wdGetVisible(WebDriver* driver, int* value) 
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		*value = driver->ie->getVisible() ? 1 : 0;
		return SUCCESS;
	} END_TRY;
}

int wdSetVisible(WebDriver* driver, int value) 
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->setVisible(value != 0);
	} END_TRY;

	return SUCCESS;
}

int wdGetCurrentUrl(WebDriver* driver, StringWrapper** result)
{
	*result = NULL;
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

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
	*result = NULL;
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

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
	*result = NULL;
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

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
	*result = NULL;
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

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
    if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		return driver->ie->addCookie(cookie);
	} END_TRY;
}

int wdDeleteCookie(WebDriver* driver, const wchar_t* cookieName)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	// Inject the XPath engine
	std::wstring script;
	for (int i = 0; DELETECOOKIES[i]; i++) {
		script += DELETECOOKIES[i];
	}
	ScriptArgs* args;
	int result = wdNewScriptArgs(&args, 1);
	if (result != SUCCESS) {
		return result;
	}
	wdAddStringScriptArg(args, cookieName);

	ScriptResult* scriptResult = NULL;
	result = wdExecuteScript(driver, script.c_str(), args, &scriptResult);
	wdFreeScriptArgs(args);
	if (scriptResult) delete scriptResult;

	return result;
}

int wdSwitchToActiveElement(WebDriver* driver, WebElement** result)
{
	*result = NULL;
    if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		ElementWrapper* element = driver->ie->getActiveElement();

		if (!element)
				return ENOSUCHELEMENT;

		WebElement* toReturn = new WebElement();
		toReturn->element = element;
		*result = toReturn;

		return SUCCESS;
	} END_TRY;
}

int wdSwitchToWindow(WebDriver* driver, const wchar_t* name)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		int result;
		// It's entirely possible the window to switch to isn't here yet. 
		// TODO(simon): Make this configurable
		for (int i = 0; i < 8; i++) {
			result = driver->ie->switchToWindow(name);
			if (result == SUCCESS) { break; }
			wait(500);
		}
		return result;
	} END_TRY;
}

int wdSwitchToFrame(WebDriver* driver, const wchar_t* path)
{
    if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		// TODO(simon): Make this configurable
		for (int i = 0; i < 8; i++) {
			bool result = driver->ie->switchToFrame(path);
			if (result) { return SUCCESS; }
			wait(500);
		}
		return ENOSUCHFRAME;
	} END_TRY;
}

int wdWaitForLoadToComplete(WebDriver* driver) 
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		driver->ie->waitForNavigateToFinish();
		return SUCCESS;
	} END_TRY;
}

int wdGetCurrentWindowHandle(WebDriver* driver, StringWrapper** handle)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->getHandle());

		// TODO(simon): Check that the handle is in the map of known driver instances

		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*handle = res;

		return SUCCESS;
	} END_TRY;
}

int wdGetAllWindowHandles(WebDriver* driver, StringCollection** handles)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	*handles = NULL;

	try {
		std::vector<std::wstring> rawHandles = driver->ie->getAllHandles();
		StringCollection* collection = new StringCollection();
		collection->strings = new std::vector<std::wstring>();
		for (std::vector<std::wstring>::iterator curr = rawHandles.begin();
			 curr != rawHandles.end();
			 curr++) {
				 collection->strings->push_back(std::wstring(*curr));
		}
		*handles = collection;

		return SUCCESS;
	} END_TRY;
}

int verifyFresh(WebElement* element) 
{
	if (!element || !element->element) { return ENOSUCHELEMENT; }

	try {
		if (!element->element->isFresh()) 
		{
			return EOBSOLETEELEMENT;
		}
	} END_TRY;
	return SUCCESS;
}

int wdeClick(WebElement* element)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		res = element->element->click();
		return res;
	} END_TRY;	
}

int wdeGetAttribute(WebDriver* driver, WebElement* element, const wchar_t* name, StringWrapper** result)
{
	*result = NULL;
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		std::wstring script(L"(function() { return function(){ ");
		script += L"var e = arguments[0]; var attr = arguments[1]; var lattr = attr.toLowerCase(); ";
		script += L"if ('class' == lattr) { attr = 'className' }; ";
		script += L"if ('readonly' == lattr) { attr = 'readOnly' }; ";
		script += L"if ('style' == lattr) { return ''; } ";
		script += L"if ('disabled' == lattr) { return e.disabled ? 'true' : 'false'; } ";
		script += L"if (e.tagName.toLowerCase() == 'input') { ";
        script += L"  var type = e.type.toLowerCase(); ";
		script += L"  if (type == 'radio' && lattr == 'selected') { return e.checked == '' || e.checked == undefined ? 'false' : 'true' ; } ";
		script += L"} ";
		script += L"return e[attr] === undefined ? undefined : e[attr].toString(); ";
		script += L"};})();";

		ScriptArgs* args;
		res = wdNewScriptArgs(&args, 2);
		if (res != SUCCESS) {
			return res;
		}
		wdAddElementScriptArg(args, element);
		wdAddStringScriptArg(args, name);

		WebDriver* driver = new WebDriver();
		driver->ie = element->element->getParent();
		ScriptResult* scriptResult = NULL;
		res = wdExecuteScript(driver, script.c_str(), args, &scriptResult);
		wdFreeScriptArgs(args);
		driver->ie = NULL;
		delete driver;

		if (res != SUCCESS) 
		{
			wdFreeScriptResult(scriptResult);
			return res;
		}

		int type;
		wdGetScriptResultType(driver, scriptResult, &type);
		if (type != TYPE_EMPTY) {
			const std::wstring originalString(bstr2cw(scriptResult->result.bstrVal));
			size_t length = originalString.length() + 1;
			wchar_t* toReturn = new wchar_t[length];

			wcscpy_s(toReturn, length, originalString.c_str());

			*result = new StringWrapper();
			(*result)->text = toReturn;
		}

		wdFreeScriptResult(scriptResult);

		return SUCCESS;
	} END_TRY;
}

int wdeGetValueOfCssProperty(WebElement* element, const wchar_t* name, StringWrapper** result)
{
	*result = NULL;
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

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
	*result = NULL;
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

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

int wdeGetTagName(WebElement* element, StringWrapper** result)
{
	*result = NULL;
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		const std::wstring originalString(element->element->getTagName());
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
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		*result = element->element->isSelected() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeSetSelected(WebElement* element)
{
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		return element->element->setSelected();
	} END_TRY;
}

int wdeToggle(WebElement* element, int* result)
{
	*result = 0;
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		int res = element->element->toggle();

		if (res == SUCCESS) {
			return wdeIsSelected(element, result);
		}
		return res;
	} END_TRY;
}

int wdeIsEnabled(WebElement* element, int* result) 
{
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		*result = element->element->isEnabled() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeIsDisplayed(WebElement* element, int* result)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		*result = element->element->isDisplayed() ? 1 : 0;

		return SUCCESS;
	} END_TRY;
}

int wdeSendKeys(WebElement* element, const wchar_t* text)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		return element->element->sendKeys(text);
	} END_TRY;
}

int wdeClear(WebElement* element) 
{
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		element->element->clear();
		return SUCCESS;
	} END_TRY;
}

int wdeSubmit(WebElement* element)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		element->element->submit();
		return SUCCESS;
	} END_TRY;	
}

int wdeGetDetailsOnceScrolledOnToScreen(WebElement* element, HWND* hwnd, long* x, long* y, long* width, long* height)
{
    int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		element->element->getLocationWhenScrolledIntoView(hwnd, x, y, width, height);
		return SUCCESS;
	} END_TRY;
}

int wdeGetLocation(WebElement* element, long* x, long* y)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		element->element->getLocation(x, y);

		return SUCCESS;
	} END_TRY;
}

int wdeGetSize(WebElement* element, long* width, long* height)
{
	int res = verifyFresh(element);	if (res != SUCCESS) { return res; }

	try {
		int result = element->element->getWidth(width);
		if (result != SUCCESS) {
			return result;
		}
		result = element->element->getHeight(height);

		return result;
	} END_TRY;
}

int wdFindElementById(WebDriver* driver, WebElement* element, const wchar_t* id, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do { 
			ElementWrapper* wrapper;
			res = ie->selectElementById(elem, id, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;
			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsById(WebDriver* driver, WebElement* element, const wchar_t* id, ElementCollection** result) 
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		clock_t end = endAt(driver);
		ElementCollection* collection = new ElementCollection();
		*result = collection;

		do {
			collection->elements = driver->ie->selectElementsById(elem, id);

			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	CComPtr<IHTMLDOMNode> res;
	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do {
			ElementWrapper* wrapper;
			int res = ie->selectElementByName(elem, name, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;
			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsByName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result)
{
	*result = NULL;
	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		*result = collection;

		clock_t end = endAt(driver);
		do {
			collection->elements = driver->ie->selectElementsByName(elem, name);

			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do {
			ElementWrapper* wrapper;
			int res = ie->selectElementByClassName(elem, className, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;
			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsByClassName(WebDriver* driver, WebElement* element, const wchar_t* className, ElementCollection** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {		
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
			if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		clock_t end = endAt(driver);
		ElementCollection* collection = new ElementCollection();
		*result = collection;

		do {
			collection->elements = driver->ie->selectElementsByClassName(elem, className);

			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do {
			ElementWrapper* wrapper;
			int res = ie->selectElementByLink(elem, linkText, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;
			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsByLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		*result = collection;
		clock_t end = endAt(driver);

		do {
			collection->elements = driver->ie->selectElementsByLink(elem, linkText);
			
			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByPartialLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do {
			ElementWrapper* wrapper;
			int res = ie->selectElementByPartialLink(elem, linkText, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;
			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsByPartialLinkText(WebDriver* driver, WebElement* element, const wchar_t* linkText, ElementCollection** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		*result = collection;
		clock_t end = endAt(driver);

		do {
			collection->elements = driver->ie->selectElementsByPartialLink(elem, linkText);

			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int wdFindElementByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, WebElement** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	InternetExplorerDriver* ie = driver->ie;
	CComPtr<IHTMLElement> elem;
	if (element && element->element) {
		elem = element->element->getWrappedElement();
	}

	try {
		clock_t end = endAt(driver);
		int res = ENOSUCHELEMENT;

		do {
			ElementWrapper* wrapper;
			int res = ie->selectElementByTagName(elem, name, &wrapper);

			if (res != SUCCESS) {
				continue;
			}

			WebElement* toReturn = new WebElement();
			toReturn->element = wrapper;

			*result = toReturn;

			return SUCCESS;
		} while (clock() < end);

		return res;
	} END_TRY;
}

int wdFindElementsByTagName(WebDriver* driver, WebElement* element, const wchar_t* name, ElementCollection** result)
{
	*result = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		InternetExplorerDriver* ie = driver->ie;
		CComPtr<IHTMLElement> elem;
		if (element && element->element) {
			elem = element->element->getWrappedElement();
		}

		ElementCollection* collection = new ElementCollection();
		*result = collection;
		clock_t end = endAt(driver);

		do {
			collection->elements = driver->ie->selectElementsByTagName(elem, name);

			if (collection->elements->size() > 0) {
				return SUCCESS;
			}
		} while (clock() < end);

		return SUCCESS;
	} END_TRY;
}

int injectXPathEngine(WebDriver* driver) 
{
	// Inject the XPath engine
	std::wstring script;
	for (int i = 0; XPATHJS[i]; i++) {
		script += XPATHJS[i];
	}
	ScriptArgs* args;
	int result = wdNewScriptArgs(&args, 0);
	if (result != SUCCESS) {
		return result;
	}

	ScriptResult* scriptResult = NULL;
	result = wdExecuteScript(driver, script.c_str(), args, &scriptResult);
	wdFreeScriptArgs(args);
	if (scriptResult) delete scriptResult;

	return result;
}

int wdFindElementByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, WebElement** out)
{
	*out = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		clock_t end = endAt(driver);
		int result = ENOSUCHELEMENT;

		do {
			result = injectXPathEngine(driver);
			// TODO(simon): Why does the injecting sometimes fail?
			/*
			if (result != SUCCESS) {
				return result;
			}
			*/

			// Call it
			std::wstring query;
			if (element) {
				query += L"(function() { return function(){var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res.snapshotItem(0) ;};})();";
			} else {
				query += L"(function() { return function(){var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res.snapshotLength != 0 ? res.snapshotItem(0) : undefined ;};})();";
			}

			ScriptArgs* queryArgs;
			result = wdNewScriptArgs(&queryArgs, 2);
			if (result != SUCCESS) {
				wdFreeScriptArgs(queryArgs);
				continue;
			}
			result = wdAddStringScriptArg(queryArgs, xpath);
			if (result != SUCCESS) {
				wdFreeScriptArgs(queryArgs);
				continue;
			}
			if (element) {
				result = wdAddElementScriptArg(queryArgs, element);
			}
			if (result != SUCCESS) {
				wdFreeScriptArgs(queryArgs);
				continue;
			}

			ScriptResult* queryResult;
			result = wdExecuteScript(driver, query.c_str(), queryArgs, &queryResult);
			wdFreeScriptArgs(queryArgs);

			// And be done
			if (result == SUCCESS) {
				int type = 0;
				result = wdGetScriptResultType(driver, queryResult, &type);
				if (type != TYPE_EMPTY) {
					result = wdGetElementScriptResult(queryResult, driver, out);
				} else {
					result = ENOSUCHELEMENT;
					wdFreeScriptResult(queryResult);
					continue;
				}
			}
			wdFreeScriptResult(queryResult);

			return result;
		} while (clock() < end);

		return result;
	} END_TRY;
}

int wdFindElementsByXPath(WebDriver* driver, WebElement* element, const wchar_t* xpath, ElementCollection** out)
{
	*out = NULL;
	if (!driver || !driver->ie) { return ENOSUCHDRIVER; }

	try {
		clock_t end = endAt(driver);
		int result = EUNHANDLEDERROR;

		do {

			result = injectXPathEngine(driver);
			if (result != SUCCESS) {
				continue;
			}

			// Call it
			std::wstring query;
			if (element)
				query += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res;};})();";
			else
				query += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res;};})();";

			// We need to use the raw functions because we don't allow random objects
			// to be returned from the executeScript method normally
			SAFEARRAYBOUND bounds;
			bounds.cElements = 2;
			bounds.lLbound = 0;
			SAFEARRAY* queryArgs = SafeArrayCreate(VT_VARIANT, 1, &bounds);

			CComVariant queryArg(xpath);
			LONG index = 0;
			SafeArrayPutElement(queryArgs, &index, &queryArg);
		
			if (element) {
				CComVariant elementArg(element->element->getWrappedElement());
				LONG index = 1;
				SafeArrayPutElement(queryArgs, &index, &elementArg);
			}

			CComVariant snapshot;
			result = driver->ie->executeScript(query.c_str(), queryArgs, &snapshot);
			SafeArrayDestroy(queryArgs);
			if (result != SUCCESS) {
				continue;
			}

			bounds.cElements = 1;
			SAFEARRAY* lengthArgs = SafeArrayCreate(VT_VARIANT, 1, &bounds);
			index = 0;
			SafeArrayPutElement(lengthArgs, &index, &snapshot);
			CComVariant lengthVar;
			result = driver->ie->executeScript(L"(function(){return function() {return arguments[0].snapshotLength;}})();", lengthArgs, &lengthVar);
			SafeArrayDestroy(lengthArgs);
			if (result != SUCCESS) {
				continue;
			}

			if (lengthVar.vt != VT_I4) {
				result = EUNEXPECTEDJSERROR;
				continue;
			}

			long length = lengthVar.lVal;

			bounds.cElements = 2;
			SAFEARRAY* snapshotArgs = SafeArrayCreate(VT_VARIANT, 1, &bounds);
			index = 0;
			SafeArrayPutElement(snapshotArgs, &index, &snapshot);
		
			ElementCollection* elements = new ElementCollection();
			elements->elements = new std::vector<ElementWrapper*>();

			index = 1;
			for (long i = 0; i < length; i++) {
				ScriptArgs* getElemArgs;
				wdNewScriptArgs(&getElemArgs, 2);
				// Cheat
				index = 0;
				SafeArrayPutElement(getElemArgs->args, &index, &snapshot);
				getElemArgs->currentIndex++;
				wdAddNumberScriptArg(getElemArgs, i);

				ScriptResult* getElemRes;
				wdExecuteScript(driver, L"(function(){return function() {return arguments[0].iterateNext();}})();", getElemArgs, &getElemRes);
				WebElement* e;
				wdGetElementScriptResult(getElemRes, driver, &e);
				elements->elements->push_back(e->element);
				wdFreeScriptArgs(getElemArgs);
			}
			SafeArrayDestroy(queryArgs);

			*out = elements;
			return SUCCESS;
		} while (clock() < end);

		return result;
	} END_TRY;
}


int wdNewScriptArgs(ScriptArgs** scriptArgs, int maxLength) 
{
	*scriptArgs = NULL;
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

	CComVariant dest(arg);
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

int wdAddDoubleScriptArg(ScriptArgs* scriptArgs, double number)
{
	VARIANT dest;
	dest.vt = VT_R8;
	dest.dblVal = (DOUBLE) number;	

	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdAddElementScriptArg(ScriptArgs* scriptArgs, WebElement* element)
{
	VARIANT dest;
	VariantClear(&dest);

	if (!element || !element->element) {
		dest.vt = VT_EMPTY;
	} else {
		dest.vt = VT_DISPATCH;
		dest.pdispVal = element->element->getWrappedElement();
	}

	LONG index = scriptArgs->currentIndex;
	SafeArrayPutElement(scriptArgs->args, &index, &dest);

	scriptArgs->currentIndex++;

	return SUCCESS;
}

int wdExecuteScript(WebDriver* driver, const wchar_t* script, ScriptArgs* scriptArgs, ScriptResult** scriptResultRef) 
{
	try {
		*scriptResultRef = NULL;
		CComVariant result;
		int res = driver->ie->executeScript(script, scriptArgs->args, &result);
		if (res != SUCCESS) {
			return res;
		}

		ScriptResult* toReturn = new ScriptResult();
		HRESULT hr = VariantCopy(&(toReturn->result), &result);
		if (!SUCCEEDED(hr) && result.vt == VT_USERDEFINED) {
			// Special handling of the user defined path *sigh*
			toReturn->result.vt = VT_USERDEFINED;
			toReturn->result.bstrVal = CComBSTR(result.bstrVal);
		}
		*scriptResultRef = toReturn;

		return SUCCESS;
	} END_TRY;
}

int wdGetScriptResultType(WebDriver* driver, ScriptResult* result, int* type)
{
	if (!result) { return ENOSCRIPTRESULT; }

	switch (result->result.vt) {
		case VT_BSTR:
			*type = TYPE_STRING;
			break;

		case VT_I4:
		case VT_I8:
			*type = TYPE_LONG;
			break;

		case VT_BOOL:
			*type = TYPE_BOOLEAN;
			break;

		case VT_DISPATCH:
			{
			  LPCWSTR itemType = driver->ie->getScriptResultType(&(result->result));
			  std::string itemTypeStr;
			  cw2string(itemType, itemTypeStr);

			  LOG(DEBUG) << "Got type: " << itemTypeStr;
			  // If it's a Javascript array or an HTML Collection - type 8 will
			  // indicate the driver that this is ultimately an array.
			  if ((itemTypeStr == "JavascriptArray") ||
			      (itemTypeStr == "HtmlCollection")) {
			    *type = TYPE_ARRAY;
			  } else {
			    *type = TYPE_ELEMENT;
			  }
			}
			break;

		case VT_EMPTY:
			*type = TYPE_EMPTY;
			break;

		case VT_USERDEFINED:
			*type = TYPE_EXCEPTION;
			break;

		case VT_R4:
		case VT_R8:
			*type = TYPE_DOUBLE;
			break;

		default:
			return EUNKNOWNSCRIPTRESULT;
	}

	return SUCCESS;
}

int wdGetStringScriptResult(ScriptResult* result, StringWrapper** wrapper)
{
	*wrapper = NULL;
	if (!result) { return ENOSCRIPTRESULT; }

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
	if (!result) { return ENOSCRIPTRESULT; }

	*value = result->result.lVal;

	return SUCCESS;
}

int wdGetDoubleScriptResult(ScriptResult* result, double* value)
{
	if (!result) { return ENOSCRIPTRESULT; }

	*value = result->result.dblVal;

	return SUCCESS;
}

int wdGetBooleanScriptResult(ScriptResult* result, int* value) 
{
	if (!result) { return ENOSCRIPTRESULT; }

	*value = result->result.boolVal == VARIANT_TRUE ? 1 : 0;

	return SUCCESS;
}

int wdGetElementScriptResult(ScriptResult* result, WebDriver* driver, WebElement** element)
{
	*element = NULL;
	if (!result) { return ENOSCRIPTRESULT; }

	IHTMLElement *node = (IHTMLElement*) result->result.pdispVal;
	WebElement* toReturn = new WebElement();
	toReturn->element = new ElementWrapper(driver->ie, node);

	*element = toReturn;

	return SUCCESS;
}

int wdGetArrayLengthScriptResult(WebDriver* driver, ScriptResult* result,
                                 int* length)
{
  // Prepare an array for the Javascript execution, containing only one
  // element - the original returned array from a JS execution.
  SAFEARRAYBOUND lengthQuery;
  lengthQuery.cElements = 1;
  lengthQuery.lLbound = 0;
  SAFEARRAY* lengthArgs = SafeArrayCreate(VT_VARIANT, 1, &lengthQuery);
  LONG index = 0;
  SafeArrayPutElement(lengthArgs, &index, &(result->result));
  CComVariant lengthVar;
  int lengthResult = driver->ie->executeScript(
      L"(function(){return function() {return arguments[0].length;}})();",
      lengthArgs, &lengthVar);
  SafeArrayDestroy(lengthArgs);
  if (lengthResult != SUCCESS) {
    return lengthResult;
  }

  // Expect the return type to be an integer. A non-integer means this was
  // not an array after all.
  if (lengthVar.vt != VT_I4) {
    return EUNEXPECTEDJSERROR;
  }

  *length = lengthVar.lVal;

  return SUCCESS;
}

int wdGetArrayItemFromScriptResult(WebDriver* driver, ScriptResult* result,
                                   int index, ScriptResult** arrayItem)
{
  // Prepare an array for Javascript execution. The array contains the original
  // array returned from a previous execution and the index of the item required
  // from that array.
  ScriptArgs* getItemArgs;
  wdNewScriptArgs(&getItemArgs, 2);
  LONG argIndex = 0;
  // Original array.
  SafeArrayPutElement(getItemArgs->args, &argIndex, &(result->result));
  getItemArgs->currentIndex++;
  // Item index
  wdAddNumberScriptArg(getItemArgs, index);

  int execRes = wdExecuteScript(
      driver,
      L"(function(){return function() {return arguments[0][arguments[1]];}})();",
      getItemArgs, arrayItem);

  wdFreeScriptArgs(getItemArgs);
  getItemArgs = NULL;
  return execRes;
}


int wdeMouseDownAt(HWND hwnd, long windowX, long windowY)
{
	mouseDownAt(hwnd, windowX, windowY);
	return SUCCESS;
}

int wdeMouseUpAt(HWND hwnd, long windowX, long windowY)
{
	mouseUpAt(hwnd, windowX, windowY);
	return SUCCESS;
}

int wdeMouseMoveTo(HWND hwnd, long duration, long fromX, long fromY, long toX, long toY)
{
	mouseMoveTo(hwnd, duration, fromX, fromY, toX, toY);
	return SUCCESS;
}

int wdCaptureScreenshotAsBase64(WebDriver* driver, StringWrapper** result) {
	*result = NULL;
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	try {
		const std::wstring originalString(driver->ie->captureScreenshotAsBase64());
		size_t length = originalString.length() + 1;
		wchar_t* toReturn = new wchar_t[length];

		wcscpy_s(toReturn, length, originalString.c_str());

		StringWrapper* res = new StringWrapper();
		res->text = toReturn;
		
		*result = res;

		return SUCCESS;
	} END_TRY;
}

int wdSetImplicitWaitTimeout(WebDriver* driver, long timeoutInMillis)
{
	if (!driver || !driver->ie) return ENOSUCHDRIVER;

	driver->implicitWaitTimeout = timeoutInMillis;

	return SUCCESS;
}

}