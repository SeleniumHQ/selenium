package com.thoughtworks.selenium.browserlifecycle.window;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;

public class WindowSpawner implements Spawner {

	public Killable spawn(String executable, String argument)
			throws LifeCycleException {
		return new BrowserWindow(executable, argument);
	}

}