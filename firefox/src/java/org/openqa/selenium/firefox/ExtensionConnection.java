package org.openqa.selenium.firefox;

public interface ExtensionConnection {
    boolean isConnected();
    Response sendMessageAndWaitForResponse(Class<? extends RuntimeException> throwOnFailure, Command command);
    void quit();
}
