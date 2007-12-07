#ifndef TextNode_h
#define TextNode_h

#include <mshtml.h>
#include "Node.h"
#include "AbstractNode.h"
#include "DocumentNode.h"

class TextNode : public AbstractNode
{
public:
	TextNode(IHTMLDOMNode* element);
	~TextNode();

	Node* getFirstAttribute();
};

#endif