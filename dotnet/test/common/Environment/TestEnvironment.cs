using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public string DriverServiceLocation { get; set; }

        [JsonProperty]
        public string ActiveDriverConfig { get; set; }

        [JsonProperty]
        public string ActiveWebsiteConfig { get; set; }

        [JsonProperty]
        public Dictionary<string, WebsiteConfig> WebSiteConfigs { get; set; }

        [JsonProperty]
        public Dictionary<string, DriverConfig> DriverConfigs { get; set; }
    }
}
