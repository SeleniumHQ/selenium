
package com.thoughtworks.selenium.browserlifecycle.window;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;

public interface Spawner {
	
	public Killable spawn(String executable, String argument)
			throws LifeCycleException;
	
}
