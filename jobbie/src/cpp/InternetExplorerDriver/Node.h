#pragma once

class Node
{
public:
	virtual ~Node();

	virtual Node* getDocument() = 0;
	virtual bool hasNextSibling() = 0;
	virtual Node* getNextSibling() = 0;
	virtual Node* getFirstChild() = 0;
	virtual Node* getFirstAttribute() = 0;

	virtual const char* name() = 0;
	virtual const char* getText() = 0;
};
