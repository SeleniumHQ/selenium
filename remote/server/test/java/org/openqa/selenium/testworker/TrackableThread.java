package org.openqa.selenium.testworker;

import java.util.concurrent.TimeoutException;

public class TrackableThread extends Thread {

	private TrackableRunnable trackedTarget;

	public TrackableThread(TrackableRunnable target, String name) {
		super(target, name);
		trackedTarget = target;
	}

	public TrackableThread(ThreadGroup group, TrackableRunnable target, String name) {
		super(group, target, name);
		trackedTarget = target;
	}

	public TrackableThread(ThreadGroup group, TrackableRunnable target, String name,
			long stackSize) {
		super(group, target, name, stackSize);
		trackedTarget = target;
	}
	
	@Override
	public synchronized void start() {
		ThreadStartedAt tsa = new ThreadStartedAt();
		trackedTarget.setThreadStartedAt(tsa);
		super.start();
	}
	
	public void joinOrInterrupt(long millisJoinTimeout, long millisInterruptTimeout) throws Throwable {
		join(millisJoinTimeout);
		if (isAlive()) {
			interrupt();
			join(millisInterruptTimeout);
			if (isAlive()) {
				throw new TimeoutException("Thread refused to die");
			}
		}
		if (trackedTarget.getThrowable() != null) {
			throw new Throwable("Underlying thread had exception", trackedTarget.getThrowable());
		}
	}
	
	public Object getResult(long millisJoinTimeout, long millisInterruptTimeout) throws Throwable {
		joinOrInterrupt(millisJoinTimeout, millisInterruptTimeout);
		return trackedTarget.getResult();
	}
	
	public Object getResult() throws Throwable {
		return getResult(10000, 1000);
	}

}
