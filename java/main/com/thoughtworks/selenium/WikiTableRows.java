package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;

/**
 * This class implement's the three methods that are required by the Selenium XML-RPC
 * interface for Wiki table rows.
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class WikiTableRows {
    private final Exchanger commandExchanger;
    private final Exchanger resultExchanger;

    public WikiTableRows(Exchanger commandExchanger, Exchanger resultExchanger) {
        this.commandExchanger = commandExchanger;
        this.resultExchanger = resultExchanger;
    }

    public String getRow() throws InterruptedException {
        return (String) commandExchanger.exchange(null);
    }

    public void setResult(String result) throws InterruptedException {
        resultExchanger.exchange(result);
    }

    public void setException(String message) throws InterruptedException {
        resultExchanger.exchange(new SeleniumException(message));
    }

}
