#pragma once

#include <Exdisp.h>
#include <mshtml.h>
#include "IeWrapper.h"
#include "com_thoughtworks_webdriver_ie_InternetExplorerElement.h"

class IeWrapper;

class ElementWrapper
{
public:
	ElementWrapper(IeWrapper* ie, IHTMLDOMNode *node);
	~ElementWrapper();

	const char* getAttribute(const char* name);
	const char* getValue();
	bool isSelected();
	void setSelected();
	bool isEnabled();
	bool toggle();
	const char* getText();

	void click();
	void submit();

	void setNode(IHTMLDOMNode* fromNode);

private:
	const char* getTextAreaValue();
	bool isCheckbox();
	IHTMLFormElement* findParentForm();

	IeWrapper* ie;
	IHTMLElement* element;
};
