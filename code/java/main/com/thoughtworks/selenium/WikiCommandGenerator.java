/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.5 $
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
                }
                return commandExecutor.execute(wikiRow);
            }
        });
    }
}
