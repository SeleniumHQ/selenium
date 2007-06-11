#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

AttributeNode::AttributeNode(IHTMLAttributeCollection* allAttributes, long length, long index)
{
	this->allAttributes = allAttributes;
	this->length = length;
	this->index = index;
	
	attribute = getAttribute(index);
}

AttributeNode::~AttributeNode()
{
}

Node* AttributeNode::getDocument() 
{
	return NULL;
}
bool AttributeNode::hasNextSibling() 
{
	long newIndex = findNextSpecifiedIndex();
	return newIndex < length;
}

Node* AttributeNode::getNextSibling()
{
	long newIndex = findNextSpecifiedIndex();

	return new AttributeNode(allAttributes, length, newIndex);
}

Node* AttributeNode::getFirstChild() 
{
	return NULL;
}

Node* AttributeNode::getFirstAttribute() 
{
	return new AttributeNode(allAttributes, length, 0);
}

const char* AttributeNode::name()
{
	BSTR name;
	attribute->get_nodeName(&name);
	return bstr2char(name);
}

const char* AttributeNode::getText()
{
	VARIANT value;
	attribute->get_nodeValue(&value);
	return variant2char(value);
}

long AttributeNode::findNextSpecifiedIndex()
{
	IHTMLDOMAttribute* attr;
	VARIANT_BOOL specified;
	for (int i = index + 1; i < length; i++) {
		attr = getAttribute(i);
		attr->get_specified(&specified);
		if (specified == VARIANT_TRUE) 
			return i;
	}

	return length + 1;
}

IHTMLDOMAttribute* AttributeNode::getAttribute(long atIndex)
{
	VARIANT idx;
	idx.vt = VT_I4;
	idx.lVal = atIndex;

	IDispatch* dispatch = NULL;
	allAttributes->item(&idx, &dispatch);

	IHTMLDOMAttribute* attr;
	dispatch->QueryInterface(__uuidof(IHTMLDOMAttribute), (void**)&attr);
	return attr;
}
