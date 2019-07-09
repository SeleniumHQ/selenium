namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Violation configuration setting.
    /// </summary>
    public sealed class ViolationSetting
    {
        /// <summary>
        /// Violation type.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Time threshold to trigger upon.
        ///</summary>
        [JsonProperty("threshold")]
        public double Threshold
        {
            get;
            set;
        }
    }
}