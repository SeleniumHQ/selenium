package com.thoughtworks.selenium.browserlifecycle.coordinate;

public class SignalWaiter implements Waiter, Listener {

	private boolean _signalled = false;

	public SignalWaiter(Audible audible) {
		audible.addListener(this);
	}

	public synchronized void waitFor(long attentionSpan)
			throws InterruptedException {
		if (!_signalled) {
			this.wait(attentionSpan);
		}
	}

	public synchronized void signal() {
		_signalled = true;
		this.notify();
	}
}