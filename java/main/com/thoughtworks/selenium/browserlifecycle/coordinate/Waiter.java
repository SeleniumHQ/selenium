package com.thoughtworks.selenium.browserlifecycle.coordinate;

public interface Waiter {
	public void waitFor(long attentionSpan) throws InterruptedException;
}