package com.thoughtworks.selenium;

import org.jmock.MockObjectTestCase;
import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class RemoteInterfaceTest extends MockObjectTestCase {
    public void testShouldGetCommandFromExchanger() throws InterruptedException {
        final Exchanger commandExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    commandExchanger.exchange("foo");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        assertEquals("foo", new WikiTableRows(commandExchanger, null).getRow());
    }

    public void testShouldPutExceptionOnExchanger() throws InterruptedException {
        final Exchanger resultExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    new WikiTableRows(null, resultExchanger).setException("KO");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        SeleniumException e = (SeleniumException) resultExchanger.exchange(null);
        assertEquals("KO", e.getMessage());
    }

    public void testShouldPutResultOnExchanger() throws InterruptedException {
        final Exchanger resultExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    new WikiTableRows(null, resultExchanger).setResult("OK");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        assertEquals("OK", resultExchanger.exchange(null));
    }
}
