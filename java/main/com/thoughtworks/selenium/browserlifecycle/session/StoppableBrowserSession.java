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

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.BrowserSpawner;

public class StoppableBrowserSession implements BrowserSession {
	
	private BrowserSpawner _windowSpawner;
	private Waiter _sessionWaiter;

	public StoppableBrowserSession(BrowserSpawner windowSpawner, Waiter sessionWaiter) {
		_windowSpawner = windowSpawner;
		_sessionWaiter = sessionWaiter;
	}

	public void run(String url, long timeout) throws LifeCycleException {
		_sessionWaiter.initialise();
		Killable window = startBrowser(url);
		waitUntilSessionIsOver(timeout);
		stopBrowser(window);
	}

	private Killable startBrowser(String url) throws LifeCycleException {
		return _windowSpawner.spawn(url);
	}

	private void waitUntilSessionIsOver(long timeout)
			throws SessionInterruptedException {
		try {
			_sessionWaiter.waitFor(timeout);
		} catch (InterruptedException e) {
			throw new SessionInterruptedException(e);
		}
	}

	private void stopBrowser(Killable window) {
		window.die();
	}

	public class SessionInterruptedException extends LifeCycleException {
		public SessionInterruptedException(InterruptedException cause) {
			super("BrowserSession was interrupted", cause);
		}
	}

}