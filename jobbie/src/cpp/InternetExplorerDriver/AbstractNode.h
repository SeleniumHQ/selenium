#pragma once
#include <mshtml.h>
#include <string>
#include "Node.h"

class AbstractNode : public Node
{
public:
	AbstractNode(IHTMLDOMNode*);
	virtual ~AbstractNode(void);

	virtual Node* getDocument() const;
	virtual Node* getNextSibling() const;
	virtual Node* getFirstChild() const;
	virtual Node* getParent() const;
	virtual Node* getFirstAttribute() const = 0;

	virtual std::wstring name() const;
	virtual std::wstring getText() const;

	IHTMLDOMNode* getDomNode() const;

protected:

	static Node* buildNode(IHTMLDOMNode *from);

	CComPtr<IHTMLDOMNode> node;
};
