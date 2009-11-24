// ========================================================================
// $Id: TestHarness.java,v 1.21 2004/05/09 20:33:34 gregwilkins Exp $
// Copyright 1997-2004 Mort Bay Consulting Pty. Ltd.
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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FilePermission;
import java.net.JarURLConnection;
import java.net.URL;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.jar.JarFile;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/* ------------------------------------------------------------ */
/** Util meta TestHarness.
 * @version $Id: TestHarness.java,v 1.21 2004/05/09 20:33:34 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class TestHarness
{
    private static Log log = LogFactory.getLog(TestHarness.class);

    public static String __userDir =
        System.getProperty("user.dir",".");
    public static URL __userURL=null;
    static
    {
        try{
            File file = new File(__userDir);
            file=new File(file.getCanonicalPath());
            __userURL=file.toURL();
            if (!__userURL.toString().endsWith("/util/"))
            {
                __userURL=new URL(__userURL.toString()+
                                  "test/src/org/mortbay/util/");
                FilePermission perm = (FilePermission)
                    __userURL.openConnection().getPermission();
                __userDir=new File(perm.getName()).getCanonicalPath();
            }
        }
        catch(Exception e)
        {
            log.fatal(e); System.exit(1);
        }
    }    

    

    /* ------------------------------------------------------------ */
    public static void testBlockingQueue()
        throws Exception
    {
        System.err.print("Testing BlockingQueue.");
        System.err.flush();
        final TestCase t = new TestCase("org.openqa.jetty.util.BlockingQueue");

        final BlockingQueue bq=new BlockingQueue(5);
        t.checkEquals(bq.size(),0,"empty");
        bq.put("A");
        t.checkEquals(bq.size(),1,"size");
        t.checkEquals(bq.get(),"A","A");
        t.checkEquals(bq.size(),0,"size");
        bq.put("B");
        bq.put("C");
        bq.put("D");
        t.checkEquals(bq.size(),3,"size");
        t.checkEquals(bq.get(),"B","B");
        t.checkEquals(bq.size(),2,"size");
        bq.put("E");
        t.checkEquals(bq.size(),3,"size");
        t.checkEquals(bq.get(),"C","C");
        t.checkEquals(bq.get(),"D","D");
        t.checkEquals(bq.get(),"E","E");

        new Thread(new Runnable()
                   {
                       public void run(){
                           try{
                               Thread.sleep(1000);
                               System.err.print(".");
                               System.err.flush();
                               bq.put("F");
                           }
                           catch(InterruptedException e){}
                       }
                   }
                   ).start();  
        
        t.checkEquals(bq.get(),"F","F");
        t.checkEquals(bq.get(100),null,"null");
        
        bq.put("G1");
        bq.put("G2");
        bq.put("G3");
        bq.put("G4");
        bq.put("G5");
        
        new Thread(new Runnable()
                   {
                       public void run(){
                           try{
                               Thread.sleep(500);
                               System.err.print(".");
                               System.err.flush();
                               t.checkEquals(bq.get(),"G1","G1");
                           }
                           catch(InterruptedException e){}
                       }
                   }
                   ).start();  
        try{
            bq.put("G6",100);
            t.check(false,"put timeout");
        }
        catch(InterruptedException e)
        {
            t.checkContains(e.toString(),"Timed out","put timeout");
        }
        
        bq.put("G6");
        t.checkEquals(bq.get(),"G2","G2");
        t.checkEquals(bq.get(),"G3","G3");
        t.checkEquals(bq.get(),"G4","G4");
        t.checkEquals(bq.get(),"G5","G5");
        t.checkEquals(bq.get(),"G6","G6");
        t.checkEquals(bq.get(100),null,"that's all folks");
        System.err.println();
    }
    
    /* ------------------------------------------------------------ */
    // moved to JUnit testing
    // public static void testURI()
    
    /* ------------------------------------------------------------ */
    public static void testQuotedStringTokenizer()
    {
        TestCase test = new TestCase("org.openqa.jetty.util.QuotedStringTokenizer");
        try
        {
            QuotedStringTokenizer tok;
            
            tok=new QuotedStringTokenizer
                ("aaa, bbb, 'ccc, \"ddd\", \\'eee\\''",", ");
            test.check(tok.hasMoreTokens(),"hasMoreTokens");
            test.check(tok.hasMoreTokens(),"hasMoreTokens");
            test.checkEquals(tok.nextToken(),"aaa","aaa");
            test.check(tok.hasMoreTokens(),"hasMoreTokens");
            test.checkEquals(tok.nextToken(),"bbb","bbb");
            test.check(tok.hasMoreTokens(),"hasMoreTokens");
            test.checkEquals(tok.nextToken(),"ccc, \"ddd\", 'eee'","quoted");
            test.check(!tok.hasMoreTokens(),"hasMoreTokens");
            test.check(!tok.hasMoreTokens(),"hasMoreTokens");
            
            tok=new QuotedStringTokenizer
                ("aaa, bbb, 'ccc, \"ddd\", \\'eee\\''",", ",false,true);
            test.checkEquals(tok.nextToken(),"aaa","aaa");
            test.checkEquals(tok.nextToken(),"bbb","bbb");
            test.checkEquals(tok.nextToken(),"'ccc, \"ddd\", \\'eee\\''","quoted");
            
            tok=new QuotedStringTokenizer
                ("aa,bb;\"cc\",,'dd',;'',',;','\\''",";,");
            test.checkEquals(tok.nextToken(),"aa","aa");
            test.checkEquals(tok.nextToken(),"bb","bb");
            test.checkEquals(tok.nextToken(),"cc","cc");
            test.checkEquals(tok.nextToken(),"dd","dd");
            test.checkEquals(tok.nextToken(),"","empty");
            test.checkEquals(tok.nextToken(),",;","delimiters");
            test.checkEquals(tok.nextToken(),"'","escaped");
            
            tok=new QuotedStringTokenizer
                ("xx,bb;\"cc\",,'dd',;'',',;','\\''",";,",true);
            test.checkEquals(tok.nextToken(),"xx","xx");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),"bb","bb");
            test.checkEquals(tok.nextToken(),";",";");
            test.checkEquals(tok.nextToken(),"cc","cc");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),"dd","dd");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),";",";");
            test.checkEquals(tok.nextToken(),"","empty");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),",;","delimiters");
            test.checkEquals(tok.nextToken(),",",",");
            test.checkEquals(tok.nextToken(),"'","escaped");
            
            tok=new QuotedStringTokenizer
                ("aaa;bbb,ccc;ddd",";");
            test.checkEquals(tok.nextToken(),"aaa","aaa");
            test.check(tok.hasMoreTokens(),"hasMoreTokens");
            test.checkEquals(tok.nextToken(","),"bbb","bbb");
            test.checkEquals(tok.nextToken(),"ccc;ddd","ccc;ddd");
            
            test.checkEquals(QuotedStringTokenizer.quote("aaa"," "),"aaa","no quote");
            test.checkEquals(QuotedStringTokenizer.quote("a a"," "),"\"a a\"","quote");
            test.checkEquals(QuotedStringTokenizer.quote("a'a"," "),"\"a'a\"","quote");
            test.checkEquals(QuotedStringTokenizer.quote("a,a",","),"\"a,a\"","quote");
            test.checkEquals(QuotedStringTokenizer.quote("a\\a",""),"\"a\\\\a\"","quote");
            
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            test.check(false,e.toString());
        }
    }

    /* ------------------------------------------------------------ */
    /** 
     */
    static final void testLineInput()
    {
        TestCase test = new TestCase("org.openqa.jetty.util.LineInput");
        try
        {
                
            String data=
                "abcd\015\012"+
                "E\012"+
                "\015"+
                "fghi";
            
            ByteArrayInputStream dataStream;
            LineInput in;
                
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            
            test.checkEquals(in.readLine(),"abcd","1 read first line");
            test.checkEquals(in.readLine(),"E","1 read line");
            test.checkEquals(in.readLine(),"","1 blank line");
            test.checkEquals(in.readLine(),"fghi","1 read last line");
            test.checkEquals(in.readLine(),null,"1 read EOF");
            test.checkEquals(in.readLine(),null,"1 read EOF again");

            int bs=7;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"abcd","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fghi","1."+bs+" read last line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            bs=6;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"abcd","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fghi","1."+bs+" read last line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            bs=5;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"abcd","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fghi","1."+bs+" read last line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            bs=4;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"abcd","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fghi","1."+bs+" read last line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            bs=3;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"abc","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"d","1."+bs+" remainder line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fgh","1."+bs+" read last line");
            test.checkEquals(in.readLine(),"i","1."+bs+" remainder line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            bs=2;
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream,bs);
            test.checkEquals(in.readLine(),"ab","1."+bs+" read first line");
            test.checkEquals(in.readLine(),"cd","1."+bs+" remainder line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"E","1."+bs+" read line");
            test.checkEquals(in.readLine(),"","1."+bs+" blank line");
            test.checkEquals(in.readLine(),"fg","1."+bs+" read last line");
            test.checkEquals(in.readLine(),"hi","1."+bs+" remainder line");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF");
            test.checkEquals(in.readLine(),null,"1."+bs+" read EOF again");
            
            
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            char[] b = new char[8];
            test.checkEquals(in.readLine(b,0,8),4,"2 read first line");
            test.checkEquals(in.readLine(b,0,8),1,"2 read line");
            test.checkEquals(in.readLine(b,0,8),0,"2 blank line");
            test.checkEquals(in.readLine(b,0,8),4,"2 read last line");
            test.checkEquals(in.readLine(b,0,8),-1,"2 read EOF");
            test.checkEquals(in.readLine(b,0,8),-1,"2 read EOF again");

            
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            test.checkEquals(in.readLineBuffer().size,4,"3 read first line");
            test.checkEquals(in.readLineBuffer().size,1,"3 read line");
            test.checkEquals(in.readLineBuffer().size,0,"3 blank line");
            test.checkEquals(in.readLineBuffer().size,4,"3 read last line");
            test.checkEquals(in.readLineBuffer(),null,"3 read EOF");
            test.checkEquals(in.readLineBuffer(),null,"3 read EOF again");
            
            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            test.checkEquals(in.readLineBuffer(2).size,2,"4 read first line");
            test.checkEquals(in.readLineBuffer(2).size,2,"4 read rest of first line");
            test.checkEquals(in.readLineBuffer(2).size,1,"4 read line");
            test.checkEquals(in.readLineBuffer(2).size,0,"4 blank line");
            test.checkEquals(in.readLineBuffer(2).size,2,"4 read last line");
            test.checkEquals(in.readLineBuffer(2).size,2,"4 read rest of last line");
            test.checkEquals(in.readLineBuffer(2),null,"4 read EOF");
            test.checkEquals(in.readLineBuffer(2),null,"4 read EOF again");

            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            in.setByteLimit(8);
            test.checkEquals(in.readLine(),"abcd","read first line");
            test.checkEquals(in.readLine(),"E","read line");
            test.checkEquals(in.readLine(),null,"read EOF");
            test.checkEquals(in.readLine(),null,"read EOF again");

            dataStream=new ByteArrayInputStream(data.getBytes());
            in = new LineInput(dataStream);
            test.checkEquals(in.readLine(),"abcd","1 read first line");
            in.setByteLimit(0);
            test.checkEquals(in.skip(4096),0,"bytelimit==0");
            in.setByteLimit(-1);
            test.checkEquals(in.readLine(),"E","1 read line");
            test.checkEquals(in.readLine(),"","1 blank line");
            in.setByteLimit(1);
            test.checkEquals(in.skip(4096),1,"bytelimit==1");
            in.setByteLimit(-1);
            test.checkEquals(in.readLine(),"ghi","1 read last line");
            test.checkEquals(in.readLine(),null,"1 read EOF");
            test.checkEquals(in.readLine(),null,"1 read EOF again");

            String dataCR=
                "abcd\015"+
                "E\015"+
                "\015"+
                "fghi";
            dataStream=new ByteArrayInputStream(dataCR.getBytes());
            in = new LineInput(dataStream,5);
            test.checkEquals(in.readLine(),"abcd","CR read first line");
            test.checkEquals(in.readLine(),"E","CR read line");
            test.checkEquals(in.readLine(),"","CR blank line");
            test.checkEquals(in.readLine(),"fghi","CR read last line");
            test.checkEquals(in.readLine(),null,"CR read EOF");
            test.checkEquals(in.readLine(),null,"CR read EOF again");            
            
            String dataLF=
                "abcd\012"+
                "E\012"+
                "\012"+
                "fghi";
            dataStream=new ByteArrayInputStream(dataLF.getBytes());
            in = new LineInput(dataStream,5);
            test.checkEquals(in.readLine(),"abcd","LF read first line");
            test.checkEquals(in.readLine(),"E","LF read line");
            test.checkEquals(in.readLine(),"","LF blank line");
            test.checkEquals(in.readLine(),"fghi","LF read last line");
            test.checkEquals(in.readLine(),null,"LF read EOF");
            test.checkEquals(in.readLine(),null,"LF read EOF again");

            String dataCRLF=
                "abcd\015\012"+
                "E\015\012"+
                "\015\012"+
                "fghi";
            dataStream=new ByteArrayInputStream(dataCRLF.getBytes());
            in = new LineInput(dataStream,5);
            test.checkEquals(in.readLine(),"abcd","CRLF read first line");
            test.checkEquals(in.readLine(),"E","CRLF read line");
            test.checkEquals(in.readLine(),"","CRLF blank line");
            test.checkEquals(in.readLine(),"fghi","CRLF read last line");
            test.checkEquals(in.readLine(),null,"CRLF read EOF");
            test.checkEquals(in.readLine(),null,"CRLF read EOF again");
     

            String dataEOF=
                "abcd\015\012"+
                "efgh\015\012"+
                "ijkl\015\012";
            dataStream=new ByteArrayInputStream(dataEOF.getBytes());
            in = new LineInput(dataStream,14);
            test.checkEquals(in.readLine(),"abcd","EOF read first line");
            in.setByteLimit(6);
            test.checkEquals(in.readLine(),"efgh","EOF read second line");
            test.checkEquals(in.readLine(),null,"read EOF");
            in.setByteLimit(-1);
            test.checkEquals(in.readLine(),"ijkl","EOF read second line");
        
            String dataEOL=
                "abcdefgh\015\012"+
                "ijklmnop\015\012"+
                "12345678\015\012"+
                "87654321\015\012";
            
            dataStream=new PauseInputStream(dataEOL.getBytes(),11);
            in = new LineInput(dataStream,100);
            test.checkEquals(in.readLine(),"abcdefgh","EOL read 1");
            test.checkEquals(in.readLine(),"ijklmnop","EOL read 2");
            test.checkEquals(in.readLine(),"12345678","EOL read 3");
            test.checkEquals(in.readLine(),"87654321","EOL read 4");

            dataStream=new PauseInputStream(dataEOL.getBytes(),100);
            in = new LineInput(dataStream,11);
            test.checkEquals(in.readLine(),"abcdefgh","EOL read 1");
            test.checkEquals(in.readLine(),"ijklmnop","EOL read 2");
            test.checkEquals(in.readLine(),"12345678","EOL read 3");
            test.checkEquals(in.readLine(),"87654321","EOL read 4");
            
            dataStream=new PauseInputStream(dataEOL.getBytes(),50);
            in = new LineInput(dataStream,19);
            test.checkEquals(in.readLine(),"abcdefgh","EOL read 1");
            test.checkEquals(in.readLine(),"ijklmnop","EOL read 2");
            in.setByteLimit(5);
            test.checkEquals(in.readLine(),"12345","EOL read 3 limited");
            in.setByteLimit(-1);
            test.checkEquals(in.readLine(),"678","EOL read 4 unlimited");
            test.checkEquals(in.readLine(),"87654321","EOL read 5");

            for (int s=20;s>1;s--)
            {
                dataStream=new PauseInputStream(dataEOL.getBytes(),s);
                in = new LineInput(dataStream,100);
                test.checkEquals(in.readLine(),"abcdefgh",s+" read 1");
                test.checkEquals(in.readLine(),"ijklmnop",s+" read 2");
                test.checkEquals(in.readLine(),"12345678",s+" read 3");
                test.checkEquals(in.readLine(),"87654321",s+" read 4");
            }

        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            test.check(false,e.toString());
        }
    }

    /* ------------------------------------------------------------ */
    private static class PauseInputStream extends ByteArrayInputStream
    {
        int size;
        int c;
        
        PauseInputStream(byte[] data,int size)
        {
            super(data);
            this.size=size;
            c=size;
        }
        
        public synchronized int read()
        {
            c--;
            if(c==0)
                c=size;
            return super.read();
        }
        
        /* ------------------------------------------------------------ */
        public synchronized int read(byte b[], int off, int len)
        {
            if (len>c)
                len=c;
            if(c==0)
            {
                log.debug("read(b,o,l)==0");
                c=size;
                return 0;
            }
            
            len=super.read(b,off,len);
            if (len>=0)
                c-=len;
            return len;
        }

        /* ------------------------------------------------------------ */
        public int available()
        {   
            if(c==0)
            {
                log.debug("available==0");
                c=size;
                return 0;
            }
            return c;
        }
    }
    
    /* ------------------------------------------------------------ */
    static class TestThreadPool extends ThreadPool
    {
        /* -------------------------------------------------------- */
        int _calls=0;
        int _waiting=0;
        String _lock="lock";
        
        /* -------------------------------------------------------- */
        TestThreadPool()
            throws Exception
        {
            setName("TestPool");
            setMinThreads(2);
            setMaxThreads(4);
            setMaxIdleTimeMs(500);
        }
        
        /* -------------------------------------------------------- */
        protected void handle(Object job)
            throws InterruptedException
        {
            synchronized(_lock)
            {
                _calls++;
                _waiting++;
            }
            synchronized(job)
            {
                if(TestHarness.log.isDebugEnabled())TestHarness.log.debug("JOB wait: "+job);
                job.wait();
                if(TestHarness.log.isDebugEnabled())TestHarness.log.debug("JOB wake: "+job);
            }
            synchronized(_lock)
            {
                _waiting--;
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    static void testSingletonList()
    {
        TestCase t = new TestCase("org.openqa.jetty.util.SingletonList");
        
        try
        {
            Object o="X";
            SingletonList sl = SingletonList.newSingletonList(o);
            t.checkEquals(sl.size(),1,"SingletonList.size()");
            t.checkEquals(sl.get(0),o,"SingletonList.get(0)");
            Iterator i=sl.iterator();
            ListIterator li=sl.listIterator();
            t.check(i.hasNext(),"SingletonList.iterator().hasNext()");
            t.check(li.hasNext(),"SingletonList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"SingletonList.listIterator().hasPrevious()");

            t.checkEquals(i.next(),o,"SingletonList.iterator().next()");
            t.check(!i.hasNext(),"SingletonList.iterator().hasNext()");
            t.check(li.hasNext(),"SingletonList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"SingletonList.listIterator().hasPrevious()");
            
            t.checkEquals(li.next(),o,"SingletonList.listIterator().next()");
            t.check(!i.hasNext(),"SingletonList.iterator().hasNext()");
            t.check(!li.hasNext(),"SingletonList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"SingletonList.listIterator().hasPrevious()");
            
            t.checkEquals(li.previous(),o,"SingletonList.listIterator().previous()");
            t.check(!i.hasNext(),"SingletonList.iterator().hasNext()");
            t.check(li.hasNext(),"SingletonList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"SingletonList.listIterator().hasPrevious()");
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }
    
    /* ------------------------------------------------------------ */
    static void testLazyList()
    {
        TestCase t = new TestCase("org.openqa.jetty.util.LazyList");
        
        try
        {
            Object list = null;
            Object o1="X1";
            Object o2="X2";

            // empty list
            List empty = LazyList.getList(list);
            t.checkEquals(empty.size(),0,"empty LazyList");

            // singleton list
            list=LazyList.add(list,o1);
            
            t.checkEquals(LazyList.size(list),1,"singleton LazyList.size()");
            t.checkEquals(LazyList.get(list,0),o1,"singleton LazyList.get(0)");
            Iterator i=LazyList.iterator(list);
            ListIterator li=LazyList.listIterator(list);
            t.check(i.hasNext(),"singleton LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"singleton LazyList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"singleton LazyList.listIterator().hasPrevious()");

            t.checkEquals(i.next(),o1,"singleton LazyList.iterator().next()");
            t.check(!i.hasNext(),"singleton LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"singleton LazyList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"singleton LazyList.listIterator().hasPrevious()");
            
            t.checkEquals(li.next(),o1,"singleton LazyList.listIterator().next()");
            t.check(!i.hasNext(),"singleton LazyList.iterator().hasNext()");
            t.check(!li.hasNext(),"singleton LazyList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"singleton LazyList.listIterator().hasPrevious()");
            
            t.checkEquals(li.previous(),o1,"singleton LazyList.listIterator().previous()");
            t.check(!i.hasNext(),"singleton LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"singleton LazyList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"singleton LazyList.listIterator().hasPrevious()");


            // normal list
            list=LazyList.add(list,o2);
            
            t.checkEquals(LazyList.size(list),2,"normal LazyList.size(list,)");
            t.checkEquals(LazyList.get(list,0),o1,"normal LazyList.get(list,0)");
            t.checkEquals(LazyList.get(list,1),o2,"normal LazyList.get(list,0)");
            i=LazyList.iterator(list);
            li=LazyList.listIterator(list);
            t.check(i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");

            t.checkEquals(i.next(),o1,"normal LazyList.iterator().next()");
            t.check(i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(!li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");
            
            t.checkEquals(li.next(),o1,"normal LazyList.listIterator().next()");
            t.check(i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");

            t.checkEquals(i.next(),o2,"normal LazyList.iterator().next()");
            t.check(!i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");
            
            t.checkEquals(li.next(),o2,"normal LazyList.listIterator().next()");
            t.check(!i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(!li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");
            
            t.checkEquals(li.previous(),o2,"normal LazyList.listIterator().previous()");
            t.check(!i.hasNext(),"normal LazyList.iterator().hasNext()");
            t.check(li.hasNext(),"normal LazyList.listIterator().hasNext()");
            t.check(li.hasPrevious(),"normal LazyList.listIterator().hasPrevious()");

            
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }
    
    /* ------------------------------------------------------------ */
    static void testStringMap()
    {
        TestCase t = new TestCase("org.openqa.jetty.util.StringMap");
        
        try
        {
            StringMap map = new StringMap();

            map.put("K1","V1");
            t.checkEquals(map.get("K1"),"V1","1V1");
            map.put("K2","V2");
            t.checkEquals(map.get("K1"),"V1","2V1");
            t.checkEquals(map.get("K2"),"V2","2V2");
            map.put("0","V0");
            t.checkEquals(map.get("0"),"V0","3V0");
            t.checkEquals(map.get("K1"),"V1","3V1");
            t.checkEquals(map.get("K2"),"V2","3V2");
            
            map.put("K03","V3");
            t.checkEquals(map.get("0"),"V0","4V0");
            t.checkEquals(map.get("K1"),"V1","4V1");
            t.checkEquals(map.get("K2"),"V2","4V2");
            t.checkEquals(map.get("K03"),"V3","4V3");
            t.checkEquals(map.get("???"),null,"4null");
            
            map.put("ABCD","V4");
            map.put("ABCDEFGH","V5");
            map.put("ABXX","V6");
            t.checkEquals(map.get("AB"),null,"nullAB");
            map.put("AB","V7");
            map.put("ABCDEF","V8");
            map.put("ABCDXXXX","V9");
            
            t.checkEquals(map.get("ABCD"),"V4","V4");
            t.checkEquals(map.get("ABCDEFGH"),"V5","V5");
            t.checkEquals(map.get("ABXX"),"V6","V6");
            t.checkEquals(map.get("AB"),"V7","V7");
            t.checkEquals(map.get("ABCDEF"),"V8","V8");
            t.checkEquals(map.get("ABCDXXXX"),"V9","V9");
            t.checkEquals(map.get("ABC"),null,"null1");
            t.checkEquals(map.get("AB?"),null,"null2");
            t.checkEquals(map.get("ABCDE"),null,"null3");
            t.checkEquals(map.get("ABCD?"),null,"null4");
            t.checkEquals(map.get("ABCDEFG"),null,"null5");
            t.checkEquals(map.get("ABCDEF?"),null,"null6");
            t.checkEquals(map.get("ABCDEFGHI"),null,"null7");
            t.checkEquals(map.get("ABCDEFGH?"),null,"null8");
            
            
            t.checkEquals(map.getEntry("x0x",1,1).getValue(),"V0","5V0");
            t.checkEquals(map.getEntry("xK1x",1,2).getValue(),"V1","5V1");
            t.checkEquals(map.getEntry("xK2x",1,2).getValue(),"V2","5V2");
            t.checkEquals(map.getEntry("xK03x",1,3).getValue(),"V3","5V3");
            t.checkEquals(map.getEntry("???",1,1),null,"5null");
            
            t.checkEquals(map.getEntry("xKx",1,1),null,"5K");
            
            t.checkEquals(map.getEntry("x0x".toCharArray(),1,1).getValue(),"V0","6V0");
            t.checkEquals(map.getEntry("xK1x".toCharArray(),1,2).getValue(),"V1","6V1");
            t.checkEquals(map.getEntry("xK2x".toCharArray(),1,2).getValue(),"V2","6V2");
            t.checkEquals(map.getEntry("xK03x".toCharArray(),1,3).getValue(),"V3","6V3");
            t.checkEquals(map.getEntry("???".toCharArray(),1,1),null,"6null");
            
            t.checkEquals(map.getEntry("x0x".getBytes(),1,1).getValue(),"V0","7V0");
            t.checkEquals(map.getEntry("xK1x".getBytes(),1,2).getValue(),"V1","7V1");
            t.checkEquals(map.getEntry("xK2x".getBytes(),1,2).getValue(),"V2","7V2");
            t.checkEquals(map.getEntry("xK03x".getBytes(),1,3).getValue(),"V3","7V3");
            t.checkEquals(map.getEntry("???".getBytes(),1,1),null,"7null");
            
            t.checkEquals(map.size(),10,"8size");
            t.checkEquals(map.get("0"),"V0","8V0");
            t.checkEquals(map.get("k1"),null,"8V1");
            t.checkEquals(map.get("k2"),null,"8V2");
            t.checkEquals(map.get("k03"),null,"8V3");
            t.checkEquals(map.get("???"),null,"8null");

            map.clear();
            map.setIgnoreCase(true);
            map.put("K1","V1");
            map.put("K2","V2");
            map.put("0","V0");
            map.put("K03","V3");
            map.put("ABCD","V4");
            map.put("ABCDEFGH","V5");
            map.put("ABXX","V6");
            map.put("AB","V7");
            map.put("ABCDEF","V8");
            map.put("ABCDXXXX","V9");
            
            t.checkEquals(map.size(),10,"9size");
            t.checkEquals(map.get("0"),"V0","9V0");
            t.checkEquals(map.get("k1"),"V1","9V1");
            t.checkEquals(map.get("k2"),"V2","9V2");
            t.checkEquals(map.get("k03"),"V3","9V3");
            t.checkEquals(map.get("???"),null,"9null");

            map.put(null,"Vn");
            t.checkEquals(map.size(),11,"10size");
            t.checkEquals(map.get("0"),"V0","10V0");
            t.checkEquals(map.get("k1"),"V1","10V1");
            t.checkEquals(map.get("k2"),"V2","10V2");
            t.checkEquals(map.get("k03"),"V3","10V3");
            t.checkEquals(map.get("???"),null,"10null");
            t.checkEquals(map.get(null),"Vn","10Vn");

            map.remove("XXX");
            t.checkEquals(map.size(),11,"11size5");
            map.remove("k2");
            t.checkEquals(map.size(),10,"11size4");
            map.remove(null);
            t.checkEquals(map.size(),9,"11size3");
            
            map.remove("AB");
            map.remove("ABCDXXXX");
            map.remove("ABCDEF");
            map.remove("ABCDEFGH");
            t.checkEquals(map.size(),5,"12size");
            
            
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }    
    
    /* ------------------------------------------------------------ */
    static void testMultiMap()
    {
        TestCase t = new TestCase("org.openqa.jetty.util.MultiMap");
        
        try
        {
            MultiMap mm = new MultiMap();

            mm.put("K1","V1");
            t.checkEquals(mm.get("K1"),"V1","as Map");
            t.checkEquals(mm.getValues("K1").get(0),"V1","as List");
            mm.add("K1","V2");
            t.checkEquals(mm.getValues("K1").get(0),"V1","add List");
            t.checkEquals(mm.getValues("K1").get(1),"V2","add List");

            mm.put("K2",new Integer(2));
            t.checkEquals(mm.getValues("K2").get(0),new Integer(2),"as Object");

            MultiMap m2=(MultiMap)mm.clone();
            m2.add("K1","V3");
            
            t.checkEquals(mm.getValues("K1").size(),2,"unchanged List");
            t.checkEquals(mm.getValues("K1").get(0),"V1","unchanged List");
            t.checkEquals(mm.getValues("K1").get(1),"V2","unchanged List");
            t.checkEquals(m2.getValues("K1").get(0),"V1","clone List");
            t.checkEquals(m2.getValues("K1").get(1),"V2","clone List");
            t.checkEquals(m2.getValues("K1").get(2),"V3","clone List");
            t.checkEquals(m2.getValue("K1",0),"V1","clone List");
            t.checkEquals(m2.getValue("K1",1),"V2","clone List");
            t.checkEquals(m2.getValue("K1",2),"V3","clone List");       
            
            t.check(mm.removeValue("K1","V2"),"delete");
            t.check(mm.get("K1")!=null,"!deleted");
            t.check(mm.removeValue("K1","V1"),"delete");
            t.check(mm.get("K1")==null,"deleted");
            t.check(!mm.removeValue("K1","V0"),"!deleted");
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }


    /* ------------------------------------------------------------ */
    public static void testJarURL()
    {
        TestCase t = new TestCase("org.openqa.jetty.util.Zip");
        try
        {
            // Test jar update
            File tmpJar = File.createTempFile("test",".jar");
            tmpJar.deleteOnExit();
            
            URL jar1 = new URL(__userURL+"TestData/test.zip");
            System.err.println(jar1);
            IO.copy(jar1.openStream(),new FileOutputStream(tmpJar));
            URL url1 = new URL("jar:"+tmpJar.toURL()+"!/");
            JarURLConnection jc1 = (JarURLConnection)url1.openConnection();
            JarFile j1=jc1.getJarFile();
            System.err.println("T1:");
            Enumeration e = j1.entries();
            while(e.hasMoreElements())
                System.err.println(e.nextElement());
            
            
            URL jar2 = new URL(__userURL+"TestData/alt.zip");
            System.err.println(jar2);
            IO.copy(jar2.openStream(),new FileOutputStream(tmpJar));
            URL url2 = new URL("jar:"+tmpJar.toURL()+"!/");
            JarURLConnection jc2 = (JarURLConnection)url2.openConnection();
            JarFile j2=jc2.getJarFile();
            System.err.println("T2:");
            e = j2.entries();
            while(e.hasMoreElements())
                System.err.println(e.nextElement());
            
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }
    
    /* ------------------------------------------------------------ */
    /** main.
     */
    public static void main(String[] args)
    {
        try
        {
            testStringMap();
            testSingletonList();
            testLazyList();
            testMultiMap();
            testQuotedStringTokenizer();            
            testBlockingQueue();
            testLineInput();
        }
        catch(Throwable th)
        {
            log.warn(LogSupport.EXCEPTION,th);
            TestCase t = new TestCase("org.openqa.jetty.util.TestHarness");
            t.check(false,th.toString());
        }
        finally
        {
            TestCase.report();
        }
    }
}
