namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// This method does not remove binding function from global object but
    /// unsubscribes current runtime agent from Runtime.bindingCalled notifications.
    /// </summary>
    public sealed class RemoveBindingCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.removeBinding";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
    }

    public sealed class RemoveBindingCommandResponse : ICommandResponse<RemoveBindingCommandSettings>
    {
    }
}