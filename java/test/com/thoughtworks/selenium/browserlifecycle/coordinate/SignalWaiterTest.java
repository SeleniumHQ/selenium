package com.thoughtworks.selenium.browserlifecycle.coordinate;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.coordinate.Audible;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Listener;
import com.thoughtworks.selenium.browserlifecycle.coordinate.SignalWaiter;

public class SignalWaiterTest extends MockObjectTestCase {

	public void testShouldAddSelfAsListenerOnConstruction() {

		// How can you do this with JMock?
		
		class MockAudible implements Audible {
			private Listener _listener;

			public void addListener(Listener listener) {
				_listener = listener;
			}

			public Listener getListener() {
				return _listener;
			}
		}

		MockAudible audible = new MockAudible();
		SignalWaiter waiter = new SignalWaiter(audible);

		assertSame("Should have registered self with audible", waiter, audible
				.getListener());
	}

	
	// The following tests suck. They rely on inter-thread timing and hence it is possible that
	// they may fail when they should not. If this starts to happen they should be removed or even
	// better replaced with fully deterministic tests [ if anyone can figure out how!:)]
	
	
	class TimerThread extends Thread {
		
		private long _time;
		
		public TimerThread(long time) {
			_time = time;

		}
		
		public void run()  {
			try {
				Thread.sleep(_time);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	class WaiterThread extends Thread {
		
		private SignalWaiter _waiter;
		private long _time;
		
		public WaiterThread(SignalWaiter waiter, long time) {
			_waiter = waiter;
			_time = time;
		}
		
		public void run()  {
			try {
				_waiter.waitFor(_time);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			
		}
	}
	
	public void testShouldNotWaitIfEventHasAlreadyHappened() throws InterruptedException {
  		
		Mock audible = mock(Audible.class);
		audible.stubs().method("addListener");
		
		SignalWaiter waiter = new SignalWaiter((Audible) audible.proxy());
        WaiterThread waiterThread = new WaiterThread(waiter, 1000);
        TimerThread timerThread = new TimerThread(5);
		
		waiter.signal();
        timerThread.start();
        
        waiterThread.start();
        timerThread.join();

		assertFalse("Expected waiter thread to finish before timer", waiterThread.isAlive());
		
	}
	
	public void testShouldStopWaitingWhenSignalled() throws InterruptedException {
		Mock audible = mock(Audible.class);
		audible.stubs().method("addListener");
		
		SignalWaiter waiter = new SignalWaiter((Audible) audible.proxy());
        WaiterThread waiterThread = new WaiterThread(waiter, 1000);
        TimerThread timerThread = new TimerThread(10);
	
        timerThread.start();
        waiterThread.start();
        timerThread.join();
        
		assertTrue("Waiter thread should be waiting", waiterThread.isAlive());
        
        TimerThread timerThread2 = new TimerThread(10);
        timerThread2.start();
        waiter.signal();
        timerThread2.join();

    	assertFalse("Expected waiter thread to finish before timer", waiterThread.isAlive());
	}

	public void testShouldEventuallyStopWaitingIfNoSignal() throws InterruptedException {
		Mock audible = mock(Audible.class);
		audible.stubs().method("addListener");
		
		SignalWaiter waiter = new SignalWaiter((Audible) audible.proxy());
        WaiterThread waiterThread = new WaiterThread(waiter, 100);
        TimerThread timerThread = new TimerThread(10);
        
        timerThread.start();
        waiterThread.start();
        timerThread.join();
        
		assertTrue("Waiter thread should be waiting", waiterThread.isAlive());
        
        TimerThread timerThread2 = new TimerThread(100);
        timerThread2.start();
        timerThread2.join();

    	assertFalse("Expected waiter thread to finish before timer", waiterThread.isAlive());
	}
}