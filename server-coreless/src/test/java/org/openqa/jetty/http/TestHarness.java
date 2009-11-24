// ========================================================================
// $Id: TestHarness.java,v 1.23 2005/04/07 09:15:41 gregwilkins Exp $
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

package org.openqa.jetty.http;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FilePermission;
import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.TestCase;

/* ------------------------------------------------------------ */
/** Top level test harness.
 *
 * @version $Id: TestHarness.java,v 1.23 2005/04/07 09:15:41 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class TestHarness
{
    private static Log log = LogFactory.getLog(TestHarness.class);

    public final static String CRLF = "\015\012";
    public static String __userDir =
        System.getProperty("user.dir",".");
    public static URL __userURL=null;
    static
    {
        try{
            File file = new File(__userDir);
            __userURL=file.toURL();
            if (!__userURL.toString().endsWith("/http/"))
            {
                __userURL=new URL(__userURL.toString()+
                                  "test/src/org/mortbay/http/");
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
    
    /* -------------------------------------------------------------- */
    public static void chunkInTest()
        throws Exception
    {
        TestCase test = new TestCase("org.openqa.jetty.http.HttpInputStream");

        byte[] buf = new byte[18];
        
        try{
            FileInputStream fin=
                new FileInputStream(__userDir+File.separator+
                                    "TestData"+File.separator+
                                    "chunkIn.bin");
            HttpInputStream cin = new HttpInputStream(fin);
            cin.setContentLength(10);
            test.checkEquals(cin.read(buf),10,"content length limited");
            test.checkEquals(cin.read(buf),-1,"content length EOF");
            
            fin= new FileInputStream(__userDir+File.separator+
                                    "TestData"+File.separator+
                                    "chunkIn.bin");
            cin = new HttpInputStream(fin);
            cin.setChunking();
            test.checkEquals(cin.read(),'a',"Read 1st char");
            test.checkEquals(cin.read(),'b',"Read cont char");
            test.checkEquals(cin.read(),'c',"Read next chunk char");

            test.checkEquals(cin.read(buf),17,"Read array chunk limited");
            test.checkEquals(new String(buf,0,17),
                             "defghijklmnopqrst","Read array chunk");
            test.checkEquals(cin.read(buf,1,10),6,"Read Offset limited");
            test.checkEquals(new String(buf,0,17),"duvwxyzklmnopqrst",
                             "Read offset");
            test.checkEquals(cin.read(buf),6,"Read CRLF");
            test.checkEquals(new String(buf,0,6),
                             "12"+CRLF+"34",
                             "Read CRLF");
            test.checkEquals(cin.read(buf),12,"Read to EOF");
            test.checkEquals(new String(buf,0,12),
                             "567890abcdef","Read to EOF");
            test.checkEquals(cin.read(buf),-1,"Read EOF");
            test.checkEquals(cin.read(buf),-1,"Read EOF again");

            // Read some more after a reset
            cin.resetStream();
            cin.setChunking();
            test.checkEquals(cin.read(),'a',"2 Read 1st char");
            test.checkEquals(cin.read(),'b',"2 Read cont char");
            test.checkEquals(cin.read(),'c',"2 Read next chunk char");

            test.checkEquals(cin.read(buf),17,"2 Read array chunk limited");
            test.checkEquals(new String(buf,0,17),
                             "defghijklmnopqrst","2 Read array chunk");
            test.checkEquals(cin.read(buf,1,10),6,"2 Read Offset limited");
            test.checkEquals(new String(buf,0,17),"duvwxyzklmnopqrst",
                             "2 Read offset");
            test.checkEquals(cin.read(buf),6,"2 Read CRLF");
            test.checkEquals(new String(buf,0,6),
                             "12"+CRLF+"34",
                             "2 Read CRLF");
            test.checkEquals(cin.read(buf),12,"2 Read to EOF");
            test.checkEquals(new String(buf,0,12),
                             "567890abcdef","2 Read to EOF");
            test.checkEquals(cin.read(buf),-1,"2 Read EOF");
            test.checkEquals(cin.read(buf),-1,"2 Read EOF again");
            
            
            // Bad EOF in chunking;
            ByteArrayInputStream bin = new ByteArrayInputStream
            (
                    ("8;\n"+
                    "01234567\n").getBytes()
            );
            cin = new HttpInputStream(fin);
            cin.setChunking();
            try
            {
                for(int i=0;i<100;i++)
                    if (cin.read(new byte[100])<0)
                        break;
                test.check(false, "no unexpected EOF");
            }
            catch(IOException e)
            {
                test.check(true, "no unexpected EOF");
            }
            
            // Bad EOF in mid chunking;
            bin = new ByteArrayInputStream
            (
                    ("8;\n"+
                    "01234567\n" +
                    "8;\n" +
                    "1234").getBytes()
            );
            cin = new HttpInputStream(fin);
            cin.setChunking();
            try
            {
                for(int i=0;i<100;i++)
                    if (cin.read(new byte[100])<0)
                        break;
                test.check(false, "no unexpected EOF");
            }
            catch(IOException e)
            {
                test.check(true, "no unexpected EOF");
            }
            
        }
        catch(Exception e)
        {
            test.check(false,e.toString());
        }
    }
    
    /* -------------------------------------------------------------- */
    public static void chunkOutTest()
        throws Exception
    {
        TestCase test = new TestCase("org.openqa.jetty.http.HttpOutputStream");

        try{
            File tmpFile=File.createTempFile("HTTP.TestHarness",".chunked");

            if (!log.isDebugEnabled())
                tmpFile.deleteOnExit();
            else
                if(log.isDebugEnabled())log.debug("Chunk out tmp = "+tmpFile);
            
            FileOutputStream fout = new FileOutputStream(tmpFile);
            HttpOutputStream cout = new HttpOutputStream(fout,4020);
            cout.setChunking();
            
            cout.write("Reset Output".getBytes());
            cout.resetBuffer();
            cout.setChunking();
            
            cout.flush();
            cout.write('a');
            cout.flush();
            cout.write('b');
            cout.write('c');
            cout.flush();
            cout.write("defghijklmnopqrstuvwxyz".getBytes());
            cout.flush();
            cout.write("XXX0123456789\nXXX".getBytes(),3,11);
            cout.flush();
            byte[] eleven = "0123456789\n".getBytes();
            for (int i=0;i<400;i++)
                cout.write(eleven);
            cout.close();
            
            FileInputStream ftmp= new FileInputStream(tmpFile);
            ChunkingInputStream cin = new ChunkingInputStream(new LineInput(ftmp));

            test.checkEquals(cin.read(),'a',"a in 1");
            byte[] b = new byte[100];
            test.checkEquals(cin.read(b,0,2),2,"bc in 23");
            test.checkEquals(b[0],'b',"b in 2");
            test.checkEquals(b[1],'c',"c in 3");

            LineInput lin = new LineInput(cin);            
            String line=lin.readLine();
            
            test.checkEquals(line.length(),33,"def...");            
            test.checkEquals(line,"defghijklmnopqrstuvwxyz0123456789","readLine");
            int chars=0;
            while (cin.read()!=-1)
                chars++;
            test.checkEquals(chars,400*11,"Auto flush");

            
            ftmp= new FileInputStream(tmpFile);
            FileInputStream ftest=
                new FileInputStream(__userDir+File.separator+
                                    "TestData"+File.separator+
                                    "chunkOut.bin");
            test.checkEquals(ftmp,ftest,"chunked out");
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            test.check(false,e.toString());
        }
    }

    /* -------------------------------------------------------------- */
    public static void chunkingOSTest()
        throws Exception
    {
        TestCase test = new TestCase("org.openqa.jetty.http.ChunkingOutputStream");

        try{
            File tmpFile=File.createTempFile("HTTP.TestHarness",".chunked");

            if (!log.isDebugEnabled())
                tmpFile.deleteOnExit();
            else
                if(log.isDebugEnabled())log.debug("Chunk out tmp = "+tmpFile);
            
            FileOutputStream fout = new FileOutputStream(tmpFile);
            ChunkingOutputStream cout = new ChunkingOutputStream(fout,4020,512);
            
            cout.write("Reset Output".getBytes());
            cout.resetStream();
            
            cout.flush();
            cout.write('a');
            cout.flush();
            cout.write('b');
            cout.write('c');
            cout.flush();
            cout.write("defghijklmnopqrstuvwxyz".getBytes());
            cout.flush();
            cout.write("XXX0123456789\nXXX".getBytes(),3,11);
            cout.flush();
            byte[] eleven = "0123456789\n".getBytes();
            for (int i=0;i<400;i++)
                cout.write(eleven);
            cout.close();
            
            FileInputStream ftmp= new FileInputStream(tmpFile);
            HttpInputStream cin = new HttpInputStream(ftmp);
            cin.setChunking();

            test.checkEquals(cin.read(),'a',"a in 1");
            byte[] b = new byte[100];
            test.checkEquals(cin.read(b,0,2),2,"bc in 23");
            test.checkEquals(b[0],'b',"b in 2");
            test.checkEquals(b[1],'c',"c in 3");

            LineInput lin = new LineInput(cin);            
            String line=lin.readLine();
            
            test.checkEquals(line.length(),33,"def...");            
            test.checkEquals(line,"defghijklmnopqrstuvwxyz0123456789","readLine");
            int chars=0;
            while (cin.read()!=-1)
                chars++;
            test.checkEquals(chars,400*11,"Auto flush");
            
            ftmp= new FileInputStream(tmpFile);
            FileInputStream ftest=
                new FileInputStream(__userDir+File.separator+
                                    "TestData"+File.separator+
                                    "chunkOut.bin");
            test.checkEquals(ftmp,ftest,"chunked out "+tmpFile);
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            test.check(false,e.toString());
        }
    }

 
    
    /* --------------------------------------------------------------- */
    public static void httpFields()
    {
        String h1 =
            "Content-Type: xyz" + CRLF +
            "I1	:	42   " + CRLF +
            "D1: Fri, 31 Dec 1999 23:59:59 GMT" + CRLF +
            "D2: Friday, 31-Dec-99 23:59:59 GMT" + CRLF +
            "D3: Fri Dec 31 23:59:59 1999" + CRLF +
            "D4: Mon Jan 1 00:00:01 2000" + CRLF +
            "D5: Tue Feb 29 12:00:00 2000" + CRLF +
            "C1: Continuation  " + CRLF +
            "    Value  " + CRLF +
            "L1: V1  " + CRLF +
            "L1: V2  " + CRLF +
            "L1: V,3  " + CRLF +
            "L2: V1, V2, 'V,3'" + CRLF +
            CRLF +
            "Other Stuff"+ CRLF;
        
        String h2 =
            "Content-Type: pqy" + CRLF +
            "I1: -33" + CRLF +
            "D1: Fri, 31 Dec 1999 23:59:59 GMT" + CRLF +
            "D2: Fri, 31 Dec 1999 23:59:59 GMT" + CRLF +
            "D3: Fri Dec 31 23:59:59 1999" + CRLF +
            "D4: Mon Jan 1 00:00:01 2000" + CRLF +
            "D5: Tue Feb 29 12:00:00 2000" + CRLF +
            "C1: VC1" + CRLF +
            "L1: V1" + CRLF +
            "L1: V2" + CRLF +
            "L1: V,3" + CRLF +
            "L2: V1, V2, 'V,3'" + CRLF +
            "U1: VU1" + CRLF +
            "U2: VU2" + CRLF +
            "U1: VU2" + CRLF +
            CRLF;

        ByteArrayInputStream bais = new ByteArrayInputStream(h1.getBytes());
        LineInput lis = new LineInput(bais);


        TestCase t = new TestCase("org.openqa.jetty.http.HttpFields");
        try
        {    
            HttpFields f = new HttpFields();
            f.read(lis);
            
            byte[] b = "xxxxxxxxxxxcl".getBytes();
            t.checkEquals(lis.read(b),13,"Read other");
            t.checkEquals(new String(b,0,11),
                          "Other Stuff","Read other");
        
            t.checkEquals(f.get(HttpFields.__ContentType),
                          "xyz","getHeader");
            f.put(HttpFields.__ContentType,"pqy");
            t.checkEquals(f.get(HttpFields.__ContentType),
                          "pqy","setHeader");
            
            f.put("U1","VU1");
            t.checkEquals(f.get("U1"),"VU1","put1");
            f.remove("C1");
            t.checkEquals(f.get("C1"),null,"remove");
            f.put("U2","VU2");
            t.checkEquals(f.get("U2"),"VU2","put2");
            f.add("C1","VC1");
            t.checkEquals(f.get("C1"),"VC1","add2");
            f.add("U1","VU2");
            t.checkEquals(f.get("U1"),"VU1","add2");
            
            t.checkEquals(f.getIntField("I1"),42,"getIntHeader");
            f.putIntField("I1",-33);
            t.checkEquals(f.getIntField("I1"),-33,"setIntHeader");
        
        
            long d1 = f.getDateField("D1");
            long d2 = f.getDateField("D2");
            long d3 = f.getDateField("D3");
            long d4 = f.getDateField("D4");
            long d5 = f.getDateField("D5");
            t.check(d1>0,"getDateHeader1");
            t.check(d2>0,"getDateHeader2");
            t.checkEquals(d1,d2,"getDateHeader12");
            t.checkEquals(d2,d3,"getDateHeader23");
            t.checkEquals(d3+2000,d4,"getDateHeader34");
            t.checkEquals(951825600000L,d5,"getDateHeader5");

            f.putDateField("D2",d1);
            t.checkEquals(f.get("D1"),f.get("D2"),
                          "setDateHeader12");

            Enumeration e = f.getValues("L1");
            t.check(e.hasMoreElements(),"getValues L1[0]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V1","getValues L1[0]==");
            t.check(e.hasMoreElements(),"getValues L1[1]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V2","getValues L1[1]==");
            t.check(e.hasMoreElements(),"getValues L1[2]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V,3","getValues L1[2]==");
            
            e = f.getValues("L2",", \t");
            t.check(e.hasMoreElements(),"getValues L2[0]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V1","getValues L2[0]==");
            t.check(e.hasMoreElements(),"getValues L2[1]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V2","getValues L2[1]==");
            t.check(e.hasMoreElements(),"getValues L2[2]");
            if (e.hasMoreElements())
                t.checkEquals(e.nextElement(),"V,3","getValues L2[2]==");
            
            String h3 = f.toString();
            t.checkEquals(h2,h3,"toString");

            HashMap params = new HashMap();
            String value = HttpFields.valueParameters(" v ; p1=v1 ; p2 = \" v 2 \";p3 ; p4='v4=;' ;",params);
            t.checkEquals(value,"v","value");
            t.checkEquals(params.size(),4,"params");
            t.checkEquals(params.get("p1"),"v1","p1=v1");
            t.checkEquals(params.get("p2")," v 2 ","p2=\" v 2 \"");
            t.checkEquals(params.get("p3"),null,"p3=null");
            t.check(params.containsKey("p3"),"p3");
            t.checkEquals(params.get("p4"),"v4=;","p4=v4=;");


            

        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }

    /* --------------------------------------------------------------- */
    public static void pathMap()
    {
        TestCase t = new TestCase("org.openqa.jetty.http.PathMap");
        try
        {
            PathMap p = new PathMap();

            p.put("/abs/path","1");
            p.put("/abs/path/longer","2");
            p.put("/animal/bird/*","3");
            p.put("/animal/fish/*","4");
            p.put("/animal/*","5");
            p.put("*.tar.gz","6");
            p.put("*.gz","7");
            p.put("/","8");
            p.put("/XXX:/YYY","9");


            String[][] tests =
            {
                {"/abs/path","1"},
                {"/abs/path/xxx","8"},
                {"/abs/pith","8"},
                {"/abs/path/longer","2"},
                {"/abs/path/","8"},
                {"/abs/path/xxx","8"},
                {"/animal/bird/eagle/bald","3"},
                {"/animal/fish/shark/grey","4"},
                {"/animal/insect/bug","5"},
                {"/animal","5"},
                {"/animal/","5"},
                {"/suffix/path.tar.gz","6"},
                {"/suffix/path.gz","7"},
                {"/animal/path.gz","5"},
                {"/Other/path","8"},
            };    

            for (int i=0;i<tests.length;i++)
            {
                t.checkEquals(p.getMatch(tests[i][0]).getValue(),tests[i][1],tests[i][0]);
                t.checkEquals(p.getMatch(tests[i][0]+"?a=1").getValue(),tests[i][1],tests[i][0]+"?a=1");
                t.checkEquals(p.getMatch(tests[i][0]+";a=1").getValue(),tests[i][1],tests[i][0]+";a=1");
                t.checkEquals(p.getMatch(tests[i][0]+";a=1?a=1").getValue(),tests[i][1],tests[i][0]+";a=1?a=1");
            }
            
            t.checkEquals(p.get("/abs/path"),"1","Get absolute path");
            t.checkEquals(p.getMatch("/abs/path").getKey(),"/abs/path",
                          "Match absolute path");
            
            t.checkEquals(p.getMatches("/animal/bird/path.tar.gz").toString(),
                          "[/animal/bird/*=3, /animal/*=5, *.tar.gz=6, *.gz=7, /=8]",
                          "all matches");
            
            t.checkEquals(p.getMatches("/animal/fish/").toString(),
                          "[/animal/fish/*=4, /animal/*=5, /=8]",
                          "Dir matches");
            t.checkEquals(p.getMatches("/animal/fish").toString(),
                          "[/animal/fish/*=4, /animal/*=5, /=8]",
                          "Dir matches");
            t.checkEquals(p.getMatches("/").toString(),
                          "[/=8]",
                          "Dir matches");
            t.checkEquals(p.getMatches("").toString(),
                          "[/=8]",
                          "Dir matches");

            t.checkEquals(PathMap.pathMatch("/Foo/bar","/Foo/bar"),"/Foo/bar","pathMatch exact");
            t.checkEquals(PathMap.pathMatch("/Foo/*","/Foo/bar"),"/Foo","pathMatch prefix");
            t.checkEquals(PathMap.pathMatch("/Foo/*","/Foo/"),"/Foo","pathMatch prefix");
            t.checkEquals(PathMap.pathMatch("/Foo/*","/Foo"),"/Foo","pathMatch prefix");
            t.checkEquals(PathMap.pathMatch("*.ext","/Foo/bar.ext"),"/Foo/bar.ext","pathMatch suffix");
            t.checkEquals(PathMap.pathMatch("/","/Foo/bar.ext"),"/Foo/bar.ext","pathMatch default");
            
            t.checkEquals(PathMap.pathInfo("/Foo/bar","/Foo/bar"),null,"pathInfo exact");
            t.checkEquals(PathMap.pathInfo("/Foo/*","/Foo/bar"),"/bar","pathInfo prefix");
            t.checkEquals(PathMap.pathInfo("/Foo/*","/Foo/"),"/","pathInfo prefix");
            t.checkEquals(PathMap.pathInfo("/Foo/*","/Foo"),null,"pathInfo prefix");
            t.checkEquals(PathMap.pathInfo("*.ext","/Foo/bar.ext"),null,"pathInfo suffix");
            t.checkEquals(PathMap.pathInfo("/","/Foo/bar.ext"),null,"pathInfo default");
            t.checkEquals(p.getMatch("/XXX").getValue(),"9",
                          "multi paths");
            t.checkEquals(p.getMatch("/YYY").getValue(),"9",
                          "multi paths");
            
            p.put("/*","0");

            t.checkEquals(p.get("/abs/path"),"1","Get absolute path");
            t.checkEquals(p.getMatch("/abs/path").getKey(),"/abs/path",
                          "Match absolute path");
            t.checkEquals(p.getMatch("/abs/path").getValue(),"1",
                          "Match absolute path");
            t.checkEquals(p.getMatch("/abs/path/xxx").getValue(),"0",
                          "Mismatch absolute path");
            t.checkEquals(p.getMatch("/abs/pith").getValue(),"0",
                          "Mismatch absolute path");
            t.checkEquals(p.getMatch("/abs/path/longer").getValue(),"2",
                          "Match longer absolute path");
            t.checkEquals(p.getMatch("/abs/path/").getValue(),"0",
                          "Not exact absolute path");
            t.checkEquals(p.getMatch("/abs/path/xxx").getValue(),"0",
                          "Not exact absolute path");
            
            t.checkEquals(p.getMatch("/animal/bird/eagle/bald").getValue(),"3",
                          "Match longest prefix");
            t.checkEquals(p.getMatch("/animal/fish/shark/grey").getValue(),"4",
                          "Match longest prefix");
            t.checkEquals(p.getMatch("/animal/insect/bug").getValue(),"5",
                          "Match longest prefix");
            t.checkEquals(p.getMatch("/animal").getValue(),"5",
                          "mismatch exact prefix");
            t.checkEquals(p.getMatch("/animal/").getValue(),"5",
                          "mismatch exact prefix");
            
            t.checkEquals(p.getMatch("/suffix/path.tar.gz").getValue(),"0",
                          "Match longest suffix");
            t.checkEquals(p.getMatch("/suffix/path.gz").getValue(),"0",
                          "Match longest suffix");
            t.checkEquals(p.getMatch("/animal/path.gz").getValue(),"5",
                          "prefix rather than suffix");
            
            t.checkEquals(p.getMatch("/Other/path").getValue(),"0",
                          "default");
            
            t.checkEquals(PathMap.pathMatch("/*","/xxx/zzz"),"","pathMatch /*");
            t.checkEquals(PathMap.pathInfo("/*","/xxx/zzz"),"/xxx/zzz","pathInfo /*");

            t.check(PathMap.match("/","/anything"),"match /");
            t.check(PathMap.match("/*","/anything"),"match /*");
            t.check(PathMap.match("/foo","/foo"),"match /foo");
            t.check(!PathMap.match("/foo","/bar"),"!match /foo");
            t.check(PathMap.match("/foo/*","/foo"),"match /foo/*");
            t.check(PathMap.match("/foo/*","/foo/"),"match /foo/*");
            t.check(PathMap.match("/foo/*","/foo/anything"),"match /foo/*");
            t.check(!PathMap.match("/foo/*","/bar"),"!match /foo/*");
            t.check(!PathMap.match("/foo/*","/bar/"),"!match /foo/*");
            t.check(!PathMap.match("/foo/*","/bar/anything"),"!match /foo/*");
            t.check(PathMap.match("*.foo","anything.foo"),"match *.foo");
            t.check(!PathMap.match("*.foo","anything.bar"),"!match *.foo");

        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            t.check(false,e.toString());
        }
    }
    
    
    
    /* ------------------------------------------------------------ */
    public static void main(String[] args)
    {
        try
        {
            chunkInTest();
            chunkOutTest();
            chunkingOSTest();
            httpFields();
            pathMap();
            
            TestRFC2616.test();
        }
        catch(Throwable e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            new TestCase("org.openqa.jetty.http.TestHarness").check(false,e.toString());
        }
        finally
        {
            TestCase.report();
        }
    }
}
