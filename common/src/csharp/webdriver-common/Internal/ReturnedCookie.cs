using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;
using System.Globalization;

namespace OpenQA.Selenium.Internal
{
    public class ReturnedCookie : Cookie
    {
        private string currentHost;

        public ReturnedCookie(string name, string value, string domain, string path, DateTime? expiry, bool isSecure, Uri currentUrl)
            : base(name, value, domain, path, expiry)
        {
            this.isSecure = isSecure;
            if (currentUrl != null)
            {
                this.currentHost = currentUrl.Host;
            }
            else
            {
                throw new ArgumentNullException("currentUrl", "Current URL of ReturnedCookie cannot be null");
            }
            Validate();
        }

        bool isSecure;

        protected void Validate()
        {
            string currentDomain = Domain;

            if (!string.IsNullOrEmpty(currentDomain))
            {
                try
                {
                    string domainToUse = currentDomain.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? currentDomain : "http://" + currentDomain;
                    Uri url = new Uri(domainToUse);
                    System.Net.Dns.GetHostEntry(url.Host);
                }
                catch (UriFormatException)
                {
                    throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "URL not valid: {0}", currentDomain));
                }
                catch (SocketException)
                {
                    // Domains must not be resolvable - it is perfectly valid for a domain not to
                    // have an IP address - hence, just throwing is incorrect. As a safety measure,
                    // check to see if the domain is a part of the fqdn of the local host - this will
                    // make sure some tests in CookieImplementationTest will pass.
                    if (currentHost == null || !currentHost.Contains(currentDomain))
                    {
                        throw new ArgumentException(String.Format(CultureInfo.InvariantCulture, "Domain unknown: {0}", currentDomain));
                    }
                    // no IP - unreasonable in any modern os has localhost address.
                }
            }
        }

        public override bool Secure
        {
            get { return isSecure; }
        }

        public override String ToString()
        {
            return Name + "=" + Value
                + (Expiry == null ? string.Empty : "; expires=" + Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy HH:mm:ss UTC", CultureInfo.InvariantCulture))
                    + (string.IsNullOrEmpty(Path) ? string.Empty : "; path=" + Path)
                    + (string.IsNullOrEmpty(Domain) ? string.Empty : "; domain=" + Domain)
                    + (isSecure ? ";secure;" : "");
        }
    }
}
