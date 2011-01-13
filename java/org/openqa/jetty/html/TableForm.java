// ========================================================================
// $Id: TableForm.java,v 1.6 2004/05/09 20:31:28 gregwilkins Exp $
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
import java.util.Enumeration;

// =======================================================================
/** A form laid out in a Table.
 * <p> This class creates a form and lays out all the elements within a
 * table. Each element added has a label part and a element part. The label
 * is displayed in the form beside the element. All buttons are shown at the
 * bottom.
 */
public class TableForm extends Form
{

    /* ----------------------------------------------------------- */
    private Table table = null;
    private Table column = null;
    private int columns = 1;
    private Composite hidden = new Composite();
    private Composite buttons = null;
    private Composite bottomButtons = null;
    private String fieldAttributes = null;
    private boolean extendRow = false;
    
    /* ----------------------------------------------------------- */
    /** Create a new TableForm.
     * @param target The target url to send the form contents to
     */
    public TableForm(String target)
    {
        super(target);
        newTable();
        super.add(hidden);
    }

    /* ----------------------------------------------------------- */
    /** Add an informational section.
     */
    public void addText(String label,
                        String value)
    {
        Composite c = new Composite();
        c.add(value);
        addField(label,c);
    }

    /* ----------------------------------------------------------- */
    /** Add a Text Entry Field.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public Input addTextField(String tag, 
                              String label,
                              int length,
                              String value)
    {
        Input i = new Input(Input.Text,tag,value);
        i.setSize(length);
        addField(label,i);
        return i;
    }

    /* ----------------------------------------------------------- */
    /** Add a Text Area.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public TextArea addTextArea(String tag, 
                                String label,
                                int width,
                                int height,
                                String value)
    {
        TextArea ta = new TextArea(tag,value);
        ta.setSize(width,height);
        addField(label,ta);
        return ta;
    }

    /* ----------------------------------------------------------- */
    /** Add a File Entry Field.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public Input addFileField(String tag, 
                              String label)
    {
        Input i = new Input(Input.File,tag);
        addField(label,i);
        return i;
    }
    
    /* ----------------------------------------------------------- */
    /** Add an informational field which also passes the data as hidden.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public void addInfoField(String tag, 
                             String label,
                             String value)
    {
        addText(label,value);
        addHiddenField(tag,value);
    }

    /* ----------------------------------------------------------- */
    /** Add a hidden field.
     * @param tag The form name of the element
     */
    public void addHiddenField(String tag, 
                               String value)
    {
        Element e = new Input(Input.Hidden,tag,value);
        hidden.add(e);
    }

    /* ----------------------------------------------------------- */
    /** Add a password field.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public void addPassword(String tag,
                            String label,
                            int length)
    {
        Input i = new Input(Input.Password,tag);
        i.setSize(length);
        addField(label,i);
    }

    /* ----------------------------------------------------------- */
    /**
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public void addCheckbox(String tag,
                            String label,
                            boolean checked)
    {
        Input cb = new Input(Input.Checkbox,tag);
        addField(label,cb);
        if (checked)
            cb.check();
    }

    /* ----------------------------------------------------------- */
    /** Add a Select field.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public Select addSelect(String tag,
                            String label,
                            boolean multiple,
                            int size)
    {
        Select s = new Select(tag,multiple);
        s.setSize(size);
        addField(label,s);
        return s;
    }

    /* ----------------------------------------------------------- */
    /** Add a Select field initialised with fields.
     * @param tag The form name of the element
     * @param label The label for the element in the table.
     */
    public Select addSelect(String tag,
                            String label,
                            boolean multiple,
                            int size,
                            Enumeration values)
    {
        Select s = addSelect(tag,label,multiple,size);
        s.setSize(size);
        while (values.hasMoreElements())
            s.add(values.nextElement().toString());
        return s;
    }
    
    /* ----------------------------------------------------------- */
    /* add a new button area.
     * A button area is a line of a column in a table form where multiple
     * buttons can be placed.  Subsequent calls to addButton will
     * add buttons to this area.
     */
    public void addButtonArea(String label)
    {
        buttons=new Composite();
        addField(label,buttons);
    }
    
    /* ----------------------------------------------------------- */
    /* add a new button area.
     * A button area is a line of a column in a table form where multiple
     * buttons can be placed.  Subsequent calls to addButton will
     * add buttons to this area.
     */
    public void addButtonArea()
    {
        buttons=new Composite();
        addField(null,buttons);
    }
    
    /* ----------------------------------------------------------- */
    /* add a new button row.
     * A button row is a line of a column in a table form where multiple
     * buttons can be placed, that is aligned with the left hand side of the
     * TableForm Subsequent calls to addButton will
     * add buttons to this area.
     */
    public void addButtonRow()
    {
        buttons=new Composite();
        
        if (!extendRow)
        {
            column.newRow();
            column.addCell(buttons).left().middle();
            column.cell().attribute("colspan","2");
        }
        extendRow=false;
    }
    
    /* ----------------------------------------------------------- */
    /* add a new button area to bottom of multicolumn form.
     * A button area is a line of a table form where multiple
     * buttons can be placed. Subsequent calls to addButton will
     * add buttons to this area.
     * This is the default if no call is made to newButtonArea.
     */
    public void buttonsAtBottom()
    {
        if (bottomButtons!=null)
            buttons=bottomButtons;
        else
        {
            buttons=new Composite();
            bottomButtons=buttons;
        }
    }

    /* ----------------------------------------------------------- */
    /** Add a Submit Button.
     * @param tag The form name of the element
     * @param label The label for the Button
     */
    public Input addButton(String tag,
                           String label)
    {
        if (buttons==null)
            buttonsAtBottom();
        Input e = new Input(Input.Submit,tag,label);

        if (extendRow)
            addField(null,e);
        else
            buttons.add(e);
        return e;
    }

    /* ----------------------------------------------------------- */
    /** Add a reset button.
     * @param label The label for the element in the table.
     */
    public void addReset(String label)
    {
        if (buttons==null)
            buttonsAtBottom();
        Element e = new Input(Input.Reset,"Reset",label);
        if (extendRow)
            addField(null,e);
        else
            buttons.add(e);
    }

    // ------------------------------------------------------------
    /** Use the given attributes on the next addXXX */
    public void useAttributes(String attr){
        fieldAttributes = attr;
    }
    
    // ------------------------------------------------------------
    /** Get the internal table */
    public Table table(){
        return column;
    }
    
    // ------------------------------------------------------------
    /** Get the internal table */
    public Table outerTable(){
        return table;
    }

    /* ----------------------------------------------------------- */
    /** Extend the usage of the current row in the form.  The next
     * element added will be added to the same row as the form and
     * not have a label of it's own.
     * @return TableForm, the this pointer so that users can write:<pre>
     *                    tableForm.extendRow().addField(...)</pre>
     */
    public TableForm extendRow()
    {
        extendRow=true;
        return this;
    }

    /* ----------------------------------------------------------- */
    /** Add an arbitrary element to the table.
     * @param label The label for the element in the table.
     */
    public void addField(String label,Element field)
    {
        if (label==null)
            label="&nbsp;";
        else
            label="<b>"+label+":</b>";

        if (extendRow)
        {
            column.add(field);
            extendRow=false;
        }
        else
        {
            column.newRow();
            column.addCell(label);
            column.cell().right();
        
            if (fieldAttributes != null)
            {
                column.addCell(field,fieldAttributes);
                fieldAttributes = null;
            }
            else
                column.addCell(field);
        }
    }
    
    /* ----------------------------------------------------------- */
    /** Create a new column in the form.
     */
    public void addColumn()
    {
        column = new Table(0);
        table.addCell(column).top();
        columns++;
    }
    
    /* ----------------------------------------------------------- */
    /** Create a new column in the form.
     */
    public void addColumn(int spacing)
    {
        table.addCell("&nbsp","width="+spacing);
        column = new Table(0);
        table.addCell(column);
        table.cell().top();
        columns++;
    }
    
    /* ------------------------------------------------------------ */
    /** Add a new sections of columns.
     */
    public void newColumns()
    {
        column = new Table(0);
        columns = 1;
        table.newRow();
        table.addCell(column);
        table.cell().top();
    }

    /* ------------------------------------------------------------ */
    /** Set the column span of the current column.
     * This call is needed for forms that have varying numbers
     * of columns in different sections. NB. and column spacing
     * counts as a column.
     * @param span 
     */
    public void setColumnSpan(int span)
    {
        table.cell().attribute("colspan",""+span);
    }
    
    /* ----------------------------------------------------------- */
    /** Start using a new Table.
     * Anything added to the Composite parent of
     * this object before this is called will be added between the two
     * tables. */
    public void newTable()
    {
        table = new Table(0);
        column = new Table(0);
        columns = 1;
        super.add(table);
        table.newRow();
        table.addCell(column).top();    
    }
    
    /* ----------------------------------------------------------- */
    public void write(Writer out)
        throws IOException
    {
        if (bottomButtons!=null)
        {
            table.newRow();
            table.addCell(bottomButtons).attribute("colspan",columns);
        }
        super.write(out);
    } 
}
