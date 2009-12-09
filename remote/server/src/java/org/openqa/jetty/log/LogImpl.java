// ========================================================================
// Copyright (c) 1997 MortBay Consulting, Sydney
// $Id: LogImpl.java,v 1.6 2005/08/13 00:01:27 gregwilkins Exp $
// ========================================================================

package org.openqa.jetty.log;
import java.util.ArrayList;
import java.util.StringTokenizer;

import org.openqa.jetty.util.Loader;

/*-----------------------------------------------------------------------*/
/** A Commons Log implementation for Jetty logs.
 * 
 * The log can contain multiple log syncs.
 * The following system properties can be used to control the configuration:<pre>
 *   DEBUG - if set debugging is output is enabled.
 *   DEBUG_PATTERNS - A list of substring patterns used to match against log information for
 *                    fine grained control of debug logging.
 *   DEBUG_VERBOSE - If set to a positive integer, trace and info are enabled.
 *                   If set to zero, then info is enabled.
 *   LOG_SINKS - List of class names used to instantiate the log sinks.
 * </pre> 
 * This logger can be configured with the org.openqa.jetty.log.Factory
 * 
 * @see org.openqa.jetty.log.LogFactory
 */
public class LogImpl implements org.apache.commons.logging.Log
{
    /*-------------------------------------------------------------------*/
    public final static String DEBUG= "DEBUG  ";
    public final static String INFO=  "INFO   ";
    public final static String TRACE= "TRACE  ";
    public final static String FAIL=  "FAIL!! ";
    public final static String WARN=  "WARN!! ";
    public final static String ERROR= "ERROR! ";

    /*-------------------------------------------------------------------*/
    boolean _debugOn=false;
    private ArrayList _debugPatterns=null;
    private boolean _initialized = false;
    private String _patterns=null;

    
    /*-------------------------------------------------------------------*/
    public LogSink[] _sinks = null;
    private boolean _suppressWarnings=false;
    private int _verbose=0;
    
    /*-------------------------------------------------------------------*/
    /** Construct the shared instance of Log that decodes the
     * options setup in the environments properties.
     */
    public LogImpl()
    {
        try{
            _debugOn= System.getProperty("DEBUG") != null;
            setDebugPatterns(System.getProperty("DEBUG_PATTERNS"));
            setVerbose(Integer.getInteger("DEBUG_VERBOSE",0).intValue());
        }
        catch (Exception e)
        {
            System.err.println("Exception from getProperty!\n"+
                               "Probably running in applet\n"+
                               "Use Code.initParamsFromApplet or Code.setOption to control debug output.");
        }   
    }
    
    /* ------------------------------------------------------------ */
    /** Add a Log Sink.
     * @param logSink 
     */
    public synchronized void add(LogSink logSink)
    	throws Exception	
    {
        logSink.setLogImpl(this);
        if (!logSink.isStarted())
            logSink.start();
        
        if (_sinks==null)
        {
            _sinks=new LogSink[1];
            _sinks[0]=logSink;
        }
        else
        {
            boolean slotFree = false;
            for( int i=_sinks.length; i-->0; )
            {
                if( _sinks[i] == null )
                {
                    slotFree = true;
                    _sinks[i] = logSink;
                    break;
                }
            }

            if( !slotFree )
            {
                LogSink[] ns = new LogSink[_sinks.length+1];
                for (int i=_sinks.length;i-->0;)
                    ns[i]=_sinks[i];
                ns[_sinks.length]=logSink;
                _sinks=ns;
            }
        }
        _initialized = true;

        info("added "+logSink);
    }


    /* ------------------------------------------------------------ */
    /** Add a Log Sink.
     * @param logSinkClass The logsink classname or null for the default. 
     */
    public synchronized void add(String logSinkClass)
    {
        try
        {
            if (logSinkClass==null || logSinkClass.length()==0)
                logSinkClass="org.openqa.jetty.log.OutputStreamLogSink";
            Class sinkClass =  Loader.loadClass(this.getClass(),logSinkClass);
            LogSink sink=(LogSink)sinkClass.newInstance();
            add(sink);
        }
        catch(Exception e)
        {
            message(WARN,e,2);
            throw new IllegalArgumentException(e.toString());
        }
        
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#debug(java.lang.Object)
     */
    public void debug(Object m)
    {
        if (_debugOn)
        {
            Frame frame = new Frame(1,true);
            if (isDebugOnFor(frame))
            {
                frame.complete();
                message(DEBUG,m,frame);
            }
        }
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#debug(java.lang.Object, java.lang.Throwable)
     */
    public void debug(Object m, Throwable ex)
    {
        if (_debugOn)
        {
            Frame frame = new Frame(1,true);
            if (isDebugOnFor(frame))
            {
                frame.complete();
                message(DEBUG,new Object[]{m,ex},frame);
            }
        }
    }
    
    
    /*-------------------------------------------------------------------*/
    /** Default initialization is used the first time we have to log
     *	unless a sink has been added with add(). _needInit allows us to
     *	distinguish between initial state and disabled state.
     */
    private synchronized void defaultInit() 
    {
        if (!_initialized)
        {
            _initialized = true;
            String sinkClasses = System.getProperty("LOG_SINKS","org.openqa.jetty.log.OutputStreamLogSink");
            StringTokenizer sinkTokens = new StringTokenizer(sinkClasses, ";, ");
                    
            LogSink sink= null;
            while (sinkTokens.hasMoreTokens())
            {
                String sinkClassName = sinkTokens.nextToken();
                    	
                try
                {
                    Class sinkClass = Loader.loadClass(this.getClass(),sinkClassName);
                    if (org.openqa.jetty.log.LogSink.class.isAssignableFrom(sinkClass)) {
                        sink = (LogSink)sinkClass.newInstance();
                        sink.start();
                        add(sink);
                    }
                    else
                        // Can't use Code.fail here, that's what we're setting up
                        System.err.println(sinkClass+" is not a org.openqa.jetty.log.LogSink");
                }
                catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    /** 
     */
    public synchronized void deleteStoppedLogSinks()
    {
        if (_sinks!=null)
        {
            for (int s=_sinks.length;s-->0;)
            {
                if (_sinks[s]==null)
                    continue;
                if (!_sinks[s].isStarted())
                    _sinks[s]=null;
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    /** No logging.
     * All log sinks are stopped and removed.
     */
    public synchronized void reset()
    {
        info("reset");
        if (_sinks!=null) {
            for (int s=_sinks.length;s-->0;)
            {
                try{
                    if (_sinks[s]!=null)
                        _sinks[s].stop();
                    _sinks[s]=null;
                }
                catch(InterruptedException e)
                {
                    if (getDebug() && getVerbose()>0)
                        message("WARN",e);
                }
            }
            _sinks=null;
        }
        _initialized=true;
    }

    
    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#error(java.lang.Object)
     */
    public void error(Object arg0)
    {
        message(ERROR,arg0,new Frame(1));
        
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#error(java.lang.Object, java.lang.Throwable)
     */
    public void error(Object arg0, Throwable arg1)
    {
        message(ERROR,new Object[]{arg0,arg1},new Frame(1));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#fatal(java.lang.Object)
     */
    public void fatal(Object arg0)
    {
        message(FAIL,arg0,new Frame(1));
        
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#fatal(java.lang.Object, java.lang.Throwable)
     */
    public void fatal(Object arg0, Throwable arg1)
    {
        message(FAIL,new Object[]{arg0,arg1},new Frame(1));
    }
    
    
    /* ------------------------------------------------------------ */
    /** Get the debug status.
     * @return the debug status
     */
    public boolean getDebug()
    {
        return _debugOn;
    }

    /* ------------------------------------------------------------ */
    /** Get the debug patterns.
     * @return Coma separated list of debug patterns
     */
    public String getDebugPatterns()
    {
        return _patterns;
    }
    
    /* ------------------------------------------------------------ */
    public LogSink[] getLogSinks()
    {
        return _sinks;
    }

    /* ------------------------------------------------------------ */
    /** Get the warnings suppression status.
     * @return the warnings suppression status
     */
    public boolean getSuppressWarnings()
    {
        return _suppressWarnings;
    }

    /* ------------------------------------------------------------ */
    /** Get the verbosity level.
     * @return the verbosity level
     */
    public int getVerbose()
    {
        return _verbose;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#info(java.lang.Object)
     */
    public void info(Object arg0)
    {
        if (isInfoEnabled())
            message(INFO,arg0,new Frame(1));
        
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#info(java.lang.Object, java.lang.Throwable)
     */
    public void info(Object arg0, Throwable arg1)
    {
        if (isInfoEnabled())
            message(INFO,new Object[]{arg0,arg1},new Frame(1));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isDebugEnabled()
     */
    public boolean isDebugEnabled()
    {
        return _debugOn;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isErrorEnabled()
     */
    public boolean isErrorEnabled()
    {
        return !_suppressWarnings;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isFatalEnabled()
     */
    public boolean isFatalEnabled()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isInfoEnabled()
     */
    public boolean isInfoEnabled()
    {
        return _verbose>=0;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isTraceEnabled()
     */
    public boolean isTraceEnabled()
    {
        return _verbose>0;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#isWarnEnabled()
     */
    public boolean isWarnEnabled()
    {
        return !_suppressWarnings;
    }
    
    /*-------------------------------------------------------------------*/
    public void message(String tag,
                        Object msg,
                        Frame frame)
    {
        long time = System.currentTimeMillis();
        message(tag,msg,frame,time);
    }
    
    /* ------------------------------------------------------------ */
    /** Log a message.
     * @param tag Tag for type of log
     * @param msg The message
     * @param frame The frame that generated the message.
     * @param time The time stamp of the message.
     */
    public synchronized void message(String tag,
                                     Object msg,
                                     Frame frame,
                                     long time)
    {
        if (!_initialized)
            defaultInit();
        
        boolean logged=false;
        if (_sinks!=null)
        {
            for (int s=_sinks.length;s-->0;)
            {
                if (_sinks[s]==null)
                    continue;
            
                if (_sinks[s].isStarted())
                {
                    logged=true;
                    _sinks[s].log(tag,msg,frame,time);
                }
            }		
        }

        if (!logged)
            System.err.println(time+": "+tag+":"+msg+" @ "+frame);
    }
    
    /* ------------------------------------------------------------ */
    /** Log a message.
     * @param tag Tag for type of log
     * @param msg The message
     */
    public synchronized void message(String tag,
                                     Object msg)
    {
        message(tag,msg,new Frame(1),System.currentTimeMillis());
    }
    
    /* ------------------------------------------------------------ */
    /** Log a message.
     * @param tag Tag for type of log
     * @param msg The message
     */
    public synchronized void message(String tag,
                                     Object msg,
                                     int depth)
    {
        message(tag,msg,new Frame(depth),System.currentTimeMillis());
    }

    /* ------------------------------------------------------------ */
    /** Set if debugging is on or off.
     * @param debug 
     */
    public synchronized void setDebug(boolean debug)
    {
        boolean oldDebug=_debugOn;
        if (_debugOn && !debug)
            this.message(DEBUG,"DEBUG OFF");
        _debugOn=debug;
        if (!oldDebug && debug)
            this.message(DEBUG,"DEBUG ON");
    }
    
    /* ------------------------------------------------------------ */
    /** Set debug patterns.
     * @param patterns comma separated string of patterns 
     */
    public void setDebugPatterns(String patterns)
    {
        _patterns=patterns;
        if (patterns!=null && patterns.length()>0)
        {
            _debugPatterns = new ArrayList();

            StringTokenizer tok = new StringTokenizer(patterns,", \t");
            while (tok.hasMoreTokens())
            {
                String pattern = tok.nextToken();
                _debugPatterns.add(pattern);
            }
        }
        else
            _debugPatterns = null;
    }

    /* ------------------------------------------------------------ */
    /** Set warning suppression.
     * @param warnings Warnings suppress if this is true and debug is false
     */
    public void setSuppressWarnings(boolean warnings)
    {
        _suppressWarnings=warnings;
    }

    
    /* ------------------------------------------------------------ */
    /** Set verbosity level.
     * @param verbose 
     */
    public void setVerbose(int verbose)
    {
        _verbose=verbose;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#trace(java.lang.Object)
     */
    public void trace(Object arg0)
    {
        if (isTraceEnabled())
            message(TRACE,arg0,new Frame(1));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#trace(java.lang.Object, java.lang.Throwable)
     */
    public void trace(Object arg0, Throwable arg1)
    {
        if (isTraceEnabled())
            message(TRACE,new Object[]{arg0,arg1},new Frame(1));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#warn(java.lang.Object)
     */
    public void warn(Object arg0)
    {
        if (!_suppressWarnings)
            message(WARN,arg0,new Frame(1));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.Log#warn(java.lang.Object, java.lang.Throwable)
     */
    public void warn(Object arg0, Throwable arg1)
    {
        if (!_suppressWarnings)
            message(WARN,new Object[]{arg0,arg1},new Frame(1));
    }

    /*-------------------------------------------------------------------*/
    private boolean isDebugOnFor(Frame frame)
    {
        if (_debugOn)
        {
            if (_debugPatterns==null)
                return true;
            else
            {
                for (int i = _debugPatterns.size();--i>=0;)
                {
                    if(frame.getWhere().indexOf((String)_debugPatterns
                                                .get(i))>=0)
                        return true;
                }
            }
        }
        return false;
    }
    
}

