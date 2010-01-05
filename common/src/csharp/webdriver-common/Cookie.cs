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
        private DateTime? cookieExpiry = null;

        public Cookie(string name, string value, string domain, string path, DateTime? expiry)
        {
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
            Validate();
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
                + (cookieExpiry == null ? string.Empty : "; expires=" + cookieExpiry.Value.ToString("DDD MM/dd/yyyy hh:mm:ss z"))
                    + (string.IsNullOrEmpty(cookiePath) ? string.Empty : "; path=" + cookiePath)
                    + (string.IsNullOrEmpty(cookieDomain) ? string.Empty : "; domain=" + cookieDomain);
            //                + (isSecure ? ";secure;" : "");
        }

        protected virtual void Validate()
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
