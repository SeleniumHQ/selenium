using System;
using System.Net;
using System.Diagnostics;

namespace OpenQA.Selenium.Environment
{
    public class TestWebServer
    {
        private Process webserverProcess;
        private string[] classPath = {
            @"build\common\common.jar",
            @"build\common\test.jar",
            @"third_party\java\apache-httpclient\httpclient-4.0.2.jar",
            @"third_party\java\apache-httpclient\httpcore-4.0.1.jar",
            @"third_party\java\apache-httpclient\httpmime-4.0.1.jar",
            @"third_party\java\apache-mime4j\apache-mime4j-0.6.jar",
            @"third_party\java\cglib\cglib-nodep-2.1_3.jar",
            @"third_party\java\commons-codec\commons-codec-1.4.jar",
            @"third_party\java\commons-collections\commons-collections-3.2.1.jar",
            @"third_party\java\commons-el\commons-el-1.0.jar",
            @"third_party\java\commons-io\commons-io-1.4.jar",
            @"third_party\java\commons-lang\commons-lang-2.4.jar",
            @"third_party\java\commons-logging\commons-logging-1.1.1.jar",
            @"third_party\java\guava-libraries\guava-r06.jar",
            @"third_party\java\hamcrest\hamcrest-all-1.1.jar",
            @"third_party\java\jasper\jasper-compiler-5.5.15.jar",
            @"third_party\java\jasper\jasper-compiler-jdt-5.5.15.jar",
            @"third_party\java\jasper\jasper-runtime-5.5.15.jar",
            @"third_party\java\jasper\jsp-api-2.0.jar",
            @"third_party\java\jetty\jetty-continuation-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-http-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-io-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-security-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-server-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-servlet-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-servlets-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-util-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-webapp-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-websocket-7.2.0.v20101020.jar",
            @"third_party\java\jetty\jetty-xml-7.2.0.v20101020.jar",
            @"third_party\java\jmock\jmock-2.4.0.jar",
            @"third_party\java\jmock\jmock-junit3-2.4.0.jar",
            @"third_party\java\jna\jna.jar",
            @"third_party\java\json\json-20080701.jar",
            @"third_party\java\junit\junit-dep-4.8.1.jar",
            @"third_party\java\servlet-api\servlet-api-2.5-6.1.9.jar",
            @"third_party\java\slf4j\jcl104-over-slf4j-1.3.1.jar",
            @"third_party\java\slf4j\slf4j-api-1.3.1.jar",
            @"third_party\java\slf4j\slf4j-simple-1.3.1.jar"
        };

        private string webserverClassName = "org.openqa.selenium.environment.webserver.Jetty7AppServer";
        private string projectRootPath;

        public TestWebServer(string projectRoot)
        {
            projectRootPath = projectRoot;
        }

        public void Start()
        {
            if (webserverProcess == null || webserverProcess.HasExited)
            {
                webserverProcess = new Process();
                webserverProcess.StartInfo.FileName = "java.exe";
                webserverProcess.StartInfo.Arguments = "-cp " + string.Join(";", classPath) + " " + webserverClassName;
                webserverProcess.StartInfo.WorkingDirectory = projectRootPath;
                webserverProcess.Start();
                DateTime timeout = DateTime.Now.Add(TimeSpan.FromSeconds(30));
                bool isRunning = false;
                while (!isRunning && DateTime.Now < timeout)
                {
                    // Poll until the webserver is correctly serving pages.
                    HttpWebRequest request = WebRequest.Create(EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html")) as HttpWebRequest;
                    try
                    {
                        HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                        if (response.StatusCode == HttpStatusCode.OK)
                        {
                            isRunning = true;
                        }
                    }
                    catch (WebException)
                    {
                    }
                }

                if (!isRunning)
                {
                    throw new TimeoutException("Could not start the test web server in 15 seconds");
                }
            }
        }

        public void Stop()
        {
            HttpWebRequest request = WebRequest.Create(EnvironmentManager.Instance.UrlBuilder.WhereIs("quitquitquit")) as HttpWebRequest;
            try
            {
                request.GetResponse();
            }
            catch (WebException)
            {
            }

            if (webserverProcess != null)
            {
                webserverProcess.WaitForExit(10000);
                if (!webserverProcess.HasExited)
                {
                    webserverProcess.Kill();
                }

                webserverProcess.Dispose();
                webserverProcess = null;
            }
        }
    }
}
