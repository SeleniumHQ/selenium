package com.thoughtworks.selenium.browserlifecycle.session;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

class BrowserSession implements Session {
	
	private Spawner _windowSpawner;
	private Waiter _sessionWaiter;
	private String _browserExecutable;
	private String _url;

	public BrowserSession(Spawner windowSpawner, Waiter sessionWaiter,
			String browserExecutable, String url) {
		_windowSpawner = windowSpawner;
		_sessionWaiter = sessionWaiter;
		_browserExecutable = browserExecutable;
		_url = url;
	}

	public void run(long timeout) throws LifeCycleException {
		Killable window = startBrowser();
		waitUntilSessionIsOver(timeout);
		stopBrowser(window);
	}

	private Killable startBrowser() throws LifeCycleException {
		return _windowSpawner.spawn(_browserExecutable, _url);
	}

	private void waitUntilSessionIsOver(long timeout)
			throws SessionInterruptedException {
		try {
			_sessionWaiter.waitFor(timeout);
		} catch (InterruptedException e) {
			throw new SessionInterruptedException(e);
		}
	}

	private void stopBrowser(Killable window) {
		window.die();
	}

	public class SessionInterruptedException extends LifeCycleException {
		public SessionInterruptedException(InterruptedException cause) {
			super("BrowserSession was interrupted", cause);
		}
	}

}