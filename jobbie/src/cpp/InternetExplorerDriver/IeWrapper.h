#pragma once
#ifndef IeWrapper_h
#define IeWrapper_h

#include <Exdisp.h>
#include <mshtml.h>
#include <string>
#include "ElementWrapper.h"

class ElementWrapper;

class IeWrapper
{
public:
	IeWrapper();
	~IeWrapper();

	bool getVisible();
	void setVisible(bool isShown);

	const wchar_t* getCurrentUrl();

	const wchar_t* getTitle();
	void get(const wchar_t* url);

	ElementWrapper* selectElementById(const wchar_t *elementId);
	ElementWrapper* selectElementByLink(const wchar_t *elementLink);
	IHTMLDocument2* getDocument();

	void waitForNavigateToFinish();

private:
	IHTMLDocument3* getDocument3();
	IWebBrowser2* ie;
};

#endif