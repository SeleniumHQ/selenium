using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;

namespace OpenQA.Selenium
{

    public class Cookie
    {
        private string cookieName;
        private string cookieValue;
        private string cookiePath;
        private string cookieDomain;
        private DateTime? cookieExpiry;

        public Cookie(string name, string value, string domain, string path, DateTime? expiry)
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new ArgumentException("Cookie name cannot be null or empty string", "name");
            }

            if (value == null)
            {
                throw new ArgumentNullException("value", "Cookie value cannot be null");
            }

            if (name.IndexOf(';') != -1)
            {
                throw new ArgumentException("Cookie names cannot contain a ';': " + name, "name");
            }

            this.cookieName = name;
            this.cookieValue = value;
            if (!string.IsNullOrEmpty(path))
            {
                this.cookiePath = path;
            }
            else
            {
                this.cookiePath = "/";
            }
            this.cookieDomain = domain;
            if (expiry != null)
            {
                this.cookieExpiry = expiry;
            }
        }

        public Cookie(string name, string value, string path, DateTime? expiry)
            : this(name, value, null, path, expiry)
        {
        }

        public Cookie(string name, string value)
            : this(name, value, "/", null)
        {

        }

        public Cookie(string name, string value, string path)
            : this(name, value, path, null)
        {
        }

        public override string ToString()
        {
            return cookieName + "=" + cookieValue
                + (cookieExpiry == null ? string.Empty : "; expires=" + cookieExpiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture))
                    + (string.IsNullOrEmpty(cookiePath) ? string.Empty : "; path=" + cookiePath)
                    + (string.IsNullOrEmpty(cookieDomain) ? string.Empty : "; domain=" + cookieDomain);
            //                + (isSecure ? ";secure;" : "");
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

        public string Name
        {
            get { return cookieName; }
        }

        public string Value
        {
            get { return cookieValue; }
        }

        public string Domain
        {
            get { return cookieDomain; }
        }

        public virtual string Path
        {
            get { return cookiePath; }
        }

        public virtual bool Secure
        {
            get { return false; } 
        }

        public DateTime? Expiry
        {
            get { return cookieExpiry; }
        }
    }
}
