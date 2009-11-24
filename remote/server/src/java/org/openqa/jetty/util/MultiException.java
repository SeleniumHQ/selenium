// ========================================================================
// $Id: MultiException.java,v 1.10 2004/05/09 20:32:49 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.util;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.List;


/* ------------------------------------------------------------ */
/** Wraps multiple exceptions.
 *
 * Allows multiple exceptions to be thrown as a single exception.
 *
 * @version $Id: MultiException.java,v 1.10 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class MultiException extends Exception
{
    private Object nested;

    /* ------------------------------------------------------------ */
    public MultiException()
    {
        super("Multiple exceptions");
    }

    /* ------------------------------------------------------------ */
    public void add(Exception e)
    {
        if (e instanceof MultiException)
        {
            MultiException me = (MultiException)e;
            for (int i=0;i<LazyList.size(me.nested);i++)
                nested=LazyList.add(nested,LazyList.get(me.nested,i));
        }
        else
            nested=LazyList.add(nested,e);
    }

    /* ------------------------------------------------------------ */
    public int size()
    {
        return LazyList.size(nested);
    }
    
    /* ------------------------------------------------------------ */
    public List getExceptions()
    {
        return LazyList.getList(nested);
    }
    
    /* ------------------------------------------------------------ */
    public Exception getException(int i)
    {
        return (Exception) LazyList.get(nested,i);
    }

    /* ------------------------------------------------------------ */
    /** Throw a multiexception.
     * If this multi exception is empty then no action is taken. If it
     * contains a single exception that is thrown, otherwise the this
     * multi exception is thrown. 
     * @exception Exception 
     */
    public void ifExceptionThrow()
        throws Exception
    {
        switch (LazyList.size(nested))
        {
          case 0:
              break;
          case 1:
              throw (Exception)LazyList.get(nested,0);
          default:
              throw this;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Throw a multiexception.
     * If this multi exception is empty then no action is taken. If it
     * contains a any exceptions then this
     * multi exception is thrown. 
     */
    public void ifExceptionThrowMulti()
        throws MultiException
    {
        if (LazyList.size(nested)>0)
            throw this;
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        if (LazyList.size(nested)>0)
            return "org.openqa.jetty.util.MultiException"+
                LazyList.getList(nested);
        return "org.openqa.jetty.util.MultiException[]";
    }

    /* ------------------------------------------------------------ */
    public void printStackTrace()
    {
        super.printStackTrace();
        for (int i=0;i<LazyList.size(nested);i++)
            ((Throwable)LazyList.get(nested,i)).printStackTrace();
    }
   

    /* ------------------------------------------------------------------------------- */
    /**
     * @see java.lang.Throwable#printStackTrace(java.io.PrintStream)
     */
    public void printStackTrace(PrintStream out)
    {
        super.printStackTrace(out);
        for (int i=0;i<LazyList.size(nested);i++)
            ((Throwable)LazyList.get(nested,i)).printStackTrace(out);
    }

    /* ------------------------------------------------------------------------------- */
    /**
     * @see java.lang.Throwable#printStackTrace(java.io.PrintWriter)
     */
    public void printStackTrace(PrintWriter out)
    {
        super.printStackTrace(out);
        for (int i=0;i<LazyList.size(nested);i++)
            ((Throwable)LazyList.get(nested,i)).printStackTrace(out);
    }

}
