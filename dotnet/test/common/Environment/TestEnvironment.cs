using Newtonsoft.Json;
using System.Collections.Generic;

namespace OpenQA.Selenium.Environment
{
    [JsonObject]
    class TestEnvironment
    {
        [JsonProperty]
        public bool CaptureWebServerOutput { get; set; }

        [JsonProperty]
        public bool HideWebServerCommandPrompt { get; set; }

        [JsonProperty]
        public string ActiveDriverConfig { get; set; }

        [JsonProperty]
        public string ActiveWebsiteConfig { get; set; }

        [JsonProperty]
        public Dictionary<string, WebsiteConfig> WebSiteConfigs { get; set; }

        [JsonProperty]
        public Dictionary<string, DriverConfig> DriverConfigs { get; set; }

        [JsonProperty]
        public TestWebServerConfig TestWebServerConfig {get; set;}
    }
}
