package com.thoughtworks.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

import java.util.List;

public class SelectElementHandlingTest extends AbstractDriverTestCase {
	@Ignore("ie, safari")
	public void testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");

        WebElement option = options.get(0);
        assertThat(option.isSelected(), is(true));
        option.toggle();
        assertThat(option.isSelected(), is(false));
        option.toggle();
        assertThat(option.isSelected(), is(true));

        option = options.get(2);
        assertThat(option.isSelected(), is(true));
    }
	
	@Ignore("ie, safari")
    public void testShouldNotBeAbleToDeselectAnOptionFromANormalSelect() {
        driver.get(formPage);

        WebElement select = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = select.getChildrenOfType("option");
        WebElement option = options.get(0);

        try {
        	option.toggle();
        	fail("Should not have succeeded");
        } catch (RuntimeException e) {
        	// This is expected
        }
    }

	@Ignore("safari")
    public void testShouldBeAbleToChangeTheSelectedOptionInASelect() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertThat(one.isSelected(), is(true));
        assertThat(two.isSelected(), is(false));

        two.setSelected();
        assertThat(one.isSelected(), is(false));
        assertThat(two.isSelected(), is(true));
    }

	@Ignore("safari")
    public void testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");
        for (WebElement option : options)
            option.setSelected();

        for (int i = 0; i < options.size(); i++) {
            WebElement option = options.get(i);
            assertThat("Option at index is not selected but should be: " + i, option.isSelected(), is(true));
        }
    }
}
