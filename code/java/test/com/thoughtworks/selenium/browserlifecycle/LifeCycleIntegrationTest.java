/*
 * Copyright 2004 ThoughtWorks, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *  
 */
package com.thoughtworks.selenium.browserlifecycle;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.session.BrowserSession;
import com.thoughtworks.selenium.browserlifecycle.session.SequentialMultipleBrowserSession;
import com.thoughtworks.selenium.browserlifecycle.session.StoppableBrowserSession;
import com.thoughtworks.selenium.browserlifecycle.window.BrowserSpawner;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;

public class LifeCycleIntegrationTest extends MockObjectTestCase {

	// this is a test to make sure eveything hangs together, but with the
	// nasty System dependant and threading stuff mocked

	public void testShouldSpawnWaitAndKillBrowsersInOrder()
			throws LifeCycleException {

		Mock mockBrowserSpawnerOne = mock(BrowserSpawner.class);
		Mock mockBrowserSpawnerTwo = mock(BrowserSpawner.class);

		Mock mockWindow = mock(Killable.class);
		Mock mockWaiter = mock(Waiter.class);

		BrowserSession firstBrowserSession = new StoppableBrowserSession(
				(BrowserSpawner) mockBrowserSpawnerOne.proxy(),
				(Waiter) mockWaiter.proxy());

		BrowserSession secondBrowserSession = new StoppableBrowserSession(
				(BrowserSpawner) mockBrowserSpawnerTwo.proxy(),
				(Waiter) mockWaiter.proxy());

		long timeout = 10;
		String url = "testUrl";

		BrowserSession[] browserSessions = new BrowserSession[] {
				firstBrowserSession, secondBrowserSession };

		BrowserSession sequentialMultipleBrowserSession = new SequentialMultipleBrowserSession(
				browserSessions);

		mockWaiter.expects(once()).method("initialise").id(
				"first waiter initialised");

		mockBrowserSpawnerOne.expects(once()).method("spawn").with(eq(url))
				.after(mockWaiter, "first waiter initialised").will(
						returnValue(mockWindow.proxy())).id(
						"first window spawned");

		mockWaiter.expects(once()).method("waitFor").with(eq(timeout)).after(
				mockBrowserSpawnerOne, "first window spawned").id(
				"waiting for first window");

		mockWindow.expects(once()).method("die").after(mockWaiter,
				"waiting for first window").id("first window killed");

		mockWaiter.expects(once()).method("initialise").after(mockWindow,
				"first window killed").id("second waiter initialised");

		mockBrowserSpawnerTwo.expects(once()).method("spawn").with(eq(url))
				.after(mockWaiter, "second waiter initialised").will(
						returnValue(mockWindow.proxy())).id(
						"second window spawned");

		mockWaiter.expects(once()).method("waitFor").with(eq(timeout)).after(
				mockBrowserSpawnerTwo, "second window spawned").id(
				"waiting for second window");

		mockWindow.expects(once()).method("die").after(mockWaiter,
				"waiting for second window").id("second window killed");

		sequentialMultipleBrowserSession.run(url, timeout);

		mockBrowserSpawnerOne.verify();
		mockBrowserSpawnerTwo.verify();
		mockWindow.verify();
		mockWaiter.verify();

	}
}