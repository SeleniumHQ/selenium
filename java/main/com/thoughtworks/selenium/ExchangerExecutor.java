package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;

/**
 * CommandExecutor that expects commands and results to be exchanged via another thread
 * through exchangers.
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class ExchangerExecutor implements CommandExecutor {
    private final Exchanger commandExchanger;
    private final Exchanger resultExchanger;

    public ExchangerExecutor(Exchanger commandExchanger, Exchanger resultExchanger) {
        this.commandExchanger = commandExchanger;
        this.resultExchanger = resultExchanger;
    }

    public Object execute(String wikiRow) throws InterruptedException {
        commandExchanger.exchange(wikiRow);
        Object result = resultExchanger.exchange(null);
        if(result instanceof SeleniumException) {
            throw (SeleniumException) result;
        } else {
            return result;
        }
    }
}
