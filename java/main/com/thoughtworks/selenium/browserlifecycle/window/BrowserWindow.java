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
package com.thoughtworks.selenium.browserlifecycle.window;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;



public class BrowserWindow implements Killable{

    private Process _browserprocess;

	public BrowserWindow(String browserExecutable, String url) throws UnableToOpenBrowserWindowException {
		try {
			_browserprocess = Runtime.getRuntime().exec(new String[] {browserExecutable, url});
		} catch (Throwable t) {
			throw new UnableToOpenBrowserWindowException(browserExecutable, url, t);
		}
	}
	
	public synchronized void die() {
		_browserprocess.destroy();
	}
	
	public class UnableToOpenBrowserWindowException extends LifeCycleException {
		public UnableToOpenBrowserWindowException(String executable, String url, Throwable cause) {
           super("Encountered a problem opening url [" + url + "] with browser [" + executable + "]", cause);
		}
	}
}
