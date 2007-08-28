package com.thoughtworks.selenium;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.thoughtworks.selenium.internal.AltLookupStrategy;
import com.thoughtworks.selenium.internal.ClassLookupStrategy;
import com.thoughtworks.selenium.internal.ExactTextMatchingStrategy;
import com.thoughtworks.selenium.internal.GlobTextMatchingStrategy;
import com.thoughtworks.selenium.internal.IdLookupStrategy;
import com.thoughtworks.selenium.internal.IdOptionSelectStrategy;
import com.thoughtworks.selenium.internal.IdentifierLookupStrategy;
import com.thoughtworks.selenium.internal.ImplicitLookupStrategy;
import com.thoughtworks.selenium.internal.IndexOptionSelectStrategy;
import com.thoughtworks.selenium.internal.LabelOptionSelectStrategy;
import com.thoughtworks.selenium.internal.LinkLookupStrategy;
import com.thoughtworks.selenium.internal.LookupStrategy;
import com.thoughtworks.selenium.internal.NameLookupStrategy;
import com.thoughtworks.selenium.internal.OptionSelectStrategy;
import com.thoughtworks.selenium.internal.RegExTextMatchingStrategy;
import com.thoughtworks.selenium.internal.TextMatchingStrategy;
import com.thoughtworks.selenium.internal.ValueOptionSelectStrategy;
import com.thoughtworks.selenium.internal.XPathLookupStrategy;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class WebDriverBackedSelenium implements Selenium {
	private static final Pattern STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.*)");
	private static final Pattern TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+):(.*)");
	protected WebDriver driver;
	private final String baseUrl;
	private final Map lookupStrategies = new HashMap();
	private final Map optionSelectStrategies = new HashMap();
	private final Map textMatchingStrategies = new HashMap();

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
		List allLinks = driver.selectElements("//a");
		Iterator i = allLinks.iterator();
		List links = new ArrayList();
		while (i.hasNext()) {
			WebElement link = (WebElement) i.next();
			String id = link.getAttribute("id");
			if (id == null) 
				links.add("");
			else
				links.add(id);
		}
		
		return (String[]) links.toArray(new String[] {});
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
		throw new UnsupportedOperationException();
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
		throw new UnsupportedOperationException();
	}

	public Number getElementIndex(String locator) {
		throw new UnsupportedOperationException();
	}

	public Number getElementPositionLeft(String locator) {
		throw new UnsupportedOperationException();
	}

	public Number getElementPositionTop(String locator) {
		throw new UnsupportedOperationException();
	}

	public Number getElementWidth(String locator) {
		throw new UnsupportedOperationException();
	}

	public String getEval(String script) {
		throw new UnsupportedOperationException();
	}

	public String getExpression(String expression) {
		throw new UnsupportedOperationException();
	}

	public String getHtmlSource() {
		throw new UnsupportedOperationException();
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
		List options = select.getChildrenOfType("option");
		List optionValues = new ArrayList();
		Iterator allOptions = options.iterator();
		while (allOptions.hasNext()) {
			WebElement option = (WebElement) allOptions.next();
			optionValues.add(option.getText());
		}
		
		return (String[]) optionValues.toArray(new String[0]);
	}

	public String getSelectedId(String selectLocator) {
		return findSelectedOptionProperties(selectLocator, "id")[0];
	}

	public String[] getSelectedIds(String selectLocator) {
		throw new UnsupportedOperationException();
	}

	public String getSelectedIndex(String selectLocator) {
		WebElement select = findElement(selectLocator);
		List options = select.getChildrenOfType("option");
		for (int i = 0; i < options.size(); i++) {
			WebElement option = (WebElement) options.get(i);
			if (option.isSelected())
				return String.valueOf(i);
		}
		
		throw new SeleniumException("No option is selected: " + selectLocator);
	}

	public String[] getSelectedIndexes(String selectLocator) {
		return findSelectedOptionProperties(selectLocator, "index");
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
		throw new UnsupportedOperationException();
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
		throw new UnsupportedOperationException();
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
		String text = driver.selectText("/html/body");
		text = text.trim();
		
		String strategyName = "implicit";
		String use = pattern;
		Matcher matcher = TEXT_MATCHING_STRATEGY_AND_VALUE_PATTERN.matcher(pattern);
		if (matcher.matches()) {
			strategyName = matcher.group(1);
			use = matcher.group(2);
		}
		TextMatchingStrategy strategy = (TextMatchingStrategy) textMatchingStrategies.get(strategyName);
		
		return strategy.isAMatch(use, text);
	}

	public boolean isVisible(String locator) {
		return findElement(locator).isDisplayed();
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
		throw new UnsupportedOperationException();
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
		throw new UnsupportedOperationException();
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
		List options = select.getChildrenOfType("option");
		removeAllSelections(options);
	}

	private void removeAllSelections(List options) {
		Iterator allOptions = options.iterator();
		while (allOptions.hasNext()) {
			WebElement option = (WebElement) allOptions.next();
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
		List allOptions = select.getChildrenOfType("option");
		
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
		throw new UnsupportedOperationException();
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
		throw new UnsupportedOperationException();
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
		String strategyName = "implicit";
		String use = locator;
		
		Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
		if (matcher.matches()) {
			strategyName = matcher.group(1);
			use = matcher.group(2);
		}

		LookupStrategy strategy = (LookupStrategy) lookupStrategies.get(strategyName);
		if (strategy == null) 
		    throw new SeleniumException("No matcher found for " + strategyName);
		
		try {
			return strategy.find(driver, use);
		} catch (NoSuchElementException e) {
			throw new SeleniumException("Element " + locator + " not found");
		}		
	}
	
	private String[] findSelectedOptionProperties(String selectLocator, String property) {
		WebElement element = findElement(selectLocator);
		List options = element.getChildrenOfType("option");
		if (options.size() == 0) {
			throw new SeleniumException("Specified element is not a Select (has no options)");
	    }

		List selectedOptions = new ArrayList();

		Iterator allOptions = options.iterator();
		while (allOptions.hasNext()) {
			WebElement option = (WebElement) allOptions.next();
			if (option.isSelected()) {
				if ("text".equals(property)) {
					selectedOptions.add(option.getText());
				} else if ("value".equals(property)) {
					selectedOptions.add(option.getValue());
				} else {
					String propVal = option.getAttribute(property);
					selectedOptions.add(propVal);
				}
	        }
		}
	    if (selectedOptions.size() == 0)
	    	throw new SeleniumException("No option selected");
	    return (String[]) selectedOptions.toArray(new String[0]);
	}
}
