#pragma once

#include <Exdisp.h>
#include <mshtml.h>
#include <vector>
#include "IeWrapper.h"
#include "com_thoughtworks_webdriver_ie_InternetExplorerElement.h"

class IeWrapper;

class ElementWrapper
{
public:
	ElementWrapper(IeWrapper* ie, IHTMLDOMNode *node);
	~ElementWrapper();

	const wchar_t* getAttribute(const wchar_t* name);
	const wchar_t* getValue();
	void setValue(wchar_t* newValue);
	bool isSelected();
	void setSelected();
	bool isEnabled();
	bool toggle();
	const wchar_t* getText();

	void click();
	void submit();

	std::vector<ElementWrapper*>* getChildrenWithTagName(const wchar_t* tagName);

	void setNode(IHTMLDOMNode* fromNode);

private:
	const wchar_t* getTextAreaValue();
	bool isCheckbox();
	IHTMLFormElement* findParentForm();

	IeWrapper* ie;
	IHTMLElement* element;
};
