#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

ElementNode::ElementNode(IeWrapper* ie, IHTMLElement* element)
{
	element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
	this->ie = ie;
}

ElementNode::ElementNode(IeWrapper* ie, IHTMLDOMNode* node) 
{
	this->node = node;
	this->ie = ie;
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

	return new DocumentNode(ie, doc);
}

Node* ElementNode::getFirstChild()
{
	IHTMLDOMNode* child = NULL;
	node->get_firstChild(&child);

	if (child == NULL)
		return NULL;

	return new ElementNode(ie, child);
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

	return new ElementNode(ie, sibling);
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

const char* ElementNode::getText()
{
	IHTMLElement* element;
	node->QueryInterface(__uuidof(element), (void**)&element);

	BSTR text;
	element->get_innerText(&text);
	return bstr2char(text);
}

void ElementNode::click()
{
	IHTMLElement* element;
	node->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
	IDispatch *dispatch;
	element->get_document(&dispatch);
	IHTMLDocument4* doc;
	dispatch->QueryInterface(__uuidof(IHTMLDocument4), (void**)&doc);

	IHTMLElement3* element3;
	node->QueryInterface(__uuidof(IHTMLElement3), (void**)&element3);

	IHTMLEventObj *eventObject;
	doc->createEventObject(NULL, &eventObject);

	VARIANT eventref;
	eventref.vt = VT_DISPATCH;
	eventref.pdispVal = eventObject;

	VARIANT_BOOL cancellable = VARIANT_TRUE;
	element3->fireEvent(BSTR("onMouseDown"), &eventref, &cancellable);
	element3->fireEvent(BSTR("onMouseUp"), &eventref, &cancellable);

	element->click();
	ie->waitForNavigateToFinish();
}