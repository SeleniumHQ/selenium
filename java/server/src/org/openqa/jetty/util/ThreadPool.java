// ========================================================================
// $Id: ThreadPool.java,v 1.41 2005/08/13 00:01:28 gregwilkins Exp $
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

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

import java.io.Serializable;
/* ------------------------------------------------------------ */
/**
 * A pool of threads.
 * <p>
 * Avoids the expense of thread creation by pooling threads after their run methods exit for reuse.
 * <p>
 * If the maximum pool size is reached, jobs wait for a free thread. 
 * Idle threads timeout and terminate until the minimum number of threads are running.
 * <p>
 * This implementation uses the run(Object) method to place a job on a queue, which is read by the
 * getJob(timeout) method. Derived implementations may specialize getJob(timeout) to obtain jobs
 * from other sources without queing overheads.
 * 
 * @version $Id: ThreadPool.java,v 1.41 2005/08/13 00:01:28 gregwilkins Exp $
 * @author Juancarlo A�ez <juancarlo@modelistica.com>
 * @author Greg Wilkins <gregw@mortbay.com>
 */
public class ThreadPool implements LifeCycle,Serializable
{
    static Log log=LogFactory.getLog(ThreadPool.class);
    static private int __pool=0;
    public static final String __DAEMON="org.openqa.jetty.util.ThreadPool.daemon";
    public static final String __PRIORITY="org.openqa.jetty.util.ThreadPool.priority";
    
    /* ------------------------------------------------------------------- */
    private Pool _pool;
    private Object _join="";
    private transient boolean _started;

    /* ------------------------------------------------------------------- */
    /*
     * Construct
     */
    public ThreadPool()
    {
        String name=this.getClass().getName();
        int ld = name.lastIndexOf('.');
        if (ld>=0)
            name=name.substring(ld+1);
        synchronized(ThreadPool.class)
        {
            name+=__pool++;
        }
        
        _pool=new Pool();
        _pool.setPoolClass(ThreadPool.PoolThread.class);
        setName(name);
    }

    /* ------------------------------------------------------------ */
    /**
     * @return The name of the ThreadPool.
     */
    public String getName()
    {
        return _pool.getPoolName();
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the Pool name. All ThreadPool instances with the same Pool name will share the same Pool
     * instance. Thus they will share the same max, min and available Threads. The field values of
     * the first ThreadPool to call setPoolName with a specific name are used for the named Pool.
     * Subsequent ThreadPools that join the name pool will loose their private values.
     * 
     * @param name Name of the Pool instance this ThreadPool uses or null for an anonymous private
     *                  pool.
     */
    public void setName(String name)
    {
        synchronized(Pool.class)
        {
            if(isStarted())
            {
                if((name==null&&_pool.getPoolName()!=null)||(name!=null&&!name.equals(_pool.getPoolName())))
                    throw new IllegalStateException("started");
                return;
            }
            
            if(name==null)
            {
                if(_pool.getPoolName()!=null)
                {               
                    _pool=new Pool();
                    _pool.setPoolName(getName());
                }
            }
            else if (!name.equals(getName()))
            {
                Pool pool=Pool.getPool(name);
                if(pool==null)
                    _pool.setPoolName(name);
                else
                    _pool=pool;       
            }
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * @deprecated use getName()
     */
    public String getPoolName()
    {
        return getName();
    }

    /* ------------------------------------------------------------ */
    /**
     * @deprecated use setName(String)
     */
    public void setPoolName(String name)
    {
        setName(name);
    }

    /* ------------------------------------------------------------ */
    /**
     * Delegated to the named or anonymous Pool.
     */
    public boolean isDaemon()
    {
        return _pool.getAttribute(__DAEMON)!=null;
    }

    /* ------------------------------------------------------------ */
    /**
     * Delegated to the named or anonymous Pool.
     */
    public void setDaemon(boolean daemon)
    {
        _pool.setAttribute(__DAEMON,daemon?"true":null);
    }

    /* ------------------------------------------------------------ */
    /**
     * Is the pool running jobs.
     * 
     * @return True if start() has been called.
     */
    public boolean isStarted()
    {
        return _started;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the number of threads in the pool. Delegated to the named or anonymous Pool.
     * 
     * @see #getIdleThreads
     * @return Number of threads
     */
    public int getThreads()
    {
        return _pool.size();
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the number of idle threads in the pool. Delegated to the named or anonymous Pool.
     * 
     * @see #getThreads
     * @return Number of threads
     */
    public int getIdleThreads()
    {
        return _pool.available();
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the minimum number of threads. Delegated to the named or anonymous Pool.
     * 
     * @see #setMinThreads
     * @return minimum number of threads.
     */
    public int getMinThreads()
    {
        return _pool.getMinSize();
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the minimum number of threads. Delegated to the named or anonymous Pool.
     * 
     * @see #getMinThreads
     * @param minThreads minimum number of threads
     */
    public void setMinThreads(int minThreads)
    {
        _pool.setMinSize(minThreads);
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the maximum number of threads. Delegated to the named or anonymous Pool.
     * 
     * @see #setMaxThreads
     * @return maximum number of threads.
     */
    public int getMaxThreads()
    {
        return _pool.getMaxSize();
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the maximum number of threads. Delegated to the named or anonymous Pool.
     * 
     * @see #getMaxThreads
     * @param maxThreads maximum number of threads.
     */
    public void setMaxThreads(int maxThreads)
    {
        _pool.setMaxSize(maxThreads);
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the maximum thread idle time. Delegated to the named or anonymous Pool.
     * 
     * @see #setMaxIdleTimeMs
     * @return Max idle time in ms.
     */
    public int getMaxIdleTimeMs()
    {
        return _pool.getMaxIdleTimeMs();
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the maximum thread idle time. Threads that are idle for longer than this period may be
     * stopped. Delegated to the named or anonymous Pool.
     * 
     * @see #getMaxIdleTimeMs
     * @param maxIdleTimeMs Max idle time in ms.
     */
    public void setMaxIdleTimeMs(int maxIdleTimeMs)
    {
        _pool.setMaxIdleTimeMs(maxIdleTimeMs);
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the priority of the pool threads.
     * 
     * @return the priority of the pool threads.
     */
    public int getThreadsPriority()
    {
        int priority=Thread.NORM_PRIORITY;
        Object o=_pool.getAttribute(__PRIORITY);
        if(o!=null)
        {
            priority=((Integer)o).intValue();
        }
        return priority;
    }

    /* ------------------------------------------------------------ */
    /**
     * Set the priority of the pool threads.
     * 
     * @param priority the new thread priority.
     */
    public void setThreadsPriority(int priority)
    {
        _pool.setAttribute(__PRIORITY,new Integer(priority));
    }

    /* ------------------------------------------------------------ */
    /**
     * Set Max Read Time.
     * 
     * @deprecated maxIdleTime is used instead.
     */
    public void setMaxStopTimeMs(int ms)
    {
        log.warn("setMaxStopTimeMs is deprecated. No longer required.");
    }

    /* ------------------------------------------------------------ */
    /*
     * Start the ThreadPool. Construct the minimum number of threads.
     */
    public void start() throws Exception
    {
        _started=true;
        _pool.start();
    }

    /* ------------------------------------------------------------ */
    /**
     * Stop the ThreadPool. New jobs are no longer accepted,idle threads are interrupted and
     * stopJob is called on active threads. The method then waits
     * min(getMaxStopTimeMs(),getMaxIdleTimeMs()), for all jobs to stop, at which time killJob is
     * called.
     */
    public void stop() throws InterruptedException
    {
        _started=false;
        _pool.stop();
        synchronized(_join)
        {
            _join.notifyAll();
        }
    }

    /* ------------------------------------------------------------ */
    public void join()
    {
        while(isStarted()&&_pool!=null)
        {
            synchronized(_join)
            {
                try
                {
                    if(isStarted()&&_pool!=null)
                        _join.wait(30000);
                }
                catch(Exception e)
                {
                    LogSupport.ignore(log,e);
                }
            }
        }
    }

    /* ------------------------------------------------------------ */
    public void shrink() throws InterruptedException
    {
        _pool.shrink();
    }

    /* ------------------------------------------------------------ */
    /**
     * Run job. Give a job to the pool.
     * 
     * @param job If the job is derived from Runnable, the run method is called, otherwise it is
     *                  passed as the argument to the handle method.
     */
    public void run(Object job) throws InterruptedException
    {
        if(job==null)
            return;
        try
        {
            PoolThread thread=(PoolThread)_pool.get(getMaxIdleTimeMs());
            if(thread!=null)
                thread.run(this,job);
            else
            {
                log.warn("No thread for "+job);
                stopJob(null,job);
            }
        }
        catch(InterruptedException e)
        {
            throw e;
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * Handle a job. Called by the allocated thread to handle a job. If the job is a Runnable, it's
     * run method is called. Otherwise this method needs to be specialized by a derived class to
     * provide specific handling.
     * 
     * @param job The job to execute.
     * @exception InterruptedException
     */
    protected void handle(Object job) throws InterruptedException
    {
        if(job!=null&&job instanceof Runnable)
            ((Runnable)job).run();
        else
            log.warn("Invalid job: "+job);
    }

    /* ------------------------------------------------------------ */
    /**
     * Stop a Job. This method is called by the Pool if a job needs to be stopped. The default
     * implementation does nothing and should be extended by a derived thread pool class if special
     * action is required.
     * 
     * @param thread The thread allocated to the job, or null if no thread allocated.
     * @param job The job object passed to run.
     */
    protected void stopJob(Thread thread,Object job)
    {}



    /* ------------------------------------------------------------ */
    /**
     * Pool Thread class. The PoolThread allows the threads job to be retrieved and active status
     * to be indicated.
     */
    public static class PoolThread extends Thread implements Pool.PondLife  // Thread safety reviewed
    {
        Pool _pool;
        ThreadPool _jobPool;
        Object _job;
        ThreadPool _runPool;
        Object _run;
        int _id;
        String _name;

        /* ------------------------------------------------------------ */
        public void enterPool(Pool pool,int id)
        {
            synchronized(this)
            {
                _pool=pool;
                _id=id;
                _name=_pool.getPoolName()+"-"+id;
                this.setName(_name);
                this.setDaemon(pool.getAttribute(__DAEMON)!=null);
                Object o=pool.getAttribute(__PRIORITY);
                if(o!=null)
                {
                    this.setPriority(((Integer)o).intValue());
                }
                this.start();
            }
        }

        /* ------------------------------------------------------------ */
        public int getID()
        {
            return _id;
        }

        /* ------------------------------------------------------------ */
        public void poolClosing()
        {
            synchronized(this)
            {
                _pool=null;
                if(_run==null)
                    notify();
                else
                    interrupt();
            }
        }

        /* ------------------------------------------------------------ */
        public void leavePool()
        {
            synchronized(this)
            {
                _pool=null;
                if(_jobPool==null&&_runPool==null)
                    notify();
                if(_job!=null&&_jobPool!=null)
                {
                    _jobPool.stopJob(this,_job);
                    _job=null;
                    _jobPool=null;
                }
                
                if(_run!=null&&_runPool!=null)
                {
                    _runPool.stopJob(this,_run);
                    _run=null;
                    _runPool=null;
                }
            }
        }

        /* ------------------------------------------------------------ */
        public void run(ThreadPool pool,Object job)
        {
            synchronized(this)
            {
                _jobPool=pool;
                _job=job;
                notify();
            }
        }

        /* ------------------------------------------------------------ */
        /**
         * ThreadPool run. Loop getting jobs and handling them until idle or stopped.
         */
        public void run()
        {
            Object run=null;
            ThreadPool runPool=null;
            while(_pool!=null&&_pool.isStarted())
            {
                try
                {
                    synchronized(this)
                    {
                        // Wait for a job.
                        if(run==null&&_pool!=null&&_pool.isStarted()&&_job==null)
                            wait(_pool.getMaxIdleTimeMs());
                        if(_job!=null)
                        {
                            run=_run=_job;
                            _job=null;
                            runPool=_runPool=_jobPool;
                            _jobPool=null;
                        }
                    }
                    
                    // handle outside of sync
                    if(run!=null && runPool!=null)
                        runPool.handle(run);
                    else if (run==null && _pool!=null)
                        _pool.shrink();
                }
                catch(InterruptedException e)
                {
                    LogSupport.ignore(log,e);
                }
                finally
                {
                    synchronized(this)
                    {
                        boolean got=run!=null;
                        run=_run=null;
                        runPool=_runPool=null;
                        try
                        {
                            if(got&&_pool!=null)
                                _pool.put(this);
                        }
                        catch(InterruptedException e)
                        {
                            LogSupport.ignore(log,e);
                        }
                    }
                }
            }
        }

        public String toString()
        {
            return _name;
        }
    }
}
