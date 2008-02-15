#pragma once

#include <mshtml.h>
#include <string>
#include "Node.h"

class AttributeNode : public Node
{
public:
	AttributeNode(IEnumVARIANT* enumerator);
	~AttributeNode();

	virtual Node* getDocument() const;
	virtual Node* getNextSibling() const;
	virtual Node* getFirstChild() const;
	virtual Node* getFirstAttribute() const;

	std::wstring name() const;
	std::wstring getText() const;

private:
	void moveToNextSpecifiedIndex();

	CComPtr<IEnumVARIANT> enumerator;
	CComPtr<IHTMLDOMAttribute> attribute;
};
