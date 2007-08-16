package org.openqa.selenium.testworker;


public abstract class TrackableRunnable implements Runnable {

	private ThreadStartedAt threadStartedAt;
	private Throwable throwable;
	private Object result;
	
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
