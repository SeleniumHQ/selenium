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

public class SequentialMultipleBrowserSessionTest extends MockObjectTestCase {

	public void testShouldDoNothingIfPassedNoBrowserSessions() throws Exception {

		String url = "irrelevant";
		BrowserSession[] browserSessions = new BrowserSession[] {};

		SequentialMultipleBrowserSession session = new SequentialMultipleBrowserSession(
				browserSessions);
		session.run(url, 0);
	}

	public void testShouldRunASingleBrowserSession()
			throws Exception {

		Mock browserSession = mock(BrowserSession.class);

		long timeout = 99;
		String url = "testUrl";
		BrowserSession[] browserSessions = new BrowserSession[] { (BrowserSession) browserSession
				.proxy() };

		SequentialMultipleBrowserSession session = new SequentialMultipleBrowserSession(
				browserSessions);
		browserSession.expects(once()).method("run").with(eq(url), eq(timeout));

		session.run(url, timeout);

		browserSession.verify();
	}

	public void testShouldRunMultipleSessionsInOrder()
			throws Exception {

		Mock browserSession1 = mock(BrowserSession.class);
		Mock browserSession2 = mock(BrowserSession.class);

		long timeout = 99;
		String url = "testUrl";

		BrowserSession[] browserSessions = new BrowserSession[] {
				(BrowserSession) browserSession1.proxy(),
				(BrowserSession) browserSession2.proxy() };

		SequentialMultipleBrowserSession session = new SequentialMultipleBrowserSession(
				browserSessions);

		browserSession1.expects(once()).method("run")
				.with(eq(url), eq(timeout)).id("first session run");

		browserSession2.expects(once()).method("run")
				.with(eq(url), eq(timeout)).after(browserSession1,
						"first session run");

		session.run(url, timeout);

		browserSession1.verify();
		browserSession2.verify();
	}

	// is this what we want? or should we just go on to the next browser
	// and report at end?
	public void testShouldAbortOnError() {

		Mock browserSession1 = mock(BrowserSession.class);
		Mock browserSession2 = mock(BrowserSession.class);

		long timeout = 99;
		String url = "testUrl";

		BrowserSession[] browserSessions = new BrowserSession[] {
				(BrowserSession) browserSession1.proxy(),
				(BrowserSession) browserSession2.proxy() };

		LifeCycleException error = new LifeCycleException("test",
				new Throwable());

		SequentialMultipleBrowserSession session = new SequentialMultipleBrowserSession(
				browserSessions);

		browserSession1.expects(once()).method("run")
				.with(eq(url), eq(timeout)).will(throwException(error));
		
		browserSession2.expects(never());

		try {
			session.run(url, timeout);
			fail("Expected exception to be thrown");
		} catch (LifeCycleException e) {
			// woot
		}


		browserSession1.verify();
		browserSession2.verify();
	}

}