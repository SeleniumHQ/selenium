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

package org.openqa.selenium.ie;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.ReturnedCookie;

public class InternetExplorerDriver implements WebDriver, SearchContext, JavascriptExecutor {
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

    private native Object doExecuteScript(String script, Object[] args);
    public Object executeScript(String script, Object... args) {
    	for (Object arg : args) {
    		if (!(arg instanceof String || 
    			  arg instanceof Boolean || 
    			  arg instanceof Number || 
    			  arg instanceof InternetExplorerElement))
    			throw new IllegalArgumentException("Parameter is not of recognized type: " + arg);
    	}
    	
    	script = script.replace("\"", "\\\"");
    	script = "(function() { return function(){" + script + "};})();";
    	return doExecuteScript(script, args);
    }
    
    
    public native void get(String url);

    public native String getCurrentUrl();

    public native String getTitle();

    public native boolean getVisible();

    public native void setVisible(boolean visible);

    public List<WebElement> findElements(By by) {
    	return new Finder(iePointer, 0).findElements(by);
    }

    public WebElement findElement(By by) {
        return new Finder(iePointer, 0).findElement(by);
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

    @Override
    protected void finalize() throws Throwable {
    	if (iePointer != 0)
    		deleteStoredObject();
    }

    private native void deleteStoredObject();

    private native void setFrameIndex(String pathToFrame);
    
    private native void goBack();
	private native void goForward();

	private native void doAddCookie(String cookieString);
    private native String doGetCookies();
    
    private native void doSetMouseSpeed(int timeOut);
	
    private native WebElement doSwitchToActiveElement();
    
    private class InternetExplorerTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            return frame(String.valueOf(frameIndex));
        }

        public WebDriver frame(String frameName) {
        	setFrameIndex(frameName);
        	return InternetExplorerDriver.this;
        }

        public WebDriver window(String windowName) {
            return null; // For the sake of getting us off the ground
        }

        public WebDriver defaultContent() {
            return frame("");
        }


        public WebElement activeElement() {
            return doSwitchToActiveElement();
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

        public Speed getSpeed() {
            throw new UnsupportedOperationException();
        }

        public void setSpeed(Speed speed) {
            doSetMouseSpeed(speed.getTimeOut());
        }
    }
}
