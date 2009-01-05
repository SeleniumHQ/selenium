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

package org.openqa.selenium.safari;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;

public class SafariDriverTest extends AbstractDriverTestCase {
    public void testGetUrl() {
        driver.get(xhtmlTestPage);
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
    }

    public void testShouldFindByLinks() {
        driver.get(xhtmlTestPage);
        assertThat(driver, notNullValue());
        assertThat(driver.findElement(By.linkText("click me")), is(notNullValue()));

    }
}
