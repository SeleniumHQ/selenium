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

import static org.openqa.selenium.Ignore.Driver.*;

public class RenderedWebElementTest extends AbstractDriverTestCase {
	@JavascriptEnabled
        @Ignore({HTMLUNIT, SAFARI})
	public void testShouldPickUpStyleOfAnElement() {
		driver.get(javascriptPage);
		
		RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-parent"));
		String backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("#008000", backgroundColour);
		
		element = (RenderedWebElement) driver.findElement(By.id("red-item"));
		backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("#ff0000", backgroundColour);
	}

    @JavascriptEnabled
    @Ignore({HTMLUNIT, SAFARI})
    public void testShouldAllowInheritedStylesToBeUsed() {
		driver.get(javascriptPage);
		
		RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-item"));
		String backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("transparent", backgroundColour);
	}
}
