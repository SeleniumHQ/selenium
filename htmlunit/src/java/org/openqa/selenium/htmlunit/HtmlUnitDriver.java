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

package org.openqa.selenium.htmlunit;

import java.net.ConnectException;
import java.net.URL;
import java.net.UnknownHostException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.httpclient.HttpState;

import com.gargoylesoftware.htmlunit.ElementNotFoundException;
import com.gargoylesoftware.htmlunit.Page;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.WebResponse;
import com.gargoylesoftware.htmlunit.WebWindow;
import com.gargoylesoftware.htmlunit.WebWindowEvent;
import com.gargoylesoftware.htmlunit.WebWindowListener;
import com.gargoylesoftware.htmlunit.html.FrameWindow;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlInlineFrame;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.ReturnedCookie;

public class HtmlUnitDriver implements WebDriver, FindsById, FindsByLinkText, 
		FindsByXPath, FindsByName, SearchContext {
    private WebClient webClient;
    private WebWindow currentWindow;
    /** window name => history. */
    private Map<String, History> histories = new HashMap<String, History>();

    public HtmlUnitDriver() {
        webClient = newWebClient();
        webClient.addWebWindowListener(new WebWindowListener() {
            private boolean waitingToLoad;

            public void webWindowOpened(WebWindowEvent webWindowEvent) {
                waitingToLoad = true;
            }

            public void webWindowContentChanged(WebWindowEvent webWindowEvent) {
                WebWindow window = webWindowEvent.getWebWindow();
                if (waitingToLoad) {
                    waitingToLoad = false;
                    webClient.setCurrentWindow(window);
                }
                String windowName = window.getName();
                History history = histories.get(windowName);
                if (history == null) {
                    history = new History(window);
                    histories.put(windowName, history);
                }
                history.addNewPage(webWindowEvent.getNewPage());
            }

            public void webWindowClosed(WebWindowEvent webWindowEvent) {
                WebWindow window = webWindowEvent.getWebWindow();
                String windowName = window.getName();
                histories.remove(windowName);
                pickWindow();
            }
        });
    }

    private HtmlUnitDriver(WebWindow currentWindow) {
        this();
        this.currentWindow = currentWindow;
    }

    protected WebClient newWebClient() {
        WebClient client = new WebClient();
        client.setThrowExceptionOnFailingStatusCode(true);
        client.setJavaScriptEnabled(false);
        client.setRedirectEnabled(true);
        try {
			client.setUseInsecureSSL(true);
		} catch (GeneralSecurityException e) {
			throw new RuntimeException(e);
		}
        return client;
    }

    public void get(String url) {
        try {
            URL fullUrl = new URL(url);
            webClient.getPage(fullUrl);
        } catch (UnknownHostException e) {
          // This should be fine
        } catch (ConnectException e) {
          // This might be expected
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        pickWindow();
    }

    private void pickWindow() {
        currentWindow = webClient.getCurrentWindow();
        Page page = webClient.getCurrentWindow().getEnclosedPage();

        if (page == null)
          return;

        if (((HtmlPage) page).getFrames().size() > 0) {
            FrameWindow frame = (FrameWindow) ((HtmlPage) page).getFrames().get(0);
            if (!(frame.getFrameElement() instanceof HtmlInlineFrame))
                switchTo().frame(0);
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

    public WebElement findElement(By by) {
        return by.findElement((SearchContext)this);
    }

    public List<WebElement> findElements(By by) {
        return by.findElements((SearchContext)this);
    }

    public String getPageSource() {
        WebResponse webResponse = lastPage().getWebResponse();
        return webResponse.getContentAsString();
    }

    public void close() {
        webClient = newWebClient();
    }

    public void quit() {
    	webClient = null;
    	currentWindow = null;
    }

    public TargetLocator switchTo() {
        return new HtmlUnitTargetLocator();
    }


  public Navigation navigate() {
    return new HtmlUnitNavigation();
  }

  private synchronized HtmlPage lastPage() {
        return (HtmlPage) currentWindow.getEnclosedPage();
    }

    public WebElement findElementByLinkText(String selector) {
        int equalsIndex = selector.indexOf('=') + 1;
        String expectedText = selector.substring(equalsIndex).trim();

        List<HtmlAnchor> anchors = lastPage().getAnchors();
        Iterator<HtmlAnchor> allAnchors = anchors.iterator();
        while (allAnchors.hasNext()) {
            HtmlAnchor anchor = allAnchors.next();
            if (expectedText.equals(anchor.asText())) {
                return new HtmlUnitWebElement(this, anchor);
            }
        }
        throw new NoSuchElementException("No link found with text: " + expectedText);
    }

  public List<WebElement> findElementsByLinkText(String selector) {
    int equalsIndex = selector.indexOf('=') + 1;
    String expectedText = selector.substring(equalsIndex).trim();

    List<HtmlAnchor> anchors = lastPage().getAnchors();
    Iterator<HtmlAnchor> allAnchors = anchors.iterator();
    List<WebElement> elements = new ArrayList<WebElement>();
    while (allAnchors.hasNext()) {
      HtmlAnchor anchor = allAnchors.next();
      if (expectedText.equals(anchor.asText())) {
        elements.add(new HtmlUnitWebElement(this, anchor));
      }
    }
    return elements;
  }

    public WebElement findElementById(String id) {
        try {
            HtmlElement element = lastPage().getHtmlElementById(id);
            return new HtmlUnitWebElement(this, element);
        } catch (ElementNotFoundException e) {
            throw new NoSuchElementException("Cannot find element with ID: " + id);
        }
    }

    public List<WebElement> findElementsById(String id) {
        return findElementsByXPath("//*[@id='" + id + "']");
    }

  public WebElement findElementByName(String name) {
    List<HtmlElement> allElements = lastPage().getHtmlElementsByName(name);
    if (allElements.size() > 0) {
        return new HtmlUnitWebElement(this, allElements.get(0));
    }

    throw new NoSuchElementException("Cannot find element with name: " + name);
  }

  @SuppressWarnings("unchecked")
  public List<WebElement> findElementsByName(String using) {
    List allElements = lastPage().getHtmlElementsByName(using);
    return convertRawHtmlElementsToWebElements(allElements);
  }

  public WebElement findElementByXPath(String selector) {
    	Object node = lastPage().getFirstByXPath(selector);
        if (node == null)
            throw new NoSuchElementException("Cannot locate a node using " + selector);
        if (node instanceof HtmlElement)
        	return new HtmlUnitWebElement(this, (HtmlElement) node);
        throw new NoSuchElementException(String.format("Cannot find element with xpath %s", selector));
    }

    public List<WebElement> findElementsByXPath(String selector) {
    	List<? extends Object> nodes = lastPage().getByXPath(selector);
        return convertRawHtmlElementsToWebElements(nodes);
    }

    private List<WebElement> convertRawHtmlElementsToWebElements(List<? extends Object> nodes) {
        List<WebElement> elements = new ArrayList<WebElement>();

      for (Object node : nodes) {
    	if (node instanceof HtmlElement)
    		elements.add(new HtmlUnitWebElement(this, (HtmlElement) node));
      }

        return elements;
    }


  private class HtmlUnitTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            HtmlPage page = (HtmlPage) webClient.getCurrentWindow().getEnclosedPage();
            try {
                currentWindow = (WebWindow) page.getFrames().get(frameIndex);
            } catch (IndexOutOfBoundsException e) {
                throw new NoSuchFrameException("Cannot find frame: " + frameIndex);
            }
            return HtmlUnitDriver.this;
        }

        public WebDriver frame(String name) {
            HtmlPage page = (HtmlPage) webClient.getCurrentWindow().getEnclosedPage();
            WebWindow window = webClient.getCurrentWindow();

            String[] names = name.split("\\.");
            for (String frameName : names) {
                try {
                    int index = Integer.parseInt(frameName);
                    window = (WebWindow) page.getFrames().get(index);
                } catch (NumberFormatException e) {
                    window = null;
                    for (Object frame : page.getFrames()) {
                        FrameWindow frameWindow = (FrameWindow) frame;
                        if (frameName.equals(frameWindow.getFrameElement().getId())) {
                            window = frameWindow;
                            break;
                        } else if (frameName.equals(frameWindow.getName())) {
                            window = frameWindow;
                            break;
                        }
                    }
                    if (window == null) {
                        throw new NoSuchFrameException("Cannot find frame: " + name);
                    }
                } catch (IndexOutOfBoundsException e) {
                    throw new NoSuchFrameException("Cannot find frame: " + name);
                }

                page = (HtmlPage) window.getEnclosedPage();
            }

            currentWindow = window;
            return HtmlUnitDriver.this;
        }

        public WebDriver window(String windowId) {
            WebWindow window = webClient.getWebWindowByName(windowId);
            webClient.setCurrentWindow(window);
            pickWindow();
            return HtmlUnitDriver.this;
        }

        public WebDriver defaultContent() {
            pickWindow();
            return HtmlUnitDriver.this;
        }

		public WebElement activeElement() {
            Page page = currentWindow.getEnclosedPage();
            if (page instanceof HtmlPage) {
                HtmlElement element = ((HtmlPage) page).getFocusedElement();
                if (element == null) {
                    List<? extends HtmlElement> allBodies = ((HtmlPage) page).getDocumentElement().getHtmlElementsByTagName("body");
                    if (allBodies.size() > 0)
                        return new HtmlUnitWebElement(HtmlUnitDriver.this, allBodies.get(0));
                }
            }

            throw new NoSuchElementException("Unable to locate element with focus or body tag");
        }

        public Alert alert() {
            return null;
        }
    }

    protected WebDriver findActiveWindow() {
        WebWindow window = webClient.getCurrentWindow();
        HtmlPage page = (HtmlPage) window.getEnclosedPage();

        if (page != null && page.getFrames().size() > 0) {
            FrameWindow frame = (FrameWindow) page.getFrames().get(0);
            if (!(frame.getFrameElement() instanceof HtmlInlineFrame))
                return new HtmlUnitDriver(frame);
        }

        if (currentWindow != null && currentWindow.equals(window))
            return this;
        return new HtmlUnitDriver(window);
    }


    protected WebClient getWebClient() {
        return webClient;
    }

    protected WebWindow getCurrentWindow() {
        return currentWindow;
    }

    private class History {
        private final WebWindow window;
        private List<Page> history = new ArrayList<Page>();
        private int index = -1;

        private History(WebWindow window) {
            this.window = window;
        }

        public void addNewPage(Page newPage) {
            ++index;
            while (history.size() > index) {
                history.remove(index);
            }
            history.add(newPage);
        }

        public void goBack() {
            if (index > 0) {
                --index;
                window.setEnclosedPage(history.get(index));
            }
        }

        public void goForward() {
            if (index < history.size() - 1) {
                ++index;
                window.setEnclosedPage(history.get(index));
            }
        }
    }

    private class HtmlUnitNavigation implements Navigation {
      public void back() {
        String windowName = currentWindow.getName();
        History history = histories.get(windowName);
        history.goBack();
      }


      public void forward() {
          String windowName = currentWindow.getName();
          History history = histories.get(windowName);
          history.goForward();
      }


      public void to(String url) {
        get(url);
      }
    }

    public Options manage() {
        return new HtmlUnitOptions();
    }

    private class HtmlUnitOptions implements Options {
        private HttpState state;

        HtmlUnitOptions() {
            state = webClient.getWebConnection().getState();
        }

        public void addCookie(Cookie cookie) {
          String domain = getDomainForCookie(cookie);

            state.addCookie(new org.apache.commons.httpclient.Cookie(domain,
                    cookie.getName(), cookie.getValue(), cookie.getPath(), cookie.getExpiry(),
                    cookie.isSecure()));
        }

        public void deleteCookieNamed(String name) {
            //Assume the cookie either doesn't have a domain or has the same domain as the current
            //page. Delete the cookie for both cases.
            state.addCookie(new org.apache.commons.httpclient.Cookie(getHostName(), name, "", "/",
                    new Date(0), false));
            state.addCookie(new org.apache.commons.httpclient.Cookie("", name, "", "/", new Date(0),
                    false));
        }

        public void deleteCookie(Cookie cookie) {
            String domain = getDomainForCookie(cookie);

            state.addCookie(new org.apache.commons.httpclient.Cookie(domain,
                    cookie.getName(), cookie.getValue(), cookie.getPath(), new Date(0),
                    cookie.isSecure()));
        }

        public void deleteAllCookies() {
            state.clearCookies();
        }

        public Set<Cookie> getCookies() {
            HttpState state = webClient.getWebConnection().getState();
            org.apache.commons.httpclient.Cookie[] rawCookies = state.getCookies();
            
            Set<Cookie> retCookies = new HashSet<Cookie>();
            for(org.apache.commons.httpclient.Cookie c : rawCookies) {
                if("".equals(c.getDomain()) || getHostName().indexOf(c.getDomain()) != -1) {
                	if (c.getPath() != null && getPath().startsWith(c.getPath())) {
                		retCookies.add(new ReturnedCookie(c.getName(), c.getValue(), c.getDomain(), c.getPath(),
                            c.getExpiryDate(), c.getSecure()));
                	}
                }
            }
            return retCookies;  
        }

        private String getHostName() {
            return lastPage().getWebResponse().getUrl().getHost().toLowerCase();
        }
        
        private String getPath() {
        	return lastPage().getWebResponse().getUrl().getPath();
        }

        public Speed getSpeed() {
            throw new UnsupportedOperationException();
        }

        public void setSpeed(Speed speed) {
            throw new UnsupportedOperationException();
        }

        private String getDomainForCookie(Cookie cookie) {
            URL current = lastPage().getWebResponse().getUrl();
            String hostName = cookie.getDomain();
            if (hostName == null || "".equals(hostName)) {
                hostName = String.format("%s:%s", current.getHost(), current.getPort());
            }
            return hostName;
        }

    }
}
