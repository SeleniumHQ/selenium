
#include "StdAfx.h"
#include "ElementWrapper.h"
#include "utils.h"
#include <iostream>

using namespace std;

#include <comutil.h>
#include <comdef.h>

ElementWrapper::ElementWrapper(IeWrapper* ie, IHTMLDOMNode* node)
{
	node->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
	this->ie = ie;
}

ElementWrapper::~ElementWrapper()
{
	element->Release();
}

const char* ElementWrapper::getAttribute(const char* name) 
{
	char *lookFor = (char *)name;

	if (_stricmp("class", name) == 0) {
		lookFor = "className";
	}

	BSTR attributeName = BSTR(lookFor);
	VARIANT value;
	element->getAttribute(attributeName, 0, &value);

	const char* toReturn = variant2char(value);
	VariantClear(&value);
	return toReturn;
}

const char* ElementWrapper::getValue()
{
	BSTR temp;
	element->get_tagName(&temp);
	const char *name = bstr2char(temp);
	SysFreeString(temp);

	int value = _stricmp("textarea", name);
	delete name;

	if (value == 0) 
		return this->getTextAreaValue();
	return this->getAttribute("value");
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

void ElementWrapper::setSelected()
{
	if (isCheckbox()) {
		if (!isSelected()) {
			click();
		}

		BSTR checked = BSTR("checked");
		VARIANT isChecked;
		isChecked.vt = VT_BSTR;
		isChecked.bstrVal = BSTR("true");
		element->setAttribute(checked, isChecked, 0);
		SysFreeString(checked);
		VariantClear(&isChecked);
		return;
    }

	IHTMLOptionElement* option = NULL;
	element->QueryInterface(__uuidof(IHTMLOptionElement), (void**)&option);
	if (option != NULL) {
		option->put_selected(VARIANT_TRUE);
		option->Release();
		return;
	}

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

bool ElementWrapper::toggle()
{
	click();
	return isSelected();
}

const char* ElementWrapper::getText() 
{
	BSTR text;
	element->get_innerText(&text);

	const char* toReturn = bstr2char(text);
	SysFreeString(text);
	return toReturn;
}

const char* ElementWrapper::getTextAreaValue() 
{
	IHTMLTextAreaElement* textarea;
	element->QueryInterface(__uuidof(IHTMLTextAreaElement), (void**)&textarea);

	BSTR result;
	textarea->get_value(&result);
	textarea->Release();

	const char* toReturn = bstr2char(result);
	SysFreeString(result);
	return toReturn;
}

void ElementWrapper::click()
{
	IDispatch *dispatch;
	element->get_document(&dispatch);

	IHTMLDocument4* doc;
	dispatch->QueryInterface(__uuidof(IHTMLDocument4), (void**)&doc);
	dispatch->Release();

	IHTMLElement3* element3;
	element->QueryInterface(__uuidof(IHTMLElement3), (void**)&element3);

	IHTMLEventObj *eventObject = NULL;
	doc->createEventObject(NULL, &eventObject);
	doc->Release();

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
	if (eventObject != NULL) eventObject->Release();
	element3->Release();

	ie->waitForNavigateToFinish();
}

void ElementWrapper::submit()
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
			const char* type = bstr2char(typeName);

			if (type != NULL && (_stricmp("submit", type) == 0 || _stricmp("image", type) == 0)) {
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
	const char* name = bstr2char(tagName);
	SysFreeString(tagName);

	bool isCheckbox = false;
	if (_stricmp(name, "input") == 0) {
		IHTMLInputElement* input;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		BSTR typeName;
		input->get_type(&typeName);
		const char* type = bstr2char(typeName);
		isCheckbox = type != NULL && _stricmp(type, "checkbox") == 0;
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