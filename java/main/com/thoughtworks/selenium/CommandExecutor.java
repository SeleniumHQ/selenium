package com.thoughtworks.selenium;

/**
 * Executes a command
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public interface CommandExecutor {
    Object execute(String command) throws InterruptedException;
}
