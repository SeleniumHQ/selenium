package org.openqa.grid.common.exception;


public class GridConfigurationException extends GridException {

	public GridConfigurationException(String msg) {
		super(msg);
		
	}

	public GridConfigurationException(String msg, Throwable e) {
		super(msg,e);
	}

}
