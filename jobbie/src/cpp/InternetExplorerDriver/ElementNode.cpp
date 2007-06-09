#include "stdafx.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

ElementNode::ElementNode(IHTMLElement* element, long index)
{
	element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
	this->index = index;
}

ElementNode::ElementNode(IHTMLDOMNode* node, long index) 
{
	this->node = node;
	this->index = index;
}

ElementNode::~ElementNode()
{
}

Node* ElementNode::getDocument()
{
	IHTMLDOMNode2 *node2;
	node->QueryInterface(__uuidof(IHTMLDOMNode2), (void**)&node2);

	IDispatch* dispatch;
	node2->get_ownerDocument(&dispatch);

	IHTMLDocument2 *doc;
	dispatch->QueryInterface(__uuidof(IHTMLDocument2), (void**)&doc);

	return new DocumentNode(doc);
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

	return new ElementNode(res, index + 1);
}

const char* ElementNode::name()
{
	CComBSTR name;
	node->get_nodeName(&name);
	return bstr2char(name);
}