package com.thoughtworks.selenium;

import java.lang.reflect.Proxy;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class WikiCommandGenerator {
    private final CommandExecutor commandExecutor;

    public WikiCommandGenerator(CommandExecutor commandExecutor) {
        this.commandExecutor = commandExecutor;
    }

    public Object proxy(Class clazz) {
        return Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{clazz}, new InvocationHandler(){
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                String wikiRow;
                if(method.getName().equals("verifyTable")) {
                    // special case
                    wikiRow = "|" + method.getName() + "|" + args[0] + "." + args[1] + "." + args[2] + "|" + args[3] + "|";
                } else {
                    // handles the other cases
                    String arg2 = args.length == 2 ? args[1].toString() : "";
                    wikiRow = "|" + method.getName() + "|" + args[0] + "|" + arg2 + "|";
                    return commandExecutor.execute(wikiRow);
                }
                return commandExecutor.execute(wikiRow);
            }
        });
    }
}
