#pragma once

#include <mshtml.h>
#include "Node.h"

class AttributeNode : public Node
{
public:
	AttributeNode(IHTMLAttributeCollection* allAttributes, long length, long index);
	~AttributeNode();

	Node* getDocument();
	bool hasNextSibling();
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const char* name();

private:
	IHTMLAttributeCollection* allAttributes;
	long length;
	long index;
};
