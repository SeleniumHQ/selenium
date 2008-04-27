#ifndef TextNode_h
#define TextNode_h

#include <mshtml.h>
#include <string>
#include "Node.h"
#include "AbstractNode.h"
#include "DocumentNode.h"

class TextNode : public AbstractNode
{
public:
	TextNode(IHTMLDOMNode* element);
	~TextNode();

	virtual Node* getFirstAttribute() const;
	virtual std::wstring getText() const;
};

#endif