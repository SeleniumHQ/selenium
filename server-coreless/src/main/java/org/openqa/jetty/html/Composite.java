// ========================================================================
// $Id: Composite.java,v 1.6 2004/05/09 20:31:28 gregwilkins Exp $
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
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;


/* -------------------------------------------------------------------- */
/** HTML Composite Element.
 * <p>This class is can be used a either an abstract or concrete
 * holder of other HTML elements.
 * Used directly, it allow multiple HTML Elements to be added which
 * are produced sequentially.
 * Derived used of Composite may wrap each contain Element in
 * special purpose HTML tags (e.g. list).
 *
 * <p>Notes<br>
 * Elements are added to the Composite either as HTML Elements or as
 * Strings.  Other objects added to the Composite are converted to Strings
 * @see Element
 * @version $Id: Composite.java,v 1.6 2004/05/09 20:31:28 gregwilkins Exp $
 * @author Greg Wilkins
*/
public class Composite extends Element
{
    /* ----------------------------------------------------------------- */
    /** The vector of elements in this Composite.
     */
    protected ArrayList elements= new ArrayList(8);

    /* ----------------------------------------------------------------- */
    protected Composite nest=null;

    /* ----------------------------------------------------------------- */
    /** Default constructor.
     */
    public Composite()
    {}
    
    /* ----------------------------------------------------------------- */
    /** Default constructor.
     */
    public Composite(String attributes)
    {
        super(attributes);
    }

    /* ----------------------------------------------------------------- */
    /** Add an Object to the Composite by converting it to a Element or.
     * String
     * @param o The Object to add. If it is a String or Element, it is
     * added directly, otherwise toString() is called.
     * @return This Composite (for chained commands)
     */
    public Composite add(Object o)
    {
        if (nest!=null)
            nest.add(o);
        else
        {
            if (o!=null)
            {
                if (o instanceof Element)
                {
                    if(o instanceof Page)
                        throw new IllegalArgumentException("Can't insert Page in Composite");
                    elements.add(o);
                }
                else if (o instanceof String)
                    elements.add(o);
                else 
                    elements.add(o.toString());
            }
        }
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Nest a Composite within a Composite.
     * The passed Composite is added to this Composite. Adds to
     * this composite are actually added to the nested Composite.
     * Calls to nest are passed the nested Composite
     * @return The Composite to unest on to return to the original
     * state.
     */
    public Composite nest(Composite c)
    {
        if (nest!=null)
            return nest.nest(c);
        else
        {
            add(c);
            nest=c;
        }
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Explicit set of the Nested component.
     * No add is performed. setNest() obeys any current nesting and
     * sets the nesting of the nested component.
     */
    public Composite setNest(Composite c)
    {
        if (nest!=null)
            nest.setNest(c);
        else
            nest=c;
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Recursively unnest the composites.
     */
    public Composite unnest()
    {
        if (nest!=null)
            nest.unnest();
        nest = null;
        return this;
    }


    /* ----------------------------------------------------------------- */
    /** The number of Elements in this Composite.
     * @return The number of elements in this Composite
     */
    public int size()
    {
        return elements.size();
    }
    
    /* ----------------------------------------------------------------- */
    /** Write the composite.
     * The default implementation writes the elements sequentially. May
     * be overridden for more specialized behaviour.
     * @param out Writer to write the element to.
     */
    public void write(Writer out)
         throws IOException
    {
        for (int i=0; i <elements.size() ; i++)
        {
            Object element = elements.get(i);
          
            if (element instanceof Element)
                ((Element)element).write(out);
            else if (element==null)
                out.write("null");
            else 
                out.write(element.toString());
        }
    }
    
    /* ----------------------------------------------------------------- */
    /** Contents of the composite.
     */
    public String contents()
    {
        StringBuffer buf = new StringBuffer();
        synchronized(buf)
        {
            for (int i=0; i <elements.size() ; i++)
            {
                Object element = elements.get(i);
                if (element==null)
                    buf.append("null");
                else 
                    buf.append(element.toString());
            }
        }
        return buf.toString();
    }

    /* ------------------------------------------------------------ */
    /** Empty the contents of this Composite .
     */
    public Composite reset()
    {
        elements.clear();
        return unnest();
    }
    
    /* ----------------------------------------------------------------- */
    /* Flush is a package method used by Page.flush() to locate the
     * most nested composite, write out and empty its contents.
     */
    void flush(Writer out)
         throws IOException
    {
        if (nest!=null)
            nest.flush(out);
        else
        {
            write(out);
            elements.clear();
        }
    }
    
    /* ----------------------------------------------------------------- */
    /* Flush is a package method used by Page.flush() to locate the
     * most nested composite, write out and empty its contents.
     */
    void flush(OutputStream out)
         throws IOException
    {
        flush(new OutputStreamWriter(out));
    }
    
    /* ----------------------------------------------------------------- */
    /* Flush is a package method used by Page.flush() to locate the
     * most nested composite, write out and empty its contents.
     */
    void flush(OutputStream out, String encoding)
         throws IOException
    {
        flush(new OutputStreamWriter(out,encoding));
    }

    /* ------------------------------------------------------------ */
    /** Replace an object within the composite.
     */
    public boolean replace(Object oldObj, Object newObj)
    {  
        if (nest != null)
        {
            return nest.replace(oldObj, newObj);
        }
        else
        {
            int sz = elements.size();
            for (int i = 0; i < sz; i++)
            {
                if (elements.get(i) == oldObj)
                {
                    elements.set(i,newObj);
                    return true;
                }     
            }
        }
        
        return false;
    }           

}
