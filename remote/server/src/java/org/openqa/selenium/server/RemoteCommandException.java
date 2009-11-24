package org.openqa.selenium.server;

/**
 * Exception to notify calling methods that an exception occurred when 
 * executing the method.
 * 
 * @author Matthew Purland
 */
public class RemoteCommandException extends Exception {
	// Result of the remote command that an exception occurred
	private String result;
	
	public RemoteCommandException(String message, String result) {
		super(message);
		
		this.result = result;
	}
	
	public RemoteCommandException(String message, String result, Throwable throwable) {
		super(message, throwable);
	
		this.result = result;
	}
	
	/**
	 * Get the result of the remote command that caused
	 * the exception.
	 */
	public String getResult() {
		return result;
	}
}
