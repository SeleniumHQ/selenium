#ifndef CommentNode_h
#define CommentNode_h

#include <mshtml.h>
#include "Node.h"
#include "AbstractNode.h"
#include "DocumentNode.h"

class CommentNode : public AbstractNode
{
public:
	CommentNode(IHTMLDOMNode* element);
	~CommentNode();

	virtual Node* getFirstChild() const;
	virtual Node* getFirstAttribute() const;
};

#endif