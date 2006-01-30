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
package com.thoughtworks.selenium.results.servlet;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * @author Darren Cotterill
 * @author Ajit George
 */
public class UrlDecoder {

    public String decode(String string) {
        try {
            return URLDecoder.decode(string, System.getProperty("file.encoding"));
        } catch (UnsupportedEncodingException e) {
            return string;
        }
    }
    
    public List decodeListOfStrings(List list) {
        List decodedList = new LinkedList();
        
        for (Iterator i = list.iterator(); i.hasNext();) {
            decodedList.add(decode((String) i.next()));
        }
        
        return decodedList;
    }
}
