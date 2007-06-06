package com.thoughtworks.webdriver.ie;

import java.util.Iterator;

import org.jaxen.DefaultNavigator;
import org.jaxen.UnsupportedAxisException;
import org.jaxen.XPath;
import org.jaxen.saxpath.SAXPathException;

public class IeNavigator extends DefaultNavigator  {
	private final InternetExplorerDriver driver;

	public IeNavigator(InternetExplorerDriver driver) {
		this.driver = driver;
	}
	
	public Object getDocumentNode(Object context) {
		return ((HtmlNode) context).getDocument();
	}
	
	public Iterator getChildAxisIterator(final Object contextNode) throws UnsupportedAxisException {
		return new Iterator() {
			HtmlNode node = new HtmlNode(contextNode);
			
			public boolean hasNext() {
				return node.hasNextChild();
			}

			public Object next() {
				return node.nextChild();
			}

			public void remove() {
				throw new UnsupportedOperationException("Cannot remove a node");
			}
		};
	}
	
	public String getAttributeName(Object arg0) {
		return null;
	}

	public String getAttributeNamespaceUri(Object arg0) {
		return null;
	}

	public String getAttributeQName(Object arg0) {
		return null;
	}

	public String getAttributeStringValue(Object arg0) {
		return null;
	}

	public String getCommentStringValue(Object arg0) {
		return null;
	}

	public String getElementName(Object arg0) {
		return null;
	}

	public String getElementNamespaceUri(Object arg0) {
		return null;
	}

	public String getElementQName(Object arg0) {
		return null;
	}

	public String getElementStringValue(Object arg0) {
		return null;
	}

	public String getNamespacePrefix(Object arg0) {
		return null;
	}

	public String getNamespaceStringValue(Object arg0) {
		return null;
	}

	public String getTextStringValue(Object arg0) {
		return null;
	}

	public boolean isAttribute(Object arg0) {
		return false;
	}

	public boolean isComment(Object arg0) {
		return false;
	}

	public boolean isDocument(Object arg0) {
		return false;
	}

	public boolean isElement(Object arg0) {
		return false;
	}

	public boolean isNamespace(Object arg0) {
		return false;
	}

	public boolean isProcessingInstruction(Object arg0) {
		return false;
	}

	public boolean isText(Object arg0) {
		return false;
	}

	public XPath parseXPath(String xpath) throws SAXPathException {
		return new IeXPath(xpath, driver);
	}
}
