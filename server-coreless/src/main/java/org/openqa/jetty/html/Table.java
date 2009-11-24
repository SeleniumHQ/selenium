// ========================================================================
// $Id: Table.java,v 1.3 2004/05/09 20:31:28 gregwilkins Exp $
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
import java.util.Hashtable;

/* --------------------------------------------------------------------- */
/** A HTML Table element.
 * <p> The Table Element works by calling newRow and then adding cells or
 * headings.
 * <p>Notes<br>
 * Tables are implemented by nesting a cell Block within a row Block
 * within the table which is also a Block (see nest() on class Composite).
 * Once a row and cell have been created, calling add or attributes on
 * the table actually calls the cell.
 *
 * @see org.openqa.jetty.html.Element
 */
public class Table extends Block
{    
    /* ----------------------------------------------------------------- */
    private Block row = null;
    private Block cell = null;
    private static Hashtable threadNestingMap = null;
    private CompositeFactory cellNestFactory = null;
    private Block _defaultHead=null;
    private Block _defaultCell=null;
    private Block _defaultRow=null;

    /* ----------------------------------------------------------------- */
    /** Construct Table.
     */
    public Table()
    {
        super("table");
        if (threadNestingMap!=null)
            cellNestFactory = (CompositeFactory)
                threadNestingMap.get(Thread.currentThread());
    }
    
    /* ----------------------------------------------------------------- */
    /** Construct Table.
     */
    public Table(int border)
    {
        super("table");
        attribute("border",border);
        if (threadNestingMap!=null)
            cellNestFactory = (CompositeFactory)
                threadNestingMap.get(Thread.currentThread());
    }

    /* ----------------------------------------------------------------- */
    /** Construct Table with attributes.
     */
    public Table(int border, String attributes)
    {
        this(border);
        attribute(attributes);
    }

    /* ----------------------------------------------------------------- */
    /** Create new table row.
     * Attributes set after this call and before a call to newCell or
     * newHeader are considered row attributes.
     */
    public Table newRow()
    {
        unnest();
        nest(row = new Block("tr"));
        if (_defaultRow!=null)
        {
            row.setAttributesFrom(_defaultRow);
            if (_defaultRow.size()>0)
                row.add(_defaultRow.contents());
        }
        cell=null;
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Create new table row with attributes.
     * Attributes set after this call and before a call to newCell or
     * newHeader are considered row attributes.
     */
    public Table newRow(String attributes)
    {
        newRow();
        row.attribute(attributes);
        return this;    
    }

    /* ----------------------------------------------------------------- */
    /* Create a new Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     */
    private void newBlock(String m)
    {
        if (row==null)
            newRow();
        else
            row.unnest();
        row.nest(cell=new Block(m));

        if (cellNestFactory!=null)
            cell.nest(cellNestFactory.newComposite());  
    }
    
    /* ----------------------------------------------------------------- */
    /* Create a new Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     */
    public Table newCell()
    {
        newBlock("td");
        if (_defaultCell!=null)
        {
            cell.setAttributesFrom(_defaultCell);
            if (_defaultCell.size()>0)
                cell.add(_defaultCell.contents());
        }
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /* Create a new Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     * @return This table for call chaining
     */
    public Table newCell(String attributes)
    {
        newCell();
        cell.attribute(attributes);
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /* Add a new Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     * @return This table for call chaining
     */
    public Table addCell(Object o)
    {
        newCell();
        cell.add(o);
        return this;
    }

    /* ----------------------------------------------------------------- */
    /* Add a new Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     * @return This table for call chaining
     */
    public Table addCell(Object o, String attributes)
    {
        addCell(o);
        cell.attribute(attributes);
        return this;
    }
        
    /* ----------------------------------------------------------------- */
    /* Create a new Heading in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     */
    public Table newHeading()
    {
        newBlock("th");
        if (_defaultHead!=null)
        {
            cell.setAttributesFrom(_defaultHead);
            if (_defaultHead.size()>0)
                cell.add(_defaultHead.contents());
        }
        return this;
    }
    
    /* ----------------------------------------------------------------- */
    /* Add a new heading Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     * @return This table for call chaining
     */
    public Table addHeading(Object o)
    {
        newHeading();
        cell.add(o);
        return this;
    }

    /* ----------------------------------------------------------------- */
    /* Add a new heading Cell in the current row.
     * Adds to the table after this call and before next call to newRow,
     * newCell or newHeader are added to the cell.
     * @return This table for call chaining
     */
    public Table addHeading(Object o,String attributes)
    {
        addHeading(o);
        cell.attribute(attributes);
        return this;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the table cell spacing.
     * @param s spacing in pixels
     * @return This table for call chaining
     */
    public Table cellSpacing(int s)
    {
        attribute("cellspacing",s);
        return this;
    }
    

    /* ------------------------------------------------------------ */
    /** Set the table cell padding.
     * @param padding the cell padding in pixels
     * @return This table for call chaining
     */
    public Table cellPadding(int padding)
    {
        attribute("cellpadding",padding);
        return this;
    }
    
    /* ------------------------------------------------------------ */
    /** Set horizontal and vertical spacing.
     * @param h horizontal spacing
     * @param v vertical spacing
     * @return This table for call chaining
     */
    public Table spacing(int h, int v)
    {
        if (h>=0)
            attribute("hspace",h);
        if (v>=0)
            attribute("vspace",v);
        return this;
    }

    /* ----------------------------------------------------------------- */
    /** Get the current row Block element.
     * Use this call for setting row attributes.
     * @return The Block instance which has been nested in the table as
     * the row
     */
    public Block row()
    {
        return row;
    }
    
    /* ----------------------------------------------------------------- */
    /** Get the current cell Block element.
     * Use this call for setting cell attributes.
     * @return The Block instance which has been nested in the row as
     * the cell
     */
    public Block cell()
    {
        return cell;
    }
    
    /* ----------------------------------------------------------------- */
    /** Add cell nesting factory.
     * Set the CompositeFactory for this thread. Each new cell in the
     * table added by this thread will have a new Composite from this
     * factory nested in the Cell.
     * @param factory The factory for this Thread. If null clear this
     * threads factory.
     * @deprecated Use setNestingFactory or setThreadNestingFactory
     */
    public static void setCellNestingFactory(CompositeFactory factory)
    {
        if (threadNestingMap==null)
            threadNestingMap= new Hashtable();
        
        if (factory == null)
            threadNestingMap.remove(Thread.currentThread());
        else
            threadNestingMap.put(Thread.currentThread(),factory);
    }
    
    /* ----------------------------------------------------------------- */
    /** Add cell nesting factory for thread.
     * Set the CompositeFactory for this thread. Each new cell in the
     * table added by this thread will have a new Composite from this
     * factory nested in the Cell.
     * @param factory The factory for this Thread. If null clear this
     * threads factory.
     */
    public static void setThreadNestingFactory(CompositeFactory factory)
    {
        if (threadNestingMap==null)
            threadNestingMap= new Hashtable();
        
        if (factory == null)
            threadNestingMap.remove(Thread.currentThread());
        else
            threadNestingMap.put(Thread.currentThread(),factory);
    }
    
    /* ----------------------------------------------------------------- */
    /** Add cell nesting factory for table.
     * Set the CompositeFactory for this thread. Each new cell in the
     * table added by this thread will have a new Composite from this
     * factory nested in the Cell.
     * @param factory The factory for this Thread. If null clear this
     * threads factory.
     */
    public void setNestingFactory(CompositeFactory factory)
    {
        cellNestFactory = factory;
    }

    
    /* ------------------------------------------------------------ */
    /** Access the default row template.
     * The Block returned is used as a template for all new rows added
     * to the table.  Thus if attributes or content are added to the
     * default row, the these are added to each new row in the table.
     * @return The default row template
     */
    public Block defaultRow()
    {
        if (_defaultRow==null)
            _defaultRow=new Block("tr");
        return _defaultRow;
    }
    
    /* ------------------------------------------------------------ */
    /** Access the default header cell template.
     * The Block returned is used as a template for all new header cells added
     * to the table.  Thus if attributes or content are added to the
     * default cell, the these are added to each new cell in the table.
     * @return The default head cell template
     */
    public Block defaultHead()
    {
        if (_defaultHead==null)
            _defaultHead=new Block("th");
        return _defaultHead;
    }
    
    /* ------------------------------------------------------------ */
    /** Access the default cell template.
     * The Block returned is used as a template for all new cells added
     * to the table.  Thus if attributes or content are added to the
     * default cell, the these are added to each new cell in the table.
     * @return The default cell template
     */
    public Block defaultCell()
    {
        if (_defaultCell==null)
            _defaultCell=new Block("td");
        return _defaultCell;
    }
}








