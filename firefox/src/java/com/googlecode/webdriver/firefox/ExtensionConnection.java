package com.googlecode.webdriver.firefox;

public interface ExtensionConnection {
    boolean isConnected();
    Response sendMessageAndWaitForResponse(String methodName, long id, String argument);
    void quit();
}
