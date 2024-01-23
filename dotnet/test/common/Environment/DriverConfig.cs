using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace OpenQA.Selenium.Environment
{
    [JsonObject]
    public class DriverConfig
    {
        [JsonProperty]
        public string DriverTypeName { get; set; }

        [JsonProperty]
        [JsonConverter(typeof(StringEnumConverter))]
        public Browser BrowserValue { get; set; }

        [JsonProperty]
        public string RemoteCapabilities { get; set; }

        [JsonProperty]
        public bool AutoStartRemoteServer { get; set; }

        [JsonProperty]
        public bool Logging { get; set; }
    }
}
