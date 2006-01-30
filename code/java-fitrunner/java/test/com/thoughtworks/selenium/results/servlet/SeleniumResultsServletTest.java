package com.thoughtworks.selenium.results.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Locale;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import junit.framework.TestCase;

import com.thoughtworks.selenium.results.servlet.SeleniumResultsServlet;
import com.thoughtworks.selenium.results.servlet.TestResults;

public class SeleniumResultsServletTest extends TestCase {

	public void testPostedResultsCreateTestResultsObject() throws Exception {
		SeleniumResultsServlet servlet = new SeleniumResultsServlet();

		MockServletRequest mockRequest = new MockServletRequest();
        
        String result = "Failed";
        String totalTime = "1:00:00";
        String numTestPasses = "1";
        String numTestFailures = "2";
        String numCommandPasses = "10";
        String numCommandFailures = "20";
        String numCommandErrors = "15";
        String suite = "the test suite";
        String testTable1 = "%3Ctest%3E";
        
        Map parameterMap = new HashMap();
        parameterMap.put("result", result);
        parameterMap.put("totalTime", totalTime);
        parameterMap.put("numTestPasses", numTestPasses);
        parameterMap.put("numTestFailures", numTestFailures);
        parameterMap.put("numCommandPasses", numCommandPasses);
        parameterMap.put("numCommandFailures", numCommandFailures);
        parameterMap.put("numCommandErrors", numCommandErrors);
        parameterMap.put("suite", suite);
        parameterMap.put("testTable.1", testTable1);
        parameterMap.put("testTable.2", testTable1);
        parameterMap.put("testTable.3", testTable1);

        
        mockRequest.setParameters(parameterMap);
        
        servlet.doPost(mockRequest, new MockServletResponse());
        
        TestResults testResults = SeleniumResultsServlet.getResults();

        assertEquals("Failed", testResults.getResult());
        assertEquals(3, testResults.getNumTotalTests());
        assertEquals("the test suite", testResults.getDecodedTestSuite());
        assertEquals("<test>", testResults.getDecodedTestTables().get(0));
        assertEquals("<test>", testResults.getDecodedTestTables().get(1));
        assertEquals("<test>", testResults.getDecodedTestTables().get(2));
        
	}
    
    public void testGetWithClearParameterClearsResults() throws Exception {

        MockServletRequest mockServletRequest = new MockServletRequest();

        Map parameterMap = new HashMap();
        parameterMap.put("clear", "true");
        
        mockServletRequest.setParameters(parameterMap);

        SeleniumResultsServlet servlet = new SeleniumResultsServlet();
        SeleniumResultsServlet.setResults(
                new TestResults("a", "a", "a", "a", "a", "a", "a", "a", new LinkedList()));
        servlet.doGet(mockServletRequest, new MockServletResponse());
        
        assertNull(SeleniumResultsServlet.getResults());
        
    }
	
    private class MockServletResponse implements HttpServletResponse {

        public void addCookie(Cookie arg0) {
        }

        public boolean containsHeader(String arg0) {
            return false;
        }

        public String encodeURL(String arg0) {
            return null;
        }

        public String encodeRedirectURL(String arg0) {
            return null;
        }

        public String encodeUrl(String arg0) {
            return null;
        }

        public String encodeRedirectUrl(String arg0) {
            return null;
        }

        public void sendError(int arg0, String arg1) throws IOException {
        }

        public void sendError(int arg0) throws IOException {
        }

        public void sendRedirect(String arg0) throws IOException {
        }

        public void setDateHeader(String arg0, long arg1) {
        }

        public void addDateHeader(String arg0, long arg1) {
        }

        public void setHeader(String arg0, String arg1) {
        }

        public void addHeader(String arg0, String arg1) {
        }

        public void setIntHeader(String arg0, int arg1) {
        }

        public void addIntHeader(String arg0, int arg1) {
        }

        public void setStatus(int arg0) {
        }

        public void setStatus(int arg0, String arg1) {
        }

        public String getCharacterEncoding() {
            return null;
        }

        public ServletOutputStream getOutputStream() throws IOException {
            return new ServletOutputStream() {
            
                public void println(String arg0) throws IOException {
                    super.println(arg0);
                }

                public void write(int b) throws IOException {
                }
            };
        }

        public PrintWriter getWriter() throws IOException {
            return null;
        }

        public void setContentLength(int arg0) {
        }

        public void setContentType(String arg0) {
        }

        public void setBufferSize(int arg0) {
        }

        public int getBufferSize() {
            return 0;
        }

        public void flushBuffer() throws IOException {
        }

        public void resetBuffer() {
        }

        public boolean isCommitted() {
            return false;
        }

        public void reset() {
        }

        public void setLocale(Locale arg0) {
        }

        public Locale getLocale() {
            return null;
        }
        
    }
	private class MockServletRequest implements HttpServletRequest {

        Map parameters = new HashMap();
        
        public void setParameters(Map map) {
            parameters = map;
        }
        
        public String getAuthType() {
            return null;
        }

        public Cookie[] getCookies() {
            return null;
        }

        public long getDateHeader(String arg0) {
            return 0;
        }

        public String getHeader(String arg0) {
            return null;
        }

        public Enumeration getHeaders(String arg0) {
            return null;
        }

        public Enumeration getHeaderNames() {
            return null;
        }

        public int getIntHeader(String arg0) {
            return 0;
        }

        public String getMethod() {
            return null;
        }

        public String getPathInfo() {
            return null;
        }

        public String getPathTranslated() {
            return null;
        }

        public String getContextPath() {
            return null;
        }

        public String getQueryString() {
            return null;
        }

        public String getRemoteUser() {
            return null;
        }

        public boolean isUserInRole(String arg0) {
            return false;
        }

        public Principal getUserPrincipal() {
            return null;
        }

        public String getRequestedSessionId() {
            return null;
        }

        public String getRequestURI() {
            return null;
        }

        public StringBuffer getRequestURL() {
            return null;
        }

        public String getServletPath() {
            return null;
        }

        public HttpSession getSession(boolean arg0) {
            return null;
        }

        public HttpSession getSession() {
            return null;
        }

        public boolean isRequestedSessionIdValid() {
            return false;
        }

        public boolean isRequestedSessionIdFromCookie() {
            return false;
        }

        public boolean isRequestedSessionIdFromURL() {
            return false;
        }

        public boolean isRequestedSessionIdFromUrl() {
            return false;
        }

        public Object getAttribute(String arg0) {
            return null;
        }

        public Enumeration getAttributeNames() {
            return null;
        }

        public String getCharacterEncoding() {
            return null;
        }

        public void setCharacterEncoding(String arg0) throws UnsupportedEncodingException {
        }

        public int getContentLength() {
            return 0;
        }

        public String getContentType() {
            return null;
        }

        public ServletInputStream getInputStream() throws IOException {
            return null;
        }

        public String getParameter(String arg0) {
            return (String) parameters.get(arg0);
        }

        public Enumeration getParameterNames() {
            return null;
        }

        public String[] getParameterValues(String arg0) {
            return null;
        }

        public Map getParameterMap() {
            return null;
        }

        public String getProtocol() {
            return null;
        }

        public String getScheme() {
            return null;
        }

        public String getServerName() {
            return null;
        }

        public int getServerPort() {
            return 0;
        }

        public BufferedReader getReader() throws IOException {
            return null;
        }

        public String getRemoteAddr() {
            return null;
        }

        public String getRemoteHost() {
            return null;
        }

        public void setAttribute(String arg0, Object arg1) {
        }

        public void removeAttribute(String arg0) {
        }

        public Locale getLocale() {
            return null;
        }

        public Enumeration getLocales() {
            return null;
        }

        public boolean isSecure() {
            return false;
        }

        public RequestDispatcher getRequestDispatcher(String arg0) {
            return new RequestDispatcher() {
            
                public void include(ServletRequest arg0, ServletResponse arg1)
                        throws ServletException, IOException {
                }
            
                public void forward(ServletRequest arg0, ServletResponse arg1)
                        throws ServletException, IOException {
                }
            };
        }

        public String getRealPath(String arg0) {
            return null;
        }
        
    }
}
