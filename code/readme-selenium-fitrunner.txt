Selenium Functional Testing Tool
(c) ThoughtWorks, Inc., 2004
- jrhuggins@thoughtworks.com

To run a test suite with just a web browser (no server):

    Open <selenium_home>/javascript/TestRunner.html in your browser.
    Example: file:///C:/selenium/javascript/TestRunner.html


To run a test suite with simple web server:

    1) Launch <selenium_home>/javascript/startWebServer.bat
        (An installation of Python is required. This works with 2.3.4, 
        but hasn't been tested with older versions, yet.)

    2) Open up your browser, then goto the URL: 
        http://localhost:8000/TestRunner.html    
        (If you don't want the web server to run on port 8000, modify
        <selenium_home>\javascript\tinyWebServer.py)

To run a different test suite from the default, use the URL syntax:
   ./TestRunner.html?test={my-test-suite}

Supported Browsers:
    Microsoft Internet Explorer 6.0+
    Mozilla 1.6+
    Mozilla Firefox 0.9.3+

    Other browsers, I'd love to add support for, but havn't yet:
    Opera, Konqueror, and Safari
    
Gotchas:
1) The tinyWebServer included is not meant for production use. It is only
provided to show a simple, working example of Selenium running from a web server.
(TODO- provide instructions for installing in Apache or IIS)

2) The tinyWebServer is only available from localhost (unless you hack the source).
This was done as a security measure.

3) The tests may not complete automatically the first time, because the browser may pop-up alert boxes:
    a) Asking if you want to remember form values (click "No" or "Never for this site")
    b) Warning about security implications about posting data unencrypted.

4) You'll need to whitelist "localhost" in your pop-up blocker, if it is enabled.

