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
package com.thoughtworks.selenium.browserlifecycle.session;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.BrowserSpawner;

public class StoppableBrowserSessionTest extends MockObjectTestCase {

	public void testShouldInitWaiterThenSpawnThenWaitThenKill() throws LifeCycleException {

		Mock spawner = mock(BrowserSpawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		StoppableBrowserSession session = new StoppableBrowserSession(
				(BrowserSpawner) spawner.proxy(), (Waiter) waiter.proxy());

		waiter.expects(once()).method("initialise").id("waiter initialised");
		spawner.expects(once()).method("spawn").after(waiter, "waiter initialised").will(
				returnValue(window.proxy())).id("spawn called");
		waiter.expects(once()).method("waitFor").after(spawner, "spawn called")
				.id("wait called");
		window.expects(once()).method("die").after(waiter, "wait called");

		session.run("irrelevant", 0);

		spawner.verify();
		waiter.verify();
		window.verify();
	}

	public void testShouldSpawnNewBrowserWindowWithSuppliedDetails()
			throws LifeCycleException {

		Mock spawner = mock(BrowserSpawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		String url = "testUrl";

		StoppableBrowserSession session = new StoppableBrowserSession(
				(BrowserSpawner) spawner.proxy(), (Waiter) waiter.proxy());

		waiter.stubs();
		window.stubs();
		spawner.expects(once()).method("spawn").with(eq(url)).will(
				returnValue(window.proxy()));

		session.run(url, 0);

		spawner.verify();

	}

	public void testShouldWaitWithSuppliedTimeout() throws LifeCycleException {

		Mock spawner = mock(BrowserSpawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		long timeout = 1;

		StoppableBrowserSession session = new StoppableBrowserSession(
				(BrowserSpawner) spawner.proxy(), (Waiter) waiter.proxy());

		window.stubs();
		waiter.expects(once()).method("initialise");
		spawner.stubs().method("spawn").will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor").with(eq(timeout));

		session.run("irrelevant", timeout);

		waiter.verify();
	}

	public void testShouldPassUpExceptionsEncounteredWhenSpawning() {
		Mock spawner = mock(BrowserSpawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		Exception problem = new LifeCycleException("test exception",
				new Throwable());

		StoppableBrowserSession session = new StoppableBrowserSession(
				(BrowserSpawner) spawner.proxy(), (Waiter) waiter.proxy());
		waiter.expects(once()).method("initialise");
		spawner.stubs().method("spawn").will(throwException(problem));

		try {
			session.run("irrelevant", 0);
			fail("Expected Exception to be Thrown");
		} catch (LifeCycleException e) {
			assertSame(problem, e);
		}

		spawner.verify();
	}

	public void testShouldIndicateSessionInterruptedIfWaitIsInterrupted()
			throws LifeCycleException {
		Mock spawner = mock(BrowserSpawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		long timeout = 1;

		StoppableBrowserSession session = new StoppableBrowserSession(
				(BrowserSpawner) spawner.proxy(), (Waiter) waiter.proxy());

		window.stubs();
		waiter.expects(once()).method("initialise");
		spawner.stubs().method("spawn").will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor").will(
				throwException(new InterruptedException()));
		;

		try {
			session.run("irrelevant", timeout);
			fail("Expected exception to be thrown");
		} catch (StoppableBrowserSession.SessionInterruptedException e) {
			//expected
		}

		waiter.verify();
	}

}