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

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

public class BrowserSessionTest extends MockObjectTestCase {

	public void testShouldSpawnThenWaitThenKill() throws LifeCycleException {

		Mock spawner = mock(Spawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		BrowserSession session = new BrowserSession((Spawner) spawner.proxy(),
				(Waiter) waiter.proxy(), "irrelevant", "irrelevant");

		spawner.expects(once()).method("spawn").will(
				returnValue(window.proxy())).id("spawn called");
		waiter.expects(once()).method("waitFor").after(spawner, "spawn called")
				.id("wait called");
		window.expects(once()).method("die").after(waiter, "wait called");
		session.run(0);

		spawner.verify();
		waiter.verify();
		window.verify();
	}

	public void testShouldSpawnNewBrowserWindowWithSuppliedDetails()
			throws LifeCycleException {

		Mock spawner = mock(Spawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		String executable = "testBowserExecutable";
		String url = "testUrl";

		BrowserSession session = new BrowserSession((Spawner) spawner.proxy(),
				(Waiter) waiter.proxy(), executable, url);

		waiter.stubs();
		window.stubs();
		spawner.expects(once()).method("spawn").with(eq(executable), eq(url))
				.will(returnValue(window.proxy()));

		session.run(0);

		spawner.verify();

	}

	public void testShouldWaitWithSuppliedTimeout() throws LifeCycleException {

		Mock spawner = mock(Spawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		long timeout = 1;

		BrowserSession session = new BrowserSession((Spawner) spawner.proxy(),
				(Waiter) waiter.proxy(), "irrelevant", "irrelevant");

		window.stubs();
		spawner.stubs().method("spawn").will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor").with(eq(timeout));

		session.run(timeout);

		waiter.verify();
	}
	
	public void testShouldPassUpExceptionsEncounteredWhenSpawning() {
		Mock spawner = mock(Spawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		Exception problem = new LifeCycleException("test exception", new Throwable());

		BrowserSession session = new BrowserSession((Spawner) spawner.proxy(),
				(Waiter) waiter.proxy(), "irrelevant", "irrelevant");
		
		spawner.stubs().method("spawn").will(throwException(problem));
		
		try {
			session.run(0);
			fail("Expected Exception to be Thrown");
		} catch (LifeCycleException e) {
			assertSame(problem, e);
		}
		
		spawner.verify();
	}

	public void testShouldIndicateSessionInterruptedIfWaitIsInterrupted() throws LifeCycleException {
		Mock spawner = mock(Spawner.class);
		Mock waiter = mock(Waiter.class);
		Mock window = mock(Killable.class);

		long timeout = 1;

		BrowserSession session = new BrowserSession((Spawner) spawner.proxy(),
				(Waiter) waiter.proxy(), "irrelevant", "irrelevant");

		window.stubs();
		spawner.stubs().method("spawn").will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor").will(throwException(new InterruptedException()));;

		try {
			session.run(timeout);
			fail("Expected exception to be thrown");
		} catch (BrowserSession.SessionInterruptedException e) {
			//expected
		}

		waiter.verify();
	}

	
}