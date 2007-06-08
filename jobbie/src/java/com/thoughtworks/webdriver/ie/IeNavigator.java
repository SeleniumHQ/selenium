package com.thoughtworks.webdriver.ie;

import java.util.Iterator;

import org.jaxen.DefaultNavigator;
import org.jaxen.UnsupportedAxisException;
import org.jaxen.XPath;
import org.jaxen.saxpath.SAXPathException;

public class IeNavigator extends DefaultNavigator {
	private final InternetExplorerDriver driver;

	public IeNavigator(InternetExplorerDriver driver) {
		this.driver = driver;
	}

	public Object getDocumentNode(Object context) {
		return ((HtmlNode) context).getDocument();
	}

	public Iterator getAttributeAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		System.out.println("Attribute axis");
		return super.getAttributeAxisIterator(contextNode);
	}

	public Iterator getChildAxisIterator(final Object contextNode)
			throws UnsupportedAxisException {
		return new Iterator() {
			HtmlNode node = (HtmlNode) contextNode;

			public boolean hasNext() {
				return node.hasNextChild();
			}

			public Object next() {
				node = (HtmlNode) node.nextChild();
				return node;
			}

			public void remove() {
				throw new UnsupportedOperationException("Cannot remove a node");
			}
		};
	}

	public Iterator getDescendantAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getDescendantAxisIterator");
	}

	public Iterator getFollowingAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getFollowingAxisIterator");
	}

	public Iterator getFollowingSiblingAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException(
				"getFollowingSiblingAxisIterator");
	}

	public Iterator getAncestorAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getAncestorAxisIterator");
	}

	public Object getElementById(Object contextNode, String elementId) {
		throw new UnsupportedOperationException("getElementById");
	}

	public Iterator getNamespaceAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getNamespaceAxisIterator");
	}

	public Iterator getParentAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getParentAxisIterator");
	}

	public short getNodeType(Object node) {
		throw new UnsupportedOperationException("getNodeType");
	}

	public Object getParentNode(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getParentNode");
	}

	public Iterator getPrecedingAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException("getPrecedingAxisIterator");
	}

	public Iterator getPrecedingSiblingAxisIterator(Object contextNode)
			throws UnsupportedAxisException {
		throw new UnsupportedOperationException(
				"getPrecedingSiblingAxisIterator");
	}

	public XPath parseXPath(String xpath) throws SAXPathException {
		return new IeXPath(xpath, driver);
	}

	public String getAttributeName(Object attr) {
		throw new UnsupportedOperationException("getAttributeName");
	}

	public String getAttributeNamespaceUri(Object attr) {
		throw new UnsupportedOperationException("getAttributeNamespaceUri");
	}

	public String getAttributeQName(Object attr) {
		throw new UnsupportedOperationException("getAttributeQName");
	}

	public String getAttributeStringValue(Object attr) {
		throw new UnsupportedOperationException("getAttributeStringValue");
	}

	public String getCommentStringValue(Object comment) {
		throw new UnsupportedOperationException("getCommentStringValue");
	}

	public String getElementName(Object element) {
		return ((ElementNode) element).getName();
	}

	public String getElementNamespaceUri(Object element) {
		return "";
	}

	public String getElementQName(Object element) {
		throw new UnsupportedOperationException("getElementQName");
	}

	public String getElementStringValue(Object element) {
		throw new UnsupportedOperationException("getElementStringValue");
	}

	public String getNamespacePrefix(Object ns) {
		throw new UnsupportedOperationException("getNamespacePrefix");
	}

	public String getNamespaceStringValue(Object ns) {
		throw new UnsupportedOperationException("getNamespaceStringValue");
	}

	public String getTextStringValue(Object text) {
		throw new UnsupportedOperationException("getTextStringValue");
	}

	public boolean isAttribute(Object object) {
		throw new UnsupportedOperationException("isAttribute");
	}

	public boolean isComment(Object object) {
		throw new UnsupportedOperationException("isComment");
	}

	public boolean isDocument(Object object) {
		throw new UnsupportedOperationException("isDocument");
	}

	public boolean isElement(Object object) {
		return object instanceof ElementNode;
	}

	public boolean isNamespace(Object object) {
		throw new UnsupportedOperationException("isNamespace");
	}

	public boolean isProcessingInstruction(Object object) {
		throw new UnsupportedOperationException("isProcessingInstruction");
	}

	public boolean isText(Object object) {
		throw new UnsupportedOperationException("isText");
	}
}
