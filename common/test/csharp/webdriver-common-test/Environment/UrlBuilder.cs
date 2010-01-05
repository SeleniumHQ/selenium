using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Environment
{
    public class UrlBuilder
    {
        string protocol;
        string hostName;
        string port;
        string path;
        string alternateHostName;

        public string AlternateHostName
        {
            get { return alternateHostName; }
        }

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
            alternateHostName = System.Net.Dns.GetHostEntry(hostName).AddressList[0].ToString();
        }

        public string WhereIs(string page)
        {
            // TODO(andre.nogueira): Is it a problem if folder==""?
            return protocol + "://" + hostName + ":" + port + "/" + path + "/" + page;
        }

        public string WhereElseIs(string page)
        {
            return protocol + "://" + alternateHostName + ":" + port + "/" + path + "/" + page;
        }
    }
}
