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