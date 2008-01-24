package org.openqa.selenium;

import java.io.InputStream;
import java.net.URL;

public class TestReporter {
    public static String getOs() {
        String name = System.getProperty("os.name");
        String version = System.getProperty("os.version");

        if (name.equals("Windows XP")) {
            return "XP";
        }

        if (name.equals("Windows Vista")) {
            return "VISTA";
        }

        if (name.equals("Mac OS X")) {
            if (version.startsWith("10.5")) {
                return "LEOPARD";
            }

            if (version.startsWith("10.4")) {
                return "TIGER";
            }
        }

        return "UNKNOWN";
    }

    public static void pass(String name) {
        report(name, "pass");
    }

    public static void fail(String name) {
        report(name, "fail");
    }

    public static void skip(String name) {
        report(name, "skip");
    }

    public static void report(String name, boolean pass) {
        report(name, pass ? "pass" : "fail");
    }

    public static void report(String name, String result) {
        String os = getOs();
        String browser = System.getProperty("browser", "FIREFOX2");

        name = name.replaceAll(" ", "+");

        try {
            StringBuilder sb = new StringBuilder();
            sb.append("http://selenium-rc.openqa.org/report_test.jsp?");
            sb.append("os=").append(os);
            sb.append("&browser=").append(browser);
            sb.append("&name=").append(name);
            sb.append("&result=").append(result);

            URL url = new URL(sb.toString());
            InputStream is = url.openStream();
            is.read();
            is.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
