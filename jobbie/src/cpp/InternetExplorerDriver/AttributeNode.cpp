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
	return index + 1 < length;
}

Node* AttributeNode::getNextSibling()
{
	return new AttributeNode(allAttributes, length, index + 1);
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
	VARIANT idx;
	idx.vt = VT_I4;
	idx.lVal = index;

	IDispatch* dispatch = NULL;
	allAttributes->item(&idx, &dispatch);

	IHTMLDOMAttribute* attribute;
	dispatch->QueryInterface(__uuidof(IHTMLDOMAttribute), (void**)&attribute);

	BSTR name;
	attribute->get_nodeName(&name);
	return bstr2char(name);
}
