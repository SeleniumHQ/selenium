package org.openqa.selenium.server;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

public class WindowClosedException extends RemoteCommandException {

	public static final String WINDOW_CLOSED_ERROR = "Current window or frame is closed!";
	private static final long serialVersionUID = 1L;
	static Log log = LogFactory.getLog(WindowClosedException.class);
	
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
