/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.remote;

/**
 * All the browsers supported by selenium
 */
public enum BrowserType {
	FIREFOX("firefox"),
	FIREFOX_2("firefox2"),
	FIREFOX_3("firefox3"),
	FIREFOX_PROXY("firefoxproxy"),
	FIREFOX_CHROME("firefoxchrome"),
	GOOGLECHROME("googlechrome"),
	SAFARI("safari"),
	OPERA("opera"),
	IEXPLORE("iexplore"),
	IEXPLORE_PROXY("iexploreproxy"),
	SAFARI_PROXY("safariproxy"),
	CHROME("chrome"),
	KONQUEROR("konqueror"),
	MOCK("mock"),
	IE_HTA("iehta"),
	ANDROID("android"),
	HTMLUNIT("htmlunit"),
	IE("internetexplorer"),
	IPHONE("iPhone"),
	IPAD("iPad"),
	PHANTOMJS("phantomjs");
	private String type;

	BrowserType(String type) {
		this.type = type;
	}

	public static BrowserType fromString(String type) {
		if (type == null) {
			throw new IllegalArgumentException();
		}
		for (BrowserType browserType : BrowserType.values()) {
			if (type.equalsIgnoreCase(browserType.type)) {
				return browserType;
			}
		}
		throw new IllegalArgumentException();
	}

	@Override
	public String toString() {
		return type;
	}

	public String browserName() {
		return toString();
	}

}
