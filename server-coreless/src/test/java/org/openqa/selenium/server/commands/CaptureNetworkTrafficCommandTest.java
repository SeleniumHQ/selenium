package org.openqa.selenium.server.commands;

import junit.framework.TestCase;

import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.*;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.openqa.selenium.server.ModifiedIO;

public class CaptureNetworkTrafficCommandTest extends TestCase {
    public void testJson() throws ParseException, IOException {
        prepare();
        check("json", "json.txt");
    }

    public void testXml() throws ParseException, IOException {
        prepare();
        check("xml", "xml.xml");
    }

    public void testPlain() throws ParseException, IOException {
        prepare();
        check("plain", "plain.txt");
    }

    private void check(String type, String file) throws IOException {
        CaptureNetworkTrafficCommand c = new CaptureNetworkTrafficCommand(type);

        InputStream is = this.getClass().getResourceAsStream("/org/openqa/selenium/server/commands/" + file);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ModifiedIO.copy(is, baos);

        String result = c.execute();
        assertTrue(result.startsWith("OK,"));
        assertEquals(baos.toString(), result.substring(3));
    }

    private void prepare() throws ParseException {
        // mock data to be reused
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
        Date start = sdf.parse("2009-04-15T09:22:41.000-0700");
        Date end = sdf.parse("2009-04-15T09:22:41.102-0700");

        final Map<String, String> requestHeaders = new TreeMap<String, String>();
        requestHeaders.put("foo", "bar");
        requestHeaders.put("baz", "blah");
        HttpRequest req = new HttpRequest() {
            @Override
            public Enumeration getFieldNames() {
                return Collections.enumeration(requestHeaders.keySet());
            }

            @Override
            public String getField(String name) {
                return requestHeaders.get(name);
            }
        };
        HttpResponse res = new HttpResponse() {
            @Override
            public Enumeration getFieldNames() {
                return Collections.enumeration(requestHeaders.keySet());
            }

            @Override
            public String getField(String name) {
                return requestHeaders.get(name);
            }
        };
        // end mock data

        CaptureNetworkTrafficCommand.clear();

        // entry 1
        CaptureNetworkTrafficCommand.Entry entry = new CaptureNetworkTrafficCommand.Entry("GET", "http://example.com/index.html");
        entry.setStart(start);
        entry.finish(404, 1234);
        entry.setEnd(end);
        entry.addRequestHeaders(req);
        entry.addResponseHeader(res);
        CaptureNetworkTrafficCommand.capture(entry);

        // entry 2
        entry = new CaptureNetworkTrafficCommand.Entry("GET", "http://example.com/index2.html?foo=\"bar\"");
        entry.setStart(start);
        entry.finish(200, 1234);
        entry.setEnd(end);
        entry.addRequestHeaders(req);
        entry.addResponseHeader(res);
        CaptureNetworkTrafficCommand.capture(entry);

        // entry 3
        entry = new CaptureNetworkTrafficCommand.Entry("GET", "http://example.com/index3.html?foo='bar'");
        entry.setStart(start);
        entry.finish(302, 1234);
        entry.setEnd(end);
        requestHeaders.put("'\"special\nchar\"'", "today's\ntest \"is\"\n<great>!");
        entry.addRequestHeaders(req);
        entry.addResponseHeader(res);
        CaptureNetworkTrafficCommand.capture(entry);
    }
}
