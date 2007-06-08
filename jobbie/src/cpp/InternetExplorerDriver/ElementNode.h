#ifndef ElementNode_h
#define ElementNode_h

#include <mshtml.h>
#include "Node.h"
#include "DocumentNode.h"

class ElementNode : public Node
{
public:
	ElementNode(DocumentNode* document, IHTMLElement* element, long index);
	ElementNode(DocumentNode* document, IHTMLDOMNode* element, long index);
	~ElementNode();

	Node* getDocument();
	bool hasNextChild();
	Node* getNextChild();

	const char* name();

private:
	DocumentNode* document;
	IHTMLDOMNode* node;
	long index;
};

#endif