/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.webdriver.htmlunit;

import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.jaxen.JaxenException;
import org.jaxen.XPath;

import com.gargoylesoftware.htmlunit.*;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.FrameWindow;
import com.gargoylesoftware.htmlunit.html.xpath.HtmlUnitXPath;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class HtmlUnitDriver implements WebDriver {
	private WebClient webClient;
    private WebWindow currentWindow;

    public HtmlUnitDriver() {
		newWebClient();
	}

	private void newWebClient() {
		webClient = new WebClient();
		webClient.setThrowExceptionOnFailingStatusCode(true);
		webClient.setJavaScriptEnabled(false);
		webClient.setRedirectEnabled(true);
	}

	public void get(String url) {
		try {
			URL fullUrl = new URL(url);
			Page page = webClient.getPage(fullUrl);
			page.initialize();
            currentWindow = webClient.getCurrentWindow();
        } catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

    public String getCurrentUrl() {
        return lastPage().getWebResponse().getUrl().toString();
    }

    public String getTitle() {
		HtmlPage htmlPage = lastPage();
		if (htmlPage == null) {
			return null; // no page so there is no title
		}
		return htmlPage.getTitleText();
	}

	public boolean getVisible() {
		return false;
	}

	public void setVisible(boolean visible) {
		// no-op
	}
	
	public String selectText(String selector) {
		try {
			HtmlUnitXPath xpath = new HtmlUnitXPath(selector);
			return xpath.stringValueOf(lastPage());
		} catch (JaxenException e) {
			throw new RuntimeException(e);
		}
	}

	public List selectElements(String selector) {
		try {
			HtmlUnitXPath xpath = new HtmlUnitXPath(selector);
			List nodes = xpath.selectNodes(lastPage());
			List elements = new ArrayList();
			
			for (int i = 0; i < nodes.size(); i++) {
				elements.add(new HtmlUnitWebElement((HtmlElement) nodes.get(i)));
			}
			
			return elements;
		} catch (JaxenException e) {
			throw new RuntimeException(e);
		}
	}

	public WebElement selectElement(String selector) {
		if (selector.startsWith("link=")) {
			return selectLinkWithText(selector);
		} else if (selector.startsWith("id=")) {
			return selectElementById(selector);
		} else {
			return selectElementUsingXPath(selector);
		}
	}
	
	public void dumpBody() {
		WebResponse webResponse = lastPage().getWebResponse();
		System.out.println(webResponse.getContentAsString());
	}
	
	public void close() {
		newWebClient();
	}


    public TargetLocator switchTo() {
        return new HtmlUnitTargetLocator();
    }

    private synchronized HtmlPage lastPage() {
        return (HtmlPage) currentWindow.getEnclosedPage();
    }

	private WebElement selectLinkWithText(String selector) {
		int equalsIndex = selector.indexOf('=') + 1;
		String expectedText = selector.substring(equalsIndex).trim();
		
		List anchors = lastPage().getAnchors();
		Iterator allAnchors = anchors.iterator();
		while (allAnchors.hasNext()) {
			HtmlAnchor anchor = (HtmlAnchor) allAnchors.next();
			if (expectedText.equals(anchor.asText())) {
				return new HtmlUnitWebElement(anchor);
			}
		}
		throw new NoSuchElementException("No link found with text: " + expectedText);
	}

	private WebElement selectElementById(String selector) {
		int equalsIndex = selector.indexOf('=') + 1;
		String id = selector.substring(equalsIndex).trim();

        try {
            HtmlElement element = lastPage().getHtmlElementById(id);
	    	return new HtmlUnitWebElement(element);
        } catch (ElementNotFoundException e) {
            throw new NoSuchElementException("Cannot find element with ID: " + id);
        }
    }
	
	private WebElement selectElementUsingXPath(String selector) {
		try {
			XPath xpath = new HtmlUnitXPath(selector);
            Object node = xpath.selectSingleNode(lastPage());
			if (node == null) 
				throw new NoSuchElementException("Cannot locate a node using " + selector);
			return new HtmlUnitWebElement((HtmlElement) node);
		} catch (JaxenException e) {
			throw new RuntimeException(e);
		}
	}

    private class HtmlUnitTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            HtmlPage page = (HtmlPage) webClient.getCurrentWindow().getEnclosedPage();
            currentWindow = (WebWindow) page.getFrames().get(frameIndex);
            return HtmlUnitDriver.this;
        }
    }
}
