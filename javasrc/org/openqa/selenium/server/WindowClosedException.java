package org.openqa.selenium.server;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.internal.Trace;
import org.openqa.selenium.internal.TraceFactory;

public class WindowClosedException extends RemoteCommandException {

	public static final String WINDOW_CLOSED_ERROR = "Current window or frame is closed!";
	private static final long serialVersionUID = 1L;
	static Trace log = TraceFactory.getTrace(WindowClosedException.class);
	
	public WindowClosedException() {
		super(WINDOW_CLOSED_ERROR, WINDOW_CLOSED_ERROR);
		log.debug(WINDOW_CLOSED_ERROR);
	}

	public WindowClosedException(String message) {
		super(message, message);
		log.debug(message);
	}

	public WindowClosedException(Throwable cause) {
		super(WINDOW_CLOSED_ERROR, WINDOW_CLOSED_ERROR, cause);
		log.debug(WINDOW_CLOSED_ERROR, cause);
	}

	public WindowClosedException(String message, Throwable cause) {
		super(message, message, cause);
		log.debug(message, cause);
	}

}
