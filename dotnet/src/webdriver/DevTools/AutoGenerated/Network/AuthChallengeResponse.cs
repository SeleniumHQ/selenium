namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Response to an AuthChallenge.
    /// </summary>
    public sealed class AuthChallengeResponse
    {
        /// <summary>
        /// The decision on what to do in response to the authorization challenge.  Default means
        /// deferring to the default behavior of the net stack, which will likely either the Cancel
        /// authentication or display a popup dialog box.
        ///</summary>
        [JsonProperty("response")]
        public string Response
        {
            get;
            set;
        }
        /// <summary>
        /// The username to provide, possibly empty. Should only be set if response is
        /// ProvideCredentials.
        ///</summary>
        [JsonProperty("username", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Username
        {
            get;
            set;
        }
        /// <summary>
        /// The password to provide, possibly empty. Should only be set if response is
        /// ProvideCredentials.
        ///</summary>
        [JsonProperty("password", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Password
        {
            get;
            set;
        }
    }
}