#include "stdafx.h"
#include "DocumentNode.h"
#include "ElementNode.h"

#include <iostream>
using namespace std;

DocumentNode::DocumentNode(IHTMLDocument2* doc)
{
	this->doc = doc;
	doc->AddRef();
}

DocumentNode::~DocumentNode()
{
	doc->Release();
}

Node* DocumentNode::getDocument() const
{
	return new DocumentNode(doc);
}

Node* DocumentNode::getNextSibling() const
{
	return NULL;
}

Node* DocumentNode::getFirstChild() const
{
	CComQIPtr<IHTMLDocument3> doc3(doc);

	IHTMLElement* rootElement;
	doc3->get_documentElement(&rootElement);

	CComQIPtr<IHTMLDOMNode> rootNode(rootElement);
	rootElement->Release();

	return new ElementNode(rootNode);
}

Node* DocumentNode::getFirstAttribute() const
{
	return NULL;
}

std::wstring DocumentNode::name() const
{
	return L"<document node>";
}

std::wstring DocumentNode::getText() const
{
	return L"";
}
