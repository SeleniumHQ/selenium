package org.openqa.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.AltLookupStrategy;
import org.openqa.selenium.internal.ClassLookupStrategy;
import org.openqa.selenium.internal.ExactTextMatchingStrategy;
import org.openqa.selenium.internal.GlobTextMatchingStrategy;
import org.openqa.selenium.internal.IdLookupStrategy;
import org.openqa.selenium.internal.IdOptionSelectStrategy;
import org.openqa.selenium.internal.IdentifierLookupStrategy;
import org.openqa.selenium.internal.ImplicitLookupStrategy;
import org.openqa.selenium.internal.IndexOptionSelectStrategy;
import org.openqa.selenium.internal.LabelOptionSelectStrategy;
import org.openqa.selenium.internal.LinkLookupStrategy;
import org.openqa.selenium.internal.LookupStrategy;
import org.openqa.selenium.internal.NameLookupStrategy;
import org.openqa.selenium.internal.OptionSelectStrategy;
import org.openqa.selenium.internal.RegExTextMatchingStrategy;
import org.openqa.selenium.internal.TextMatchingStrategy;
import org.openqa.selenium.internal.ValueOptionSelectStrategy;
import org.openqa.selenium.internal.XPathLookupStrategy;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import java.awt.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Date;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;

public class WebDriverBackedSelenium implements Selenium {
    private static final Pattern STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.*)");
    private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
    protected WebDriver driver;
    private final String baseUrl;
    private final Map<String, LookupStrategy> lookupStrategies = new HashMap<String, LookupStrategy>();
    private final Map<String, OptionSelectStrategy> optionSelectStrategies = new HashMap<String, OptionSelectStrategy>(); 
    private final Map<String, TextMatchingStrategy> textMatchingStrategies = new HashMap<String, TextMatchingStrategy>();
    private final Pattern NAME_VALUE_PAIR_PATTERN = Pattern.compile("([^\\s=\\[\\]\\(\\),\"\\/\\?@:;]+)=([^\\s=\\[\\]\\(\\),\"\\/\\?@:;]*)");
    private static final Pattern MAX_AGE_PATTERN = Pattern.compile("max_age=(\\d+)");
    private static final Pattern PATH_PATTERN = Pattern.compile("path=([^\\s,]+)[,]?");
    private static final Pattern DOMAIN_PATTERN = Pattern.compile("domain=([^\\s,]+)[,]?");

    private static final String resourceName = "/org/openqa/selenium/internal/injectableSelenium.js";

    // Keyboard related stuff
    private boolean metaKeyDown;
    private boolean altKeyDown;
    private boolean controlKeyDown;
    private boolean shiftKeyDown;
    private String embeddedSelenium;

    public WebDriverBackedSelenium(WebDriver baseDriver, String baseUrl) {
        setUpElementFindingStrategies();
        setUpOptionFindingStrategies();
        setUpTextMatchingStrategies();

        this.driver = baseDriver;
        if (baseUrl.endsWith("/")) {
            this.baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        } else {
            this.baseUrl = baseUrl;
        }
    }

    private void setUpTextMatchingStrategies() {
        textMatchingStrategies.put("implicit", new GlobTextMatchingStrategy());
        textMatchingStrategies.put("glob", new GlobTextMatchingStrategy());
        textMatchingStrategies.put("regexp", new RegExTextMatchingStrategy());
        textMatchingStrategies.put("exact", new ExactTextMatchingStrategy());
    }

    private void setUpOptionFindingStrategies() {
        optionSelectStrategies.put("implicit", new LabelOptionSelectStrategy());
        optionSelectStrategies.put("id", new IdOptionSelectStrategy());
        optionSelectStrategies.put("index", new IndexOptionSelectStrategy());
        optionSelectStrategies.put("label", new LabelOptionSelectStrategy());
        optionSelectStrategies.put("value", new ValueOptionSelectStrategy());
    }

    private void setUpElementFindingStrategies() {
        lookupStrategies.put("alt", new AltLookupStrategy());
        lookupStrategies.put("class", new ClassLookupStrategy());
        lookupStrategies.put("id", new IdLookupStrategy());
        lookupStrategies.put("identifier", new IdentifierLookupStrategy());
        lookupStrategies.put("implicit", new ImplicitLookupStrategy());
        lookupStrategies.put("link", new LinkLookupStrategy());
        lookupStrategies.put("name", new NameLookupStrategy());
        lookupStrategies.put("xpath", new XPathLookupStrategy());
    }

    public void addSelection(String locator, String optionLocator) {
        WebElement select = findElement(locator);
        if (!"multiple".equals(select.getAttribute("multiple")))
            throw new SeleniumException("You may only add a selection to a select that supports multiple selections");
        select(locator, optionLocator, true, false);
    }

    public void altKeyDown() {
        altKeyDown = true;
    }

    public void altKeyUp() {
        altKeyDown = false;
    }

    public void answerOnNextPrompt(String answer) {
        throw new UnsupportedOperationException();
    }

    public void check(String locator) {
        findElement(locator).setSelected();
    }

    public void chooseCancelOnNextConfirmation() {
        throw new UnsupportedOperationException();
    }

    public void chooseOkOnNextConfirmation() {
        throw new UnsupportedOperationException();
    }

    public void click(String locator) {
        WebElement element = findElement(locator);
        element.click();
    }

    public void clickAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
    }

    public void close() {
        driver.close();
    }

    public void controlKeyDown() {
        controlKeyDown = true;
    }

    public void controlKeyUp() {
        controlKeyDown = false;
    }

    public void createCookie(String nameValuePair, String optionsString) {
        Matcher nameValuePairMatcher = NAME_VALUE_PAIR_PATTERN.matcher(nameValuePair);
        if (!nameValuePairMatcher.find())
            throw new SeleniumException("Invalid parameter: " + nameValuePair);

        String name = nameValuePairMatcher.group(1);
        String value = nameValuePairMatcher.group(2);

        String rawCookie = nameValuePair.trim();
        Matcher maxAgeMatcher = MAX_AGE_PATTERN.matcher(optionsString);
        Date maxAge = null;

        if (maxAgeMatcher.find()) {
            maxAge = new Date(System.currentTimeMillis() + Integer.parseInt(maxAgeMatcher.group(1)) * 1000);
        }

        String path = null;
        Matcher pathMatcher = PATH_PATTERN.matcher(optionsString);
        if (pathMatcher.find()) {
            path = pathMatcher.group(1);
        }

        Cookie cookie = new Cookie(name, value, path, maxAge);
        driver.manage().addCookie(cookie);
    }

    public void deleteCookie(String name, String path) {
        driver.manage().deleteCookieNamed(name);
    }

    public void deleteAllVisibleCookies() {
        driver.manage().deleteAllCookies();
    }

    public void setBrowserLogLevel(String logLevel) {
        throw new UnsupportedOperationException("setBrowserLogLevel");
    }

    private Object executeScript(String script) {
        if (driver instanceof JavascriptExecutor) {
            return ((JavascriptExecutor) driver).executeScript(script);
        }

        throw new UnsupportedOperationException(
                "The underlying WebDriver instance does not support executing javascript");
    }

    public void runScript(String script) {
        executeScript(script);
    }

    public void addLocationStrategy(String strategyName, String functionDefinition) {
        throw new UnsupportedOperationException("addLocationStrategy");
    }

    public void setContext(String context) {
    	// no-op
    }

    public void attachFile(String fieldLocator, String fileLocator) {
        throw new UnsupportedOperationException("attachFile");
    }

    public void doubleClick(String locator) {
        WebElement element = findElement(locator);
        element.click();
        element.click();
    }

    public void contextMenu(String locator) {
        throw new UnsupportedOperationException("contextMenu");
    }

    public void doubleClickAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
    }

    public void contextMenuAt(String locator, String coordString) {
        throw new UnsupportedOperationException("contextMenuAt");
    }

    public void dragAndDrop(String locator, String movementsString) {
        String[] parts = movementsString.split("\\s*,\\s*", 2);
        int xDelta = Integer.parseInt(parts[0].trim());
        int yDelta = Integer.parseInt(parts[1].trim());

        ((RenderedWebElement) findElement(locator)).dragAndDropBy(xDelta, yDelta);
    }

    public void dragAndDropToObject(String locatorOfObjectToBeDragged,
                                    String locatorOfDragDestinationObject) {
        RenderedWebElement dragger = (RenderedWebElement) findElement(locatorOfObjectToBeDragged);
        RenderedWebElement draggee = (RenderedWebElement) findElement(locatorOfDragDestinationObject);

        dragger.dragAndDropOn(draggee);
    }

    public void dragdrop(String locator, String movementsString) {
        dragAndDrop(locator, movementsString);
    }

    public void fireEvent(String locator, String eventName) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("doFireEvent", element, eventName);
    }

    public void focus(String locator) {
        fireEvent(locator, "focus");
    }

    public String getAlert() {
        throw new UnsupportedOperationException();
    }

    public String[] getAllButtons() {
        List<WebElement> allInputs = driver.findElements(By.xpath("//input"));
        List<String> ids = new ArrayList<String>();

        for (WebElement input : allInputs) {
            String type = input.getAttribute("type").toLowerCase();
            if ("button".equals(type) || "submit".equals(type) || "reset".equals(type))
                ids.add(input.getAttribute("id"));
        }

        return ids.toArray(new String[0]);
    }

    public String[] getAllFields() {
        List<WebElement> allInputs = driver.findElements(By.xpath("//input"));
        List<String> ids = new ArrayList<String>();

        for (WebElement input : allInputs) {
            String type = input.getAttribute("type").toLowerCase();
            if ("text".equals(type))
                ids.add(input.getAttribute("id"));
        }

        return ids.toArray(new String[0]);
    }

    public String[] getAllLinks() {
        List<WebElement> allLinks = driver.findElements(By.xpath("//a"));
        Iterator<WebElement> i = allLinks.iterator();
        List<String> links = new ArrayList<String>();
        while (i.hasNext()) {
            WebElement link = i.next();
            String id = link.getAttribute("id");
            if (id == null)
                links.add("");
            else
                links.add(id);
        }

        return links.toArray(new String[links.size()]);
    }

    public String[] getAllWindowIds() {
        throw new UnsupportedOperationException();
    }

    public String[] getAllWindowNames() {
        throw new UnsupportedOperationException();
    }

    public String[] getAllWindowTitles() {
        throw new UnsupportedOperationException();
    }

    public String getAttribute(String locator) {
        int attributePos = locator.lastIndexOf("@");
        String elementLocator = locator.substring(0, attributePos);
        String attributeName = locator.substring(attributePos + 1);

        // Find the element.
        WebElement element = findElement(elementLocator);
        return element.getAttribute(attributeName);
    }

    public String[] getAttributeFromAllWindows(String attributeName) {
        throw new UnsupportedOperationException();
    }

    public String getBodyText() {
        return driver.findElement(By.xpath("//body")).getText();
    }

    public String getConfirmation() {
        throw new UnsupportedOperationException();
    }

    public String getCookie() {
        return (String) executeScript("return document.cookie;");
    }

    public String getCookieByName(String name) {
        for (Cookie cookie : driver.manage().getCookies()) {
            if (name.equals(cookie.getName()))
                return cookie.getValue();
        }

        return null;
    }

    public boolean isCookiePresent(String name) {
        return getCookieByName(name) == null;
    }

    public Number getCursorPosition(String locator) {
        throw new UnsupportedOperationException();
    }

    public Number getElementHeight(String locator) {
      Dimension size = ((RenderedWebElement) findElement(locator)).getSize();
      return (int) size.getHeight();
    }

    public Number getElementIndex(String locator) {
        throw new UnsupportedOperationException("getElementIndex");
    }

    public Number getElementPositionLeft(String locator) {
      Point location = ((RenderedWebElement) findElement(locator)).getLocation();
      return (int) location.getX();
    }

    public Number getElementPositionTop(String locator) {
      Point location = ((RenderedWebElement) findElement(locator)).getLocation();
      return (int) location.getY();
    }

    public Number getElementWidth(String locator) {
      Dimension size = ((RenderedWebElement) findElement(locator)).getSize();
      return (int) size.getWidth();
    }

    public String getEval(String script) {
    	return String.valueOf(((JavascriptExecutor) driver).executeScript(script));
    }

    public String getExpression(String expression) {
        throw new UnsupportedOperationException();
    }

    public Number getXpathCount(String xpath) {
        return driver.findElements(By.xpath(xpath)).size();
    }

    public void assignId(String locator, String identifier) {
        throw new UnsupportedOperationException("assignId");
    }

    public void allowNativeXpath(String allow) {
        // no-op
    }

    public void ignoreAttributesWithoutValue(String ignore) {
        throw new UnsupportedOperationException("ignoreAttributesWithoutValue");
    }

    public String getHtmlSource() {
        return driver.getPageSource();
    }

    public String getLocation() {
        return driver.getCurrentUrl();
    }

    public String getLogMessages() {
        throw new UnsupportedOperationException();
    }

    public Number getMouseSpeed() {
        throw new UnsupportedOperationException();
    }

    public String getPrompt() {
        throw new UnsupportedOperationException();
    }

    public String[] getSelectOptions(String selectLocator) {
        WebElement select = findElement(selectLocator);
        List<WebElement> options = select.getChildrenOfType("option");
        List<String> optionValues = new ArrayList<String>();
        for (WebElement option : options) {
            optionValues.add(option.getText());
        }

        return optionValues.toArray(new String[optionValues.size()]);
    }

    public String getSelectedId(String selectLocator) {
        return findSelectedOptionProperties(selectLocator, "id")[0];
    }

    public String[] getSelectedIds(String selectLocator) {
        return findSelectedOptionProperties(selectLocator, "id");
    }

  public String getSelectedIndex(String selectLocator) {
      List<WebElement> options = getOptions(selectLocator);

      for (int i = 0; i < options.size(); i++) {
          WebElement option = options.get(i);
          if (option.isSelected())
              return String.valueOf(i);
      }

        throw new SeleniumException("No option is selected: " + selectLocator);
    }

    public String[] getSelectedIndexes(String selectLocator) {
        List<WebElement> options = getOptions(selectLocator);

        List<String> selected = new ArrayList<String>();
        for (int i = 0; i < options.size(); i++) {
          WebElement option = options.get(i);
          if (option.isSelected())
              selected.add(String.valueOf(i));
      }

      return selected.toArray(new String[selected.size()]);
    }

    public String getSelectedLabel(String selectLocator) {
        String[] labels = findSelectedOptionProperties(selectLocator, "text");
        return labels[0];  // Since we know that there must have been at least one thing selected
    }

    public String[] getSelectedLabels(String selectLocator) {
        return findSelectedOptionProperties(selectLocator, "text");
    }

    public String getSelectedValue(String selectLocator) {
        return findSelectedOptionProperties(selectLocator, "value")[0];
    }

    public String[] getSelectedValues(String selectLocator) {
        return findSelectedOptionProperties(selectLocator, "value");
    }

    public void getSpeed() {
        throw new UnsupportedOperationException();
    }

    public String getTable(String tableCellAddress) {
        throw new UnsupportedOperationException();
    }

    public String getText(String locator) {
        return findElement(locator).getText().trim();
    }

    public String getTitle() {
        return driver.getTitle();
    }

    public String getValue(String locator) {
        return findElement(locator).getValue();
    }

    public boolean getWhetherThisFrameMatchFrameExpression(
            String currentFrameString, String target) {
        throw new UnsupportedOperationException();
    }

    public boolean getWhetherThisWindowMatchWindowExpression(
            String currentWindowString, String target) {
        throw new UnsupportedOperationException();
    }

    public void getXpathCount() {
        throw new UnsupportedOperationException();
    }

    public void goBack() {
        driver.navigate().back();
    }

    public void highlight(String locator) {
        throw new UnsupportedOperationException();
    }

    public boolean isAlertPresent() {
        throw new UnsupportedOperationException();
    }

    public boolean isChecked(String locator) {
        return findElement(locator).isSelected();
    }

    public boolean isConfirmationPresent() {
        throw new UnsupportedOperationException();
    }

    public boolean isEditable(String locator) {
        WebElement element = findElement(locator);
        String value = element.getValue();

        return value != null && element.isEnabled();
    }

    public boolean isElementPresent(String locator) {
        try {
            findElement(locator);
            return true;
        } catch (SeleniumException e) {
            return false;
        }
    }

    public boolean isOrdered(String locator1, String locator2) {
        throw new UnsupportedOperationException();
    }

    public boolean isPromptPresent() {
        throw new UnsupportedOperationException();
    }

    public boolean isSomethingSelected(String selectLocator) {
        throw new UnsupportedOperationException();
    }

    public boolean isTextPresent(String pattern) {
        String text = driver.findElement(By.xpath("/html/body")).getText();
        text = text.trim();

        String strategyName = "implicit";
        String use = pattern;
        Matcher matcher = TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN.matcher(pattern);
        if (matcher.matches()) {
            strategyName = matcher.group(1);
            use = matcher.group(2);
        }
        TextMatchingStrategy strategy = textMatchingStrategies.get(strategyName);

        return strategy.isAMatch(use, text);
    }

    public boolean isVisible(String locator) {
        return ((RenderedWebElement) findElement(locator)).isDisplayed();
    }

    public void keyDown(String locator, String keySequence) {
        callEmbeddedSelenium("doKeyDown", findElement(locator), keySequence, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);

    }

    public void keyPress(String locator, String keySequence) {
        typeKeys(locator, keySequence);
    }

    public void keyUp(String locator, String keySequence) {
        typeKeys(locator, keySequence);
    }

    public void metaKeyDown() {
        metaKeyDown = true;
    }

    public void metaKeyUp() {
        metaKeyDown = false;
    }

    public void mouseDown(String locator) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEvent", element, "mousedown", true);
    }

    public void mouseDownAt(String locator, String coordString) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEventAt", element, "mousedown", coordString);
    }

    public void mouseMove(String locator) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEvent", element, "mousemove", true);
    }

    public void mouseMoveAt(String locator, String coordString) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEventAt", element, "mousemove", coordString);
    }

    public void mouseOut(String locator) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEvent", element, "mouseout", true);
    }

    public void mouseOver(String locator) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEvent", element, "mouseover", true);
    }

    public void mouseUp(String locator) {
      WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEvent", element, "mouseup", true);
    }

    public void mouseUpAt(String locator, String coordString) {
        WebElement element = findElement(locator);
        callEmbeddedSelenium("triggerMouseEventAt", element, "mouseup", coordString);
    }

    public void open(String url) {
        String urlToOpen = url;

        if (url.startsWith("/")) {
            urlToOpen = baseUrl + url;
        }
        driver.get(urlToOpen);
    }

    public void openWindow(String url, String windowID) {
        throw new UnsupportedOperationException();
    }

    public void refresh() {
        throw new UnsupportedOperationException();
    }

    public void removeAllSelections(String locator) {
        WebElement select = findElement(locator);
        List<WebElement> options = select.getChildrenOfType("option");
        removeAllSelections(options);
    }

    private void removeAllSelections(List<WebElement> options) {
        for (WebElement option : options) {
            if (option.isSelected())
                option.toggle();
        }
    }

    public void removeSelection(String locator, String optionLocator) {
        WebElement select = findElement(locator);
        if (!"multiple".equals(select.getAttribute("multiple")))
            throw new SeleniumException("You may only remove a selection to a select that supports multiple selections");
        select(locator, optionLocator, false, false);
    }

    public void select(String selectLocator, String optionLocator) {
        select(selectLocator, optionLocator, true, true);
    }

    private void select(String selectLocator, String optionLocator, boolean setSelected, boolean onlyOneOption) {
        WebElement select = findElement(selectLocator);
        List<WebElement> allOptions = select.getChildrenOfType("option");

        boolean isMultiple = false;

        String multiple = select.getAttribute("multiple");
        if (multiple != null && "".equals(multiple))
            isMultiple = true;

        if (onlyOneOption && isMultiple) {
            removeAllSelections(allOptions);
        }

        Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(optionLocator);
        String strategyName = "implicit";
        String use = optionLocator;

        if (matcher.matches()) {
            strategyName = matcher.group(1);
            use = matcher.group(2);
        }
        if (use == null)
            use = "";

        OptionSelectStrategy strategy = optionSelectStrategies.get(strategyName);
        if (strategy == null)
            throw new SeleniumException(strategyName + " (from " + optionLocator + ") is not a method for selecting options");

        if (!strategy.select(allOptions, use, setSelected, isMultiple))
            throw new SeleniumException(optionLocator + " is not an option");
    }

    public void selectFrame(String locator) {
        throw new UnsupportedOperationException();
    }

    public void selectWindow(String windowID) {
        driver.switchTo().window(windowID);
    }

    public void setContext(String context, String logLevelThreshold) {
        // no-op
    }

    public void setCursorPosition(String locator, String position) {
        throw new UnsupportedOperationException();
    }

    public void setMouseSpeed(String pixels) {
        throw new UnsupportedOperationException();
    }

    public void setSpeed(String value) {
        throw new UnsupportedOperationException();
    }

    public void setTimeout(String timeout) {
        throw new UnsupportedOperationException();
    }

    public void shiftKeyDown() {
        shiftKeyDown = true;
    }

    public void shiftKeyUp() {
        shiftKeyDown = false;
    }

    public void start() {
        // no-op;
    }

    public void stop() {
        // no-op
    }

    public void submit(String formLocator) {
        findElement(formLocator).submit();
    }

    public void type(String locator, String value) {
    	WebElement element = findElement(locator);

        callEmbeddedSelenium("replaceText", element, value);
    }

    private void callEmbeddedSelenium(String functionName, WebElement element, Object... values) {
        StringBuilder builder = new StringBuilder(readSelenium());
        builder.append("return browserbot.").append(functionName).append(".apply(browserbot, arguments);");

        List<Object> args = new ArrayList<Object>();
        args.add(element);
        args.addAll(Arrays.asList(values));

        ((JavascriptExecutor) driver).executeScript(builder.toString(), args.toArray());
    }

    private String readSelenium() {
        if (embeddedSelenium != null) {
            return embeddedSelenium;
        }

        InputStream raw = WebDriverBackedSelenium.class.getResourceAsStream(resourceName);
        if (raw == null) {
            throw new RuntimeException("Cannot locate the embedded selenium instance");
        }

        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(raw));
            StringBuilder builder = new StringBuilder();
            for (String line = reader.readLine(); line != null; line = reader.readLine()) {
                builder.append(line).append("\n");
            }
            embeddedSelenium = builder.toString();
            return embeddedSelenium;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                raw.close();
            } catch (IOException e) {
                // Nothing sane to do
            }
        }
    }

    public void typeKeys(String locator, String value) {
    	value = value.replace("\\38", Keys.ARROW_UP);
    	value = value.replace("\\40", Keys.ARROW_DOWN);
    	value = value.replace("\\37", Keys.ARROW_LEFT);
    	value = value.replace("\\39", Keys.ARROW_RIGHT);
    	
        findElement(locator).sendKeys(value);
    }

    public void uncheck(String locator) {
        WebElement element = findElement(locator);
        if (element.isSelected())
            element.toggle();
    }

    public void waitForCondition(String script, String timeout) {
        throw new UnsupportedOperationException();
    }

    public void waitForFrameToLoad(String frameAddress, String timeout) {
        throw new UnsupportedOperationException();
    }

    public void waitForPageToLoad(String timeout) {
        // no-op. WebDriver should be blocking
    }

    public void waitForPopUp(String windowID, String timeout) {
        throw new UnsupportedOperationException();
    }

    public void windowFocus() {
        throw new UnsupportedOperationException();
    }

    public void windowMaximize() {
        throw new UnsupportedOperationException();
    }

    public void captureScreenshot(String filename) {
        throw new UnsupportedOperationException("captureScreenshot");
    }

    public void shutDownSeleniumServer() {
        driver.quit();
    }

    public void keyDownNative(String keycode) {
        throw new UnsupportedOperationException("keyDownNative");
    }

    public void keyUpNative(String keycode) {
        throw new UnsupportedOperationException("keyUpNative");
    }

    public void keyPressNative(String keycode) {
        throw new UnsupportedOperationException("keyPressNative");
    }

    protected WebElement findElement(String locator) {
        LookupStrategy strategy = findStrategy(locator);
        String use = determineWebDriverLocator(locator);

        try {
            return strategy.find(driver, use);
        } catch (NoSuchElementException e) {
            throw new SeleniumException("Element " + locator + " not found");
        }
    }

    protected LookupStrategy findStrategy(String locator) {
      String strategyName = "implicit";

      Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
      if (matcher.matches()) {
        strategyName = matcher.group(1);
      }

      LookupStrategy strategy = lookupStrategies.get(strategyName);
      if (strategy == null)
        throw new SeleniumException("No matcher found for " + strategyName);

      return strategy;
    }

    protected String determineWebDriverLocator(String locator) {
        String use = locator;

        Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
        if (matcher.matches()) {
          use = matcher.group(2);
        }

        return use;
    }


    private String[] findSelectedOptionProperties(String selectLocator, String property) {
      List<WebElement> options = getOptions(selectLocator);

        List<String> selectedOptions = new ArrayList<String>();

        for (WebElement option : options) {
            if (option.isSelected()) {
                if ("text".equals(property)) {
                    selectedOptions.add(option.getText());
                } else if ("value".equals(property)) {
                    selectedOptions.add(option.getValue());
                } else {
                    String propVal = option.getAttribute(property);
                    if (propVal != null)
                        selectedOptions.add(propVal);
                }
            }
        }

        if (selectedOptions.size() == 0)
            throw new SeleniumException("No option selected");
        return selectedOptions.toArray(new String[selectedOptions.size()]);
    }

    private List<WebElement> getOptions(String selectLocator) {
        WebElement element = findElement(selectLocator);
        List<WebElement> options = element.getChildrenOfType("option");
        if (options.size() == 0) {
          throw new SeleniumException("Specified element is not a Select (has no options)");
        }
        return options;
    }
}
