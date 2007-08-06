package com.thoughtworks.webdriver.ie;

import org.jaxen.BaseXPath;
import org.jaxen.JaxenException;

public class IeXPath extends BaseXPath {
	public IeXPath(String xpath, InternetExplorerDriver driver) throws JaxenException {
		super(xpath, new IeNavigator(driver));
	}
}
