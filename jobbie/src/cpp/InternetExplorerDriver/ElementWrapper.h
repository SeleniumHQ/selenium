#pragma once

#include <Exdisp.h>
#include <mshtml.h>
#include "com_thoughtworks_webdriver_ie_InternetExplorerElement.h"

class ElementWrapper
{
public:
	ElementWrapper(IHTMLDOMNode *node);
	~ElementWrapper();

	const char* getAttribute(const char* name);
	const char* getValue();

private:
	IHTMLDOMNode* node;
	const char* getTextAreaValue();
};
