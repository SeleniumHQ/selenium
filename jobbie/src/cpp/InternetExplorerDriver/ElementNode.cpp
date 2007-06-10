#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

ElementNode::ElementNode(IHTMLElement* element)
{
	element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
}

ElementNode::ElementNode(IHTMLDOMNode* node) 
{
	this->node = node;
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

Node* ElementNode::getFirstChild()
{
	IHTMLDOMNode* child = NULL;
	node->get_firstChild(&child);

	if (child == NULL)
		return NULL;

	return new ElementNode(child);
}

bool ElementNode::hasNextSibling()
{
	IHTMLDOMNode* sibling = NULL;
	node->get_nextSibling(&sibling);

	return sibling != NULL;
}

Node* ElementNode::getNextSibling() 
{
	IHTMLDOMNode* sibling = NULL;
	node->get_nextSibling(&sibling);

	if (sibling == NULL)
		return NULL;

	return new ElementNode(sibling);
}

Node* ElementNode::getFirstAttribute() 
{
	IDispatch* dispatch = NULL;
	node->get_attributes(&dispatch);

	IHTMLAttributeCollection* allAttributes;
	dispatch->QueryInterface(__uuidof(IHTMLAttributeCollection), (void**)&allAttributes);

	long length = 0;
	allAttributes->get_length(&length);

	if (length == 0)
		return NULL;

	return new AttributeNode(allAttributes, length, 0);
}

const char* ElementNode::name()
{
	CComBSTR name;
	node->get_nodeName(&name);
	return bstr2char(name);
}