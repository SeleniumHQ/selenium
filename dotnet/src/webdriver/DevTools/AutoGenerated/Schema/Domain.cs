namespace OpenQA.Selenium.DevTools.Schema
{
    using Newtonsoft.Json;

    /// <summary>
    /// Description of the protocol domain.
    /// </summary>
    public sealed class Domain
    {
        /// <summary>
        /// Domain name.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Domain version.
        ///</summary>
        [JsonProperty("version")]
        public string Version
        {
            get;
            set;
        }
    }
}