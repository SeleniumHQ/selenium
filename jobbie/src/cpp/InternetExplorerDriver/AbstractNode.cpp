#include "stdafx.h"
#include "AbstractNode.h"
#include "AttributeNode.h"
#include "CommentNode.h"
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

Node* AbstractNode::getDocument() const
{
	CComQIPtr<IHTMLDOMNode2> node2(node);

	IDispatch* dispatch;
	node2->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument2> doc(dispatch);
	dispatch->Release();

	return new DocumentNode(doc);
}

Node* AbstractNode::getParent() const
{
	IHTMLDOMNode* parent = NULL;
	node->get_parentNode(&parent);
	
	if (parent == NULL)
		return NULL;

	Node* toReturn = AbstractNode::buildNode(parent);
	parent->Release();
	return toReturn;
}

Node* AbstractNode::getFirstChild() const
{
	IHTMLDOMNode* child = NULL;
	node->get_firstChild(&child);

	if (child == NULL)
		return NULL;

	Node* toReturn = AbstractNode::buildNode(child);
	child->Release();
	return toReturn;
}

Node* AbstractNode::getNextSibling() const
{
	IHTMLDOMNode* sibling = NULL;
	node->get_nextSibling(&sibling);

	if (sibling == NULL) {
		return NULL;
	}

	Node* toReturn = AbstractNode::buildNode(sibling);
	sibling->Release();
	return toReturn;
}

std::wstring AbstractNode::name() const
{
	CComBSTR name;
	node->get_nodeName(&name);
	return bstr2wstring(name);
}

std::wstring AbstractNode::getText() const
{
	CComQIPtr<IHTMLElement> element(node);

	CComBSTR text;
	element->get_innerText(&text);
	return bstr2wstring(text);
}

IHTMLDOMNode* AbstractNode::getDomNode() const
{
	return node;
}

Node* AbstractNode::buildNode(IHTMLDOMNode *from) 
{
	long type = 0;
	from->get_nodeType(&type);

	if (type == 3)
	{
		return new TextNode(from);
	} else if (type == 8) 
	{
		return new CommentNode(from);
	}

	return new ElementNode(from);
}