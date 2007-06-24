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
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const wchar_t* name();
	const wchar_t* getText();

private:
	long findNextSpecifiedIndex();
	IHTMLDOMAttribute* getAttribute(long atIndex);

	IHTMLAttributeCollection* allAttributes;
	IHTMLDOMAttribute* attribute;
	long length;
	long index;
};
