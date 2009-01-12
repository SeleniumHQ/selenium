/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

import java.util.List;

public class SelectElementHandlingTest extends AbstractDriverTestCase {
    @Ignore("safari, ie")
    public void testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getElementsByTagName("option");

        WebElement option = options.get(0);
        assertThat(option.isSelected(), is(true));
        option.toggle();
        assertThat(option.isSelected(), is(false));
        option.toggle();
        assertThat(option.isSelected(), is(true));

        option = options.get(2);
        assertThat(option.isSelected(), is(true));
    }

    @Ignore("safari, ie")
    public void testShouldNotBeAbleToDeselectAnOptionFromANormalSelect() {
        driver.get(formPage);

        WebElement select = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = select.getElementsByTagName("option");
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
        List<WebElement> options = selectBox.getElementsByTagName("option");
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
        List<WebElement> options = multiSelect.getElementsByTagName("option");
        for (WebElement option : options)
            option.setSelected();

        for (int i = 0; i < options.size(); i++) {
            WebElement option = options.get(i);
            assertThat("Option at index is not selected but should be: " + i, option.isSelected(), is(true));
        }
    }
}
