#ifndef ElementNode_h
#define ElementNode_h

#include <mshtml.h>
#include "Node.h"
#include "DocumentNode.h"

class ElementNode : public Node
{
public:
	ElementNode(IHTMLElement* element, long index);
	ElementNode(IHTMLDOMNode* element, long index);
	~ElementNode();

	Node* getDocument();
	bool hasNextChild();
	Node* getNextChild();

	const char* name();

private:
	IHTMLDOMNode* node;
	long index;
};

#endif