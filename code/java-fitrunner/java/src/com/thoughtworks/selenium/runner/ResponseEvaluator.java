package com.thoughtworks.selenium.runner;

import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

/**
 * @author Darren Cotterill
 * @author Ajit George
 * @version $Revision: $
 */
public interface ResponseEvaluator {
    public boolean evaluate(GetMethod get);
    
    public static final ResponseEvaluator SUCCESSFUL_CONNECT = new ResponseEvaluator() {

        public boolean evaluate(GetMethod get) {
            return get.getStatusCode() == HttpStatus.SC_OK;
        }
    };
}