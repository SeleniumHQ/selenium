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
	ElementNode* getParent();
	Node* getFirstChild();
	Node* getNextSibling();
	Node* getFirstAttribute();

	const wchar_t* name();
	const wchar_t* getText();

	IHTMLDOMNode* getDomNode();

private:
	IHTMLDOMNode* node;
};

#endif