using System.Net.Sockets;
using System.Net;

namespace OpenQA.Selenium.Environment
{
    public class UrlBuilder
    {
        string protocol;
        string hostName;
        string port;
        string securePort;
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

        public UrlBuilder(WebsiteConfig config)
        {
            protocol = config.Protocol;
            hostName = config.HostName;
            port = config.Port;
            securePort = config.SecurePort;
            path = config.Folder;
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

        public string LocalWhereIs(string page)
        {
            string location = string.Empty;
            location = "http://localhost:" + port + "/" + path + "/" + page;

            return location;
        }

        public string WhereIs(string page)
        {
            string location = string.Empty;
            location = "http://" + hostName + ":" + port + "/" + path + "/" + page;

            return location;
        }

        public string WhereElseIs(string page)
        {
            string location = string.Empty;
            location = "http://" + alternateHostName + ":" + port + "/" + path + "/" + page;

            return location;
        }

        public string WhereIsSecure(string page)
        {
            string location = string.Empty;
            location = "https://" + hostName + ":" + securePort + "/" + path + "/" + page;

            return location;
        }
    }
}
