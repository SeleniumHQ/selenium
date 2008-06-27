#pragma once

#include <string>
#include <vector>

#include <Exdisp.h>
#include <mshtml.h>

#include "InternetExplorerDriver.h"
#include "org_openqa_selenium_ie_InternetExplorerElement.h"

class InternetExplorerDriver;

class ElementWrapper
{
public:
	ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode *node);
	~ElementWrapper();

	std::wstring getAttribute(const std::wstring& name);
	std::wstring getValue();
	void sendKeys(const std::wstring& newValue);
	void clear();
	bool isSelected();
	void setSelected();
	bool isEnabled();
	bool isDisplayed();
	bool toggle();
	std::wstring getText();
	std::wstring getValueOfCssProperty(const std::wstring& propertyName);

	long getX();
	long getY();
	long getWidth();
	long getHeight();

	void click();
	void submit();

	std::vector<ElementWrapper*>* getChildrenWithTagName(const std::wstring& tagName);

private:
	std::wstring getTextAreaValue();
	bool isCheckbox();
	void findParentForm(IHTMLFormElement **pform);
	IHTMLEventObj* newEventObject();
	void fireEvent(IHTMLEventObj*, const OLECHAR*);
	void fireEvent(IHTMLDOMNode* fireFrom, IHTMLEventObj*, const OLECHAR*);

	static void getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted);
	static void collapsingAppend(std::wstring& s, const std::wstring& s2);
	static std::wstring collapseWhitespace(const wchar_t *text);
	static bool isBlockLevel(IHTMLDOMNode *node);

	InternetExplorerDriver* ie;
	CComQIPtr<IHTMLElement> element;
};

