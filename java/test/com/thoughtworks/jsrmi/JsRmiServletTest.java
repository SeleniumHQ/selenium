package com.thoughtworks.jsrmi;

import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import edu.emory.mathcs.util.concurrent.Future;
import org.jmock.MockObjectTestCase;

import javax.servlet.ServletException;
import java.io.IOException;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class JsRmiServletTest extends MockObjectTestCase {
    public void testShould() {
    }

    public void XtestShouldExchangeJsRmiInvocationWithFutureOnGet() throws IOException, ServletException, InterruptedException {
        final Exchanger exchanger = new Exchanger();
        final Future[] future = new Future[1];
        JsRmiServlet servlet = new JsRmiServlet(exchanger);
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    future[0] = (Future) exchanger.exchange("Some invocation");
                } catch (InterruptedException e) {
                }
            }
        });
        assertEquals("Some invocation", servlet.get());
        assertNotNull(future[0]);
    }
}
