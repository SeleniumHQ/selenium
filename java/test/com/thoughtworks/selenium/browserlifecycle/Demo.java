package com.thoughtworks.selenium.browserlifecycle;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.thoughtworks.selenium.browserlifecycle.coordinate.Audible;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Listener;
import com.thoughtworks.selenium.browserlifecycle.coordinate.SignalWaiterFactory;
import com.thoughtworks.selenium.browserlifecycle.session.MultipleBrowserSession;
import com.thoughtworks.selenium.browserlifecycle.session.SeleniumSessionFactory;
import com.thoughtworks.selenium.browserlifecycle.window.WindowSpawner;

public class Demo {

	static class DemoServer implements Audible, Runnable {

		List _listeners = new ArrayList();

		public void run() {

			//Wait for a bit before triggering the event - in the real world
			// this would be a real event

			try {
				Thread.sleep(5000); // 
			} catch (InterruptedException e) {
				e.printStackTrace();
			}

			synchronized (_listeners) {

				for (Iterator iter = _listeners.iterator(); iter.hasNext();) {
					Listener listener = (Listener) iter.next();
					listener.signal();

				}
			}
		}

		public void addListener(Listener listener) {
			synchronized (_listeners) {
				_listeners.add(listener);
			}
		}

	}

	public static void main(String[] args) throws LifeCycleException {

		DemoServer server = new DemoServer();

		long timeout = 10000;
		String url = "http://www.google.com";
		String[] browsers = new String[] {
				"c:\\program files\\Mozilla Firefox\\firefox.exe",
				"c:\\program files\\internet explorer\\iexplore.exe" };

		Audible signaller;

		WindowSpawner windowSpawner = new WindowSpawner();
		SignalWaiterFactory waiterFactory = new SignalWaiterFactory(server);

		SeleniumSessionFactory factory = new SeleniumSessionFactory(
				windowSpawner, waiterFactory);
		MultipleBrowserSession session = (MultipleBrowserSession) factory
				.buildMultipleBrowserSession(browsers, url);

		Thread serverThread = new Thread(server);
		serverThread.start();

		session.run(timeout);

		// Expect that this will result in :
		//         - firefox window on google for 5 secs before it is killed by
		// notification from the demo server
		//         - IE window on google for 10 secs before killed by timeout
		// if thread timing is off, then both may time out

	}
}