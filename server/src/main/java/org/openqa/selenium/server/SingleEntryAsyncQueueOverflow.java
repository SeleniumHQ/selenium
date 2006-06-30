package org.openqa.selenium.server;

public class SingleEntryAsyncQueueOverflow extends RuntimeException {
    public SingleEntryAsyncQueueOverflow(Object newEntry, Object oldEntry) {
        super("should never have >1 entry on queue: attempt to add " + newEntry + " to queue which was holding " + oldEntry);
    }
}
