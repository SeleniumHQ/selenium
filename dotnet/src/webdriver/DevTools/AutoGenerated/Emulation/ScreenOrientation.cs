namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Screen orientation.
    /// </summary>
    public sealed class ScreenOrientation
    {
        /// <summary>
        /// Orientation type.
        ///</summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Orientation angle.
        ///</summary>
        [JsonProperty("angle")]
        public long Angle
        {
            get;
            set;
        }
    }
}