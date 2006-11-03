package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.SeleneseQueue;

public interface SeleneseQueueAware {
    void setSeleneseQueue(SeleneseQueue queue);
}
