package com.thoughtworks.selenium.browserlifecycle.coordinate;

public class SignalWaiterFactory implements WaiterFactory {

	private Audible _signaller;

	public SignalWaiterFactory(Audible signaller) {
		_signaller = signaller;
	}

	public Waiter getWaiter() {
		return new SignalWaiter(_signaller);
	}

}