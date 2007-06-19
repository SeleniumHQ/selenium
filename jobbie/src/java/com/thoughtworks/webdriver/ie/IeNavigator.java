package com.thoughtworks.webdriver.ie;

import java.util.Collections;
import java.util.Iterator;

import org.jaxen.DefaultNavigator;
import org.jaxen.UnsupportedAxisException;
import org.jaxen.XPath;
import org.jaxen.saxpath.SAXPathException;

import com.thoughtworks.webdriver.NoSuchElementException;

public class IeNavigator extends DefaultNavigator {
	private final InternetExplorerDriver driver;

	public IeNavigator(InternetExplorerDriver driver) {
		this.driver = driver;
	}

	public Object getDocumentNode(Object context) {
		return ((HtmlNode) context).getDocument();
	}

	public Iterator getAttributeAxisIterator(Object contextNode) throws UnsupportedAxisException {
		try {
			final HtmlNode firstAttribute = ((HtmlNode) contextNode).getFirstAttribute();
			return new NodeIterator(firstAttribute);
		} catch (NoSuchElementException e) {
			// No declared attribute
			return Collections.EMPTY_LIST.iterator();
		}
	}

	public Iterator getChildAxisIterator(Object contextNode) throws UnsupportedAxisException {
		HtmlNode html = (HtmlNode) contextNode;
		while (html instanceof DocumentNode) {
			html = (HtmlNode) html.getFirstChild();
		}
		
		return new NodeIterator(html.getFirstChild());
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
		return ((AttributeNode) attr).getName();
	}

	public String getAttributeNamespaceUri(Object attr) {
		return "";
	}

	public String getAttributeQName(Object attr) {
		throw new UnsupportedOperationException("getAttributeQName");
	}

	public String getAttributeStringValue(Object attr) {
		return ((AttributeNode) attr).getText();
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
		return object instanceof AttributeNode;
	}

	public boolean isComment(Object object) {
		return false;
	}

	public boolean isDocument(Object object) {
		return object instanceof DocumentNode;
	}

	public boolean isElement(Object object) {
		return object instanceof ElementNode;
	}

	public boolean isNamespace(Object object) {
		return false;
	}

	public boolean isProcessingInstruction(Object object) {
		return false;
	}

	public boolean isText(Object object) {
		// This should really be: 
		// return object instanceof TextNode
		return object instanceof ElementNode && "#text".equals(((HtmlNode) object).getName());
	}
	
	private static class NodeIterator implements Iterator {
		private HtmlNode node;

		public NodeIterator(HtmlNode node) {
			this.node = node;
		}
		
		public boolean hasNext() {
			return node != null && node.hasNextSibling();
		}

		public Object next() {
			node = (HtmlNode) node.getNextSibling();
			return node;
		}

		public void remove() {
			throw new UnsupportedOperationException("remove");
		}		
	}
}
