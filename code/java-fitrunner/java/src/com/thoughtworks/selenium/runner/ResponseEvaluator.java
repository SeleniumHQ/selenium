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
package com.thoughtworks.selenium.runner;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;


/**
 * @author Darren Cotterill
 * @author Ajit George
 */

public interface ResponseEvaluator {
    public boolean evaluate(GetMethod get);
    
    public static final ResponseEvaluator SUCCESSFUL_CONNECT = new ResponseEvaluator() {

        public boolean evaluate(GetMethod get) {
            return get.getStatusCode() == HttpStatus.SC_OK;
        }
    };
}