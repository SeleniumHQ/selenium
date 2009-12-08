using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Environment
{
   
    // As of yet we don't need the complexity of the Java bindings' AppServers,
    // as we are not launching the web server.
    // As such I went with a simple UrlBuilder class instead.
    public class UrlBuilder
    {
        string protocol;
        string hostName;
        string port;
        string path;

        public string HostName
        {
            get { return hostName; }
        }

        public string Path
        {
            get { return path; }
        }

        public UrlBuilder()
        {
            protocol = EnvironmentManager.GetSettingValue("Protocol");
            hostName = EnvironmentManager.GetSettingValue("HostName");
            port = EnvironmentManager.GetSettingValue("Port");
            // TODO(andre.nogueira): Remove trailing / from folder
            path = EnvironmentManager.GetSettingValue("Folder");
        }

        public string WhereIs(string page)
        {
            // TODO(andre.nogueira): Is it a problem if folder==""?
            return protocol + "://" + hostName + ":" + port + "/common/" + page;
        }

    }
}
