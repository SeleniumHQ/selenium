using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public class DevToolsSessionInfo
    {
        [JsonProperty("description")]
        public string Description
        {
            get;
            set;
        }

        [JsonProperty("devtoolsFrontendUrl")]
        public string DevToolsFrontendUrl
        {
            get;
            set;
        }

        [JsonProperty("id")]
        public string Id
        {
            get;
            set;
        }

        [JsonProperty("title")]
        public string Title
        {
            get;
            set;
        }

        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }

        [JsonProperty("webSocketDebuggerUrl")]
        public string WebSocketDebuggerUrl
        {
            get;
            set;
        }
    }
}
