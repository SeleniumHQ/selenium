#pragma once

#include <mshtml.h>
#include "Node.h"

class AttributeNode : public Node
{
public:
	AttributeNode(IEnumVARIANT* enumerator);
	~AttributeNode();

	Node* getDocument();
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const wchar_t* name();
	const wchar_t* getText();

private:
	void moveToNextSpecifiedIndex();

	IEnumVARIANT* enumerator;
	IHTMLDOMAttribute* attribute;
};
