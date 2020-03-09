namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Inject object to the target's main frame that provides a communication
    /// channel with browser target.
    /// 
    /// Injected object will be available as `window[bindingName]`.
    /// 
    /// The object has the follwing API:
    /// - `binding.send(json)` - a method to send messages over the remote debugging protocol
    /// - `binding.onmessage = json => handleMessage(json)` - a callback that will be called for the protocol notifications and command responses.
    /// </summary>
    public sealed class ExposeDevToolsProtocolCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.exposeDevToolsProtocol";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the targetId
        /// </summary>
        [JsonProperty("targetId")]
        public string TargetId
        {
            get;
            set;
        }
        /// <summary>
        /// Binding name, 'cdp' if not specified.
        /// </summary>
        [JsonProperty("bindingName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BindingName
        {
            get;
            set;
        }
    }

    public sealed class ExposeDevToolsProtocolCommandResponse : ICommandResponse<ExposeDevToolsProtocolCommandSettings>
    {
    }
}