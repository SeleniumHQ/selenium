using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{

    public class Cookie
    {
        private string cookieName;
        private string cookieValue;
        private string cookiePath;
        private string cookieDomain;
        private DateTime cookieExpiry = DateTime.MinValue;

        public Cookie(string name, string value, string path, string domain, DateTime expiry)
        {
            this.cookieName = name;
            this.cookieValue = value;
            this.cookiePath = path;
            this.cookieDomain = domain;
            this.cookieExpiry = expiry;
            Validate();
        }

        public Cookie(string name, string value, string path, string domain)
            : this(name, value, path, domain, DateTime.MinValue)
        {
        }

        public Cookie(string name, string value)
            : this(name, value, "/", "")
        {

        }

        public override string ToString()
        {
            return cookieName + "=" + cookieValue
                + (cookieExpiry.Equals(DateTime.MinValue) ? string.Empty : "; expires=" + cookieExpiry.ToLongDateString())
                    + (string.IsNullOrEmpty(cookiePath) ? string.Empty : "; path=" + cookiePath);
                    //+ ("".Equals(domain) ? "" : "; domain=" + domain);
            //                + (isSecure ? ";secure;" : "");
        }

        protected void Validate()
        {
            if (string.IsNullOrEmpty(cookieName) || cookieValue == null || cookiePath == null)
            {
                throw new InvalidOperationException("Required attributes are not set or any non-null attribute set to null");
            }

            if (cookieName.IndexOf(';') != -1)
            {
                throw new InvalidOperationException("Cookie names cannot contain a ';': " + cookieName);
            }
        }

        /**
         *  Two cookies are equal if the name and value match
         */
        public override bool Equals(object obj)
        {
            Cookie cookie = obj as Cookie;

            if (this == obj)
            {
                return true;
            }
            if (cookie == null)
            {
                return false;
            }

            if (!cookieName.Equals(cookie.cookieName))
            {
                return false;
            }
            return !(cookieValue != null ? !cookieValue.Equals(cookie.cookieValue) : cookie.Value != null);
        }

        public override int GetHashCode()
        {
            return cookieName.GetHashCode();
        }

        public String Name
        {
            get { return cookieName; }
        }

        public String Value
        {
            get { return cookieValue; }
        }

        public String Domain
        {
            get { return cookieDomain; }
        }

        public String Path
        {
            get { return cookiePath; }
        }

        public virtual bool Secure
        {
            get { return false; } 
        }

        public DateTime Expiry
        {
            get { return cookieExpiry; }
        }
    }
}
