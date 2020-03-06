namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
    /// </summary>
    public sealed class SetCookieCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setCookie";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Cookie name.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie value.
        /// </summary>
        [JsonProperty("value")]
        public string Value
        {
            get;
            set;
        }
        /// <summary>
        /// The request-URI to associate with the setting of the cookie. This value can affect the
        /// default domain and path values of the created cookie.
        /// </summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie domain.
        /// </summary>
        [JsonProperty("domain", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Domain
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie path.
        /// </summary>
        [JsonProperty("path", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Path
        {
            get;
            set;
        }
        /// <summary>
        /// True if cookie is secure.
        /// </summary>
        [JsonProperty("secure", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Secure
        {
            get;
            set;
        }
        /// <summary>
        /// True if cookie is http-only.
        /// </summary>
        [JsonProperty("httpOnly", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? HttpOnly
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie SameSite type.
        /// </summary>
        [JsonProperty("sameSite", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public CookieSameSite? SameSite
        {
            get;
            set;
        }
        /// <summary>
        /// Cookie expiration date, session cookie if not set
        /// </summary>
        [JsonProperty("expires", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Expires
        {
            get;
            set;
        }
    }

    public sealed class SetCookieCommandResponse : ICommandResponse<SetCookieCommandSettings>
    {
        /// <summary>
        /// True if successfully set cookie.
        ///</summary>
        [JsonProperty("success")]
        public bool Success
        {
            get;
            set;
        }
    }
}