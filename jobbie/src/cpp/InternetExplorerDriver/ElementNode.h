#ifndef ElementNode_h
#define ElementNode_h

#include <mshtml.h>
#include "Node.h"
#include "AbstractNode.h"

class ElementNode : public AbstractNode
{
public:
	ElementNode(IHTMLDOMNode* element);
	~ElementNode();

	Node* getFirstAttribute() const;
};

#endif