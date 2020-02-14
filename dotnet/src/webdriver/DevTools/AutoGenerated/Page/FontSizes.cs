namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Default font sizes.
    /// </summary>
    public sealed class FontSizes
    {
        /// <summary>
        /// Default standard font size.
        ///</summary>
        [JsonProperty("standard", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Standard
        {
            get;
            set;
        }
        /// <summary>
        /// Default fixed font size.
        ///</summary>
        [JsonProperty("fixed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Fixed
        {
            get;
            set;
        }
    }
}