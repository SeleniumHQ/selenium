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

import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
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
