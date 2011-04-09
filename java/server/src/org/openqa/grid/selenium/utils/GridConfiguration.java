package org.openqa.grid.selenium.utils;

import java.net.URL;
import java.security.InvalidParameterException;

public class GridConfiguration {

	private GridRole role = GridRole.NOT_GRID;
	private URL registrationURL;
	private int port = 5555;
	
	
	public URL getRegistrationURL() {
		return registrationURL;
	}

	public void setRegistrationURL(URL registrationURL) {
		this.registrationURL = registrationURL;
	}

	public GridRole getRole() {
		return role;
	}

	public int getPort() {
		return port;
	}

	

	public void setRole(GridRole role) {
		this.role = role;

	}

	public void setRegitrationURL(URL url) {
		this.registrationURL = url;

	}

	public void setPort(int port) {
		this.port = port;

	}

	/**
	 * Validate the current config
	 * @throws InvalidParameterException if the CLA are wrong
	 */
	public void validate() {
		if (role==GridRole.WEBDRIVER || role ==GridRole.REMOTE_CONTROL){
			if (registrationURL==null){
				throw new InvalidParameterException("registration url cannot be null");
			}
		}
		
	}

}
