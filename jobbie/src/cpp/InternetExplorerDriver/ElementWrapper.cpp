
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
}

ElementWrapper::~ElementWrapper()
{
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

	VARIANT variant;
	variant.vt = VT_BSTR;
	variant.bstrVal = _bstr_t(lookFor);
	
	IDispatch* ppDisp = NULL;
	attributes->item(&variant, &ppDisp); 

	if (ppDisp == NULL) {
		return NULL;
	}

	IHTMLDOMAttribute* attribute;
	ppDisp->QueryInterface(__uuidof(IHTMLDOMAttribute), (void **)&attribute);

	VARIANT variant2;
	attribute->get_nodeValue(&variant2);

	ppDisp->Release();
	attributes->Release();
	dispatch->Release();

	return variant2char(variant2);
}

const char* ElementWrapper::getValue()
{
	CComBSTR temp;
	node->get_nodeName(&temp);
	const char *name = bstr2char(temp);

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

	return bstr2char(result);
}