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
package com.thoughtworks.jsrmi;

import edu.emory.mathcs.util.concurrent.Callable;
import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.FutureTask;

import javax.servlet.SingleThreadModel;
import javax.servlet.http.HttpServlet;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
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
