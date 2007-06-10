#ifndef ElementNode_h
#define ElementNode_h

#include <mshtml.h>
#include "Node.h"
#include "DocumentNode.h"

class ElementNode : public Node
{
public:
	ElementNode(IHTMLElement* element);
	ElementNode(IHTMLDOMNode* element);
	~ElementNode();

	Node* getDocument();
	Node* getFirstChild();
	bool hasNextSibling();
	Node* getNextSibling();
	Node* getFirstAttribute();

	const char* name();

private:
	IHTMLDOMNode* node;
};

#endif