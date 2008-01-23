package org.openqa.selenium;

import java.io.InputStream;
import java.net.URL;

public class TestReporter {
    public static void report(String name, boolean pass) {
        String os = "LEOPARD";
        String browser = "FIREFOX2";

        name = name.replaceAll(" ", "+");

        try {
            StringBuilder sb = new StringBuilder();
            sb.append("http://selenium-rc.openqa.org/report_test.jsp?");
            sb.append("os=").append(os);
            sb.append("&browser=").append(browser);
            sb.append("&name=").append(name);
            sb.append("&pass=").append(pass);

            URL url = new URL(sb.toString());
            InputStream is = url.openStream();
            is.read();
            is.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
