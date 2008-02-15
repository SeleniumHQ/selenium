#include "StdAfx.h"

#include <iostream>

#include <comutil.h>
#include <comdef.h>

#include "ElementWrapper.h"
#include "utils.h"

ElementWrapper::ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode* node)
	: element(node)
{
	this->ie = ie;
}

ElementWrapper::~ElementWrapper()
{
}

std::wstring ElementWrapper::getAttribute(const std::wstring& name) 
{
	CComBSTR attributeName;
	if (_wcsicmp(L"class", name.c_str()) == 0) {
		attributeName = L"className";
	} else {
		attributeName = name.c_str();
	}

	CComVariant value;
	element->getAttribute(attributeName, 0, &value);
	return variant2wchar(value);
}

std::wstring ElementWrapper::getValue()
{
	CComBSTR temp;
	element->get_tagName(&temp);
	std::wstring name(bstr2wstring(temp));

	if (_wcsicmp(L"textarea", name.c_str()) == 0)
		return getTextAreaValue();

	return getAttribute(L"value");
}

void ElementWrapper::sendKeys(const std::wstring& newValue)
{
	bool initialVis = ie->getVisible();
	// Bring the IE window to the front.
	ie->bringToFront();

	VARIANT top;
	top.vt = VT_BOOL;
	top.boolVal = VARIANT_TRUE;

	element->scrollIntoView(top);

	CComQIPtr<IHTMLElement2> element2(element);
	element2->focus();
	
	// Allow the element to actually get the focus
	Sleep(10);

	for (const wchar_t *p = newValue.c_str(); *p; ++p)
	{
		wchar_t c = *p;

		if (c == '\r')
			continue;

		WORD keyCode = 0;
	
		bool needsShift = false;
		
		keyCode = VkKeyScan(c);
		needsShift = (keyCode & (1 << 8)) ? true : false;  // VK_LSHIFT

		INPUT input;
		input.type = INPUT_KEYBOARD;
		input.ki.time = 0;
		input.ki.wScan = 0;
		input.ki.dwFlags = KEYEVENTF_EXTENDEDKEY;
		input.ki.dwExtraInfo = 0;
		input.ki.wVk = keyCode;

		if (needsShift) 
		{
			input.ki.wVk = VK_LSHIFT;
			SendInput(1, &input, sizeof(INPUT));
			Sleep(5);
		}

		input.ki.wVk = keyCode;
		SendInput(1, &input, sizeof(INPUT));

		input.ki.dwFlags = KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP;
		SendInput(1, &input, sizeof(INPUT));

		if (needsShift) 
		{
			input.ki.wVk = VK_LSHIFT;
			SendInput(1, &input, sizeof(INPUT));
		}
		Sleep(5);

	}

	element2->blur();

	ie->setVisible(initialVis);
}

void ElementWrapper::clear()
{
	CComQIPtr<IHTMLElement2> element2(element);

	CComBSTR valueAttributeName(L"value");
	VARIANT empty;
	CComBSTR emptyBstr(L"");
	empty.vt = VT_BSTR;
	empty.bstrVal = (BSTR)emptyBstr;
	element->setAttribute(valueAttributeName, empty, 0);

	Sleep(5);
}

bool ElementWrapper::isSelected()
{
	CComQIPtr<IHTMLOptionElement> option(element);
	if (option) {
		VARIANT_BOOL isSelected;
		option->get_selected(&isSelected);
		return isSelected == VARIANT_TRUE;
	}

	if (isCheckbox()) {
		CComQIPtr<IHTMLInputElement> input(element);

		VARIANT_BOOL isChecked;
		input->get_checked(&isChecked);
		return isChecked == VARIANT_TRUE;
	}

	return false;
}

void ElementWrapper::setSelected()
{
	bool currentlySelected = isSelected();

	/* TODO(malcolmr): Why not: if (isSelected()) return; ? Do we really need to re-set 'checked=true' for checkbox and do effectively nothing for select?
	   Maybe we should check for disabled elements first? */

	if (isCheckbox()) {

		if (!isSelected()) {
			click();
		}

		CComBSTR checked(L"checked");
		VARIANT isChecked;
		CComBSTR isTrue(L"true");
		isChecked.vt = VT_BSTR;
		isChecked.bstrVal = (BSTR)isTrue;
		element->setAttribute(checked, isChecked, 0);

		if (currentlySelected != isSelected()) {
			CComPtr<IHTMLEventObj> eventObj(newEventObject());
			fireEvent(eventObj, L"onchange");
		}

		return;
    }

	CComQIPtr<IHTMLOptionElement> option(element);
	if (option) {
		option->put_selected(VARIANT_TRUE);
		
		// Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		CComQIPtr<IHTMLDOMNode> node(element);
		CComPtr<IHTMLDOMNode> parent;
		node->get_parentNode(&parent);

		if (currentlySelected != isSelected()) {
			CComPtr<IHTMLEventObj> eventObj(newEventObject());
			fireEvent(parent, eventObj, L"onchange");
		}
		
		return;
	}

	if (!this->isEnabled()) 
		throw "Unable to select a disabled element";
	throw "Unable to select element.";
}

bool ElementWrapper::isEnabled() 
{
	CComQIPtr<IHTMLElement3> elem3(element);
	VARIANT_BOOL isDisabled;
	elem3->get_disabled(&isDisabled);
	return !isDisabled;
}

bool ElementWrapper::isDisplayed()
{
	bool toReturn = true;

	CComPtr<IHTMLElement> e(element);
	do {
		CComQIPtr<IHTMLElement2> e2(e);

		CComPtr<IHTMLCurrentStyle> style;
		CComBSTR display;
		CComBSTR visible;

		e2->get_currentStyle(&style);
		style->get_display(&display);
		style->get_visibility(&visible);

		std::wstring displayValue = bstr2wstring(display);
		std::wstring visibleValue = bstr2wstring(visible);

		int isDisplayed = _wcsicmp(L"none", displayValue.c_str());
		int isVisible = _wcsicmp(L"hidden", visibleValue.c_str());

		toReturn &= isDisplayed != 0 && isVisible != 0;

		CComPtr<IHTMLElement> parent;
		e->get_parentElement(&parent);
		e = parent;
	} while (e && toReturn);

	return toReturn;
}

bool ElementWrapper::toggle()
{
	click();
	return isSelected();
}

long ElementWrapper::getX() 
{
	long totalX = 0;
	long x;

	element->get_offsetLeft(&x);
	totalX += x;

	IHTMLElement* parent;
	element->get_offsetParent(&parent);

	CComBSTR table(L"TABLE");
	CComBSTR body(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			CComQIPtr<IHTMLElement2> parent2(parent);
				
			parent2->get_clientLeft(&x);
			totalX += x;
		}

		parent->get_offsetLeft(&x);
		totalX += x;

		CComPtr<IHTMLElement> t;
		parent->get_offsetParent(&t);
		parent = t;
	}

	return totalX;
}

long ElementWrapper::getY() 
{
	long totalY = 0;
	long y;

	element->get_offsetTop(&y);
	totalY += y;

	IHTMLElement* parent;
	element->get_offsetParent(&parent);

	CComBSTR table(L"TABLE");
	CComBSTR body(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			CComQIPtr<IHTMLElement2> parent2(parent);
				
			parent2->get_clientTop(&y);
			totalY += y;
		}

		parent->get_offsetLeft(&y);
		totalY += y;

		CComPtr<IHTMLElement> t;
		parent->get_offsetParent(&t);
		parent = t;
	}

	return totalY;
}

long ElementWrapper::getWidth() 
{
	long width;
	element->get_offsetWidth(&width);
	return width;
}

long ElementWrapper::getHeight() 
{
	long height;
	element->get_offsetHeight(&height);
	return height;
}

std::wstring ElementWrapper::getText() 
{
	CComBSTR tagName;
	element->get_tagName(&tagName);
	bool isTitle = tagName == L"TITLE";
	bool isPre = tagName == L"PRE";

	if (isTitle)
	{
		return ie->getTitle();
	}

	CComQIPtr<IHTMLDOMNode> node(element); 
	std::wstring toReturn(L"");
	getText(toReturn, node, isPre);

	/* Trim leading and trailing whitespace and line breaks. */
	std::wstring::const_iterator itStart = toReturn.begin();
	while (itStart != toReturn.end() && iswspace(*itStart)) {
		++itStart;
	}

	std::wstring::const_iterator itEnd = toReturn.end();
	while (itStart < itEnd) {
		--itEnd;
		if (!iswspace(*itEnd)) {
			++itEnd;
			break;
		}
	}

	return std::wstring(itStart, itEnd);
}

/* static */ void ElementWrapper::getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted)
{
	if (isBlockLevel(node)) {
		collapsingAppend(toReturn, L"\r\n");
	}

	CComPtr<IDispatch> dispatch;
	node->get_childNodes(&dispatch);
	CComQIPtr<IHTMLDOMChildrenCollection> children(dispatch);

	if (!children)
		return;

	long length = 0;
	children->get_length(&length);
	for (long i = 0; i < length; i++) 
	{
		CComPtr<IDispatch> dispatch2;
		children->item(i, &dispatch2);
		CComQIPtr<IHTMLDOMNode> child(dispatch2);

		CComBSTR childName;
		child->get_nodeName(&childName);
		
		CComQIPtr<IHTMLDOMTextNode> textNode(child);
		if (textNode) {
			CComBSTR text;
			textNode->get_data(&text);

			for (unsigned int i = 0; i < text.Length(); i++) {
				if (text[i] == 160) {
					text[i] = L' ';
				}
			}

			collapsingAppend(toReturn, isPreformatted ? bstr2wstring(text) : collapseWhitespace(text));
		} else if (wcscmp(childName, L"PRE") == 0) {
			getText(toReturn, child, true);
		} else {
			getText(toReturn, child, false);
		}
	}

	if (isBlockLevel(node)) {
		collapsingAppend(toReturn, L"\r\n");
	}
}

// Append s2 to s, collapsing intervening whitespace.
// Assumes that s and s2 have already been internally collapsed.
/*static*/ void ElementWrapper::collapsingAppend(std::wstring& s, const std::wstring& s2)
{
	if (s.empty() || s2.empty()) {
		s += s2;
		return;
	}

	// \r\n abutting \r\n collapses.
	if (s.length() >= 2 && s2.length() >= 2) {
		if (s[s.length() - 2] == '\r' && s[s.length() - 1] == '\n' &&
			s2[0] == '\r' && s2[1] == '\n') {
			s += s2.substr(2);
			return;
		}
	}

	// wspace abutting wspace collapses into a space character.
	if ((iswspace(s[s.length() - 1]) && s[s.length() - 1] != '\n') &&
		(iswspace(s2[0]) && s[0] != '\r')) {
		s += s2.substr(1);
		return;
	}

	s += s2;
}

/*static*/ std::wstring ElementWrapper::collapseWhitespace(const wchar_t *text)
{
	std::wstring toReturn(L"");
	int previousWasSpace = false;
	wchar_t previous = 'X';
	bool newlineAlreadyAppended = false;

	// Need to keep an eye out for '\r\n'
	for (unsigned int i = 0; i < wcslen(text); i++) {
		wchar_t c = text[i];
		int currentIsSpace = iswspace(c);

		// Append the character if the previous was not whitespace
		if (!(currentIsSpace && previousWasSpace)) {
			toReturn += c;
			newlineAlreadyAppended = false;
		} else if (previous == '\r' && c == '\n' && !newlineAlreadyAppended) {
			// If the previous char was '\r' and current is '\n' 
			// and we've not already appended '\r\n' append '\r\n'.

			// The previous char was '\r' and has already been appended and 
			// the current character is '\n'. Just appended that.
			toReturn += c; 
			newlineAlreadyAppended = true;
		}
		
		previousWasSpace = currentIsSpace;
		previous = c;
	}

	return toReturn;
}

std::wstring ElementWrapper::getTextAreaValue() 
{
	CComQIPtr<IHTMLTextAreaElement> textarea(element);
	CComBSTR result;
	textarea->get_value(&result);

	return bstr2wstring(result);
}

/*static */ bool ElementWrapper::isBlockLevel(IHTMLDOMNode *node)
{
	CComQIPtr<IHTMLElement> e(node);

	if (e) {
		BSTR tagName;
		e->get_tagName(&tagName);

		bool isBreak = false;
		if (!wcscmp(L"BR", tagName)) {
			isBreak = true;
		}

		SysFreeString(tagName);
		if (isBreak) {
			return true;
		}
	}

	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2(node);
	if (!element2) {
		return false;
	}

	IHTMLCurrentStyle* style;
	element2->get_currentStyle(&style);

	if (!style) {
		return false;
	}

	CComQIPtr<IHTMLCurrentStyle2, &__uuidof(IHTMLCurrentStyle2)> style2(style);
	style->Release();

	if (!style2) {
		return false;
	}

	VARIANT_BOOL isBlock;
	style2->get_isBlock(&isBlock);

	return isBlock == VARIANT_TRUE;
}

void ElementWrapper::click()
{
	CComQIPtr<IHTMLDOMNode2, &__uuidof(IHTMLDOMNode2)> node = element;
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc;

	IDispatch* dispatch;
	node->get_ownerDocument(&dispatch);
	doc = dispatch;
	dispatch->Release();

	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3;
	element3 = element;

	IHTMLEventObj* eventObject;
	VARIANT empty;
	VariantInit(&empty);
	doc->createEventObject(&empty, &eventObject);

	VARIANT eventref;
	VariantInit(&eventref);
    V_VT(&eventref) = VT_DISPATCH;
    V_DISPATCH(&eventref) = eventObject;

	VARIANT_BOOL cancellable;
	BSTR mouseDown = SysAllocString(L"onmousedown");
	BSTR mouseUp = SysAllocString(L"onmouseup");
	element3->fireEvent(mouseDown, &eventref, &cancellable);
	element3->fireEvent(mouseUp, &eventref, &cancellable);
	SysFreeString(mouseDown);
	SysFreeString(mouseUp);

	element->click();

	VariantClear(&eventref);

	ie->waitForNavigateToFinish();
}

void ElementWrapper::submit()
{
	CComQIPtr<IHTMLFormElement> form(element);
	if (form) {
		form->submit();
	} else {
		CComQIPtr<IHTMLInputElement> input(element);
		if (input) {
			CComBSTR typeName;
			input->get_type(&typeName);
			std::wstring type = bstr2wstring(typeName);

			if (_wcsicmp(L"submit", type.c_str()) == 0 || _wcsicmp(L"image", type.c_str()) == 0) {
				click();
			} else {
				CComPtr<IHTMLFormElement> form2;
				input->get_form(&form2);
				form2->submit();
			}
		} else {
			findParentForm(&form);
			if (!form) {
				throw "Unable to find the containing form";
			} 
			form->submit();
		}
	}

	ie->waitForNavigateToFinish();
}

bool ElementWrapper::isCheckbox()
{
	CComQIPtr<IHTMLInputElement> input(element);
	if (!input) {
		return false;
	}

	CComBSTR typeName;
	input->get_type(&typeName);
	std::wstring type = bstr2wstring(typeName);
	return _wcsicmp(type.c_str(), L"checkbox") == 0;
}

void ElementWrapper::findParentForm(IHTMLFormElement **pform)
{
	CComPtr<IHTMLElement> current(element);

	while (current) {
		CComQIPtr<IHTMLFormElement> form(current);
		if (form) {
			*pform = form.Detach();
			return;
		}

		CComPtr<IHTMLElement> temp;
		current->get_parentElement(&temp);
		current = temp;
    }
}

std::vector<ElementWrapper*>* ElementWrapper::getChildrenWithTagName(const std::wstring& tagName) 
{
	CComQIPtr<IHTMLElement2> element2(element);
	CComBSTR name(tagName.c_str());
	CComPtr<IHTMLElementCollection> elementCollection;
	element2->getElementsByTagName(name, &elementCollection);

	long length = 0;
	elementCollection->get_length(&length);

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	for (int i = 0; i < length; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;

		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);
		CComQIPtr<IHTMLDOMNode> node(dispatch);

		toReturn->push_back(new ElementWrapper(ie, node));
	}

	return toReturn;
}

IHTMLEventObj* ElementWrapper::newEventObject() 
{
	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4> doc(dispatch);
	dispatch->Release();
		
	VARIANT empty;
	VariantInit(&empty);
	IHTMLEventObj* eventObject;
	doc->createEventObject(&empty, &eventObject);
	return eventObject;
}

void ElementWrapper::fireEvent(IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	CComQIPtr<IHTMLDOMNode> node = element;
	fireEvent(node, eventObject, eventName);
}

void ElementWrapper::fireEvent(IHTMLDOMNode* fireOn, IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	VARIANT eventref;
	VariantInit(&eventref);
	V_VT(&eventref) = VT_DISPATCH;
	V_DISPATCH(&eventref) = eventObject;

	BSTR onChange = SysAllocString(eventName);
	VARIANT_BOOL cancellable;

	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3 = fireOn;
	element3->fireEvent(onChange, &eventref, &cancellable);

	SysFreeString(onChange);
}
