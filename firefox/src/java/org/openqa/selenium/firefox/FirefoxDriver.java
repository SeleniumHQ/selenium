/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox;

import java.beans.BeanInfo;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.IllegalLocatorException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Speed;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.internal.ExtensionConnectionFactory;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.ReturnedCookie;

import static org.openqa.selenium.OutputType.FILE;


/**
 * An implementation of the {#link WebDriver} interface that drives Firefox. This works through a firefox extension,
 * which gets installed automatically if necessary. Important system variables are:
 * <ul>
 *  <li><b>webdriver.firefox.bin</b> - Which firefox binary to use (normally "firefox" on the PATH).</li>
 *  <li><b>webdriver.firefox.profile</b> - The name of the profile to use (normally "WebDriver").</li>
 * </ul>
 *
 * When the driver starts, it will make a copy of the profile it is using, rather than using that profile directly.
 * This allows multiple instances of firefox to be started.
 */
public class FirefoxDriver implements WebDriver, JavascriptExecutor, TakesScreenshot,
        FindsById, FindsByClassName, FindsByCssSelector,
        FindsByLinkText, FindsByName, FindsByTagName, FindsByXPath {
    public static final int DEFAULT_PORT = 7055;
    // For now, only enable native events on Windows
    public static final boolean DEFAULT_ENABLE_NATIVE_EVENTS =
      Platform.getCurrent().is(Platform.WINDOWS);
    // Accept untrusted SSL certificates.
    public static final boolean ACCEPT_UNTRUSTED_CERTIFICATES = true;
    // Assume that the untrusted certificates will come from untrusted issuers
    // or will be self signed.
    public static final boolean ASSUME_UNTRUSTED_ISSUER = true;

    // Commands we can execute with needing to dismiss an active alert
    private final Set<String> alertWhiteListedCommands = new HashSet<String>() {{
      add("dismissAlert");
    }};
    private final ExtensionConnection extension;
    protected Context context;
    private FirefoxAlert currentAlert;

  public FirefoxDriver() {
      this(new FirefoxBinary(), null);
    }

  public FirefoxDriver(FirefoxProfile profile) {
      this(new FirefoxBinary(), profile);
    }

  public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile) {
    FirefoxProfile profileToUse = profile;
    String suggestedProfile = System.getProperty("webdriver.firefox.profile");
    if (profileToUse == null && suggestedProfile != null) {
      profileToUse = new ProfilesIni().getProfile(suggestedProfile);
    } else if (profileToUse == null) {
      profileToUse = new FirefoxProfile();
      profileToUse.addWebDriverExtensionIfNeeded(false);
    } else {
      profileToUse.addWebDriverExtensionIfNeeded(false);
    }
    prepareEnvironment();

    extension = connectTo(binary, profileToUse, "localhost");
    fixId();
  }

    private FirefoxDriver(ExtensionConnection extension, Context context) {
      this.extension = extension;
      this.context = context;
    }

    protected ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile, String host) {
        return ExtensionConnectionFactory.connectTo(binary, profile, host);
    }

    protected void prepareEnvironment() {
      // Does nothing, but provides a hook for subclasses to do "stuff"
    }

    public void close() {
        try {
            sendMessage(WebDriverException.class, "close");
        } catch (Exception e) {
            // All good
        }
    }

    public String getPageSource() {
        return sendMessage(WebDriverException.class, "getPageSource");
    }

    public void get(String url) {
        sendMessage(WebDriverException.class, "get", url);
    }

    public String getCurrentUrl() {
        return sendMessage(WebDriverException.class, "getCurrentUrl");
    }

    public String getTitle() {
        return sendMessage(WebDriverException.class, "title");
    }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public WebElement findElementById(String using) {
      return findElement("id", using);
  }

  public List<WebElement> findElementsById(String using) {
      return findElements("id", using);
  }

  public WebElement findElementByLinkText(String using) {
    return findElement("link text", using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return findElements("link text", using);
  }

  public WebElement findElementByPartialLinkText(String using) {
      return findElement("partial link text", using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return findElements("partial link text", using);
  }

  public List<WebElement> findElementsByXPath(String using) {
      return findElements("xpath", using);
  }

  public WebElement findElementByXPath(String using) {
      return findElement("xpath", using);
  }

  public List<WebElement> findElementsByClassName(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the class name expression is null.");

    if (using.matches(".*\\s+.*")) {
      throw new IllegalLocatorException(
          "Compound class names are not supported. Consider searching for one class name and filtering the results.");
    }
        
    return findElements("class name", using);
  }

  public WebElement findElementByClassName(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the class name expression is null.");

    if (using.matches(".*\\s+.*")) {
      throw new IllegalLocatorException(
          "Compound class names are not supported. Consider searching for one class name and filtering the results.");
    }

    return findElement("class name", using);
  }

  public WebElement findElementByCssSelector(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the css selector is null.");

    return findElement("css selector", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the css selector is null.");

    return findElements("css selector", using);
  }

  public WebElement findElementByName(String using) {
      return findElement("name", using);
  }

  public List<WebElement> findElementsByName(String using) {
      return findElements("name", using);
  }

  public WebElement findElementByTagName(String using) {
    return findElement("tag name", using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return findElements("tag name", using);
  }
  
  private WebElement findElement(String method, String selector) {
    String elementId = sendMessage(NoSuchElementException.class,
        "findElement", method, selector);

    return new FirefoxWebElement(this, elementId);
  }

  private List<WebElement> findElements(String method, String selector) {
    JSONArray returnedIds = (JSONArray) executeCommand(
        WebDriverException.class, "findElements", method, selector);
    List<WebElement> elements = new ArrayList<WebElement>();

    try {
      for (int i = 0; i < returnedIds.length(); i++) {
        String id = returnedIds.getString(i);
        elements.add(new FirefoxWebElement(this, id));
      }
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }

    return elements;
  }

    public TargetLocator switchTo() {
        return new FirefoxTargetLocator();
    }


    public Navigation navigate() {
        return new FirefoxNavigation();
    }

    protected WebDriver findActiveDriver() {
        String response = sendMessage(WebDriverException.class, "newSession");

        Context newContext = new Context(response);
        if (newContext.getDriverId().equals(newContext.getDriverId())) {
            return this;
        }
        return new FirefoxDriver(extension, newContext);
    }

    private String sendMessage(Class<? extends WebDriverException> throwOnFailure, String methodName, Object... parameters) {
        return sendMessage(throwOnFailure, new Command(context, methodName, parameters));
    }

    protected String sendMessage(Class<? extends RuntimeException> throwOnFailure, Command command) {
      return String.valueOf(executeCommand(throwOnFailure, command));
    }

    protected Object executeCommand(Class<? extends RuntimeException> throwOnFailure,
                                    String methodName, Object... parameters) {
      return executeCommand(throwOnFailure, new Command(context, methodName, parameters));
    }

    protected Object executeCommand(Class<? extends RuntimeException> throwOnFailure,
                                    Command command) {
      if (currentAlert != null) {
        if (!alertWhiteListedCommands.contains(command.getCommandName())) {
          ((FirefoxTargetLocator) switchTo()).alert().dismiss();
          throw new UnhandledAlertException(command.getCommandName());
        }
      }

      Response response = extension.sendMessageAndWaitForResponse(throwOnFailure, command);
      context = response.getContext();
      response.ifNecessaryThrow(throwOnFailure);

      Object rawResponse = response.getExtraResult("response");
      if (rawResponse instanceof JSONObject) {
        JSONObject jsonObject = (JSONObject) rawResponse;
        if (jsonObject.has("__webdriverType")) {
          // Looks like have an alert. construct it
          try {
            currentAlert = new FirefoxAlert(jsonObject.getString("text"));
            return null;
          } catch (JSONException e) {
            // Or maybe not. Fall through
          }
        }
      }
      return rawResponse;
    }

    private void fixId() {
        String response = sendMessage(WebDriverException.class, "newSession");
        this.context = new Context(response);
    }

    public void quit() {
        extension.quit();
    }

  public String getWindowHandle() {
    return sendMessage(WebDriverException.class, "getCurrentWindowHandle");
  }

  public Set<String> getWindowHandles() {
    JSONArray allHandles = (JSONArray) executeCommand(WebDriverException.class, "getWindowHandles");
    HashSet<String> toReturn = new HashSet<String>();
    for (int i = 0; i < allHandles.length(); i++) {
      String handle = allHandles.optString(i, null);
      if (handle != null) {
        toReturn.add(handle);
      }
    }
    return toReturn;
  }

  public Object executeScript(String script, Object... args) {
        // Escape the quote marks
        script = script.replaceAll("\"", "\\\"");

        Object[] convertedArgs = convertToJsObjects(args);

        try {
          JSONObject jsonResponse = (JSONObject) executeCommand(
              WebDriverException.class, "executeScript", script, convertedArgs);
          return parseJavascriptObjectFromResponse(
              jsonResponse.getString("type"),
              jsonResponse.get("value"));
        } catch (JSONException e) {
          throw new WebDriverException(e);
        }
  }
  
  public Object parseJavascriptObjectFromResponse(String resultType, Object response) {
    if ("NULL".equals(resultType))
      return null;
    
    if ("ARRAY".equals(resultType)) {
      List<Object> list = new ArrayList<Object>();
      try {
        JSONArray array = (JSONArray)response;
        for (int i = 0; i < array.length(); ++i) {
          //They really should all be JSONObjects of form {resultType, response}
          JSONObject subObject = (JSONObject)array.get(i);
          list.add(parseJavascriptObjectFromResponse(
              subObject.getString("type"), subObject.get("value")));
        }
      } catch (JSONException e) {
        throw new WebDriverException(e);
      }
      return list;
    }
    if ("ELEMENT".equals(resultType)) {
      return new FirefoxWebElement(this, (String)response);
    }

    if (response instanceof Integer) {
      return new Long((Integer)response);
    }
    return response;
  }

  public boolean isJavascriptEnabled() {
    return true;
  }

  private Object[] convertToJsObjects(Object[] args) {
    if (args.length == 0)
      return null;

    Object[] converted = new Object[args.length];
    for (int i = 0; i < args.length; i++) {
      converted[i] = convertToJsObject(args[i]);
    }

    return converted;
  }

  private Object convertToJsObject(Object arg) {
    Map<String, Object> converted = new HashMap<String, Object>();

    if (arg instanceof String) {
      converted.put("type", "STRING");
      converted.put("value", arg);
    } else if (arg instanceof Double || arg instanceof Float) {
      converted.put("type", "NUMBER");
      converted.put("value", ((Number) arg).doubleValue());
    } else if (arg instanceof Number) {
      converted.put("type", "NUMBER");
      converted.put("value", ((Number) arg).longValue());
    } else if (isPrimitiveNumberType(arg)) {
      converted.put("type", "NUMBER");
      converted.put("value", getPrimitiveTypeAsLong(arg));
    } else if (arg instanceof Boolean) {
      converted.put("type", "BOOLEAN");
      converted.put("value", ((Boolean) arg).booleanValue());
    } else if (arg.getClass() == boolean.class) {
      converted.put("type", "BOOLEAN");
      converted.put("value", arg);
    } else if (arg instanceof FirefoxWebElement) {
      converted.put("type", "ELEMENT");
      converted.put("value", ((FirefoxWebElement) arg).getElementId());
    } else if (arg instanceof Collection<?>) {
      Collection<?> args = ((Collection<?>)arg);
      Object[] list = new Object[args.size()];
      int i = 0;
      for (Object o : args) {
        list[i] = convertToJsObject(o);
        i++;
      }
      return list;
    } else {
      throw new IllegalArgumentException("Argument is of an illegal type: " + arg);
    }

    return converted;
  }

  private Long getPrimitiveTypeAsLong(Object arg) {
    return Long.valueOf(String.valueOf(arg)); // Clever
  }

  private boolean isPrimitiveNumberType(Object arg) {
    if (!arg.getClass().isPrimitive()) {
      return false;
    }

    return arg.getClass() == long.class ||
           arg.getClass() == int.class ||
           arg.getClass() == short.class; // And so on. That's the common case done :)
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
            sendMessage(WebDriverException.class, "addCookie", convertToJson(cookie));
        }

        private String convertToJson(Cookie cookie) {
          JSONObject json = new JSONObject();

          BeanInfo info;
            try {
                info = Introspector.getBeanInfo(Cookie.class);
            } catch (IntrospectionException e) {
                throw new WebDriverException(e);
            }
            PropertyDescriptor[] properties = info.getPropertyDescriptors();

            for (PropertyDescriptor property : properties) {
                if (fieldNames.contains(property.getName())) {
                    Object result;
                    try {
                        result = property.getReadMethod().invoke(cookie);
                        json.put(property.getName(), result);
                    } catch (Exception e) {
                        throw new WebDriverException(e);
                    }
                }
            }

            if (cookie.getExpiry() != null)
                try {
                    json.put("expiry",  RFC_1123_DATE_FORMAT.format(cookie.getExpiry()));
                } catch (JSONException e) {
                    throw new WebDriverException(e);
                }

            return json.toString();
        }

      public Cookie getCookieNamed(String name) {
        Set<Cookie> allCookies = getCookies();
        for (Cookie cookie : allCookies) {
          if (cookie.getName().equals(name)) {
            return cookie;
          }
        }
        return null;
      }

      public Set<Cookie> getCookies() {
            JSONArray response = (JSONArray) executeCommand(WebDriverException.class, "getCookie");
            Set<Cookie> cookies = new HashSet<Cookie>();

            try {
              for (int i = 0; i < response.length(); i++) {
                String cookieString = response.getString(i).trim();
                if ("".equals(cookieString)) {
                  continue;
                }
                HashMap<String, String> attributesMap = new HashMap<String, String>();
                attributesMap.put("name", "");
                attributesMap.put("value", "");
                attributesMap.put("domain", "");
                attributesMap.put("path", "");
                attributesMap.put("expires", "");
                attributesMap.put("secure", "false");

                for (String attribute : cookieString.split(";")) {
                    if(attribute.contains("=")) {
                        String[] tokens = attribute.trim().split("=", 2);
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
              String expiry = attributesMap.get("expires");
              if (expiry != null && !"".equals(expiry) && !expiry.equals("0")) {
                    //firefox stores expiry as number of seconds
                    expires = new Date(Long.parseLong(attributesMap.get("expires")) * 1000);
                }

                cookies.add(new ReturnedCookie(attributesMap.get("name"), attributesMap.get("value"),
                        attributesMap.get("domain"), attributesMap.get("path"),
                        expires, Boolean.parseBoolean(attributesMap.get("secure")), getCurrentUrl()));
              }
            } catch (JSONException e) {
              throw new WebDriverException(e);
            }

          return cookies;
        }

        public void deleteCookieNamed(String name) {
            Cookie toDelete = new Cookie(name, "");
            sendMessage(WebDriverException.class, "deleteCookie", convertToJson(toDelete));
        }

        public void deleteCookie(Cookie cookie) {
            sendMessage(WebDriverException.class, "deleteCookie", convertToJson(cookie));
        }

        public void deleteAllCookies() {
            sendMessage(WebDriverException.class, "deleteAllCookies");
        }

        public Speed getSpeed() {
            int pixelSpeed = (Integer) executeCommand(WebDriverException.class, "getMouseSpeed");
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

        public void setSpeed(Speed speed) {
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
            sendMessage(WebDriverException.class, "setMouseSpeed", pixelSpeed);
        }
    }

    private class FirefoxTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            sendMessage(NoSuchFrameException.class, "switchToFrame", frameIndex);
            return FirefoxDriver.this;
        }

        public WebDriver frame(String frameName) {
            sendMessage(NoSuchFrameException.class, "switchToFrame", frameName);
            return FirefoxDriver.this;
        }

        public WebDriver window(String windowName) {
          String response = sendMessage(NoSuchWindowException.class, "switchToWindow", String.valueOf(windowName));
            if (response == null || "No window found".equals(response)) {
                throw new NoSuchWindowException("Cannot find window: " + windowName);
            }
            try {
                FirefoxDriver.this.context = new Context(response);
            } catch (NumberFormatException e) {
                throw new WebDriverException("When switching to window: " + windowName + " ---- " + response);
            }
            return FirefoxDriver.this;
        }

      public WebDriver defaultContent() {
            sendMessage(WebDriverException.class, "switchToDefaultContent");
            return FirefoxDriver.this;
        }


        public WebElement activeElement() {
          String elementId = sendMessage(NoSuchElementException.class,
              "switchToActiveElement");
          return new FirefoxWebElement(FirefoxDriver.this, elementId);
        }

        public Alert alert() {
          if (currentAlert != null) {
            return currentAlert;
          }

          throw new NoAlertPresentException();
        }
    }

    private class FirefoxNavigation implements Navigation {
      public void back() {
        sendMessage(WebDriverException.class, "goBack");
      }

      public void forward() {
        sendMessage(WebDriverException.class, "goForward");
      }

      public void to(String url) {
        get(url);
      }

      public void to(URL url) {
        get(String.valueOf(url));
      }

      public void refresh() {
        sendMessage(WebDriverException.class, "refresh");
      }
    }
    
    public <X> X getScreenshotAs(OutputType<X> target) {
      // Get the screenshot as base64.
      String base64 = sendMessage(WebDriverException.class, "getScreenshotAsBase64");
      // ... and convert it.
      return target.convertFromBase64Png(base64);
    }

    /**
     * Saves a screenshot of the current page into the given file.
     *
     * @deprecated Use getScreenshotAs(file), which returns a temporary file.
     */
    @Deprecated
    public void saveScreenshot(File pngFile) {
      if (pngFile == null) {
          throw new IllegalArgumentException("Method parameter pngFile must not be null");
      }

      File tmpfile = getScreenshotAs(FILE);

      File dir = pngFile.getParentFile();
      if (dir != null && !dir.exists() && !dir.mkdirs()) {
          throw new WebDriverException("Could not create directory " + dir.getAbsolutePath());
      }

      try {
        FileHandler.copy(tmpfile, pngFile);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }

  private class FirefoxAlert implements Alert {
    private String text;

    public FirefoxAlert(String text) {
      this.text = text;
    }

    public void dismiss() {
      sendMessage(WebDriverException.class, "dismissAlert", text);
      currentAlert = null;
    }

    public void accept() {
    }

    public String getText() {
      return text;
    }
  }
}
