
package com.thoughtworks.selenium.browserlifecycle.session;


public interface SessionFactory {
  
	public Session buildBrowserSession(String browserExecutable, String url);
	public Session buildMultipleBrowserSession(String[] browsers, String url);
}
