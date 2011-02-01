package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.CommandQueue;

public interface CommandQueueAware {

    void setCommandQueue(CommandQueue queue);
    
}
