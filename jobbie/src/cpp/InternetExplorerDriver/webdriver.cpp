#include "stdafx.h"
#include "webdriver.h"
#include "InternetExplorerDriver.h"
#include "utils.h"
#include <stdio.h>

struct WebDriver {
       InternetExplorerDriver *ie;
};

struct WebElement {
		ElementWrapper *element;
};

extern "C"
{
WebDriver* webdriver_newDriverInstance()
{
	startCom();
    WebDriver *driver = new WebDriver();
   
    driver->ie = new InternetExplorerDriver();
	driver->ie->setVisible(true);

    return driver;
}

void webdriver_deleteDriverInstance(WebDriver* driver)
{
	driver->ie->close();
    delete driver->ie;
    delete driver;
}

void webdriver_get(WebDriver* driver, wchar_t* url)
{
	driver->ie->get(url);
}

void webdriver_close(WebDriver* driver)
{
	driver->ie->close();
}

const wchar_t* webdriver_getCurrentUrl(WebDriver* driver)
{
	driver->ie->getCurrentUrl();

	const std::wstring originalString(driver->ie->getCurrentUrl());
	size_t length = originalString.length() + 1;
	wchar_t* toReturn = new wchar_t[length];

	wcscpy_s(toReturn, length, originalString.c_str());
	return toReturn;
}

}