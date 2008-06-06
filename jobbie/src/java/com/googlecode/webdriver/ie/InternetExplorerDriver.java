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

package com.googlecode.webdriver.ie;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.googlecode.webdriver.Alert;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.Cookie;
import com.googlecode.webdriver.SearchContext;
import com.googlecode.webdriver.Speed;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.internal.FindsByClassName;
import com.googlecode.webdriver.internal.FindsById;
import com.googlecode.webdriver.internal.FindsByLinkText;
import com.googlecode.webdriver.internal.FindsByName;
import com.googlecode.webdriver.internal.FindsByXPath;
import com.googlecode.webdriver.internal.ReturnedCookie;

public class InternetExplorerDriver implements WebDriver, SearchContext,
	FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByXPath {
    private long iePointer; // Used by the native code to keep track of the IE instance
    private static boolean comStarted;

    public InternetExplorerDriver() {
        startCom();
        openIe();
    }

    @SuppressWarnings("unused")
    private InternetExplorerDriver(long iePointer) {
        this.iePointer = iePointer;
    }

    public String getPageSource() {
        throw new UnsupportedOperationException("getPageSource");
    }

    public native void close();
    
    public void quit() {
    	close();  // Not a good implementation, but better than nothing
    }

    public native void get(String url);

    public native String getCurrentUrl();

    public native String getTitle();

    public native boolean getVisible();

    public native void setVisible(boolean visible);


    public List<WebElement> findElements(By by) {
        return by.findElements((SearchContext)this);
    }

    public WebElement findElement(By by) {
        return by.findElement((SearchContext)this);
    }

    public WebElement findElementById(String using) {
        return selectElementById(using);
    }

    public WebElement findElementByLinkText(String using) {
        return selectElementByLink(using);
    }

    public WebElement findElementByName(String using) {
    	return selectElementByName(using);
    }

	public List<WebElement> findElementsByName(String using) {
    	return selectElementsByName(using);
    }
	
	public WebElement findElementByClassName(String using) {
		return selectElementByClassName(using);
	}
	private native WebElement selectElementByClassName(String using);
		  
	public List<WebElement> findElementsByClassName(String using) {
		return selectElementsByClassName(using);
	}
	private native List<WebElement> selectElementsByClassName(String using);

	private native WebElement selectElementByXPath(String using);
	
	public WebElement findElementByXPath(String using) {
		return selectElementByXPath(using);
    }

	private native void selectElementsByXPath(String linkText, List<WebElement> rawElements);
	
	public List<WebElement> findElementsByXPath(String using) {
        List<WebElement> rawElements = new ArrayList<WebElement>();
        selectElementsByXPath(using, rawElements);
        return rawElements;
    }

    
    public List<WebElement> findElementsByLinkText(String using) {
        List<WebElement> rawElements = new ArrayList<WebElement>();
        selectElementsByLink(using, rawElements);
        return rawElements;
    }


  public List<WebElement> findElementsById(String using) {
    throw new UnsupportedOperationException("findElementsById");
  }

  @Override
    public String toString() {
        return getClass().getName() + ":" + iePointer;
    }

    public TargetLocator switchTo() {
        return new InternetExplorerTargetLocator();
    }


    public Navigation navigate() {
        return new InternetExplorerNavigation();
    }

    public Options manage() {
        return new InternetExplorerOptions();
    }

    protected native void waitForLoadToComplete();

    private void startCom() {
        if (!comStarted) {
            loadLibrary();
            startComNatively();
            comStarted = true;
        }
    }

	private void loadLibrary() {
		try {
			System.loadLibrary("InternetExplorerDriver");
		} catch (UnsatisfiedLinkError e) {
            File dll = writeResourceToDisk("InternetExplorerDriver.dll");
            System.load(dll.getAbsolutePath());
        }
	}

	private File writeResourceToDisk(String resourceName) throws UnsatisfiedLinkError {
		InputStream is = InternetExplorerDriver.class.getResourceAsStream(resourceName);
		if (is == null) 
			is = InternetExplorerDriver.class.getResourceAsStream("/" + resourceName);
		
        FileOutputStream fos = null;
        
		try {
		    File dll = File.createTempFile("webdriver", null);
		    dll.deleteOnExit();
		    fos = new FileOutputStream(dll);
		    
		    int count;
		    byte[] buf = new byte[4096];
		    while ((count = is.read(buf, 0, buf.length)) > 0) {
		        fos.write(buf, 0, count);
		    }
		    
		    return dll;
		} catch(IOException e2) {
		    throw new UnsatisfiedLinkError("Cannot create temporary DLL: " + e2.getMessage());
		}
		finally {
		    try { is.close(); } catch(IOException e2) { }
		    if (fos != null) {
		        try { fos.close(); } catch(IOException e2) { }
		    }
		}
	}

    private native void startComNatively();

    private native void openIe();

    private native WebElement selectElementById(String elementId);

    private native WebElement selectElementByLink(String linkText);

    private native void selectElementsByLink(String linkText, List<WebElement> rawElements);

    private native WebElement selectElementByName(String using);

    private native List<WebElement> selectElementsByName(String using);
    
    @Override
    protected void finalize() throws Throwable {
    	if (iePointer != 0)
    		deleteStoredObject();
    }

    private native void deleteStoredObject();

    private native void setFrameIndex(int frameIndex);
    
    private native void goBack();
	private native void goForward();

	private native void doAddCookie(String cookieString);
    private native String doGetCookies();
	
    private class InternetExplorerTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            setFrameIndex(frameIndex);
            return InternetExplorerDriver.this;
        }

        public WebDriver frame(String frameName) {
            throw new UnsupportedOperationException("frame");
        }

        public WebDriver window(String windowName) {
            return null; // For the sake of getting us off the ground
        }

        public WebDriver defaultContent() {
            throw new UnsupportedOperationException("defaultContent");
        }


        public WebElement activeElement() {
            throw new UnsupportedOperationException("activeElement");
        }

        public Alert alert() {
            throw new UnsupportedOperationException("alert");
        }
    }
    
    private class InternetExplorerNavigation implements Navigation {
		public void back() {
			goBack();
		}
		
		public void forward() {
			goForward();
		}

		public void to(String url) {
			get(url);
		}
    }
    
    private class InternetExplorerOptions implements Options {
		public void addCookie(Cookie cookie) {
			doAddCookie(cookie.toString());
		}

		public void deleteAllCookies() {
			Set<Cookie> cookies = getCookies();
			for (Cookie cookie : cookies) {
				deleteCookie(cookie);
			}
		}

		public void deleteCookie(Cookie cookie) {
			Date dateInPast = new Date(0);
			Cookie toDelete = new ReturnedCookie(cookie.getName(), cookie.getValue(), cookie.getDomain(), cookie.getPath(), dateInPast, false);
			addCookie(toDelete);
		}

		public void deleteCookieNamed(String name) {
			deleteCookie(new ReturnedCookie(name, "", getCurrentHost(), "", null, false));
		}

		public Set<Cookie> getCookies() {
			String currentUrl = getCurrentHost();
			
			Set<Cookie> toReturn = new HashSet<Cookie>();
			String allDomainCookies = doGetCookies();

			String[] cookies = allDomainCookies.split("; ");
			for (String cookie : cookies) {
				String[] parts = cookie.split("=");
				if (parts.length != 2) {
					continue;
				}
				
				toReturn.add(new ReturnedCookie(parts[0], parts[1], currentUrl, "", null, false));
			}
			
	        return toReturn;
		}

		private String getCurrentHost() {
			try {
				URL url = new URL(getCurrentUrl());
				return url.getHost();
			} catch (MalformedURLException e) {
				return "";
			}
		}

        public Speed getMouseSpeed() {
            throw new UnsupportedOperationException();
        }

        public void setMouseSpeed(Speed speed) {
            throw new UnsupportedOperationException();
        }
    }
}
