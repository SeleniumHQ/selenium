package org.openqa.selenium.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.mortbay.http.HttpResponse;
import org.mortbay.util.IO;

public class InjectionHelper {
    private static HashMap<String, HashMap<String, String>> jsStateInitializersBySessionId = new HashMap<String, HashMap<String,String>>();
    private static HashMap<String, String> userContentTransformations = new HashMap<String, String>();
    private static List<String> userJsInjectionFiles = new LinkedList<String>(); 
    
    public static void saveJsStateInitializer(String sessionId, String uniqueId, String jsVarName, String jsStateInitializer) {
        if (SeleniumServer.isDebugMode()) {
            System.out.println("Saving JavaScript state for session " + sessionId + "/" + uniqueId + " " + jsVarName + ": " + jsStateInitializer); 
        }
        if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
            jsStateInitializersBySessionId.put(sessionId, new HashMap<String, String>());
        }
        HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
        StringBuffer sb = new StringBuffer("if (uniqueId!='");
        sb.append(uniqueId)
            .append("') {")
            .append(jsStateInitializer)
            .append("}");
        h.put(jsVarName, sb.toString());
    }
    
    public static String restoreJsStateInitializer(String sessionId, String uniqueId) {
        if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
            return "";
        }
        HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
        if (h.isEmpty()) {
            return "";
        }
        StringBuffer sb = new StringBuffer();
        for (String jsVarName: h.keySet()) {
            String jsStateInitializer = h.get(jsVarName);
            sb.append(jsStateInitializer)
            .append('\n');
            if (SeleniumServer.isDebugMode()) {
                System.out.println("Restoring JavaScript state for session " + sessionId + "/" + uniqueId 
                        + ": key=" + jsVarName + ": " + jsStateInitializer); 
            }
        }
        return sb.toString();
    }
    
    public static void injectJavaScript(SeleniumServer seleniumServer, boolean isKnownToBeHtml, HttpResponse response, InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[8192];
        int len = in.read(buf);
        if (len == -1) {
            return;
        }
        String data = new String(buf, 0, len);
        if (!isKnownToBeHtml) {
            Pattern regexp = Pattern.compile("<\\s*(html|frameset|head|body|table)", 
                    Pattern.CASE_INSENSITIVE);  
            isKnownToBeHtml = regexp.matcher(data).find();
        }
        boolean isFrameSet = false;
        if (!isKnownToBeHtml) {
            out.write(buf, 0, len);
        }
        else {
            Pattern regexp = Pattern.compile("<\\s*frameset", 
                     Pattern.CASE_INSENSITIVE);  
            isFrameSet = regexp.matcher(data).find();
            if (isFrameSet) {
                // JavaScript inserted at the end of an HTML file is executed on load *unless*
                // the file is a frame set.  In that case, only by means of the onload hook can 
                // we execute.
                data = usurpOnUnloadHook(data, "runTest");
            }
        }
        String proxyHost = "localhost";
        int proxyPort = SeleniumServer.getPortDriversShouldContact();
        String sessionId = SeleniumDriverResourceHandler.getLastSessionId();
        
        if (isKnownToBeHtml) {
            response.removeField("Content-Length"); // added js will make it wrong, lead to page getting truncated 
            
            String injectionHtml = isFrameSet ? "/core/scripts/injection.html" : "/core/scripts/injection_iframe.html";
            InputStream jsIn = new ClassPathResource(injectionHtml).getInputStream();
            if (isFrameSet) {
                out.write(makeJsChunk("var isFrameset = true;\n"));
            }
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            if (isFrameSet) {
                // TODO: explain why different
                out.write(setSomeJsVars(sessionId));
            }
            jsIn.close();
            out.write(data.getBytes());
        }           
        IO.copy(in, out);
            
        if (isKnownToBeHtml && !isFrameSet) {
            InputStream jsIn = new ClassPathResource("/core/scripts/injectionAtEOF.html").getInputStream();
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            out.write(setSomeJsVars(sessionId));
            jsIn.close();
        }
    }
    
    private static byte[] setSomeJsVars(String sessionId) {
        StringBuffer moreJs = new StringBuffer();
        if (SeleniumServer.isDebugMode()) {
            moreJs.append("debugMode = true;\n");
        }
        moreJs.append("injectedSessionId = ")
            .append(sessionId)
            .append(";\n");
        return makeJsChunk(moreJs.toString());
    }

    private static String usurpOnUnloadHook(String data, String string) {
        Pattern framesetAreaRegexp = Pattern.compile("(<\\s*frameset.*?>)", Pattern.CASE_INSENSITIVE);
        Matcher framesetMatcher = framesetAreaRegexp.matcher(data);
        if (!framesetMatcher.find()) {
            System.out.println("WARNING: looked like a frameset, but couldn't retrieve the frameset area");
            return data;
        }
        String onloadRoutine = "selenium_frameRunTest()";
        String frameSetText = framesetMatcher.group(1);
        Pattern onloadRegexp = Pattern.compile("onload='(.*?)'", Pattern.CASE_INSENSITIVE);
        Matcher onloadMatcher = onloadRegexp.matcher(frameSetText);
        if (!onloadMatcher.find()) {
            onloadRegexp = Pattern.compile("onload=\"(.*?)\"", Pattern.CASE_INSENSITIVE); // try double quotes
            onloadMatcher = onloadRegexp.matcher(frameSetText);
        }
        if (onloadMatcher.find()) {
            String oldOnloadRoutine = onloadMatcher.group(1);
            frameSetText = onloadMatcher.replaceFirst("");
            String escapedOldOnloadRoutine = null;
            try {
                escapedOldOnloadRoutine = URLEncoder.encode(oldOnloadRoutine, "UTF-8");
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException("could not handle " + oldOnloadRoutine + ": " + e);
            }
            onloadRoutine = "selenium_frameRunTest(unescape('" + escapedOldOnloadRoutine  + "'))";
        }
        
        // either there was no existing onload, or it's been stripped out
        Pattern framesetTagRegexp = Pattern.compile("<\\s*frameset", Pattern.CASE_INSENSITIVE);
        frameSetText = framesetTagRegexp.matcher(frameSetText).replaceFirst("<frameset onload=\"" + onloadRoutine + "\"");
        data = framesetMatcher.replaceFirst(frameSetText);
        return data;
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

    public static void addUserContentTransformation(String before, String after ) {
        userContentTransformations.put(before, after);
    }
    
    public static void addUserJsInjectionFile(String fileName) {
        userJsInjectionFiles.add(fileName);
    }
}
