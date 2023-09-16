using System.Net.Sockets;
using System.Net;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text;
using System.IO;

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

        public string WhereIsViaNonLoopbackAddress(string page)
        {
            string hostNameAsIPAddress = "127.0.0.1";
            IPAddress[] addresses = Dns.GetHostAddresses(Dns.GetHostName());
            foreach (IPAddress address in addresses)
            {
                if (address.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(address))
                {
                    hostNameAsIPAddress = address.ToString();
                    break;
                }
            }

            string location = string.Empty;
            location = "http://" + hostNameAsIPAddress + ":" + port + "/" + path + "/" + page;

            return location;
        }

        public string WhereIsSecure(string page)
        {
            string location = string.Empty;
            location = "https://" + hostName + ":" + securePort + "/" + path + "/" + page;

            return location;
        }
        public string CreateInlinePage(InlinePage page)
        {
            Uri createPageUri = new Uri(new Uri(WhereIs(string.Empty)), "createPage");
            Dictionary<string, object> payloadDictionary = new Dictionary<string, object>();
            payloadDictionary["content"] = page.ToString();
            string commandPayload = JsonConvert.SerializeObject(payloadDictionary);
            byte[] data = Encoding.UTF8.GetBytes(commandPayload);

            HttpWebRequest request = HttpWebRequest.Create(createPageUri) as HttpWebRequest;
            request.Method = "POST";
            request.ContentType = "application/json;charset=utf8";
            request.ServicePoint.Expect100Continue = false;
            Stream requestStream = request.GetRequestStream();
            requestStream.Write(data, 0, data.Length);
            requestStream.Close();

            HttpWebResponse response = request.GetResponse() as HttpWebResponse;
            // StreamReader.Close also closes the underlying stream.
            Stream responseStream = response.GetResponseStream();
            StreamReader responseStreamReader = new StreamReader(responseStream, Encoding.UTF8);
            string responseString = responseStreamReader.ReadToEnd();
            responseStreamReader.Close();

            // The response string from the Java remote server has trailing null
            // characters. This is due to the fix for issue 288.
            if (responseString.IndexOf('\0') >= 0)
            {
                responseString = responseString.Substring(0, responseString.IndexOf('\0'));
            }

            if (responseString.Contains("localhost"))
            {
                responseString = responseString.Replace("localhost", this.hostName);
            }

            return responseString;
        }
    }
}
