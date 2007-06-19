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

Node* DocumentNode::getDocument()
{
	return this;
}

bool DocumentNode::hasNextSibling() 
{
	return false;
}

Node* DocumentNode::getNextSibling()
{
	return NULL;
}

Node* DocumentNode::getFirstChild() 
{
	IHTMLDocument3* doc3;
	doc->QueryInterface(__uuidof(IHTMLDocument3), (void**)&doc3);

	IHTMLElement* rootElement;
	doc3->get_documentElement(&rootElement);
	doc3->Release();

	ElementNode* toReturn = new ElementNode(rootElement);
	rootElement->Release();
	return toReturn;
}

Node* DocumentNode::getFirstAttribute() 
{
	return NULL;
}

const char* DocumentNode::name()
{
	return "<document node>";
}

const char* DocumentNode::getText()
{
	return NULL;
}
