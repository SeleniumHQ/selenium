namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Cookie object
    /// </summary>
    public sealed class Cookie
    {
        /// <summary>
        /// Cookie name.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie value.
        ///</summary>
        [JsonProperty("value")]
        public string Value
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie domain.
        ///</summary>
        [JsonProperty("domain")]
        public string Domain
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie path.
        ///</summary>
        [JsonProperty("path")]
        public string Path
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie expiration date as the number of seconds since the UNIX epoch.
        ///</summary>
        [JsonProperty("expires")]
        public double Expires
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie size.
        ///</summary>
        [JsonProperty("size")]
        public long Size
        {
            get;
            set;
        }
        /// <summary>
        /// True if cookie is http-only.
        ///</summary>
        [JsonProperty("httpOnly")]
        public bool HttpOnly
        {
            get;
            set;
        }
        /// <summary>
        /// True if cookie is secure.
        ///</summary>
        [JsonProperty("secure")]
        public bool Secure
        {
            get;
            set;
        }
        /// <summary>
        /// True in case of session cookie.
        ///</summary>
        [JsonProperty("session")]
        public bool Session
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie SameSite type.
        ///</summary>
        [JsonProperty("sameSite", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public CookieSameSite? SameSite
        {
            get;
            set;
        }
    }
}