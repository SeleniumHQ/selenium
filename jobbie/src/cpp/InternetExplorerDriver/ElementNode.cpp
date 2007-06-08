#include "stdafx.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

ElementNode::ElementNode(DocumentNode* document, IHTMLElement* element, long index)
{
	element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
	this->index = index;
	this->document = document;
}

ElementNode::ElementNode(DocumentNode* document, IHTMLDOMNode* node, long index) 
{
	this->node = node;
	this->index = index;
	this->document = document;
}

ElementNode::~ElementNode()
{
}

Node* ElementNode::getDocument()
{
	return document;
}

bool ElementNode::hasNextChild()
{
	VARIANT_BOOL hasChildren;
	node->hasChildNodes(&hasChildren);
	if (hasChildren == VARIANT_FALSE)
		return false;

	IDispatch* dispatch;
	node->get_childNodes(&dispatch);

	IHTMLDOMChildrenCollection* children;
	dispatch->QueryInterface(__uuidof(IHTMLDOMChildrenCollection), (void**)&children);

	long length;
	children->get_length(&length);

	return length > index + 1;
}

Node* ElementNode::getNextChild() 
{
	IDispatch* dispatch;
	node->get_childNodes(&dispatch);

	IHTMLDOMChildrenCollection* children;
	dispatch->QueryInterface(__uuidof(IHTMLDOMChildrenCollection), (void**)&children);

	IDispatch* item;
	children->item(index + 1, &item);

	IHTMLDOMNode* res;
	item->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&res);

	return new ElementNode(document, res, index + 1);
}

const char* ElementNode::name()
{
	CComBSTR name;
	node->get_nodeName(&name);
	return bstr2char(name);
}