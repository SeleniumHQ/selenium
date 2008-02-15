#pragma once

#include <string>

class Node
{
public:
	virtual ~Node();

	virtual Node* getDocument() const = 0;
	virtual Node* getNextSibling() const = 0;
	virtual Node* getFirstChild() const = 0;
	virtual Node* getFirstAttribute() const = 0;

	virtual std::wstring name() const = 0;
	virtual std::wstring getText() const = 0;
};
