// ========================================================================
// $Id: Element.java,v 1.10 2005/08/13 00:01:23 gregwilkins Exp $
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
import java.io.StringWriter;
import java.io.Writer;
import java.util.Enumeration;
import java.util.Hashtable;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LogSupport;

/* -------------------------------------------------------------------- */
/** HTML Element.
 * <p>This abstract class is the base for all HTML Elements.
 * The feature of an abstract HTML Element is that it can be added to
 * HTML Pages, HTML Composites and several other HTML Elements derivations.
 * Elements may also have attributes set, which are handled by the derived
 * Element.
 * @see Page
 * @see Composite
 * @version $Id: Element.java,v 1.10 2005/08/13 00:01:23 gregwilkins Exp $
 * @author Greg Wilkins
*/
public abstract class Element
{
    private static Log log = LogFactory.getLog(Element.class);

    /* ----------------------------------------------------------------- */
    public static final String
        noAttributes="",
        ALIGN="align",
        LEFT="left",
        RIGHT="right",
        CENTER="center",
        VALIGN="valign",
        TOP="top",
        BOTTOM="bottom",
        MIDDLE="middle",
        WIDTH="width",
        HEIGHT="height",
        SIZE="size",
        COLOR="color",
        BGCOLOR="bgcolor",
        STYLE="style",
        CLASS="class",
        ID="id";
    
        
    
    /* ----------------------------------------------------------------- */
    /** Dimensions >=0 if set*/
    private int width=-1;
    private int height=-1;
    private int size=-1;

    /* ----------------------------------------------------------------- */
    /** The space separated string of HTML element attributes.
     */
    private String attributes=null;
    protected Hashtable attributeMap=null;

    /* ----------------------------------------------------------------- */
    /** Default constructor.
     */
    public Element(){}

    /* ----------------------------------------------------------------- */
    /** Construct with attributes.
     * @param attributes The initial attributes of the element
     */
    public Element(String attributes)
    {
        attribute(attributes);
    }

    /* ----------------------------------------------------------------- */
    /** Write element to a Writer.
     * This abstract method is called by the Page or other containing
     * Element to write the HTML for this element. This must be implemented
     * by the derived Element classes.
     * @param out Writer to write the element to.
     */
    public abstract void write(Writer out)
         throws IOException;

    /* ----------------------------------------------------------------- */
    /** Write Element to an OutputStream.
     * Calls print(Writer) and checks errors
     * Elements that override this method should also override
     * write(Writer) to avoid infinite recursion.
     * @param out OutputStream to write the element to.
     */
    public void write(OutputStream out)
         throws IOException
    {
        Writer writer = new OutputStreamWriter(out);
        write(writer);
        writer.flush();
    }
    
    /* ----------------------------------------------------------------- */
    /** Write Element to an OutputStream.
     * Calls print(Writer) and checks errors
     * Elements that override this method should also override
     * write(Writer) to avoid infinite recursion.
     * @param out OutputStream to write the element to.
     */
    public void write(OutputStream out, String encoding)
         throws IOException
    {
        Writer writer = new OutputStreamWriter(out,encoding);
        write(writer);
        writer.flush();
    }

    /* ----------------------------------------------------------------- */
    public String attributes()
    {
        if (attributes==null && attributeMap==null)
            return noAttributes;

        StringBuffer buf = new StringBuffer(128);
        synchronized(buf)
        {
            if (attributeMap!=null)
            {
                Enumeration e = attributeMap.keys();
                while (e.hasMoreElements())
                {
                    buf.append(' ');
                    String a = (String)e.nextElement();
                    buf.append(a);
                    buf.append('=');
                    buf.append(attributeMap.get(a).toString());
                }
            }
            
            if(attributes!=null && attributes.length()>0)
            {
                if (!attributes.startsWith(" "))
                    buf.append(' ');
                buf.append(attributes);
            }
        }

        return buf.toString();
    }

    /* ----------------------------------------------------------------- */
    /** Add element Attributes.
     * The attributes are added to the Element attributes (separated with
     * a space). The attributes are available to the derived class in the
     * protected member String <I>attributes</I>
     * @deprecated Use attribute(String).
     * @param attributes String of HTML attributes to add to the element.
     * @return This Element so calls can be chained.
     */
    public Element attributes(String attributes)
    {
        if (log.isDebugEnabled() && attributes!=null && attributes.indexOf('=')>=0)
            log.debug("Set attribute with old method: "+attributes+
                         " on " + getClass().getName());

        if (attributes==null)
        {
            this.attributes=null;
            return this;
        }
        
        if (attributes==noAttributes)
            return this;
        
        if (this.attributes==null)
            this.attributes=attributes;
        else
            this.attributes += ' '+attributes;
        return this;
    }

    /* ------------------------------------------------------------ */
    /** Set attributes from another Element.
     * @param e Element
     * @return This Element
     */
    public Element setAttributesFrom(Element e)
    {
        attributes=e.attributes;
        attributeMap=(Hashtable)e.attributeMap.clone();
        return this;
    }

    
    /* ----------------------------------------------------------------- */
    /** Add element Attributes.
     * The attributes are added to the Element attributes (separated with
     * a space). The attributes are available to the derived class in the
     * protected member String <I>attributes</I>
     * @param attributes String of HTML attributes to add to the element.
     * A null attribute clears the current attributes.
     * @return This Element so calls can be chained.
     */
    public Element attribute(String attributes)
    {
        if (log.isDebugEnabled() && attributes!=null && attributes.indexOf('=')>=0)
            log.warn("Set attribute with old method: "+attributes+
                         " on " + getClass().getName());
        
        if (attributes==null ||
            this.attributes==null ||
            this.attributes==noAttributes ||
            this.attributes.length()==0)
            this.attributes=attributes;
        else
            this.attributes += ' '+attributes;
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Add quoted element Attributes and value.
     * @param attribute String of HTML attribute tag
     * @param value String value of the attribute to be quoted
     * @return This Element so calls can be chained.
     */
    public Element attribute(String attribute, Object value)
    {
        if (attributeMap==null)
            attributeMap=new Hashtable(10);
        
        if (value!=null)
        {
            if (value instanceof String && ((String)value).indexOf('"')!=-1)
            {
                String s=(String)value;
                int q=0;
                while((q=s.indexOf('"',q))>=0)
                {
                    s=s.substring(0,q)+"&quot;"+s.substring(++q);
                    q+=6;
                }
                value=s;
            }
            
            attributeMap.put(attribute,"\""+value+'"');
        }
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /** Add quoted element Attributes and value.
     * @param attribute String of HTML attribute tag
     * @param value String value of the attribute to be quoted
     * @return This Element so calls can be chained.
     */
    public Element attribute(String attribute, long value)
    {
        if (attributeMap==null)
            attributeMap=new Hashtable(10);
        
        attributeMap.put(attribute,Long.toString(value));
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Convert Element to String.
     * Uses write() to convert the HTML Element to a string.
     * @return String of the HTML element
     */
    public String toString()
    {
        try{
            StringWriter out = new StringWriter();
            write(out);
            out.flush();
            return out.toString();
        }
        catch(IOException e){
            LogSupport.ignore(log,e);
        }
        return null;    
    }
    
    /* ----------------------------------------------------------------- */
    /** left justify.
     * Convenience method equivalent to attribute("align","left"). Not
     * applicable to all Elements.
     */
    public Element left()
    {
        return attribute(ALIGN,LEFT);
    }
    
    /* ----------------------------------------------------------------- */
    /** right justify.
     * Convenience method equivalent to attribute("align","right"). Not
     * applicable to all Elements.
     */
    public Element right()
    {
        return attribute(ALIGN,RIGHT);
    }
    
    /* ----------------------------------------------------------------- */
    /** Center.
     * Convenience method equivalent to attribute("align","center"). Not
     * applicable to all Elements.
     */
    public Element center()
    {
        return attribute(ALIGN,CENTER);
    }
    
    /* ----------------------------------------------------------------- */
    /** Top align.
     * Convenience method equivalent to attribute("valign","top"). Not
     * applicable to all Elements.
     */
    public Element top()
    {
        return attribute(VALIGN,TOP);
    }
    
    /* ----------------------------------------------------------------- */
    /** Bottom align.
     * Convenience method equivalent to attribute("valign","bottom"). Not
     * applicable to all Elements.
     */
    public Element bottom()
    {
        return attribute(VALIGN,BOTTOM);
    }
    
    /* ----------------------------------------------------------------- */
    /** Middle align.
     * Convenience method equivalent to attribute("valign","middle"). Not
     * applicable to all Elements.
     */
    public Element middle()
    {
        return attribute(VALIGN,MIDDLE);
    }
    
    /* ----------------------------------------------------------------- */
    /** set width.
     * Convenience method equivalent to attribute("width",w). Not
     * applicable to all Elements.
     */
    public Element width(int w)
    {
        width=w;
        return attribute(WIDTH,w);
    }
    
    /* ----------------------------------------------------------------- */
    /** set width.
     * Convenience method equivalent to attribute("width",w). Not
     * applicable to all Elements.
     */
    public Element width(String w)
    {
        width=-1;
        return attribute(WIDTH,w);
    }
    
    /* ----------------------------------------------------------------- */
    public int width()
    {
        return width;
    }
    
    /* ----------------------------------------------------------------- */
    /** set height.
     * Convenience method equivalent to attribute("height",h). Not
     * applicable to all Elements.
     */
    public Element height(int h)
    {
        height=h;
        return attribute(HEIGHT,h);
    }
    
    /* ----------------------------------------------------------------- */
    /** set height.
     * Convenience method equivalent to attribute("height",h). Not
     * applicable to all Elements.
     */
    public Element height(String h)
    {
        height=-1;
        return attribute(HEIGHT,h);
    }
    
    /* ----------------------------------------------------------------- */
    public int height()
    {
        return height;
    }
    
    /* ----------------------------------------------------------------- */
    /** set size.
     * Convenience method equivalent to attribute("size",s). Not
     * applicable to all Elements.
     */
    public Element size(int s)
    {
        size=s;
        return attribute(SIZE,s);
    }
    
    /* ----------------------------------------------------------------- */
    /** set size.
     * Convenience method equivalent to attribute("size",s). Not
     * applicable to all Elements.
     */
    public Element size(String s)
    {
        size=-1;
        return attribute(SIZE,s);
    }
    
    /* ----------------------------------------------------------------- */
    public int size()
    {
        return size;
    }
    
    /* ----------------------------------------------------------------- */
    /** set color.
     * Convenience method equivalent to attribute("color",color). Not
     * applicable to all Elements.
     */
    public Element color(String color)
    {
        return attribute(COLOR,color);
    }
    
    /* ----------------------------------------------------------------- */
    /** set BGCOLOR.
     * Convenience method equivalent to attribute("bgcolor",color). Not
     * applicable to all Elements.
     */
    public Element bgColor(String color)
    {
        return attribute(BGCOLOR,color);
    }
    
    /* ----------------------------------------------------------------- */
    /** set CSS CLASS.
     */
    public Element cssClass(String c)
    {
        return attribute(CLASS,c);
    }
    
    /* ----------------------------------------------------------------- */
    /** set CSS ID.
     * Convenience method equivalent to attribute("id",id).
     */
    public Element cssID(String id)
    {
        return attribute(ID,id);
    }
    
    /* ----------------------------------------------------------------- */
    /** set Style.
     * Convenience method equivalent to attribute("style",style).
     */
    public Element style(String style)
    {
        return attribute(STYLE,style);
    }
}




