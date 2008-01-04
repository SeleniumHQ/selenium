#pragma once

#include <mshtml.h>
#include <string>
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

	const std::wstring name();
	const wchar_t* getText();

private:
	void moveToNextSpecifiedIndex();

	IEnumVARIANT* enumerator;
	IHTMLDOMAttribute* attribute;
};
