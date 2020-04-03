namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Generic font families collection.
    /// </summary>
    public sealed class FontFamilies
    {
        /// <summary>
        /// The standard font-family.
        ///</summary>
        [JsonProperty("standard", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Standard
        {
            get;
            set;
        }
        /// <summary>
        /// The fixed font-family.
        ///</summary>
        [JsonProperty("fixed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Fixed
        {
            get;
            set;
        }
        /// <summary>
        /// The serif font-family.
        ///</summary>
        [JsonProperty("serif", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Serif
        {
            get;
            set;
        }
        /// <summary>
        /// The sansSerif font-family.
        ///</summary>
        [JsonProperty("sansSerif", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SansSerif
        {
            get;
            set;
        }
        /// <summary>
        /// The cursive font-family.
        ///</summary>
        [JsonProperty("cursive", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Cursive
        {
            get;
            set;
        }
        /// <summary>
        /// The fantasy font-family.
        ///</summary>
        [JsonProperty("fantasy", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Fantasy
        {
            get;
            set;
        }
        /// <summary>
        /// The pictograph font-family.
        ///</summary>
        [JsonProperty("pictograph", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Pictograph
        {
            get;
            set;
        }
    }
}