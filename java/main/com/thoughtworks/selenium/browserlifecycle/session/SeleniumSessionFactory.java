/*
 * Copyright 2004 ThoughtWorks, Inc.
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
package com.thoughtworks.selenium.browserlifecycle.session;

import com.thoughtworks.selenium.browserlifecycle.coordinate.WaiterFactory;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

public class SeleniumSessionFactory implements SessionFactory {
	private Spawner _windowSpawner;
	private WaiterFactory _waiterFactory;

	public SeleniumSessionFactory(Spawner windowSpawner,
			WaiterFactory waiterFactory) {
		_windowSpawner = windowSpawner;
		_waiterFactory = waiterFactory;

	}

	public Session buildBrowserSession(String browserExecutable, String url) {
		return new BrowserSession(_windowSpawner, _waiterFactory.getWaiter(),
				browserExecutable, url);
	}


	public Session buildMultipleBrowserSession(String[] browserExecutables, String url) {
		return new MultipleBrowserSession(this ,browserExecutables, url);
	}
}