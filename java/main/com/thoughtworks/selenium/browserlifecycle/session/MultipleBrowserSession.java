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

public class MultipleBrowserSession implements Session {

	SessionFactory _browserSessionFactory;
	String[] _browsers;
	String _url;

	public MultipleBrowserSession(SessionFactory browserSessionFactory,
			String[] browsers, String url) {
		_browserSessionFactory = browserSessionFactory;
		_browsers = browsers;
		_url = url;
	}

	public void run(long individualBrowserTimeout) throws LifeCycleException {
		for (int i = 0; i < _browsers.length; i++) {
			Session browserSession = (Session) _browserSessionFactory
					.buildBrowserSession(_browsers[i], _url);
			browserSession.run(individualBrowserTimeout);
		}

	}

}