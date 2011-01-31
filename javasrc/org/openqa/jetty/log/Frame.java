// ========================================================================
// Copyright (c) 1997 MortBay Consulting, Sydney
// $Id: Frame.java,v 1.1 2004/06/04 21:37:20 gregwilkins Exp $
// ========================================================================

package org.openqa.jetty.log;




/*-----------------------------------------------------------------------*/
/** Access the current execution frame.
 * This version of the Frame class uses the JDK 1.4 mechanisms to
 * access the stack frame
 */
public class Frame
{
    
    /* ------------------------------------------------------------ */
    private static String __className=Frame.class.getName();
    private static final String __lineSeparator = System.getProperty("line.separator");
    
    /*-------------------------------------------------------------------*/
    private StackTraceElement[] _stack;
    
    /*-------------------------------------------------------------------*/
    /** The full stack of where the Frame was created. */
    private String _string;
    
    /** The Method (including the "(file.java:99)") the Frame was created in */
    private String _method= "unknownMethod";
    
    /** The stack depth where the Frame was created (main is 1) */
    private int _depth=0;
    
    /** Name of the Thread the Frame was created in */
    private String _thread= "unknownThread";
    
    /** The file and linenumber of where the Frame was created. */
    private String _file= "UnknownFile";

    private String _where;
    private int _top=0;
    
    /*-------------------------------------------------------------------*/
    /** Construct a frame.
     */
    public Frame()
    {
        _stack=new Throwable().getStackTrace();
        init(0, false);
    }
    
    /*-------------------------------------------------------------------*/
    /** Construct a frame.
     * @param ignoreFrames number of levels of stack to ignore
     */
    public Frame(int ignoreFrames)
    {
        _stack=new Throwable().getStackTrace();
        init(ignoreFrames, false);
    }
    
    /* ------------------------------------------------------------ */
    /** package private Constructor. 
     * @param ignoreFrames Number of frames to ignore
     * @param partial Partial construction if true
     */
    Frame(int ignoreFrames, boolean partial)
    {
        _stack=new Throwable().getStackTrace();
        init(ignoreFrames, partial);
    }
    
    /* ------------------------------------------------------------ */
    private Frame(StackTraceElement[] stack,int top)
    {
        _stack=stack;
        _top=top;
        _where=_stack[_top].toString();
        complete();
    }
    
    /* ------------------------------------------------------------ */
    private void init(int ignoreFrames, boolean partial)
    {
        // Extract stack components, after we look for the Frame constructor
 	    // itself and pull that off the stack!
        int check=_stack.length;
        if (check>3) check=3;
        for (int i=0;i<check;i++)
        {
            if (__className.equals(_stack[i].getClassName()) &&
                "<init>".equalsIgnoreCase(_stack[i].getMethodName()))
            {
                _top=i+1;
                break;
            }
        }
        _top+=ignoreFrames;
        _where=_stack[_top].toString();
        if (!partial) complete();
    }
    
    /* ------------------------------------------------------------ */
    /** Complete partial constructor.
     */
    void complete()
    {
        _file=_stack[_top].getFileName()+":"+_stack[_top].getLineNumber();
        _method=_stack[_top].getClassName()+"."+_stack[_top].getMethodName();
        _depth=_stack.length-_top;
        _thread = Thread.currentThread().getName();
    }
    
    /*-------------------------------------------------------------------*/
    public StackTraceElement getStackTraceElement()
    {
        return _stack[_top];
    }
    
    /*-------------------------------------------------------------------*/
    public String getStack()
    {
        if (_string==null)
        {
            StringBuffer buf= new StringBuffer(512);
            
            for (int i=0;i<_stack.length;i++)
            {
                if (i>_top)
                    buf.append(__lineSeparator);
                buf.append(_stack[i].toString());
            }
            _string=buf.toString();
        }
        
        return _string;
    }
    
    /*-------------------------------------------------------------------*/
    public String getMethod()
    {
        if (_method==null)
            complete();
        return _method;
    }
    
    /*-------------------------------------------------------------------*/
    public int getDepth()
    {
        if (_thread==null)
            complete();
        return _depth;
    }
    
    /*-------------------------------------------------------------------*/
    public String getThread()
    {
        if (_thread==null)
            complete();
        return _thread;
    }
    
    /*-------------------------------------------------------------------*/
    public String getFile()
    {
        if (_file==null)
            complete();
        return _file;
    }
    
    /*-------------------------------------------------------------------*/
    public String getWhere()
    {
        return _where;
    }
    
    /*-------------------------------------------------------------------*/
    public String toString()
    {
        if (_thread==null)
            complete();
        return "["+_thread + "] " + _method+"("+_file+")";
    }
    
    /* ------------------------------------------------------------ */
    /** Get a Frame representing the function one level up in this frame.
     * @return parent frame or null if none
     */
    public Frame getParent()
    {
        if (_top+1>=_stack.length)
            return null;
        return new Frame(_stack,_top+1);
    }    
}




