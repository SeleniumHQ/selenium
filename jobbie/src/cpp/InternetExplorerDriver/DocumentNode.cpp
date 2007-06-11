#include "stdafx.h"
#include "DocumentNode.h"
#include "ElementNode.h"

#include <iostream>
using namespace std;

DocumentNode::DocumentNode(IeWrapper* ie, IHTMLDocument2* doc)
{
	this->doc = doc;
	this->ie = ie;
}

DocumentNode::~DocumentNode()
{
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

	return new ElementNode(ie, rootElement);
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
