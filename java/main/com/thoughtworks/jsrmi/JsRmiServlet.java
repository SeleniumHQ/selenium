package com.thoughtworks.jsrmi;

import edu.emory.mathcs.util.concurrent.Callable;
import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.FutureTask;

import javax.servlet.SingleThreadModel;
import javax.servlet.http.HttpServlet;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class JsRmiServlet extends HttpServlet implements SingleThreadModel {
    private final Exchanger exchanger;
    private FutureTask future;
    private Callable callable;

    public JsRmiServlet(Exchanger exchanger) {
        this.exchanger = exchanger;
    }

    String get() throws InterruptedException {
        future = new FutureTask(callable);
        return (String) exchanger.exchange(future);
    }

    void post(String result) {
//        callable.
    }
}
