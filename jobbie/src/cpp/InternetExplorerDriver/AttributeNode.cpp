#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

AttributeNode::AttributeNode(IHTMLAttributeCollection* allAttributes, long length)
{
	this->allAttributes = allAttributes;
	this->allAttributes->AddRef();
	this->length = length;

	this->index = -1;
	this->index = findNextSpecifiedIndex();
	this->attribute = getAttribute(index);
	if (this->attribute == NULL) {
		this->allAttributes->Release();
		throw "No declared attributes";
	}
}

AttributeNode::AttributeNode(IHTMLAttributeCollection* allAttributes, long length, long index)
{
	this->allAttributes = allAttributes;
	this->allAttributes->AddRef();
	this->length = length;
	this->index = index;
	
	this->attribute = getAttribute(index);
}

AttributeNode::~AttributeNode()
{
	attribute->Release();
	allAttributes->Release();
}

Node* AttributeNode::getDocument() 
{
	return NULL;
}

Node* AttributeNode::getNextSibling()
{
	long newIndex = findNextSpecifiedIndex();
	if (newIndex >= length)
		return NULL;
	return new AttributeNode(allAttributes, length, newIndex);
}

Node* AttributeNode::getFirstChild() 
{
	return NULL;
}

Node* AttributeNode::getFirstAttribute() 
{
	return NULL;
}

const char* AttributeNode::name()
{
	BSTR name;
	attribute->get_nodeName(&name);
	const char* toReturn = bstr2char(name);
	SysFreeString(name);

	if (_stricmp("classname", toReturn) == 0) {
		delete toReturn;
		return strdup("class");
	}

	return toReturn;
}

const char* AttributeNode::getText()
{
	VARIANT value;
	attribute->get_nodeValue(&value);
	const char* toReturn = variant2char(value);
	VariantClear(&value);
	return toReturn;
}

long AttributeNode::findNextSpecifiedIndex()
{
	IHTMLDOMAttribute* attr;
	VARIANT_BOOL specified;
	for (int i = index + 1; i < length; i++) {
		attr = getAttribute(i);
		attr->get_specified(&specified);
		attr->Release();
		if (specified == VARIANT_TRUE) 
			return i;
	}

	return length + 1;
}

IHTMLDOMAttribute* AttributeNode::getAttribute(long atIndex)
{
	if (atIndex >= length)
		return NULL;

	VARIANT idx;
	idx.vt = VT_I4;
	idx.lVal = atIndex;

	IDispatch* dispatch = NULL;
	allAttributes->item(&idx, &dispatch);

	IHTMLDOMAttribute* attr;
	dispatch->QueryInterface(__uuidof(IHTMLDOMAttribute), (void**)&attr);
	dispatch->Release();
	VariantClear(&idx);

	return attr;
}
