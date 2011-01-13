// ========================================================================
// $Id: Page.java,v 1.5 2004/09/23 02:15:15 gregwilkins Exp $
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
import java.io.Writer;
import java.util.Dictionary;
import java.util.Hashtable;

/* --------------------------------------------------------------------- */
/** HTML Page.
 * A HTML Page extends composite with the addition of the HTML Header
 * tags, fields and elements.
 * Furthermore, individual parts of the page may be written or the
 * progressive page be output with flush.
 * <p>
 * Pages contain parameters and named sections. These are used by
 * derived Page classes that implement a Look and Feel.  Page users
 * may add to name sections such as "Margin" or "Footer" and set
 * parameters such as "HelpUrl" without knowledge of how the look and feel
 * will arrange these.  To assist with standard look and feel creation
 * Page defines a set of standard names for many common parameters
 * and sections.
 * <p>
 * If named sections are used, the page constructor or completeSections
 * must add the named section to the page in the appropriate places.
 * If named sections are not added to the page, then they can only be
 * written with an explicit call to write(out,"section",end);
 * Changes in behaviour to section creation and adding, should be controlled
 * via page properties.
 * <p>
 * @see Composite
 * @version $Id: Page.java,v 1.5 2004/09/23 02:15:15 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class Page extends Composite
{
    /* ----------------------------------------------------------------- */
    public static final String
        Request="Request",
        Response="Response",
        Header="Header",
        Title="Title",
        Section="Section",
        HeaderSize="HdrSize",  // HeaderSize string suitable for FRAMESET
        Footer="Footer",
        FooterSize="FtrSize",  // FooterSize string suitable for FRAMESET
        Content="Content",
        ContentSize="CntSize",
        Margin="Margin",
        MarginSize="MrgSize",
        LeftMargin="Left",
        LeftMarginSize="LMSize",
        RightMargin="Right",
        RightMarginSize="RMSize",
        Help="Help",
        Home="Home",
        Heading="Heading", 
        Up="Up",
        Prev="Prev",
        Next="Next",
        Back="Back",
        Target="Target",
        BaseUrl="BaseUrl",
        FgColour="FgColour",
        BgColour="BgColour",
        HighlightColour="HlColour",
        PageType="PageType",
        NoTitle="No Title"
        ;

    /* ----------------------------------------------------------------- */
    protected Hashtable properties = new Hashtable(10);

    /* ----------------------------------------------------------------- */
    Hashtable sections = new Hashtable(10);
    private Composite head= new Composite();
    private String base="";
    private boolean writtenHtmlHead = false;
    private boolean writtenBodyTag = false;

    /* ----------------------------------------------------------------- */
    public Page()
    {
        this(NoTitle);
    }

    /* ----------------------------------------------------------------- */
    public Page(String title)
    {
        title(title);
    }

    /* ----------------------------------------------------------------- */
    public Page(String title, String attributes)
    {
        title(title);
        attribute(attributes);
    }

    /* ----------------------------------------------------------------- */
    /** Set page title.
     * @return This Page (for chained commands)
     */
    public Page title(String title)
    {
        properties.put(Title,title);
        String heading = (String)properties.get(Heading);
        if (heading==null||heading.equals(NoTitle))
            properties.put(Heading,title);
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Add element or object to the page header.
     * @param o The Object to add. If it is a String or Element, it is
     * added directly, otherwise toString() is called.
     * @return This Page (for chained commands)
     */    
    public Page addHeader(Object o)
    {
        head.add("\n");
        head.add(o);
        return this;
    }
  
    /* ----------------------------------------------------------------- */
    /** Set page background image.
     * @return This Page (for chained commands)
     */
    public final Page setBackGroundImage(String bg)
    {
        attribute("background",bg);
        return this;
    }
  
    /* ----------------------------------------------------------------- */
    /** Set page background color.
     * @return This Page (for chained commands)
     */
    public final Page setBackGroundColor(String color)
    {
        properties.put(BgColour,color);
        attribute("bgcolor",color);
        return this;
    }
  
    /* ----------------------------------------------------------------- */
    /** Set the URL Base for the Page.
     * @param target Default link target, null if none.
     * @param href Default absolute href, null if none.
     * @return This Page (for chained commands)
     */
    public final Page setBase(String target, String href)
    {
        base="<base " +
            ((target!=null)?("TARGET=\""+target+"\""):"") +
            ((href!=null)?("HREF=\""+href+"\""):"") +
            ">";
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Write the entire page by calling:<br>
     * writeHtmlHead(out)<br>
     * writeBodyTag(out)<br>
     * writeElements(out)<br>
     * writeHtmlEnd(out)
     */
    public void write(Writer out)
         throws IOException
    {
        writeHtmlHead(out);
        writeBodyTag(out);
        writeElements(out);
        writeHtmlEnd(out);
    }
    
    /* ------------------------------------------------------------ */
    /** Write HTML page head tags.
     * Write tags &ltHTML&gt&lthead&gt .... &lt/head&gt
     */
    public void writeHtmlHead(Writer out)
         throws IOException
    {
        if (!writtenHtmlHead)
        {
            writtenHtmlHead=true;
            completeSections();
            out.write("<html><head>");
            String title=(String)properties.get(Title);
            if (title!=null && title.length()>0 && !title.equals(NoTitle))
                out.write("<title>"+title+"</title>");
            head.write(out);
            out.write(base);
            out.write("\n</head>\n");
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Write HTML page body tag.
     * Write tags &ltBODY page attributes&gt.
     */
    public void writeBodyTag(Writer out)
         throws IOException
    {
        if (!writtenBodyTag)
        {
            writtenBodyTag = true;          
            out.write("<body "+attributes()+">\n");
        }
    }

    /* ------------------------------------------------------------ */
    /** Write end BODY and end HTML tags.
     */
    public void writeHtmlEnd(Writer out)
         throws IOException
    {
        out.write("\n</body>\n");
        out.write("</html>\n");
    }
    
    /* ------------------------------------------------------------ */
    /** Write any body elements of the page.
     */
    public void writeElements(Writer out)
         throws IOException
    {
        super.write(out);
    }
    
    /* ------------------------------------------------------------ */
    /** Write page section.
     * The page is written containing only the named section.
     * If a head and bodyTag have not been written, then they
     * are written before the section. If endHtml is true, the
     * end HTML tag is also written.
     * If the named section is Content and it cannot be found,
     * then the normal page contents are written.
     */
    public void write(Writer out,
                      String section,
                      boolean endHtml)
         throws IOException
    {
        writeHtmlHead(out);
        writeBodyTag(out);
        Composite s = getSection(section);
        if (s==null)
        {
            if (section.equals(Content))
                writeElements(out);
        }
        else
            s.write(out);
        if (endHtml)
            writeHtmlEnd(out);
        out.flush();
    }
    
    /* ------------------------------------------------------------ */
    /* Flush the current contents of the page.
     * writeHtmlEnd() is not called and should either be
     * explicitly called or called via an eventual call to write()
     */
    public void flush(Writer out)
         throws IOException
    {
        writeHtmlHead(out);
        writeBodyTag(out);
        super.flush(out);
    }
    
    /* ------------------------------------------------------------ */
    /* Reset the page status to not written.
     * This is useful if you want to send a page more than once.
     */
     public void rewind()
    {
        writtenHtmlHead = false;
        writtenBodyTag = false;
    }
    
    /* ------------------------------------------------------------ */
    /** Access the page properties.  It is up to a derived Page class
     * to interpret these properties.
     */
    public Dictionary properties()
    {
        return properties;
    }

    /* ------------------------------------------------------------ */
    /** Return the preferred FrameSet to be used with a specialized Page.
     * The Frames will be named after the sections they are to
     * contain.
     * The default implementation returns null
     */
    public FrameSet frameSet()
    {
        return null;
    }

    /* ------------------------------------------------------------ */
    /** Set a composite as a named section.  Other Page users may.
     * add to the section by calling addTo().  It is up to the section
     * creator to add the section to the page in it appropriate position.
     */
    public void setSection(String section, Composite composite)
    {
        sections.put(section,composite);
    }
    
    /* ------------------------------------------------------------ */
    /** Set a composite as a named section and add it to the.
     * contents of the page
     */
    public void addSection(String section, Composite composite)
    {
        sections.put(section,composite);
        add(composite);
    }
    
    /* ------------------------------------------------------------ */
    /** Get a composite as a named section. 
     */
    public Composite getSection(String section)
    {
        return (Composite)sections.get(section);
    }

    /* ------------------------------------------------------------ */
    /** Add content to a named sections.  If the named section cannot.
     * be found, the content is added to the page.
     */
    public void addTo(String section, Object element)
    {
        Composite s = (Composite)sections.get(section);
        if (s==null)
            add(element);
        else
            s.add(element);
    }
    
    /* ------------------------------------------------------------ */
    /** This call back is called just before writeHeaders() actually
     * writes the HTML page headers. It can be implemented by a derived
     * Page class to complete a named section after the rest of the Page
     * has been created and appropriate properties set.
     */
    protected void completeSections()
    {
    }
}
