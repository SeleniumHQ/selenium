using System;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Environment
{
    [JsonObject]
    public class TestWebServerConfig
    {
        [JsonProperty]
        public bool CaptureConsoleOutput { get; set; }

        [JsonProperty]
        public bool HideCommandPromptWindow { get; set; }

        [JsonProperty]
        public string JavaHomeDirectory { get; set; }
    }
}
