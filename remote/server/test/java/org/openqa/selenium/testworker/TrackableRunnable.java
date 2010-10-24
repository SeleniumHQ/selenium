package org.openqa.selenium.testworker;


public abstract class TrackableRunnable implements Runnable {

	private volatile ThreadStartedAt threadStartedAt;
	private volatile Throwable throwable;
	private volatile Object result;
	
	public void run() {
		try {
			result = go();
		} catch (Throwable t) {
			throwable = new Throwable(t);
			throwable.setStackTrace(threadStartedAt.getStackTrace());
		}
	}
	
	public Object getResult() {
		return result;
	}
	
	public abstract Object go() throws Throwable;

	public ThreadStartedAt getThreadStartedAt() {
		return threadStartedAt;
	}

	public void setThreadStartedAt(ThreadStartedAt threadStartedAt) {
		this.threadStartedAt = threadStartedAt;
	}
	
	public Throwable getThrowable() {
		return throwable;
	}

}
