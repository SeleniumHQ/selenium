package com.thoughtworks.selenium.browserlifecycle.session;

import com.thoughtworks.selenium.browserlifecycle.coordinate.WaiterFactory;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

public class SeleniumSessionFactory implements SessionFactory {
	private Spawner _windowSpawner;
	private WaiterFactory _waiterFactory;

	public SeleniumSessionFactory(Spawner windowSpawner,
			WaiterFactory waiterFactory) {
		_windowSpawner = windowSpawner;
		_waiterFactory = waiterFactory;

	}

	public Session buildBrowserSession(String browserExecutable, String url) {
		return new BrowserSession(_windowSpawner, _waiterFactory.getWaiter(),
				browserExecutable, url);
	}


	public Session buildMultipleBrowserSession(String[] browsers, String url) {
		return new MultipleBrowserSession(this ,browsers, url);
	}
}