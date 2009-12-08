using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public class ReturnedCookie : Cookie
    {
        public ReturnedCookie(String name, String value, String path, String domain, DateTime expiry, bool isSecure)
            : base(name, value, domain, path, expiry)
        {
            this.isSecure = isSecure;
            Validate();
        }

        bool isSecure;

        public override bool Secure
        {
            get { return isSecure; }
        }

        public override String ToString()
        {
            return name + "=" + value
                + (expiry.Equals(DateTime.MinValue) ? "" : "; expires=" + expiry.ToLongDateString())
                    + ("".Equals(path) ? "" : "; path=" + path)
                    + ("".Equals(domain) ? "" : "; domain=" + domain)
                    + (isSecure ? ";secure;" : "");
        }
    }
}
