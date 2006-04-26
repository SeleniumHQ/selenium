package org.openqa.selenium.server.util;

import java.io.InputStream;
import java.io.IOException;

/**
 * @author <a href="mailto:plightbo@gmail.com">Patrick Lightbody</a>
 */
public class IOUtils {
    public static String read(InputStream is) throws IOException {
        StringBuffer sb = new StringBuffer();
        byte[] buffer = new byte[2048];
        int x;
        while ((x = is.read(buffer)) != -1) {
            sb.append(new String(buffer, 0, x));
        }
        return sb.toString();
    }
}
