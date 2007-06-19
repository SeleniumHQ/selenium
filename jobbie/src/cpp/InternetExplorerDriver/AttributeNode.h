#pragma once

#include <mshtml.h>
#include "Node.h"

class AttributeNode : public Node
{
public:
	AttributeNode(IHTMLAttributeCollection* allAttributes, long length);
	AttributeNode(IHTMLAttributeCollection* allAttributes, long length, long index);
	~AttributeNode();

	Node* getDocument();
	bool hasNextSibling();
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const char* name();
	const char* getText();

private:
	long findNextSpecifiedIndex();
	IHTMLDOMAttribute* getAttribute(long atIndex);

	IHTMLAttributeCollection* allAttributes;
	IHTMLDOMAttribute* attribute;
	long length;
	long index;
};
