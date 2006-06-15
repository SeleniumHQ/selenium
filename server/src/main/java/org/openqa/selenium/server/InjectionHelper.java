package org.openqa.selenium.server;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.regex.Pattern;

import org.mortbay.http.HttpResponse;
import org.mortbay.util.IO;

public class InjectionHelper {
    public static void injectJavaScript(SeleniumServer seleniumServer, boolean isKnownToBeHtml, HttpResponse response, InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[1024];
        int len = in.read(buf);
        if (len == -1) {
            return;
        }
        if (!isKnownToBeHtml) {
            String data = new String(buf);
            Pattern regexp = Pattern.compile("<\\s*(html|head|body|table)", 
                    Pattern.CASE_INSENSITIVE);  
            isKnownToBeHtml = regexp.matcher(data).find(); 
        }
        String proxyHost = "localhost";
        int proxyPort = SeleniumServer.getProxyInjectionPort();
        String sessionId = SeleniumDriverResourceHandler.getLastSessionId();
        
        if (isKnownToBeHtml) {
            response.removeField("Content-Length"); // added js will make it wrong, lead to page getting truncated 
            
            // TODO: read these files as resources off of the class path (getting them off disk for now so I don't need to restart the server for updates)
            InputStream jsIn = new FileInputStream("../../core/javascript/core/scripts/injection.html");//  new ClassPathResource("/core/scripts/injection.html")
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            jsIn.close();
        }           
        out.write(buf, 0, len);
        IO.copy(in, out);
            
        if (isKnownToBeHtml) {
//           TODO: read these files as resources off of the class path (getting them off disk for now so I don't need to restart the server for each update)
            InputStream jsIn = new FileInputStream("../../core/javascript/core/scripts/injectionAtEOF.html");//  new ClassPathResource("/core/scripts/injection.html")
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            if (SeleniumServer.isDebugMode()) {
                out.write(makeJsChunk("debugMode = true;"));
            }
            jsIn.close();
        }
    }
    
    private static byte[] makeJsChunk(String js) {
        StringBuffer sb = new StringBuffer("\n<script language=\"JavaScript\">\n");
        sb.append(js)
        .append("\n</script>\n");
        return sb.toString().getBytes();
    }

    private static byte[] getJsWithSubstitutions(InputStream jsIn, String proxyHost, int proxyPort, String sessionId) throws IOException {
        if (jsIn.available()==0) {
            throw new RuntimeException("cannot read injected JavaScript stream");
        }
        byte[] buf = new byte[8192];
        StringBuffer sb = new StringBuffer();
        while(true) {
            int len = jsIn.read(buf);
            if (len <= 0) {
                break;
            }
            sb.append(new String(buf, 0, len, "UTF-8"));
        }
        
        if (sessionId==null) {
            sessionId = "uninitialized";
        }

        sessionId = "\"" + sessionId + "\"";
        
        
        String js = sb.toString(); 
        js = js.replaceAll("@SESSION_ID@", sessionId);
        
        return js.getBytes();   
    }
}
