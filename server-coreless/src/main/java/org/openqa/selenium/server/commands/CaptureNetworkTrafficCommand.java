package org.openqa.selenium.server.commands;

import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;

import java.util.*;

public class CaptureNetworkTrafficCommand extends Command {
    private static List<Entry> entries = new ArrayList<Entry>();

    public static void clear() {
        entries.clear();
    }

    public static void capture(Entry entry) {
        entries.add(entry);
    }

    private String type; // ie: XML, JSON, plain text, etc

    public CaptureNetworkTrafficCommand(String type) {
        this.type = type;
    }

    public String execute() {
        String resp = "OK,TODO:" + entries.toString();

        clear();

        return resp;
    }

    public static class Entry {
        private String method;
        private String url;
        private int statusCode;
        private Date start;
        private Date end;
        private long bytes;
        private List<Header> requestHeaders = new ArrayList<Header>();
        private List<Header> responseHeaders = new ArrayList<Header>();

        public Entry(String method, String url) {
            this.method = method;
            this.url = url;
            this.start = new Date();
        }

        public void finish(int statusCode, long bytes) {
            this.statusCode = statusCode;
            this.bytes = bytes;
            this.end = new Date();
        }

        public void addRequestHeaders(HttpRequest request) {
            Enumeration names = request.getFieldNames();
            while (names.hasMoreElements()) {
                String name = (String) names.nextElement();
                String value = request.getField(name);

                requestHeaders.add(new Header(name, value));
            }
        }

        public void addResponseHeader(HttpResponse response) {
            Enumeration names = response.getFieldNames();
            while (names.hasMoreElements()) {
                String name = (String) names.nextElement();
                String value = response.getField(name);

                responseHeaders.add(new Header(name, value));
            }
        }

        @Override
        public String toString() {
            return method + "|" + statusCode + "|" + url + "|" + requestHeaders.size() + "|" + responseHeaders.size() + "\n";
        }
    }

    public static class Header {
        private String name;
        private String value;

        public Header(String name, String value) {
            this.name = name;
            this.value = value;
        }
    }
}
