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
package com.thoughtworks.selenium.browserlifecycle;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.coordinate.WaiterFactory;
import com.thoughtworks.selenium.browserlifecycle.session.MultipleBrowserSession;
import com.thoughtworks.selenium.browserlifecycle.session.SeleniumSessionFactory;
import com.thoughtworks.selenium.browserlifecycle.session.SessionFactory;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

public class LifeCycleIntegrationTest extends MockObjectTestCase {

	// this is a test to make sure eveything hangs together, but with the
	// nasty System dependant and threading stuff mocked 
	
	public void testShouldSpawnWaitAndKillBrowsersInOrder() throws LifeCycleException {

		Mock mockSpawner = mock(Spawner.class);
		Mock mockWindow = mock(Killable.class);
		Mock mockWaiterFactory = mock(WaiterFactory.class);
		Mock mockWaiter = mock(Waiter.class);

		SessionFactory sessionFactory = new SeleniumSessionFactory(
				(Spawner) mockSpawner.proxy(),
				(WaiterFactory) mockWaiterFactory.proxy());

		long timeout = 10;
		String url = "testUrl";
		String browser1 = "browserOne";
		String browser2 = "browserTwo";
		String[] browsers = new String[] { browser1, browser2 };

		MultipleBrowserSession session = (MultipleBrowserSession) sessionFactory
				.buildMultipleBrowserSession(browsers, url);

		mockWaiterFactory.expects(once()).method("getWaiter").will(
				returnValue(mockWaiter.proxy())).id("first waiter created");

		mockSpawner.expects(once()).method("spawn").with(eq(browser1), eq(url))
				.after(mockWaiterFactory, "first waiter created").will(
						returnValue(mockWindow.proxy())).id(
						"first window spawned");

		mockWaiter.expects(once()).method("waitFor").with(eq(timeout)).after(
				mockSpawner, "first window spawned").id(
				"waiting for first window");

		mockWindow.expects(once()).method("die").after(mockWaiter,
				"waiting for first window").id("first window killed");

		mockWaiterFactory.expects(once()).method("getWaiter").after(mockWindow,
				"first window killed").will(returnValue(mockWaiter.proxy()))
				.id("second waiter created");

		mockSpawner.expects(once()).method("spawn").with(eq(browser2), eq(url))
				.after(mockWaiterFactory, "second waiter created").will(
						returnValue(mockWindow.proxy())).id(
						"second window spawned");

		mockWaiter.expects(once()).method("waitFor").with(eq(timeout)).after(
				mockSpawner, "second window spawned").id(
				"waiting for second window");

		mockWindow.expects(once()).method("die").after(mockWaiter,
				"waiting for second window").id("second window killed");

		session.run(timeout);

		mockSpawner.verify();
		mockWindow.verify();
		mockWaiterFactory.verify();
		mockWaiter.verify();

	}
}