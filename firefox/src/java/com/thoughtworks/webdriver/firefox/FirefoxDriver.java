package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.Alert;
import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.Cookie;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.NoSuchFrameException;
import com.thoughtworks.webdriver.internal.FindsById;
import com.thoughtworks.webdriver.internal.FindsByLinkText;
import com.thoughtworks.webdriver.internal.FindsByXPath;

import java.beans.BeanInfo;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


/**
 * An implementation of the {#link WebDriver} interface that drives Firefox. This works through a firefox extension,
 * which can be installed via the {#link FirefoxLauncher}. Important system variables are:
 * <ul>
 *  <li><b>webdriver.firefox.bin</b> - Which firefox binary to use (normally "firefox" on the PATH).</li>
 *  <li><b>webdriver.firefox.profile</b> - The name of the profile to use (normally "WebDriver").</li>
 * </ul>
 *
 * When the driver starts, it will make a copy of the profile it is using, rather than using that profile directly.
 * This allows multiple instances of firefox to be started.
 */
public class FirefoxDriver implements WebDriver, FindsById, FindsByLinkText, FindsByXPath {
    private final ExtensionConnection extension;
    private long id;

    public FirefoxDriver() {
        this(null);
    }

    public FirefoxDriver(String profileName) {
        prepareEnvironment();
      
        extension = new ExtensionConnection("localhost", 7055);

        if (!(connectToBrowser(1))) {
            new FirefoxLauncher().startProfile(profileName);
            connectToBrowser(10);
        }

        if (!extension.isConnected()) {
            throw new RuntimeException(
                    "Unable to connect to Firefox. Is the WebDriver extension installed, and is there a profile called WebDriver?\n" +
                            "To set up a profile for WebDriver, simply start firefox from the command line with the \"ProfileManager\" switch\n" +
                            "This will look like: firefox -ProfileManager. Alternatively, use the FirefoxLauncher support class from this project");
        }

        fixId();
    }

    protected void prepareEnvironment() {
      // Does nothing, but provides a hook for subclasses to do "stuff"
    }

    private FirefoxDriver(ExtensionConnection extension, long id) {
        this.extension = extension;
        this.id = id;
    }

    public WebDriver close() {
        try {
            sendMessage("close", null);
        } catch (NullPointerException e) {
            // All good
            return null;
        }

        return findActiveDriver();
    }

    public String getPageSource() {
        return sendMessage("getPageSource", null);
    }

    public WebDriver get(String url) {
        sendMessage("get", url);
        return this;
    }

    public String getCurrentUrl() {
        return sendMessage("getCurrentUrl", null);
    }

    public String getTitle() {
        return sendMessage("title", null);
    }

    public boolean getVisible() {
        return true;
    }


  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public WebElement findElementById(String using) {
      return findElement("selectElementById", using);
  }


  public List<WebElement> findElementsById(String using) {
      throw new UnsupportedOperationException("findElementsById");
  }


  public List<WebElement> findElementsByLinkText(String using) {
    throw new UnsupportedOperationException("findElementsByLinkText");
  }


  public List<WebElement> findElementsByXPath(String using) {
      String returnedIds = sendMessage("selectElementsUsingXPath", using);
      List<WebElement> elements = new ArrayList<WebElement>();

      if (returnedIds.length() == 0)
          return elements;

      String[] ids = returnedIds.split(",");
      for (String id : ids) {
          elements.add(new FirefoxWebElement(this, id));
      }
      return elements;
  }

  public WebElement findElementByLinkText(String using) {
    return findElement("selectElementUsingLink", using);
  }


  public WebElement findElementByXPath(String using) {
    return findElement("selectElementUsingXPath", using);
  }

  private WebElement findElement(String commandName, String argument) {
    String elementId = sendMessage(commandName, argument);
    if (elementId == null || "".equals(elementId)) {
      throw new NoSuchElementException("Unable to find " + argument);
    }

    return new FirefoxWebElement(this, elementId);
  }

  public WebDriver setVisible(boolean visible) {
        // no-op
        return this;
    }

    public TargetLocator switchTo() {
        return new FirefoxTargetLocator();
    }


    public Navigation navigate() {
        return new FirefoxNavigation();  
    }

  private boolean connectToBrowser(int timeToWaitInSeconds) {
        long waitUntil = System.currentTimeMillis() + timeToWaitInSeconds * 1000;
        while (!extension.isConnected() && waitUntil > System.currentTimeMillis()) {
            try {
                extension.connect();
            } catch (IOException e) {
                try {
                    Thread.sleep(250);
                } catch (InterruptedException ie) {
                    throw new RuntimeException(ie);
                }
            }
        }
        return extension.isConnected();
    }

    protected WebDriver findActiveDriver() {
        String response = sendMessage("findActiveDriver", null);
        long newId = Long.parseLong(response);
        if (newId == id) {
            return this;
        }
        return new FirefoxDriver(extension, newId);
    }

    protected String sendMessage(String methodName, String argument) {
        Response response = extension.sendMessageAndWaitForResponse(methodName, id, argument);
        return response.getResponseText();
    }

    private void fixId() {
        String response = sendMessage("findActiveDriver", null);
        id = Long.parseLong(response);
    }

    public void quit() {
        try {
            sendMessage("quit", null);
        } catch (NullPointerException e) {
            // This is expected. Swallow it.
        }
    }
    
    public Options manage() {
        return new FirefoxOptions();
    }

    private class FirefoxOptions implements Options {
        private final List<String> fieldNames = Arrays.asList("domain", "expiry", "name", "path", "value", "secure");

        public void addCookie(Cookie cookie) {
            sendMessage("addCookie", convertToJson(cookie));
        }

        private String convertToJson(Cookie cookie) {
            BeanInfo info = null;
            try {
                info = Introspector.getBeanInfo(Cookie.class);
            } catch (IntrospectionException e) {
                throw new RuntimeException(e);
            }
            PropertyDescriptor[] properties = info.getPropertyDescriptors();

            StringBuilder toReturn = new StringBuilder("{");

            for (PropertyDescriptor property : properties) {
                if (fieldNames.contains(property.getName())) {
                    Object result = null;
                    try {
                        result = property.getReadMethod().invoke(cookie, new Object[0]);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }

                    if (result != null) {
                        toReturn.append("\"")
                                .append(property.getName())
                                .append("\": \"")
                                .append(String.valueOf(result))
                                .append("\"")
                                .append(", ");
                    }

                }
            }

            toReturn.append("}");

            return toReturn.toString();
        }

        public Set<Cookie> getCookies() {
            String response = sendMessage("getCookie", null).trim();
            Set<Cookie> cookies = new HashSet<Cookie>();

            if(!"".equals(response)) {
                for(String cookieString : response.split("\n")) {
                    HashMap<String, String> attributesMap = new HashMap<String, String>();
                    attributesMap.put("name", "");
                    attributesMap.put("value", "");
                    attributesMap.put("domain", "");
                    attributesMap.put("path", "");
                    attributesMap.put("expires", "");
                    attributesMap.put("secure", "false");

                    for (String attribute : cookieString.split(";")) {
                        if(attribute.contains("=")) {
                            String[] tokens = attribute.trim().split("=");
                            if(attributesMap.get("name").equals("")) {
                                attributesMap.put("name", tokens[0]);
                                attributesMap.put("value", tokens[1]);
                            } else if("domain".equals(tokens[0])
                                    && tokens[1].trim().startsWith(".")) {
                                //convert " .example.com" into "example.com" format
                                int offset = tokens[1].indexOf(".") + 1;
                                attributesMap.put("domain", tokens[1].substring(offset));
                            } else if (tokens.length > 1) {
                                attributesMap.put(tokens[0], tokens[1]);
                            }
                        } else if (attribute.equals("secure")) {
                            attributesMap.put("secure", "true");
                        }
                    }
                    Date expires = null;
                    if (!attributesMap.get("expires").equals("0")) {
                        //firefox stores expiry as number of seconds
                        expires = new Date(Long.parseLong(attributesMap.get("expires")));
                    }
                    cookies.add(new Cookie(attributesMap.get("name"), attributesMap.get("value"), 
                            attributesMap.get("domain"), attributesMap.get("path"),
                            expires, Boolean.parseBoolean(attributesMap.get("secure"))));
                }

            }
            return cookies;
        }
        
        public void deleteCookieNamed(String name) {
            Cookie toDelete = new Cookie(name, "", "", "", null, false);
            sendMessage("deleteCookie", convertToJson(toDelete));
        }
        
        public void deleteCookie(Cookie cookie) {
            sendMessage("deleteCookie", convertToJson(cookie));
        }
        
        public void deleteAllCookies() {
            Set<Cookie> cookies = getCookies();
            for(Cookie c : cookies) {
                deleteCookie(c);
            }
        }
    }

    private class FirefoxTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            String result = sendMessage("switchToFrame", String.valueOf(frameIndex));
            if (result.length() != 0) 
                throw new NoSuchFrameException("Cannot find frame: " + result);
            return FirefoxDriver.this;
        }

        public WebDriver frame(String frameName) {
            String result = sendMessage("switchToNamedFrame", frameName);
            if (result.length() != 0)
                throw new NoSuchFrameException("Cannot find frame: " + result);
            return FirefoxDriver.this;
        }

        public WebDriver window(String windowName) {
            String response = sendMessage("switchToWindow", String.valueOf(windowName));
            if (response == null || "No window found".equals(response)) {
                return null;
            }
            try {
                FirefoxDriver.this.id = Long.parseLong(response);
            } catch (NumberFormatException e) {
                throw new RuntimeException("When switching to window: " + windowName + " ---- " + response);
            }
            return FirefoxDriver.this;
        }

        public WebDriver defaultContent() {
            sendMessage("switchToDefaultContent", null);
            return FirefoxDriver.this;
        }

        public Alert alert() {
            throw new UnsupportedOperationException("alert");
        }
    }

    private class FirefoxNavigation implements Navigation {
      public WebDriver back() {
        sendMessage("goBack", null);
        return FirefoxDriver.this;
      }

      public WebDriver forward() {
        sendMessage("goForward", null);
        return FirefoxDriver.this;
      }

      public WebDriver to(String url) {
        return get(url);
      }
    }
}
