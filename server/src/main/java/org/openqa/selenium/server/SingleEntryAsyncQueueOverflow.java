package org.openqa.selenium.server;

public class SingleEntryAsyncQueueOverflow extends RuntimeException {
    public SingleEntryAsyncQueueOverflow() {
        super("should never have >1 entry on queue");
    }
}
