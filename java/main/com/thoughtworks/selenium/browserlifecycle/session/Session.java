
package com.thoughtworks.selenium.browserlifecycle.session;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;


public interface Session {

	public void run(long timeout) throws LifeCycleException;
	
}
