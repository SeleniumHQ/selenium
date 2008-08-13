#include "StdAfx.h"
#include "utils.h"
#include <exdispid.h>
#include <iostream>
#include <jni.h>
#include <comutil.h>
#include <comdef.h>
#include <stdlib.h>
#include <string>
#include <activscp.h>
#include "atlbase.h"
#include "atlstr.h"

using namespace std;

void getDocument3(const IHTMLDOMNode* extractFrom, IHTMLDocument3** pdoc) {
	CComQIPtr<IHTMLDOMNode2> element(const_cast<IHTMLDOMNode*>(extractFrom));

	CComPtr<IDispatch> dispatch;
	element->get_ownerDocument(&dispatch);

	CComQIPtr<IHTMLDocument3> doc(dispatch);
	*pdoc = doc.Detach();
}

bool isOrUnder(const IHTMLDOMNode* root, IHTMLElement* child) 
{
	CComQIPtr<IHTMLElement> parent(const_cast<IHTMLDOMNode*>(root));
	VARIANT_BOOL toReturn;
	parent->contains(child, &toReturn);

	return toReturn == VARIANT_TRUE;
}

void findElementById(IHTMLDOMNode** result, const IHTMLDOMNode* node, const wchar_t* findThis)
{
	CComPtr<IHTMLDocument3> doc;
	getDocument3(node, &doc);

	if (!doc) 
		return;

	CComPtr<IHTMLElement> element;
	BSTR id = SysAllocString(findThis);
	doc->getElementById(id, &element);
	SysFreeString(id);
	
	if (element != NULL) {
		CComVariant value;
		element->getAttribute(CComBSTR(L"id"), 0, &value);
		std::wstring converted = variant2wchar(value);
		if (converted == findThis)
		{
			if (isOrUnder(node, element)) {
				element.QueryInterface(result);
				return;
			}
			// Fall through
		}

		CComQIPtr<IHTMLDocument2> doc2(doc);

		CComPtr<IHTMLElementCollection> allNodes;
		doc2->get_all(&allNodes);
		long length = 0;
		CComPtr<IUnknown> unknown;
		allNodes->get__newEnum(&unknown);
		CComQIPtr<IEnumVARIANT> enumerator(unknown);

		VARIANT var;
		VariantInit(&var);
		enumerator->Next(1, &var, NULL);
		IDispatch *disp;
		disp = V_DISPATCH(&var);

		while (disp) 
		{
			CComQIPtr<IHTMLElement> curr(disp);
			disp->Release();
			if (curr) 
			{
				CComVariant value;
				curr->getAttribute(CComBSTR(L"id"), 0, &value);
				std::wstring converted = variant2wchar(value);
				if (findThis == converted) 
				{

					if (isOrUnder(node, curr)) {
						curr.QueryInterface(result);
						return;
					}
				}
			}

			VariantInit(&var);
			enumerator->Next(1, &var, NULL);
			disp = V_DISPATCH(&var);
		}
	}
}