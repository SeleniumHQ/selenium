package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class ExchangerExecutorTest extends MockObjectTestCase {
    public void testShouldExecuteCommandsSynchronously() throws InterruptedException {
        final Exchanger commandExchanger = new Exchanger();
        final Exchanger resultExchanger = new Exchanger();
        final ExchangerExecutor exchangerExecutor = new ExchangerExecutor(commandExchanger, resultExchanger);
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    assertEquals("|foo|bar|zap|", commandExchanger.exchange(null));
                    resultExchanger.exchange("OK");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        assertEquals("OK", exchangerExecutor.execute("|foo|bar|zap|"));
    }

    public void testShouldThrowExceptionWhenExceptionSet() throws InterruptedException {
        final Exchanger commandExchanger = new Exchanger();
        final Exchanger resultExchanger = new Exchanger();
        final ExchangerExecutor exchangerExecutor = new ExchangerExecutor(commandExchanger, resultExchanger);
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    assertEquals("|foo|bar|zap|", commandExchanger.exchange(null));
                    resultExchanger.exchange(new SeleniumException("KO"));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        try {
            exchangerExecutor.execute("|foo|bar|zap|");
        } catch (SeleniumException expected) {
            assertEquals("KO", expected.getMessage());
        }
    }
}
