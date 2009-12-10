using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Internal
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
            return Name + "=" + Value
                + (Expiry.Equals(DateTime.MinValue) ? string.Empty : "; expires=" + Expiry.ToLongDateString())
                    + (string.IsNullOrEmpty(Path) ? string.Empty : "; path=" + Path)
                    + (string.IsNullOrEmpty(Domain) ? string.Empty : "; domain=" + Domain)
                    + (isSecure ? ";secure;" : "");
        }
    }
}
