#pragma once

#include <string>

class Node
{
public:
	virtual ~Node();

	virtual Node* getDocument() = 0;
	virtual Node* getNextSibling() = 0;
	virtual Node* getFirstChild() = 0;
	virtual Node* getFirstAttribute() = 0;

	virtual const std::wstring name() = 0;
	virtual const wchar_t* getText() = 0;
};
