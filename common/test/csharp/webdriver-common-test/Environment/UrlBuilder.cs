using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using System.Net;

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
            //Use the first IPv4 address that we find
            IPAddress ipAddress = IPAddress.Parse("127.0.0.1");
            foreach (IPAddress ip in Dns.GetHostEntry(hostName).AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    ipAddress = ip;
                    break;
                }
            }
            alternateHostName = ipAddress.ToString();
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

        public string WhereIsSecure(string page)
        {
            return protocol + "s://" + alternateHostName + ":" + port + "/" + path + "/" + page;
        }
    }
}
