#pragma once

#include <Exdisp.h>
#include <mshtml.h>
#include <string>
#include <vector>
#include "InternetExplorerDriver.h"
#include "com_thoughtworks_webdriver_ie_InternetExplorerElement.h"

class InternetExplorerDriver;

class ElementWrapper
{
public:
	ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode *node);
	~ElementWrapper();

	const wchar_t* getAttribute(const wchar_t* name);
	const wchar_t* getValue();
	InternetExplorerDriver* setValue(wchar_t* newValue);
	bool isSelected();
	InternetExplorerDriver* setSelected();
	bool isEnabled();
	bool isDisplayed();
	bool toggle();
	const std::wstring getText();

	long getX();
	long getY();
	long getWidth();
	long getHeight();

	InternetExplorerDriver* click();
	InternetExplorerDriver* submit();

	std::vector<ElementWrapper*>* getChildrenWithTagName(const wchar_t* tagName);

	void setNode(IHTMLDOMNode* fromNode);

private:
	void setInputFileValue(wchar_t* newValue);
	const wchar_t* getTextAreaValue();
	bool isCheckbox();
	IHTMLFormElement* findParentForm();
	IHTMLEventObj* newEventObject();
	void fireEvent(IHTMLEventObj*, const OLECHAR*);
	void fireEvent(IHTMLDOMNode* fireFrom, IHTMLEventObj*, const OLECHAR*);

	void getText(std::wstring& toReturn, IHTMLDOMNode* node, std::wstring& textSoFar, bool isPreformatted);
	std::wstring collapseWhitespace(const std::wstring& text);
	bool isBlockLevel(IHTMLDOMNode *node);

	void keyPress(short keyCode);
	void keyPress(short keyCode, bool shouldRelease);

	InternetExplorerDriver* ie;
	IHTMLElement* element;
};

