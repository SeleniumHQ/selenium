
#include "StdAfx.h"
#include "ElementWrapper.h"
#include "utils.h"
#include <iostream>

using namespace std;

#include <comutil.h>
#include <comdef.h>

ElementWrapper::ElementWrapper(IHTMLDOMNode* node)
{
	this->node = node;
	node->AddRef();
}

ElementWrapper::~ElementWrapper()
{
	node->Release();
}

const char* ElementWrapper::getAttribute(const char* name) 
{
	char *lookFor = (char *)name;

	if (_stricmp("class", name) == 0) {
		lookFor = "className";
	}

	IDispatch* dispatch = NULL;
	node->get_attributes(&dispatch);

	IHTMLAttributeCollection* attributes = NULL;
	dispatch->QueryInterface(__uuidof(IHTMLAttributeCollection), (void **)&attributes);
	dispatch->Release();

	VARIANT variant;
	variant.vt = VT_BSTR;
	variant.bstrVal = _bstr_t(lookFor);
	
	IDispatch* ppDisp = NULL;
	attributes->item(&variant, &ppDisp); 
	attributes->Release();
	VariantClear(&variant);

	if (ppDisp == NULL) {
		return NULL;
	}

	IHTMLDOMAttribute* attribute;
	ppDisp->QueryInterface(__uuidof(IHTMLDOMAttribute), (void **)&attribute);
	ppDisp->Release();

	VARIANT variant2;
	attribute->get_nodeValue(&variant2);
	attributes->Release();

	const char* toReturn = variant2char(variant2);
	VariantClear(&variant2);
	return toReturn;
}

const char* ElementWrapper::getValue()
{
	BSTR temp;
	node->get_nodeName(&temp);
	const char *name = bstr2char(temp);
	SysFreeString(temp);

	int value = _stricmp("textarea", name);
	delete name;

	if (value == 0) 
		return this->getTextAreaValue();
	return this->getAttribute("value");
}

const char* ElementWrapper::getTextAreaValue() 
{
	IHTMLTextAreaElement* textarea;
	node->QueryInterface(__uuidof(IHTMLTextAreaElement), (void**)&textarea);

	BSTR result;
	textarea->get_value(&result);
	textarea->Release();

	const char* toReturn = bstr2char(result);
	SysFreeString(result);
	return toReturn;
}