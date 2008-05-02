package com.googlecode.webdriver.firefox;

import com.googlecode.webdriver.Alert;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.Cookie;
import com.googlecode.webdriver.NoSuchElementException;
import com.googlecode.webdriver.NoSuchFrameException;
import com.googlecode.webdriver.Speed;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.firefox.internal.ExtensionConnectionFactory;
import com.googlecode.webdriver.firefox.internal.ProfilesIni;
import com.googlecode.webdriver.internal.FindsById;
import com.googlecode.webdriver.internal.FindsByLinkText;
import com.googlecode.webdriver.internal.FindsByXPath;
import com.googlecode.webdriver.internal.OperatingSystem;
import com.googlecode.webdriver.internal.ReturnedCookie;

import org.json.simple.JSONObject;

import java.beans.BeanInfo;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
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
	public static final String DEFAULT_PROFILE = "WebDriver";
	public static final int DEFAULT_PORT = 7055;

    private final ExtensionConnection extension;
    protected Context context;

    public FirefoxDriver() {
        this(getProfileName(), DEFAULT_PORT);
    }

    public FirefoxDriver(String profileName) {
    	this(findProfile(profileName), DEFAULT_PORT);
    }

    public FirefoxDriver(String profileName, int port) {
        this(findProfile(profileName), port);
    }

    /**
     * @deprecated Use FirefoxDriver(new FirefoxProfile(profileDir)) instead
     */
    public FirefoxDriver(File profileDir) {
      this (profileDir, DEFAULT_PORT);
    }

    /**
     * @deprecated Use FirefoxDriver(new FirefoxProfile(profileDir), port) instead
     */    
    public FirefoxDriver(File profileDir, int port) {
      this(new FirefoxProfile(profileDir), port);
    }

    public FirefoxDriver(FirefoxProfile profile) {
      this(profile, DEFAULT_PORT);
    }

    public FirefoxDriver(FirefoxProfile profile, int port) {
        profile.init();
        prepareEnvironment();

        extension = connectTo(profile, "localhost", port);

        if (!extension.isConnected()) {
            throw new RuntimeException(
                    "Unable to connect to Firefox. Is the WebDriver extension installed, and is there a profile called WebDriver?" + 
                    OperatingSystem.getCurrentPlatform().getLineEnding() +
                    "To set up a profile for WebDriver, simply start firefox from the command line with the \"ProfileManager\" switch" + 
                    OperatingSystem.getCurrentPlatform().getLineEnding() +
                    "This will look like: firefox -ProfileManager. Alternatively, use the FirefoxLauncher support class from this project");
        }

        fixId();
    }

    private FirefoxDriver(ExtensionConnection extension, Context context) {
      this.extension = extension;
      this.context = context;
    }

    private static String getProfileName() {
      return System.getProperty("webdriver.firefox.profile", DEFAULT_PROFILE);
    }
    
    private static FirefoxProfile findProfile(String profileName) {
      return new ProfilesIni().getProfile(profileName);
    }
    
    protected ExtensionConnection connectTo(FirefoxProfile profile, String host, int port) {
        return ExtensionConnectionFactory.connectTo(profile, host, port);
    }

    protected void prepareEnvironment() {
      // Does nothing, but provides a hook for subclasses to do "stuff"
    }

    public void close() {
        try {
            sendMessage(RuntimeException.class, "close");
        } catch (NullPointerException e) {
            // All good
        }
    }

    public String getPageSource() {
        return sendMessage(RuntimeException.class, "getPageSource");
    }

    public void get(String url) {
        sendMessage(RuntimeException.class, "get", url);
    }

    public String getCurrentUrl() {
        return sendMessage(RuntimeException.class, "getCurrentUrl");
    }

    public String getTitle() {
        return sendMessage(RuntimeException.class, "title");
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
      String returnedIds = sendMessage(RuntimeException.class, "selectElementsUsingXPath", using);
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
    String elementId = sendMessage(NoSuchElementException.class, commandName, argument);

    return new FirefoxWebElement(this, elementId);
  }

  public void setVisible(boolean visible) {
        // no-op
    }

    public TargetLocator switchTo() {
        return new FirefoxTargetLocator();
    }


    public Navigation navigate() {
        return new FirefoxNavigation();  
    }

    protected WebDriver findActiveDriver() {
        String response = sendMessage(RuntimeException.class, "findActiveDriver");

        Context newContext = new Context(response);
        if (newContext.getDriverId().equals(newContext.getDriverId())) {
            return this;
        }
        return new FirefoxDriver(extension, newContext);
    }

    private String sendMessage(Class<? extends RuntimeException> throwOnFailure, String methodName, Object... parameters) {
        return sendMessage(throwOnFailure, new Command(context, methodName, parameters));
    }

    protected String sendMessage(Class<? extends RuntimeException> throwOnFailure, Command command) {
        Response response = extension.sendMessageAndWaitForResponse(throwOnFailure, command);
        context = response.getContext();
        response.ifNecessaryThrow(throwOnFailure);
        return response.getResponseText();
    }

    private void fixId() {
        String response = sendMessage(RuntimeException.class, "findActiveDriver");
        this.context = new Context(response);
    }

    public void quit() {
        extension.quit();
    }

    public void setOffline(boolean isOffline) {
        sendMessage(RuntimeException.class, "setOffline", isOffline);
    }
    
    public Options manage() {
        return new FirefoxOptions();
    }

    private class FirefoxOptions implements Options {
        private final List<String> fieldNames = Arrays.asList("domain", "expiry", "name", "path", "value", "secure");
        private final DateFormat RFC_1123_DATE_FORMAT = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'Z", Locale.US);
        //TODO: need to refine the values here
        private final int SLOW_SPEED = 1;
        private final int MEDIUM_SPEED = 10;
        private final int FAST_SPEED = 100;
        
        public void addCookie(Cookie cookie) {
            sendMessage(RuntimeException.class, "addCookie", convertToJson(cookie));
        }

        private String convertToJson(Cookie cookie) {
          JSONObject json = new JSONObject();

          BeanInfo info;
            try {
                info = Introspector.getBeanInfo(Cookie.class);
            } catch (IntrospectionException e) {
                throw new RuntimeException(e);
            }
            PropertyDescriptor[] properties = info.getPropertyDescriptors();

            for (PropertyDescriptor property : properties) {
                if (fieldNames.contains(property.getName())) {
                    Object result;
                    try {
                        result = property.getReadMethod().invoke(cookie);
                        json.put(property.getName(), result);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }
            }

            if (cookie.getExpiry() != null)
              json.put("expiry",  RFC_1123_DATE_FORMAT.format(cookie.getExpiry()));

            return json.toString();
        }

        public Set<Cookie> getCookies() {
            String response = sendMessage(RuntimeException.class, "getCookie").trim();
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
                    cookies.add(new ReturnedCookie(attributesMap.get("name"), attributesMap.get("value"),
                            attributesMap.get("domain"), attributesMap.get("path"),
                            expires, Boolean.parseBoolean(attributesMap.get("secure"))));
                }

            }
            return cookies;
        }
        
        public void deleteCookieNamed(String name) {
            Cookie toDelete = new Cookie(name, "");
            sendMessage(RuntimeException.class, "deleteCookie", convertToJson(toDelete));
        }
        
        public void deleteCookie(Cookie cookie) {
            sendMessage(RuntimeException.class, "deleteCookie", convertToJson(cookie));
        }
        
        public void deleteAllCookies() {
            Set<Cookie> cookies = getCookies();
            for(Cookie c : cookies) {
                deleteCookie(c);
            }
        }
        
        public Speed getMouseSpeed() {
            int pixelSpeed = Integer.parseInt(sendMessage(RuntimeException.class, "getMouseSpeed"));
            Speed speed;

            // TODO: simon 2007-02-01; Delegate to the enum
            switch (pixelSpeed) {
                case SLOW_SPEED:
                    speed = Speed.SLOW;
                    break;
                case MEDIUM_SPEED:
                    speed = Speed.MEDIUM;
                    break;
                case FAST_SPEED:
                    speed = Speed.FAST;
                    break;
                default:
                    //TODO: log a warning here
                    speed = Speed.FAST;
                    break;
            }
            return speed;
        }
        
        public void setMouseSpeed(Speed speed) {
            int pixelSpeed;
            // TODO: simon 2007-02-01; Delegate to the enum
            switch(speed) {
                case SLOW:
                    pixelSpeed = SLOW_SPEED;
                    break;
                case MEDIUM:
                    pixelSpeed = MEDIUM_SPEED;
                    break;
                case FAST:
                    pixelSpeed = FAST_SPEED;
                    break;
                default:
                    throw new IllegalArgumentException();
            }
            sendMessage(RuntimeException.class, "setMouseSpeed", "" + pixelSpeed);
        }
    }

    private class FirefoxTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            return frame(String.valueOf(frameIndex));
        }

        public WebDriver frame(String frameName) {
            sendMessage(NoSuchFrameException.class, "switchToFrame", frameName);
            return FirefoxDriver.this;
        }

        public WebDriver window(String windowName) {
            // TODO: simon: 2007-02-01 This should also throw an exception
            String response = sendMessage(RuntimeException.class, "switchToWindow", String.valueOf(windowName));
            if (response == null || "No window found".equals(response)) {
                return null;
            }
            try {
                FirefoxDriver.this.context = new Context(response);
            } catch (NumberFormatException e) {
                throw new RuntimeException("When switching to window: " + windowName + " ---- " + response);
            }
            return FirefoxDriver.this;
        }

        public WebDriver defaultContent() {
            sendMessage(RuntimeException.class, "switchToDefaultContent");
            return FirefoxDriver.this;
        }


        public WebElement activeElement() {
            return findElement("switchToActiveElement", "active element");
        }

        public Alert alert() {
            throw new UnsupportedOperationException("alert");
        }
    }

    private class FirefoxNavigation implements Navigation {
      public void back() {
        sendMessage(RuntimeException.class, "goBack");
      }

      public void forward() {
        sendMessage(RuntimeException.class, "goForward");
      }

      public void to(String url) {
        get(url);
      }
    }
}
