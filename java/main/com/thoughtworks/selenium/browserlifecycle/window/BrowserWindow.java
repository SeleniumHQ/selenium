
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
