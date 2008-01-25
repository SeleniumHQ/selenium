package com.googlecode.webdriver.selenium;

import java.awt.Dimension;
import java.awt.Point;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.RenderedWebElement;
import com.googlecode.webdriver.NoSuchElementException;

public class WebDriverBackedSelenium implements Selenium {
    private static final Pattern STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.*)");
    private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
    protected WebDriver driver;
    private final String baseUrl;
    private final Map<String, LookupStrategy> lookupStrategies = new HashMap<String, LookupStrategy>();
    private final Map<String, OptionSelectStrategy> optionSelectStrategies = new HashMap<String, OptionSelectStrategy>(); 
    private final Map<String, TextMatchingStrategy> textMatchingStrategies = new HashMap<String, TextMatchingStrategy>();

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
        throw new UnsupportedOperationException();
    }

    public void altKeyUp() {
        throw new UnsupportedOperationException();
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
        throw new UnsupportedOperationException();
    }

    public void controlKeyUp() {
        throw new UnsupportedOperationException();
    }

    public void createCookie(String nameValuePair, String optionsString) {
        throw new UnsupportedOperationException();
    }

    public void deleteCookie(String name, String path) {
        throw new UnsupportedOperationException();
    }

    public void doubleClick(String locator) {
        WebElement element = findElement(locator);
        element.click();
        element.click();
    }

    public void doubleClickAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
    }

    public void dragAndDrop(String locator, String movementsString) {
        throw new UnsupportedOperationException();
    }

    public void dragAndDropToObject(String locatorOfObjectToBeDragged,
                                    String locatorOfDragDestinationObject) {
        throw new UnsupportedOperationException();
    }

    public void dragdrop(String locator, String movementsString) {
        throw new UnsupportedOperationException();
    }

    public void fireEvent(String locator, String eventName) {
        // no-op
        System.err.println("Fire event is not supported by WebDriver. Doing nothing");
    }

    public String getAlert() {
        throw new UnsupportedOperationException();
    }

    public String[] getAllButtons() {
        throw new UnsupportedOperationException();
    }

    public String[] getAllFields() {
        throw new UnsupportedOperationException();
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

        return links.toArray(new String[]{});
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
        throw new UnsupportedOperationException();
    }

    public Number getCursorPosition(String locator) {
        throw new UnsupportedOperationException();
    }

    public Number getElementHeight(String locator) {
      Dimension size = ((RenderedWebElement) findElement(locator)).getSize();
      return (int) size.getHeight();
    }

    public Number getElementIndex(String locator) {
        throw new UnsupportedOperationException();
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
        throw new UnsupportedOperationException();
    }

    public String getExpression(String expression) {
        throw new UnsupportedOperationException();
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
        Iterator<WebElement> allOptions = options.iterator();
        while (allOptions.hasNext()) {
            WebElement option = allOptions.next();
            optionValues.add(option.getText());
        }

        return optionValues.toArray(new String[0]);
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

      return selected.toArray(new String[] {});
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
        typeKeys(locator, keySequence);
    }

    public void keyPress(String locator, String keySequence) {
        typeKeys(locator, keySequence);
    }

    public void keyUp(String locator, String keySequence) {
        typeKeys(locator, keySequence);
    }

    public void metaKeyDown() {
        throw new UnsupportedOperationException();
    }

    public void metaKeyUp() {
        throw new UnsupportedOperationException();
    }

    public void mouseDown(String locator) {
        findElement(locator).click();
    }

    public void mouseDownAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
    }

    public void mouseMove(String locator) {
        throw new UnsupportedOperationException();
    }

    public void mouseMoveAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
    }

    public void mouseOut(String locator) {
        throw new UnsupportedOperationException();
    }

    public void mouseOver(String locator) {
        throw new UnsupportedOperationException();
    }

    public void mouseUp(String locator) {
      findElement(locator).click();
    }

    public void mouseUpAt(String locator, String coordString) {
        throw new UnsupportedOperationException();
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
        Iterator<WebElement> allOptions = options.iterator();
        while (allOptions.hasNext()) {
            WebElement option = allOptions.next();
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

        OptionSelectStrategy strategy = (OptionSelectStrategy) optionSelectStrategies.get(strategyName);
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
        throw new UnsupportedOperationException();
    }

    public void shiftKeyUp() {
        throw new UnsupportedOperationException();
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
        findElement(locator).setValue(value);
    }

    public void typeKeys(String locator, String value) {
        findElement(locator).setValue(value);
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

    protected WebElement findElement(String locator) {
        LookupStrategy strategy = findStrategy(locator);
        String use = determineWebDriverLocator(locator);

        try {
            return strategy.find(driver, use);
        } catch (NoSuchElementException e) {
            throw new SeleniumException("Element " + locator + " not found");
        }
    }

    private LookupStrategy findStrategy(String locator) {
      String strategyName = "implicit";

      Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
      if (matcher.matches()) {
        strategyName = matcher.group(1);
      }

      LookupStrategy strategy = (LookupStrategy) lookupStrategies.get(strategyName);
      if (strategy == null)
        throw new SeleniumException("No matcher found for " + strategyName);

      return strategy;
    }

    private String determineWebDriverLocator(String locator) {
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
        return (String[]) selectedOptions.toArray(new String[0]);
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
