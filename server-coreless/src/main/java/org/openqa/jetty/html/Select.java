// ========================================================================
// $Id: Select.java,v 1.7 2005/08/13 00:01:23 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.html;
import java.util.Enumeration;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/* -------------------------------------------------------------------- */
/** HTML select Block.
 * @see  org.openqa.jetty.html.Block
 */
public class Select extends Block
{
    private static Log log = LogFactory.getLog(Select.class);

    /* ----------------------------------------------------------------- */
    /**
     * @param name Name of the form element
     * @param multiple Whether multiple selections can be made
     */
    public Select(String name,boolean multiple)
    {
        super("select");
        attribute("name",name);
        
        if (multiple)
            attribute("multiple");
    }

    /* ----------------------------------------------------------------- */
    /**
     * @param name Name of the form element
     * @param multiple Whether multiple selections can be made
     */
    public Select(String name,boolean multiple, String[] options)
    {
        this(name,multiple);
        
        for (int i=0; i<options.length; i++)
            add(options[i]);
    }

    /* ----------------------------------------------------------------- */
    /** Set the number of options to display at once */
    public Select setSize(int size)
    {
        size(size);
        return this;
    }

    /* ----------------------------------------------------------------- */
    public Select add(Enumeration e)
    {
        while (e.hasMoreElements())
            add(e.nextElement().toString());
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Add option and specify if selected.
     */
    public Composite add(Object o)
    {
        if (o instanceof Enumeration)
            this.add((Enumeration)o);
        else
        {
            super.add("<option>");
            super.add(o);
        }
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Add option and specify if selected.
     */
    public Select add(Object o, boolean selected)
    {
        if (selected)
            super.add("<option selected>");
        else
            super.add("<option>");
        super.add(o);
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Add an option.
     * @param o The name of the option (displayed in the form)
     * @param selected Whether the option is selected
     * @param value The value of this option (returned in the form content)
     */
    public Select add(Object o, boolean selected, String value)
    {
        if (selected)
            super.add("<option selected value=\""+value+"\">");
        else
            super.add("<option value=\""+value+"\">");
        
        super.add(o);
        
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Build a select from the given array of Strings. The values of the
      * select are the indexes into the array of the strings, which are used
      * as the labels on the selector.
      * @param arr The array of strings for labels
      * @param selected The index of the selected label, -1 for default
      */
    public Select add(String arr[], int selected)
    {
        for (int i = 0; i < arr.length; i++){
            this.add(arr[i], i == selected, Integer.toString(i));
        }
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Build a select from the given array of Strings. The values of the
      * select are the indexes into the array of the strings, which are used
      * as the labels on the selector.
      * @param arr The array of strings for labels
      * @param selected The index of the selected label, -1 for default
      */
    public Select add(String arr[], String selected)
    {
        for (int i = 0; i < arr.length; i++){
            this.add(arr[i], arr[i].equals(selected));
        }
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Utility function for multi-selectors.
     * <p> This function takes the result returned by a multi-select input
     * and produces an integer bit-set result of the selections made. It
     * assumes the values of the multi-select are all different powers of 2.
     */
    public static int bitsetFormResult(String result)
    {
        int i;
        int from = 0;
        int res = 0;
        if(log.isDebugEnabled())log.debug("Result:"+result);
        String sres = null;
        while ((i = result.indexOf(' ', from)) != -1){
            sres = result.substring(from, i);
            res = res | Integer.parseInt(sres);
            if(log.isDebugEnabled())log.debug("Match:"+sres+"+ res="+res);
            from = i+1;
        }
        sres = result.substring(from);
        res = res | Integer.parseInt(sres);
        if(log.isDebugEnabled())log.debug("Match:"+sres+", res="+res);
        return res;     
    }
}




