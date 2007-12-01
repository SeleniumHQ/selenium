
#include "StdAfx.h"
#include "ElementWrapper.h"
#include "utils.h"
#include <iostream>

using namespace std;

#include <comutil.h>
#include <comdef.h>

ElementWrapper::ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode* node)
{
	node->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
	this->ie = ie;
}

ElementWrapper::~ElementWrapper()
{
	element->Release();
}

const wchar_t* ElementWrapper::getAttribute(const wchar_t* name) 
{
	wchar_t *lookFor = (wchar_t *)name;

	if (_wcsicmp(L"class", name) == 0) {
		lookFor = L"className";
	}

	BSTR attributeName = SysAllocString(lookFor);
	VARIANT value;
	element->getAttribute(attributeName, 0, &value);
	const wchar_t* toReturn = variant2wchar(value);
	VariantClear(&value);
	return toReturn;
}

const wchar_t* ElementWrapper::getValue()
{
	BSTR temp;
	element->get_tagName(&temp);
	const wchar_t *name = bstr2wchar(temp);
	SysFreeString(temp);

	int value = _wcsicmp(L"textarea", name);
	delete name;

	if (value == 0) 
		return this->getTextAreaValue();
	return this->getAttribute(L"value");
}

InternetExplorerDriver* ElementWrapper::setValue(wchar_t* newValue)
{
	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc = dispatch;
	dispatch->Release();
	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3 = element;

	VARIANT empty;
	VariantInit(&empty);

	size_t length = wcslen(newValue);

	CComBSTR valueAttributeName = SysAllocString(L"value");
	VARIANT reallyNewValue;
	VariantInit(&reallyNewValue);
	reallyNewValue.vt = VT_BSTR;
	reallyNewValue.bstrVal = SysAllocString(L"");
	element->setAttribute(valueAttributeName, reallyNewValue, 0);
	VariantClear(&reallyNewValue);

	CComBSTR onKeyDown = SysAllocString(L"onkeydown");
	CComBSTR onKeyPress = SysAllocString(L"onkeypress");
	CComBSTR onKeyUp = SysAllocString(L"onkeyup");
	VARIANT_BOOL cancellable;

	for (size_t i = 0; i < length; i++) {
		VariantInit(&reallyNewValue);
		reallyNewValue.vt = VT_BSTR;
		wchar_t* t = new wchar_t[i+2];
		wcsncpy_s(t, i+2, newValue, i+1);
		t[i+1] = '\0';
		reallyNewValue.bstrVal = SysAllocString(t);

		IHTMLEventObj* eventObject;
		doc->createEventObject(&empty, &eventObject);
		eventObject->put_keyCode((long) newValue[i]);

		VARIANT eventref;
		VariantInit(&eventref);
		V_VT(&eventref) = VT_DISPATCH;
		V_DISPATCH(&eventref) = eventObject;


        element3->fireEvent(onKeyDown, &eventref, &cancellable);
        element3->fireEvent(onKeyPress, &eventref, &cancellable);
		element->setAttribute(valueAttributeName, reallyNewValue, 0);
        element3->fireEvent(onKeyUp, &eventref, &cancellable);

		delete t;
		VariantClear(&eventref);
		VariantClear(&reallyNewValue);
	}

	VariantClear(&reallyNewValue);

	return new InternetExplorerDriver(ie);
}

bool ElementWrapper::isSelected()
{
	IHTMLOptionElement* option = NULL;
	element->QueryInterface(__uuidof(IHTMLOptionElement), (void**)&option);
	if (option != NULL) {
		VARIANT_BOOL isSelected;
		option->get_selected(&isSelected);
		option->Release();
		return isSelected == VARIANT_TRUE;
	}

	if (isCheckbox()) {
		IHTMLInputElement* input;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		VARIANT_BOOL isChecked;
		input->get_checked(&isChecked);
		input->Release();

		return isChecked == VARIANT_TRUE;
	}

	return false;
}

InternetExplorerDriver* ElementWrapper::setSelected()
{
	bool currentlySelected = isSelected();

	if (isCheckbox()) {
		if (!isSelected()) {
			click();
		}

		BSTR checked = SysAllocString(L"checked");
		VARIANT isChecked;
		isChecked.vt = VT_BSTR;
		isChecked.bstrVal = SysAllocString(L"true");
		element->setAttribute(checked, isChecked, 0);
		VariantClear(&isChecked);

		if (currentlySelected != isSelected()) {
			IHTMLEventObj* eventObj = newEventObject();
			fireEvent(eventObj, L"onchange");
		}

		return new InternetExplorerDriver(ie);
    }

	IHTMLOptionElement* option = NULL;
	element->QueryInterface(__uuidof(IHTMLOptionElement), (void**)&option);
	if (option != NULL) {
		option->put_selected(VARIANT_TRUE);
		option->Release();
		
		// Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		IHTMLDOMNode* node;
		IHTMLDOMNode* parent;
		element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
		node->get_parentNode(&parent);
		node->Release();

		if (currentlySelected != isSelected()) {
			IHTMLEventObj* eventObj = newEventObject();
			fireEvent(parent, eventObj, L"onchange");
		}
		parent->Release();
		
		return new InternetExplorerDriver(ie);
	}

	if (!this->isEnabled()) 
		throw "Unable to select a disabled element";
	throw "Unable to select element.";
}

bool ElementWrapper::isEnabled() 
{
	IHTMLElement3* elem;
	element->QueryInterface(__uuidof(IHTMLElement3), (void**)&elem);
	VARIANT_BOOL isDisabled;
	elem->get_disabled(&isDisabled);
	elem->Release();
	return isDisabled ? false : true;
}

bool ElementWrapper::isDisplayed()
{
	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> elem = element;
	IHTMLCurrentStyle* style;
	BSTR display;
	BSTR visible;

	elem->get_currentStyle(&style);
	style->get_display(&display);
	style->get_visibility(&visible);

	const wchar_t *displayValue = bstr2wchar(display);
	const wchar_t *visibleValue = bstr2wchar(visible);

	int isDisplayed = _wcsicmp(L"none", displayValue);
	int isVisible = _wcsicmp(L"hidden", visibleValue);

	delete displayValue;
	delete visibleValue;
	SysFreeString(display);
	SysFreeString(visible);
	style->Release();

	return isDisplayed != 0 && isVisible != 0;
}

bool ElementWrapper::toggle()
{
	click();
	return isSelected();
}

const wchar_t* ElementWrapper::getText() 
{
	BSTR text;
	element->get_innerText(&text);

	const wchar_t* toReturn = bstr2wchar(text);
	SysFreeString(text);
	return toReturn;
}

const wchar_t* ElementWrapper::getTextAreaValue() 
{
	IHTMLTextAreaElement* textarea;
	element->QueryInterface(__uuidof(IHTMLTextAreaElement), (void**)&textarea);

	BSTR result;
	textarea->get_value(&result);
	textarea->Release();

	const wchar_t* toReturn = bstr2wchar(result);
	SysFreeString(result);
	return toReturn;
}

InternetExplorerDriver* ElementWrapper::click()
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

	return new InternetExplorerDriver(ie);
}

InternetExplorerDriver* ElementWrapper::submit()
{
	IHTMLFormElement* form = NULL;
	element->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
	if (form != NULL) {
		form->submit();
		form->Release();
	} else {
		IHTMLInputElement* input = NULL;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		if (input != NULL) {
			BSTR typeName;
			input->get_type(&typeName);
			const wchar_t* type = bstr2wchar(typeName);

			if (type != NULL && (_wcsicmp(L"submit", type) == 0 || _wcsicmp(L"image", type) == 0)) {
				click();
			} else {
				input->get_form(&form);
				form->submit();
				form->Release();
			}

			delete type;
			SysFreeString(typeName);
			input->Release();
		} else {
			form = findParentForm();
			if (form == NULL) {
				throw "Unable to find the containing form";
			} 
			form->submit();
			form->Release();
		}
	}

	ie->waitForNavigateToFinish();
	return new InternetExplorerDriver(ie);
}

void ElementWrapper::setNode(IHTMLDOMNode* fromNode)
{
	if (element != NULL)
		element->Release();
	fromNode->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
}

bool ElementWrapper::isCheckbox()
{
	BSTR tagName;
	element->get_tagName(&tagName);
	const wchar_t* name = bstr2wchar(tagName);
	SysFreeString(tagName);

	bool isCheckbox = false;
	if (_wcsicmp(name, L"input") == 0) {
		IHTMLInputElement* input;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		BSTR typeName;
		input->get_type(&typeName);
		const wchar_t* type = bstr2wchar(typeName);
		isCheckbox = type != NULL && _wcsicmp(type, L"checkbox") == 0;
		delete type;
		SysFreeString(typeName);
		input->Release();
	}

	delete name;
	return isCheckbox;
}

IHTMLFormElement* ElementWrapper::findParentForm() 
{
	IHTMLElement* current = element;
	IHTMLFormElement* form = NULL;
	current->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
    while (!(current == NULL || form != NULL)) {
		IHTMLElement* temp;
		current->get_parentElement(&temp);
		if (current != element) {
			current->Release();
		}
		current = temp;
		current->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
    }
	if (current != element)
		current->Release();
	return form;
}

std::vector<ElementWrapper*>* ElementWrapper::getChildrenWithTagName(const wchar_t* tagName) 
{
	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2 = element;
	CComBSTR name = SysAllocString(tagName);
	IHTMLElementCollection* elementCollection;
	element2->getElementsByTagName(name, &elementCollection);

	long length = 0;
	elementCollection->get_length(&length);

	std::vector<ElementWrapper*>* toReturn = new std::vector<ElementWrapper*>();

	for (int i = 0; i < length; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		IDispatch* dispatch;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		elementCollection->item(idx, zero, &dispatch);
		VariantClear(&idx);
		VariantClear(&zero);

		IHTMLDOMNode* node;
		dispatch->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
		dispatch->Release();

		toReturn->push_back(new ElementWrapper(ie, node));
		node->Release();
	}

	elementCollection->Release();
	return toReturn;
}

IHTMLEventObj* ElementWrapper::newEventObject() 
{
	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc = dispatch;
	dispatch->Release();
		
	VARIANT empty;
	VariantInit(&empty);
	IHTMLEventObj* eventObject;
	doc->createEventObject(&empty, &eventObject);
	return eventObject;
}

void ElementWrapper::fireEvent(IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	CComQIPtr<IHTMLDOMNode, &__uuidof(IHTMLDOMNode)> node = element;
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