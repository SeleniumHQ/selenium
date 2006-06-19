package org.openqa.selenium.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.regex.Pattern;

import org.mortbay.http.HttpResponse;
import org.mortbay.util.IO;

public class InjectionHelper {
    private static HashMap<String, HashMap<String, String>> jsStateInitializersBySessionId = new HashMap<String, HashMap<String,String>>();
    
    public static void saveJsStateInitializer(String sessionId, String jsVarName, String jsStateInitializer) {
        if (SeleniumServer.isDebugMode()) {
            System.out.println("Saving JavaScript state for session " + sessionId + ": key=" + jsVarName + ": " + jsStateInitializer); 
        }
        if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
            jsStateInitializersBySessionId.put(sessionId, new HashMap<String, String>());
        }
        HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
        h.put(jsVarName, jsStateInitializer);
    }
    
    public static String restoreJsStateInitializer(String sessionId) {
        if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
            return "";
        }
        HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
        StringBuffer sb = new StringBuffer();
        for (String key : h.keySet()) {
            sb.append(h.get(key))
            .append('\n');
        }
        return sb.toString();
    }
    
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
            
            InputStream jsIn = new ClassPathResource("/core/scripts/injection.html").getInputStream();
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            StringBuffer moreJs = new StringBuffer();
            if (SeleniumServer.isDebugMode()) {
                moreJs.append("debugMode = true;\n");
            }
            moreJs.append("function restoreSeleniumState() {\n")
            .append(restoreJsStateInitializer(sessionId))
            .append("}\n");
            
            out.write(makeJsChunk(moreJs.toString()));
            jsIn.close();
        }           
        out.write(buf, 0, len);
        IO.copy(in, out);
            
        if (isKnownToBeHtml) {
            InputStream jsIn = new ClassPathResource("/core/scripts/injectionAtEOF.html").getInputStream();
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
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
