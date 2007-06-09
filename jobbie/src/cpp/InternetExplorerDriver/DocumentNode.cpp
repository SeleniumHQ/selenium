#include "stdafx.h"
#include "DocumentNode.h"
#include "ElementNode.h"

#include <iostream>
using namespace std;

DocumentNode::DocumentNode(IHTMLDocument2* doc)
{
	this->doc = doc;
	this->childIndex = 0;
}

DocumentNode::~DocumentNode()
{
}

Node* DocumentNode::getDocument()
{
	return this;
}

bool DocumentNode::hasNextChild() 
{
	return childIndex == 0;
}

Node* DocumentNode::getNextChild() 
{
	IHTMLDocument3* doc3;
	doc->QueryInterface(__uuidof(IHTMLDocument3), (void**)&doc3);

	IHTMLElement* rootElement;
	doc3->get_documentElement(&rootElement);

	childIndex++;

	return new ElementNode(rootElement, 0);
}

const char* DocumentNode::name()
{
	return "<document node>";
}