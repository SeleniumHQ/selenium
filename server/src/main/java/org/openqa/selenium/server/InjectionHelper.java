package org.openqa.selenium.server;

import java.io.File;
import java.io.FileInputStream;
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
    private static HashMap<String, String> sessionIdToUniqueId = new HashMap<String, String>();
    
    private static HashMap<String, String> userContentTransformations = new HashMap<String, String>();
    private static List<String> userJsInjectionFiles = new LinkedList<String>(); 
    
    public static void saveJsStateInitializer(String sessionId, String uniqueId, String jsVarName, String jsStateInitializer) {
        // when a new uniqueId is seen for a given sessionId, that means the page has 
        // reloaded and the old state should be discarded
        if (sessionIdToUniqueId.containsKey(sessionId) && !sessionIdToUniqueId.get(sessionId).equals(uniqueId)) {
            jsStateInitializersBySessionId.remove(sessionId);
            sessionIdToUniqueId.put(sessionId, uniqueId);
        }
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
	    int len = 8192;
        byte[] buf = new byte[len];
        len = readStream(in, buf, len);
        if (len == -1) {
            return;
        }
        String data = new String(buf, 0, len);
        if (!isKnownToBeHtml) {
            Pattern regexp = Pattern.compile("<\\s*(html|frameset|head|body)",
                                             Pattern.CASE_INSENSITIVE);
            isKnownToBeHtml = regexp.matcher(data).find();
        }
        boolean isFrameSet = false;
        String url = response.getHttpRequest().getRequestURL().toString();
        if (SeleniumServer.getDebugURL().equals(url)) {
            System.out.println("debug URL seen");
        }
       
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

        
        if (SeleniumServer.isDebugMode()) {
            System.out.println(url + " (InjectionHelper looking)");
        }
        if (!isKnownToBeHtml) {
            IO.copy(in, out);
        }
        else {
            if (SeleniumServer.isDebugMode()) {
                System.out.println("injecting...");
            }
            response.removeField("Content-Length"); // added js will make it wrong, lead to page getting truncated

            String injectionHtml = isFrameSet ? "/core/scripts/injection.html" : "/core/scripts/injection_iframe.html";
            InputStream jsIn = new ClassPathResource(injectionHtml).getInputStream();
            if (isFrameSet) {
                out.write(makeJsChunk("var isFrameset = true;\n"));
            }
            out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
            if (isFrameSet) {
                // Some background on the code below: broadly speaking, how we inject the JavaScript
                // when running in proxy injection mode depends on whether we are in a frame set file or not.
                //
                // In regular HTML files, the selenium JavaScript is injected into an iframe called "selenium"
                // in order to reduce its impact on the JavaScript environment (through namespace pollution,
                // etc.).  So in regular HTML files, we need to look at the parent of the current window when we want
                // a handle to, e.g., the application window.
                //
                // In frame set files, JavaScript inserted at EOF will be ignored, so everything must go into the head.
                out.write(setSomeJsVars(sessionId));
            }
            jsIn.close();
            writeDataWithUserTransformations(data, in, out);
            if (!isFrameSet) {
                jsIn = new ClassPathResource("/core/scripts/injectionAtEOF.html").getInputStream();
                out.write(getJsWithSubstitutions(jsIn, proxyHost, proxyPort, sessionId));
                out.write(setSomeJsVars(sessionId));
                jsIn.close();
                
                for (String filename : userJsInjectionFiles) {
                    jsIn = new FileInputStream(filename);
                    IO.copy(jsIn, out); 
                }
            }
        }
    }
            
    /**
     * read bufLen bytes into buf (unless EOF is seen first) from in.
     * @param in
     * @param buf
     * @param bufLen
     * @return number of bytes read
     * @throws IOException
     */
    private static int readStream(InputStream in, byte[] buf, int bufLen) throws IOException {
        int offset = 0;
        do {
            int bytesRead = in.read(buf, offset, bufLen - offset);
            if (bytesRead==-1) {
                break;
            }
            offset += bytesRead;
        } while (offset < bufLen);
        int bytesReadTotal = offset;
        return bytesReadTotal;
    }

    private static void writeDataWithUserTransformations(String data, InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[8192];
        while (true) {
            for (String beforeRegexp : userContentTransformations.keySet()) {
                String after = userContentTransformations.get(beforeRegexp);
                data = data.replaceAll(beforeRegexp, after);
            }
            
            out.write(data.getBytes());
            int len = in.read(buf);
            if (len == -1) {
                return;
            }
            data = new String(buf, 0, len);
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

    public static boolean addUserContentTransformation(String before, String after ) {
        userContentTransformations.put(before, after);
        return true;
    }
    
    public static boolean addUserJsInjectionFile(String fileName) {
        File f = new File(fileName);
        if (!f.canRead()) {
            System.out.println("Error: cannot read user JavaScript injection file " + fileName);
            return false;
        }
        userJsInjectionFiles.add(fileName);
        return true;
    }

    public static boolean userContentTransformationsExist() {
        return !userContentTransformations.isEmpty();
    }

    public static boolean userJsInjectionsExist() {
        return !userJsInjectionFiles.isEmpty();
    }
}
