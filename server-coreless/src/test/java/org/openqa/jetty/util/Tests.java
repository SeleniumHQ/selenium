// ========================================================================
// $Id: Tests.java,v 1.28 2005/11/03 09:37:56 gregwilkins Exp $
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
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Locale;
import java.util.TimeZone;

import junit.framework.TestSuite;


/* ------------------------------------------------------------ */
/** Util meta Tests.
 * @version $Id: Tests.java,v 1.28 2005/11/03 09:37:56 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class Tests extends junit.framework.TestCase
{
    public Tests(String name)
    {
      super(name);
    }
    
    public static junit.framework.Test suite() {
        TestSuite suite = new TestSuite(Tests.class);
        suite.addTest(TestResource.suite());
        suite.addTest(TestThreadedServer.suite());
        return suite;                  
    }

    /* ------------------------------------------------------------ */
    /** main.
     */
    public static void main(String[] args)
    {
      junit.textui.TestRunner.run(suite());
    }    
    
    /*-------------------------------------------------------------------*/
    /** Check that string contains a substring.
     *  @return Index of substring
     */
    private int checkContains(String check, String string, String subString)
    {
        return realCheckContains(check, string,0,subString);
    }

    /*-------------------------------------------------------------------*/
    /** Check that string contains a substring.
     *  @return Index of substring
     */
    private int realCheckContains(String check, 
                                  String string,
                                  int offset,
                                  String subString)
    {
        int index=-1;
        if ((string==null && subString==null)
            || (string!=null && (subString==null ||
                                 (index=string.indexOf(subString,offset))>=0)))
        {
          // do nothing
        }
        else
        {
            fail(check + " \"" + subString + "\" not contained in \"" +
                 (string==null?"null":string.substring(offset))+ '"');
        }
        return index;
    }


    

    /* ------------------------------------------------------------ */
    public void testDateCache() throws Exception
    {
        //@WAS: Test t = new Test("org.openqa.jetty.util.DateCache");
        //                            012345678901234567890123456789
        DateCache dc = new DateCache("EEE, dd MMM yyyy HH:mm:ss zzz ZZZ",
                                     Locale.US);
            dc.setTimeZone(TimeZone.getTimeZone("GMT"));
            String last=dc.format(System.currentTimeMillis());
            boolean change=false;
            for (int i=0;i<15;i++)
            {
                Thread.sleep(100);
                String date=dc.format(System.currentTimeMillis());
                
                assertEquals( "Same Date",
                              last.substring(0,17),
                              date.substring(0,17));
                
                if (last.substring(17).equals(date.substring(17)))
                    change=true;
                else
                {
                    int lh=Integer.parseInt(last.substring(17,19));
                    int dh=Integer.parseInt(date.substring(17,19));
                    int lm=Integer.parseInt(last.substring(20,22));
                    int dm=Integer.parseInt(date.substring(20,22));
                    int ls=Integer.parseInt(last.substring(23,25));
                    int ds=Integer.parseInt(date.substring(23,25));

                    // This won't work at midnight!
                    assertTrue(  "Time changed",
                                 ds==ls+1 ||
                                 ds==0 && dm==lm+1 ||
                                 ds==0 && dm==0 && dh==lh+1);
                }
                last=date;
            }
            assertTrue("time changed", change);


            // Test string is cached
            dc = new DateCache();
            String s1=dc.format(System.currentTimeMillis());
            dc.format(1);
            String s2=dc.format(System.currentTimeMillis());
            dc.format(System.currentTimeMillis()+10*60*60);
            String s3=dc.format(System.currentTimeMillis());
            assertTrue(s1==s2 || s2==s3);
    }


    /* ------------------------------------------------------------ */
    public void testIO() throws InterruptedException
    {
        // Only a little test
        ByteArrayInputStream in = new ByteArrayInputStream
            ("The quick brown fox jumped over the lazy dog".getBytes());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        IO.copyThread(in,out);
        Thread.sleep(500);

        assertEquals( "copyThread",
                      out.toString(),
                      "The quick brown fox jumped over the lazy dog");
    }

    /* ------------------------------------------------------------ */
    public static void testB64()
        throws UnsupportedEncodingException
    {
	    // Perform basic reversibility tests
       assertEquals("decode(encode())","",       B64Code.decode(B64Code.encode("")));
       assertEquals("decode(encode(a))","a",      B64Code.decode(B64Code.encode("a")));
       assertEquals("decode(encode(ab))","ab",     B64Code.decode(B64Code.encode("ab")));
       assertEquals("decode(encode(abc))","abc",    B64Code.decode(B64Code.encode("abc")));
       assertEquals("decode(encode(abcd))","abcd",   B64Code.decode(B64Code.encode("abcd")));
       assertEquals("decode(encode(^@))","\000",     B64Code.decode(B64Code.encode("\000")));
       assertEquals("decode(encode(a^@))","a\000",    B64Code.decode(B64Code.encode("a\000")));
       assertEquals("decode(encode(ab^@))","ab\000",   B64Code.decode(B64Code.encode("ab\000")));
       assertEquals("decode(encode(abc^@))","abc\000",  B64Code.decode(B64Code.encode("abc\000")));
       assertEquals("decode(encode(abcd^@))","abcd\000", B64Code.decode(B64Code.encode("abcd\000")));

	    // Encoder compatibility tests
	    assertEquals("encode(abc)",         B64Code.encode("abc"),     "YWJj");
	    assertEquals("encode(abcd)",     B64Code.encode("abcd"),    "YWJjZA==");
	    assertEquals("encode(abcde)",     B64Code.encode("abcde"),   "YWJjZGU=");
	    assertEquals("encode(abcdef)",     B64Code.encode("abcdef"),  "YWJjZGVm");
	    assertEquals("encode(abcdefg)", B64Code.encode("abcdefg"), "YWJjZGVmZw==");

       // Test the reversibility of the full range of 8 bit values
	    byte[] allValues= new byte[256];
	    for (int i=0; i<256; i++)
         allValues[i] = (byte) i;
	    String input = new String(allValues, StringUtil.__ISO_8859_1);
            String output=B64Code.decode(B64Code.encode(input));

            for (int i=0;i<256;i++)
              assertEquals("DIFF at "+i, (int)output.charAt(i), (int)input.charAt(i));
	    assertEquals( "decode(encode(ALL_128_ASCII_VALUES))", output,input);

    }
    
    
    /* ------------------------------------------------------------ */
    public void testPassword()
    {
        Password f1 = new Password("Foo");
        Password f2 = new Password(Password.obfuscate("Foo"));
        
        Password b1 = new Password("Bar");
        Password b2 = new Password(Password.obfuscate("Bar"));

        assertTrue("PW to PW",   f1.equals(f1));
        assertTrue("PW to Obf",  f1.equals(f2));
        assertTrue("Obf to PW",  f2.equals(f1));
        assertTrue("Obf to Obf", f2.equals(f2));
        
        assertTrue("PW to Str",  f1.check("Foo"));
        assertTrue("Obf to Str", f2.check("Foo"));
        
        assertTrue("PW to PW",   !f1.equals(b1));
        assertTrue("PW to Obf",  !f1.equals(b2));
        assertTrue("Obf to PW",  !f2.equals(b1));
        assertTrue("Obf to Obf", !f2.equals(b2));
        
        assertTrue("PW to Str",  !f1.check("Bar"));
        assertTrue("Obf to Str", !f2.check("Bar"));
    }

    
    /* ------------------------------------------------------------ */
    public void testCredential()
    {
        Credential[] creds =
            {
                    new Password("Foo"),
                    Credential.getCredential("Foo"),
                    Credential.getCredential(Credential.Crypt.crypt("user","Foo")),
                    Credential.getCredential(Credential.MD5.digest("Foo"))
            };

        assertTrue("c[0].check(c[0])", creds[0].check(creds[0]));
        assertTrue("c[0].check(c[1])", creds[0].check(creds[1]));
        assertTrue("c[0].check(c[2])", creds[0].check(creds[2]));
        assertTrue("c[0].check(c[3])", creds[0].check(creds[3]));

        assertTrue("c[1].check(c[0])", creds[1].check(creds[0]));
        assertTrue("c[1].check(c[1])", creds[1].check(creds[1]));
        assertTrue("c[1].check(c[2])", creds[1].check(creds[2]));
        assertTrue("c[1].check(c[3])", creds[1].check(creds[3]));

        assertTrue("c[2].check(c[0])", creds[2].check(creds[0]));
        assertTrue("c[2].check(c[1])", creds[2].check(creds[1]));
        assertTrue("c[2].check(c[2])",!creds[2].check(creds[2]));
        assertTrue("c[2].check(c[3])",!creds[2].check(creds[3]));

        assertTrue("c[3].check(c[0])", creds[3].check(creds[0]));
        assertTrue("c[3].check(c[1])", creds[3].check(creds[1]));
        assertTrue("c[3].check(c[2])",!creds[3].check(creds[2]));
        assertTrue("c[3].check(c[3])", creds[3].check(creds[3]));
       
    }

    /* ------------------------------------------------------------ */
    public void testURI()
        throws Exception
    {
        URI uri;

        // test basic encode/decode
        StringBuffer buf = new StringBuffer();
        URI.encodeString(buf,"foo%23;,:=bar",";,=");
        assertEquals("foo%23;,:=bar",URI.decodePath(buf.toString()));


        // No host
        uri = new URI("/");
        assertEquals("root /","/", uri.getPath());

        uri = new URI("/Test/URI");
        assertEquals("no params","/Test/URI", uri.toString());

        uri = new URI("/Test/URI?");
        assertEquals("no params","/Test/URI?", uri.toString());
        uri.setPath(uri.getPath());
        assertEquals("no params","/Test/URI", uri.toString());
        
        uri = new URI("/Test/URI?a=1");
        assertEquals("one param","/Test/URI?a=1", uri.toString());
    
        uri = new URI("/Test/URI");
        uri.put("b","2 !");
        assertEquals("add param","/Test/URI?b=2+%21", uri.toString());

        // Host but no port
        uri = new URI("http://host");
        assertEquals("root host","/", uri.getPath());
        assertEquals("root host","http://host/", uri.toString());
        
        uri = new URI("http://host/");
        assertEquals("root host/","/", uri.getPath());
        
        uri = new URI("http://host/Test/URI");
        assertEquals("no params","http://host/Test/URI", uri.toString());

        uri = new URI("http://host/Test/URI?");
        assertEquals("no params","http://host/Test/URI?", uri.toString());
        uri.setPath(uri.getPath());
        assertEquals("no params","http://host/Test/URI", uri.toString());
        
        uri = new URI("http://host/Test/URI?a=1");
        assertEquals("one param","http://host/Test/URI?a=1", uri.toString());
    
        uri = new URI("http://host/Test/URI");
        uri.put("b","2 !");
        assertEquals("add param","http://host/Test/URI?b=2+%21", uri.toString());
    
        // Host and port and path
        uri = new URI("http://host:8080");
        assertEquals("root","/", uri.getPath());
        
        uri = new URI("http://host:8080/");
        assertEquals("root","/", uri.getPath());
        
        uri = new URI("http://host:8080/xxx");
        assertEquals("path","/xxx", uri.getPath());

        String anez=UrlEncoded.decodeString("A%F1ez");
        uri = new URI("http://host:8080/"+anez);
        assertEquals("root","/"+anez, uri.getPath());            
        
        uri = new URI("http://host:8080/Test/URI");
        assertEquals("no params","http://host:8080/Test/URI", uri.toString());

        uri = new URI("http://host:8080/Test/URI?");
        assertEquals("no params","http://host:8080/Test/URI?", uri.toString());
        uri.getParameters();
        assertEquals("no params","http://host:8080/Test/URI", uri.toString());
        
        uri = new URI("http://host:8080/Test/URI?a=1");
        assertEquals("one param","http://host:8080/Test/URI?a=1", uri.toString());
    
        uri = new URI("http://host:8080/Test/URI");
        uri.put("b","2 !");
        assertEquals("add param","http://host:8080/Test/URI?b=2+%21", uri.toString());
    
        assertEquals("protocol","http", uri.getScheme());
        assertEquals("host","host", uri.getHost());
        assertEquals("port",8080, uri.getPort());

        uri.setScheme("ftp");
        uri.setHost("fff");
        uri.setPort(23);
        assertEquals("add param","ftp://fff:23/Test/URI?b=2+%21", uri.toString());
        
    
        uri = new URI("/Test/URI?c=1&d=2");
        uri.put("e","3");
        String s = uri.toString();
        assertTrue("merge params path", s.startsWith("/Test/URI?"));
        assertTrue("merge params c1", s.indexOf("c=1")>0);
        assertTrue("merge params d2", s.indexOf("d=2")>0);
        assertTrue("merge params e3", s.indexOf("e=3")>0);

        uri = new URI("/Test/URI?a=");
        assertEquals("null param","/Test/URI?a=", uri.toString());
        uri.getParameters();
        assertEquals("null param","/Test/URI?a", uri.toString());
        
        uri = new URI("/Test/URI?a+c=1%203");
        assertEquals("space param","/Test/URI?a+c=1%203", uri.toString());
        System.err.println(uri.getParameters());
        assertEquals("space param","1 3", uri.get("a c"));
        uri.getParameters();
        assertEquals("space param","/Test/URI?a+c=1+3", uri.toString());
        
        uri = new URI("/Test/Nasty%26%3F%20URI?c=%26&d=+%3F");
        assertEquals("nasty","/Test/Nasty&? URI", uri.getPath());
        uri.setPath("/test/nasty&? URI");
        uri.getParameters();
        assertTrue( "nasty",
                    uri.toString().equals("/test/nasty&%3F%20URI?c=%26&d=+%3F")||
                    uri.toString().equals("/test/nasty&%3F%20URI?d=+%3F&c=%26")
                    );
        uri=(URI)uri.clone();
        assertTrue("clone",
                   uri.toString().equals("/test/nasty&%3F%20URI?c=%26&d=+%3F")||
                   uri.toString().equals("/test/nasty&%3F%20URI?d=+%3F&c=%26")
                   );

        assertEquals("null+null", URI.addPaths(null,null),null);
        assertEquals("null+", URI.addPaths(null,""),null);
        assertEquals("null+bbb", URI.addPaths(null,"bbb"),"bbb");
        assertEquals("null+/", URI.addPaths(null,"/"),"/");
        assertEquals("null+/bbb", URI.addPaths(null,"/bbb"),"/bbb");
        
        assertEquals("+null", URI.addPaths("",null),"");
        assertEquals("+", URI.addPaths("",""),"");
        assertEquals("+bbb", URI.addPaths("","bbb"),"bbb");
        assertEquals("+/", URI.addPaths("","/"),"/");
        assertEquals("+/bbb", URI.addPaths("","/bbb"),"/bbb");
        
        assertEquals("aaa+null", URI.addPaths("aaa",null),"aaa");
        assertEquals("aaa+", URI.addPaths("aaa",""),"aaa");
        assertEquals("aaa+bbb", URI.addPaths("aaa","bbb"),"aaa/bbb");
        assertEquals("aaa+/", URI.addPaths("aaa","/"),"aaa/");
        assertEquals("aaa+/bbb", URI.addPaths("aaa","/bbb"),"aaa/bbb");
        
        assertEquals("/+null", URI.addPaths("/",null),"/");
        assertEquals("/+", URI.addPaths("/",""),"/");
        assertEquals("/+bbb", URI.addPaths("/","bbb"),"/bbb");
        assertEquals("/+/", URI.addPaths("/","/"),"/");
        assertEquals("/+/bbb", URI.addPaths("/","/bbb"),"/bbb");
        
        assertEquals("aaa/+null", URI.addPaths("aaa/",null),"aaa/");
        assertEquals("aaa/+", URI.addPaths("aaa/",""),"aaa/");
        assertEquals("aaa/+bbb", URI.addPaths("aaa/","bbb"),"aaa/bbb");
        assertEquals("aaa/+/", URI.addPaths("aaa/","/"),"aaa/");
        assertEquals("aaa/+/bbb", URI.addPaths("aaa/","/bbb"),"aaa/bbb");
        
        assertEquals(";JS+null", URI.addPaths(";JS",null),";JS");
        assertEquals(";JS+", URI.addPaths(";JS",""),";JS");
        assertEquals(";JS+bbb", URI.addPaths(";JS","bbb"),"bbb;JS");
        assertEquals(";JS+/", URI.addPaths(";JS","/"),"/;JS");
        assertEquals(";JS+/bbb", URI.addPaths(";JS","/bbb"),"/bbb;JS");
        
        assertEquals("aaa;JS+null", URI.addPaths("aaa;JS",null),"aaa;JS");
        assertEquals("aaa;JS+", URI.addPaths("aaa;JS",""),"aaa;JS");
        assertEquals("aaa;JS+bbb", URI.addPaths("aaa;JS","bbb"),"aaa/bbb;JS");
        assertEquals("aaa;JS+/", URI.addPaths("aaa;JS","/"),"aaa/;JS");
        assertEquals("aaa;JS+/bbb", URI.addPaths("aaa;JS","/bbb"),"aaa/bbb;JS");
        
        assertEquals("aaa;JS+null", URI.addPaths("aaa/;JS",null),"aaa/;JS");
        assertEquals("aaa;JS+", URI.addPaths("aaa/;JS",""),"aaa/;JS");
        assertEquals("aaa;JS+bbb", URI.addPaths("aaa/;JS","bbb"),"aaa/bbb;JS");
        assertEquals("aaa;JS+/", URI.addPaths("aaa/;JS","/"),"aaa/;JS");
        assertEquals("aaa;JS+/bbb", URI.addPaths("aaa/;JS","/bbb"),"aaa/bbb;JS");
        
        assertEquals("?A=1+null", URI.addPaths("?A=1",null),"?A=1");
        assertEquals("?A=1+", URI.addPaths("?A=1",""),"?A=1");
        assertEquals("?A=1+bbb", URI.addPaths("?A=1","bbb"),"bbb?A=1");
        assertEquals("?A=1+/", URI.addPaths("?A=1","/"),"/?A=1");
        assertEquals("?A=1+/bbb", URI.addPaths("?A=1","/bbb"),"/bbb?A=1");
        
        assertEquals("aaa?A=1+null", URI.addPaths("aaa?A=1",null),"aaa?A=1");
        assertEquals("aaa?A=1+", URI.addPaths("aaa?A=1",""),"aaa?A=1");
        assertEquals("aaa?A=1+bbb", URI.addPaths("aaa?A=1","bbb"),"aaa/bbb?A=1");
        assertEquals("aaa?A=1+/", URI.addPaths("aaa?A=1","/"),"aaa/?A=1");
        assertEquals("aaa?A=1+/bbb", URI.addPaths("aaa?A=1","/bbb"),"aaa/bbb?A=1");
        
        assertEquals("aaa?A=1+null", URI.addPaths("aaa/?A=1",null),"aaa/?A=1");
        assertEquals("aaa?A=1+", URI.addPaths("aaa/?A=1",""),"aaa/?A=1");
        assertEquals("aaa?A=1+bbb", URI.addPaths("aaa/?A=1","bbb"),"aaa/bbb?A=1");
        assertEquals("aaa?A=1+/", URI.addPaths("aaa/?A=1","/"),"aaa/?A=1");
        assertEquals("aaa?A=1+/bbb", URI.addPaths("aaa/?A=1","/bbb"),"aaa/bbb?A=1");
        
        assertEquals(";JS?A=1+null", URI.addPaths(";JS?A=1",null),";JS?A=1");
        assertEquals(";JS?A=1+", URI.addPaths(";JS?A=1",""),";JS?A=1");
        assertEquals(";JS?A=1+bbb", URI.addPaths(";JS?A=1","bbb"),"bbb;JS?A=1");
        assertEquals(";JS?A=1+/", URI.addPaths(";JS?A=1","/"),"/;JS?A=1");
        assertEquals(";JS?A=1+/bbb", URI.addPaths(";JS?A=1","/bbb"),"/bbb;JS?A=1");
        
        assertEquals("aaa;JS?A=1+null", URI.addPaths("aaa;JS?A=1",null),"aaa;JS?A=1");
        assertEquals("aaa;JS?A=1+", URI.addPaths("aaa;JS?A=1",""),"aaa;JS?A=1");
        assertEquals("aaa;JS?A=1+bbb", URI.addPaths("aaa;JS?A=1","bbb"),"aaa/bbb;JS?A=1");
        assertEquals("aaa;JS?A=1+/", URI.addPaths("aaa;JS?A=1","/"),"aaa/;JS?A=1");
        assertEquals("aaa;JS?A=1+/bbb", URI.addPaths("aaa;JS?A=1","/bbb"),"aaa/bbb;JS?A=1");
        
        assertEquals("aaa;JS?A=1+null", URI.addPaths("aaa/;JS?A=1",null),"aaa/;JS?A=1");
        assertEquals("aaa;JS?A=1+", URI.addPaths("aaa/;JS?A=1",""),"aaa/;JS?A=1");
        assertEquals("aaa;JS?A=1+bbb", URI.addPaths("aaa/;JS?A=1","bbb"),"aaa/bbb;JS?A=1");
        assertEquals("aaa;JS?A=1+/", URI.addPaths("aaa/;JS?A=1","/"),"aaa/;JS?A=1");
        assertEquals("aaa;JS?A=1+/bbb", URI.addPaths("aaa/;JS?A=1","/bbb"),"aaa/bbb;JS?A=1");

        assertEquals("parent /aaa/bbb/","/aaa/", URI.parentPath("/aaa/bbb/"));
        assertEquals("parent /aaa/bbb","/aaa/", URI.parentPath("/aaa/bbb"));
        assertEquals("parent /aaa/","/", URI.parentPath("/aaa/"));
        assertEquals("parent /aaa","/", URI.parentPath("/aaa"));
        assertEquals("parent /",null, URI.parentPath("/"));
        assertEquals("parent null",null, URI.parentPath(null));

        String[][] canonical = 
        {
            {"/aaa/bbb/","/aaa/bbb/"},
            {"/aaa//bbb/","/aaa//bbb/"},
            {"/aaa///bbb/","/aaa///bbb/"},
            {"/aaa/./bbb/","/aaa/bbb/"},
            {"/aaa//./bbb/","/aaa//bbb/"},
            {"/aaa/.//bbb/","/aaa//bbb/"},
            {"/aaa/../bbb/","/bbb/"},
            {"/aaa/./../bbb/","/bbb/"},
            {"/aaa//../bbb/","/aaa/bbb/"},
            {"/aaa/..//bbb/","//bbb/"},
            {"/aaa/bbb/ccc/../../ddd/","/aaa/ddd/"},
            {"./bbb/","bbb/"},
            {"./aaa/../bbb/","bbb/"},
            {"./",""},
            {".//",".//"},
            {".///",".///"},
            {"/.","/"},
            {"//.","//"},
            {"///.","///"},
            {"/","/"},
            {"aaa/bbb","aaa/bbb"},
            {"aaa/","aaa/"},
            {"aaa","aaa"},
            {"/aaa/bbb","/aaa/bbb"},
            {"/aaa//bbb","/aaa//bbb"},
            {"/aaa/./bbb","/aaa/bbb"},
            {"/aaa/../bbb","/bbb"},
            {"/aaa/./../bbb","/bbb"},
            {"./bbb","bbb"},
            {"./aaa/../bbb","bbb"},
            {"aaa/bbb/..","aaa/"},
            {"aaa/bbb/../","aaa/"},
            {"./",""},
            {".",""},
            {"",""},
            {"..",null},
            {"./..",null},
            {"//..","/"},
            {"aaa/../..",null},
            {"/foo/bar/../../..",null},
            {"/../foo",null},
            {"/foo/.","/foo/"},
            {"a","a"},
            {"a/","a/"},
            {"a/.","a/"},
            {"a/..",""},
            {"a/../..",null},
            {"/foo/../bar//","/bar//"},
            {"/./blah/..","/"},
            {"//../a/../bb/../ccc/../test///..","/test//"},
        };

        for (int t=0;t<canonical.length;t++)
        {
            System.err.println(canonical[t][0]+" == "+URI.canonicalPath(canonical[t][0]));
        
            assertEquals( "canonical "+canonical[t][0],
                          canonical[t][1],
                          URI.canonicalPath(canonical[t][0])
                          );
        }
    }


    /* -------------------------------------------------------------- */
    public void testUrlEncoded()
    {
          
        UrlEncoded url_encoded = new UrlEncoded();
        assertEquals("Empty",0, url_encoded.size());

        url_encoded.clear();
        url_encoded.decode("Name1=Value1");
        assertEquals("simple param size",1, url_encoded.size());
        assertEquals("simple encode","Name1=Value1", url_encoded.encode());
        assertEquals("simple get","Value1", url_encoded.getString("Name1"));
        
        url_encoded.clear();
        url_encoded.decode("Name2=");
        assertEquals("dangling param size",1, url_encoded.size());
        assertEquals("dangling encode","Name2", url_encoded.encode());
        assertEquals("dangling get","", url_encoded.getString("Name2"));
    
        url_encoded.clear();
        url_encoded.decode("Name3");
        assertEquals("noValue param size",1, url_encoded.size());
        assertEquals("noValue encode","Name3", url_encoded.encode());
        assertEquals("noValue get","", url_encoded.getString("Name3"));
    
        url_encoded.clear();
        url_encoded.decode("Name4=Value+4%21");
        assertEquals("encoded param size",1, url_encoded.size());
        assertEquals("encoded encode","Name4=Value+4%21", url_encoded.encode());
        assertEquals("encoded get","Value 4!", url_encoded.getString("Name4"));
        
        url_encoded.clear();
        url_encoded.decode("Name4=Value+4%21%20%214");
        assertEquals("encoded param size",1, url_encoded.size());
        assertEquals("encoded encode","Name4=Value+4%21+%214", url_encoded.encode());
        assertEquals("encoded get","Value 4! !4", url_encoded.getString("Name4"));

        
        url_encoded.clear();
        url_encoded.decode("Name5=aaa&Name6=bbb");
        assertEquals("multi param size",2, url_encoded.size());
        assertTrue("multi encode "+url_encoded.encode(),
                   url_encoded.encode().equals("Name5=aaa&Name6=bbb") ||
                   url_encoded.encode().equals("Name6=bbb&Name5=aaa")
                   );
        assertEquals("multi get","aaa", url_encoded.getString("Name5"));
        assertEquals("multi get","bbb", url_encoded.getString("Name6"));
    
        url_encoded.clear();
        url_encoded.decode("Name7=aaa&Name7=b%2Cb&Name7=ccc");
        assertEquals("multi encode",
                         "Name7=aaa&Name7=b%2Cb&Name7=ccc"
                         ,
                        url_encoded.encode());
        assertEquals("list get all", url_encoded.getString("Name7"),"aaa,b,b,ccc");
        assertEquals("list get","aaa", url_encoded.getValues("Name7").get(0));
        assertEquals("list get", url_encoded.getValues("Name7").get(1),"b,b");
        assertEquals("list get","ccc", url_encoded.getValues("Name7").get(2));

        url_encoded.clear();
        url_encoded.decode("Name8=xx%2C++yy++%2Czz");
        assertEquals("encoded param size",1, url_encoded.size());
        assertEquals("encoded encode","Name8=xx%2C++yy++%2Czz", url_encoded.encode());
        assertEquals("encoded get", url_encoded.getString("Name8"),"xx,  yy  ,zz");

        url_encoded.clear();
        url_encoded.decode("Name9=%83e%83X%83g", "SJIS"); // "Test" in Japanese Katakana
        assertEquals("encoded param size",1, url_encoded.size());
        assertEquals("encoded get", "\u30c6\u30b9\u30c8", url_encoded.getString("Name9"));        
        
        
        byte[] b = new byte[]
            {
                (byte)'s',
                (byte)'=',
                (byte)0x83,
                (byte)'Q',
                (byte)0x81,
                (byte)0x5b,
                (byte)0x83,
                (byte)0x80
            };
        MultiMap m = new MultiMap();
        UrlEncoded.decodeTo(b,0,b.length,m,"SJIS");
        String sjis=(String)m.get("s");
        assertEquals("SJIS len",3, sjis.length());
        assertEquals("SJIS param","\u30b2\u30fc\u30e0",sjis );
        
        
    }
}
