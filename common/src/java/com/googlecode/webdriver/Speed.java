package com.googlecode.webdriver;

public enum Speed {
    SLOW(250), 
    MEDIUM(150), 
    FAST(0);
    
    private int timeOut;
    
    private Speed(int timeOut) {
    	this.timeOut = timeOut;
    }
    
    public int getTimeOut() {
    	return timeOut;
    }
}
