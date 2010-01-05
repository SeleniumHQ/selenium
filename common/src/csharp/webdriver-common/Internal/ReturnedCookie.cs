using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;

namespace OpenQA.Selenium.Internal
{
    public class ReturnedCookie : Cookie
    {
        private string currentHost;

        public ReturnedCookie(string name, string value, string domain, string path, DateTime? expiry, bool isSecure, string currentUrl)
            : base(name, value, domain, path, expiry)
        {
            this.isSecure = isSecure;
            if (!string.IsNullOrEmpty(currentUrl))
            {
                try
                {
                    this.currentHost = new Uri(currentUrl).Host;
                }
                catch (UriFormatException e)
                {
                    throw new WebDriverException("Couldn't convert currentUrl to URI, which should be impossible!", e);
                }
            }
            Validate();
        }

        bool isSecure;

        protected override void Validate()
        {
            base.Validate();

            string currentDomain = Domain;

            if (!string.IsNullOrEmpty(currentDomain))
            {
                try
                {
                    string domainToUse = currentDomain.StartsWith("http") ? currentDomain : "http://" + currentDomain;
                    Uri url = new Uri(domainToUse);
                    System.Net.Dns.GetHostEntry(url.Host);
                }
                catch (UriFormatException e)
                {
                    throw new ArgumentException(string.Format("URL not valid: {0}", currentDomain));
                }
                catch (SocketException e)
                {
                    // Domains must not be resolvable - it is perfectly valid for a domain not to
                    // have an IP address - hence, just throwing is incorrect. As a safety measure,
                    // check to see if the domain is a part of the fqdn of the local host - this will
                    // make sure some tests in CookieImplementationTest will pass.
                    if (currentHost == null || !currentHost.Contains(currentDomain))
                    {
                        throw new ArgumentException(String.Format("Domain unknown: {0}", currentDomain));
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
                + (Expiry == null ? string.Empty : "; expires=" + Expiry.Value.ToLongDateString())
                    + (string.IsNullOrEmpty(Path) ? string.Empty : "; path=" + Path)
                    + (string.IsNullOrEmpty(Domain) ? string.Empty : "; domain=" + Domain)
                    + (isSecure ? ";secure;" : "");
        }
    }
}
