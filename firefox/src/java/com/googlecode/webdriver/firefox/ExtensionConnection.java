package com.googlecode.webdriver.firefox;

public interface ExtensionConnection {
    boolean isConnected();
    Response sendMessageAndWaitForResponse(Class<? extends RuntimeException> throwOnFailure, String methodName, long id, String... argument);
    void quit();
}
