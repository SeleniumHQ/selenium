#pragma once

class Node
{
public:
	virtual ~Node();

	virtual Node* getDocument() = 0;
	virtual bool hasNextChild() = 0;
	virtual Node* getNextChild() = 0;

	virtual const char* name() = 0;
};
