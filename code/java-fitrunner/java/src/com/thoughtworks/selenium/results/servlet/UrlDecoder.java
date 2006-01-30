package com.thoughtworks.selenium.results.servlet;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * @author Darren Cotterill
 * @author Ajit George
 * @version $Revision: $
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
