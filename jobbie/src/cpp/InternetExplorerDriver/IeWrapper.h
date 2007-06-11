#pragma once
#ifndef IeWrapper_h
#define IeWrapper_h

#include <Exdisp.h>
#include <mshtml.h>
#include "ElementWrapper.h"

class IeWrapper
{
public:
	IeWrapper();
	~IeWrapper();

	bool getVisible();
	void setVisible(bool isShown);

	const char *getCurrentUrl();

	const char* getTitle();
	void get(const char *url);

	ElementWrapper* selectElementById(const char *elementId);
	ElementWrapper* selectElementByLink(const char *elementLink);
	IHTMLDocument2* getDocument();

	void waitForNavigateToFinish();

private:
	IHTMLDocument3* getDocument3();
	IWebBrowser2* ie;
};

#endif