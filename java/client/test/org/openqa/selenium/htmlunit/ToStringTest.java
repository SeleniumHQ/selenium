/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.htmlunit;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

public class ToStringTest extends JUnit4TestBase {

  @Test
  public void toStringShouldLookNice() {
    driver.get(pages.xhtmlTestPage);

    WebElement a = driver.findElement(By.id("id1"));
    assertThat(a.toString(), is("<a id=\"id1\" href=\"#\">"));
  }

}
