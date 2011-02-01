// ========================================================================
// $Id: Input.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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

/* -------------------------------------------------------------------- */
/** HTML Form Input Tag.
 * <p>
 * @see Tag
 * @see Form
 * @version $Id: Input.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class Input extends Tag
{
    /* ----------------------------------------------------------------- */
    /** Input types */
    public final static String Text="text";
    public final static String Password="password";
    public final static String Checkbox="checkbox";
    public final static String Radio="radio";
    public final static String Submit="submit";
    public final static String Reset="reset";
    public final static String Hidden="hidden";
    public final static String File="file";
    public final static String Image="image";

    /* ----------------------------------------------------------------- */
    public Input(String type,String name)
    {
        super("input");
        attribute("type",type);
        attribute("name",name);
    }

    /* ----------------------------------------------------------------- */
    public Input(String type,String name, String value)
    {
        this(type,name);
        attribute("value",value);
    }

    /* ----------------------------------------------------------------- */
    public Input(Image image,String name, String value)
    {
        super("input");
        attribute("type","image");
        attribute("name",name);
        if (value!=null)
            attribute("value",value);
        attribute(image.attributes());
    }
    
    /* ----------------------------------------------------------------- */
    public Input(Image image,String name)
    {
        super("input");
        attribute("type","image");
        attribute("name",name);
        attribute(image.attributes());
    }

    /* ----------------------------------------------------------------- */
    public Input check()
    {
        attribute("checked");
        return this;
    }

    /* ----------------------------------------------------------------- */
    public Input setSize(int size)
    {
        size(size);
        return this;
    }

    /* ----------------------------------------------------------------- */
    public Input setMaxSize(int size)
    {
        attribute("maxlength",size);
        return this;
    }

    /* ----------------------------------------------------------------- */
    public Input fixed()
    {
        setMaxSize(size());
        return this;
    }
}
