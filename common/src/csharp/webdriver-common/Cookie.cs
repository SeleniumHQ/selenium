using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{

    public class Cookie
    {
        protected String name;
        protected String value;
        protected String path;
        protected String domain;
        protected DateTime expiry = DateTime.MinValue;

        public Cookie(String name, String value, String path, String domain, DateTime expiry)
        {
            this.name = name;
            this.value = value;
            this.path = path;
            this.domain = domain;
            this.expiry = expiry;
            Validate();
        }

        public Cookie(String name, String value, String path, String domain)
            : this(name, value, path, domain, DateTime.MinValue)
        {
        }

        public Cookie(String name, String value)
            : this(name, value, "/", "")
        {

        }

        public override String ToString()
        {
            return name + "=" + value
                + (expiry.Equals(DateTime.MinValue) ? "" : "; expires=" + expiry.ToLongDateString())
                    + ("".Equals(path) ? "" : "; path=" + path);
                    //+ ("".Equals(domain) ? "" : "; domain=" + domain);
            //                + (isSecure ? ";secure;" : "");
        }

        protected void Validate()
        {
            if (name == null || "".Equals(name) || value == null || path == null)
                throw new ArgumentOutOfRangeException("Required attributes are not set or " +
                        "any non-null attribute set to null");

            if (name.IndexOf(';') != -1)
                throw new ArgumentOutOfRangeException(
                        "Cookie names cannot contain a ';': " + name);
        }

        /**
         *  Two cookies are equal if the name and value match
         */
        public override bool Equals(Object o)
        {
            if (this == o)
            {
                return true;
            }
            if (!(o is Cookie))
            {
                return false;
            }

            Cookie cookie = (Cookie)o;

            if (!name.Equals(cookie.name))
            {
                return false;
            }
            return !(value != null ? !value.Equals(cookie.value) : cookie.Value != null);
        }

        public override int GetHashCode()
        {
            return name.GetHashCode();
        }

        public String Name
        {
            get { return name; }
        }

        public String Value
        {
            get { return value; }
        }

        public String Domain
        {
            get { return domain; }
        }

        public String Path
        {
            get { return path; }
        }

        public virtual bool Secure
        {
            get { return false; } 
        }
    }
}
