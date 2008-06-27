package org.openqa.selenium;

public enum Speed {
    SLOW(1000), 
    MEDIUM(500), 
    FAST(0),
    ;
    
    protected int timeOut;
    
    private Speed(int timeOut) {
    	this.timeOut = timeOut;
    }
    
    public int getTimeOut() {
    	return timeOut;
    }
}
