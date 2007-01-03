/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.webdriver.ie;

import java.io.File;

import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.WebDriver;

public class InternetExplorerDriverTest extends JavascriptEnabledDriverTest {
	protected boolean isUsingSameDriverInstance() {
		return true;
	}
	
	protected WebDriver getDriver() {
		System.out.println(new File(".").getAbsolutePath());
		return new InternetExplorerDriver();
	}
}
