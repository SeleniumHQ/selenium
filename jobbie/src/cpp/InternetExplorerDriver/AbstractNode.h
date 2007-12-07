#pragma once
#include <mshtml.h>
#include "Node.h"

class AbstractNode : public Node
{
public:
	AbstractNode(IHTMLDOMNode*);
	virtual ~AbstractNode(void);

	virtual Node* getDocument();
	virtual Node* getNextSibling();
	virtual Node* getFirstChild();
	virtual Node* getParent();
	virtual Node* getFirstAttribute() = 0;

	virtual const wchar_t* name();
	virtual const wchar_t* getText();

	IHTMLDOMNode* getDomNode();

protected:

	Node* buildNode(IHTMLDOMNode*);

	IHTMLDOMNode* node;
};
