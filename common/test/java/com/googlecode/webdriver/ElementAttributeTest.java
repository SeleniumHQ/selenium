package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNull.nullValue;

import java.util.List;

public class ElementAttributeTest extends AbstractDriverTestCase {
	@Ignore(value = "ie, safari", reason = "IE: Fails test. Safari: Not implemented")
	public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
        driver.get(simpleTestPage);
        WebElement head = driver.findElement(By.xpath("/html"));
        String attribute = head.getAttribute("cheese");
        assertThat(attribute, is(nullValue()));
    }

	@Ignore("safari")
    public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
        driver.get(simpleTestPage);
        WebElement body = driver.findElement(By.xpath("//body"));
        assertThat(body.getAttribute("style"), equalTo(""));
    }

	@Ignore("safari")
    public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertThat(inputElement.getAttribute("disabled"), equalTo("false"));
    }

	@Ignore("safari")
    public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
        assertThat(inputElement.isEnabled(), is(false));

        inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertThat(inputElement.isEnabled(), is(true));
    }

	@Ignore("safari")
    public void testShouldIndicateWhenATextAreaIsDisabled() {
        driver.get(formPage);
        WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
        assertThat(textArea.isEnabled(), is(false));
    }

	@Ignore("safari")
    public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertThat(checkbox.getAttribute("checked"), equalTo("false"));
        checkbox.setSelected();
        assertThat(checkbox.getAttribute("checked"), equalTo("true"));
    }

    public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {

    }

    @Ignore("safari")
    public void testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertThat(one.isSelected(), is(true));
        assertThat(two.isSelected(), is(false));
        assertThat(one.getAttribute("selected"), equalTo("true"));
        assertThat(two.getAttribute("selected"), equalTo("false"));
    }

    @Ignore("safari")
    public void testShouldReturnValueOfClassAttributeOfAnElement() {
        driver.get(xhtmlTestPage);

        WebElement heading = driver.findElement(By.xpath("//h1"));
        String className = heading.getAttribute("class");

        assertThat(className, equalTo("header"));
    }

    public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
        driver.get(formPage);

        String value = driver.findElement(By.id("withText")).getValue();

        assertThat(value, equalTo("Example text"));
    }

    @Ignore(value = "all", reason = "This is probably a meaningless test")
    public void testShouldReturnTheValueOfTheStyleAttribute() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.xpath("//form[3]"));
        String style = element.getAttribute("style");

        assertThat(style, equalTo("display: block"));
    }

}
