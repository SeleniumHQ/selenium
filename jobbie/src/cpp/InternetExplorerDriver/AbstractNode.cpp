#include "stdafx.h"
#include "AbstractNode.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "TextNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

AbstractNode::AbstractNode(IHTMLDOMNode* node) 
{
	this->node = node;
	node->AddRef();
}

AbstractNode::~AbstractNode()
{
}

Node* AbstractNode::getDocument()
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

Node* AbstractNode::getParent()
{
	IHTMLDOMNode* parent = NULL;
	node->get_parentNode(&parent);
	
	if (parent == NULL)
		return NULL;

	Node* toReturn = buildNode(parent);
	parent->Release();
	return toReturn;
}

Node* AbstractNode::getFirstChild()
{
	IHTMLDOMNode* child = NULL;
	node->get_firstChild(&child);

	if (child == NULL)
		return NULL;

	Node* toReturn = buildNode(child);
	child->Release();
	return toReturn;
}

Node* AbstractNode::getNextSibling() 
{
	IHTMLDOMNode* sibling = NULL;
	node->get_nextSibling(&sibling);

	if (sibling == NULL) {
		return NULL;
	}

	Node* toReturn = buildNode(sibling);
	sibling->Release();
	return toReturn;
}

const std::wstring AbstractNode::name()
{
	BSTR name;
	node->get_nodeName(&name);
	const std::wstring toReturn = bstr2wstring(name);
	SysFreeString(name);
	return toReturn;
}

const wchar_t* AbstractNode::getText()
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

IHTMLDOMNode* AbstractNode::getDomNode()
{
	return node;
}

Node* AbstractNode::buildNode(IHTMLDOMNode* from) 
{
	long type = 0;
	from->get_nodeType(&type);

	if (type == 3)
	{
		return new TextNode(from);
	}

	return new ElementNode(from);
}