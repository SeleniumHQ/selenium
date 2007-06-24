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
	node->AddRef();
}

ElementNode::~ElementNode()
{
	node->Release();
}

Node* ElementNode::getDocument()
{
	IHTMLDOMNode2 *node2;
	node->QueryInterface(__uuidof(IHTMLDOMNode2), (void**)&node2);

	IDispatch* dispatch;
	node2->get_ownerDocument(&dispatch);
	node2->Release();

	IHTMLDocument2 *doc;
	dispatch->QueryInterface(__uuidof(IHTMLDocument2), (void**)&doc);
	dispatch->Release();

	DocumentNode* toReturn = new DocumentNode(doc);
	doc->Release();
	return toReturn;
}

ElementNode* ElementNode::getParent()
{
	IHTMLDOMNode* parent = NULL;
	node->get_parentNode(&parent);
	
	if (parent == NULL)
		return NULL;

	ElementNode* toReturn = new ElementNode(parent);
	parent->Release();
	return toReturn;
}

Node* ElementNode::getFirstChild()
{
	IHTMLDOMNode* child = NULL;
	node->get_firstChild(&child);

	if (child == NULL)
		return NULL;

	ElementNode* toReturn = new ElementNode(child);
	child->Release();
	return toReturn;
}

Node* ElementNode::getNextSibling() 
{
	IHTMLDOMNode* sibling = NULL;
	node->get_nextSibling(&sibling);

	if (sibling == NULL) {
		return NULL;
	}

	ElementNode* toReturn = new ElementNode(sibling);
	sibling->Release();
	return toReturn;
}

Node* ElementNode::getFirstAttribute() 
{
	IDispatch* dispatch = NULL;
	node->get_attributes(&dispatch);

	IHTMLAttributeCollection* allAttributes;
	dispatch->QueryInterface(__uuidof(IHTMLAttributeCollection), (void**)&allAttributes);
	dispatch->Release();

	long length = 0;
	allAttributes->get_length(&length);

	if (length == 0) {
		allAttributes->Release();
		return NULL;
	}

	AttributeNode* toReturn = new AttributeNode(allAttributes, length);
	allAttributes->Release();
	return toReturn;
}

const wchar_t* ElementNode::name()
{
	BSTR name;
	node->get_nodeName(&name);
	const wchar_t* toReturn = bstr2wchar(name);
	SysFreeString(name);
	return toReturn;
}

const wchar_t* ElementNode::getText()
{
	IHTMLElement* element;
	node->QueryInterface(__uuidof(element), (void**)&element);

	BSTR text;
	element->get_innerText(&text);
	element->Release();
	const wchar_t* toReturn = bstr2wchar(text);
	SysFreeString(text);
	return toReturn;
}

IHTMLDOMNode* ElementNode::getDomNode()
{
	return node;
}
