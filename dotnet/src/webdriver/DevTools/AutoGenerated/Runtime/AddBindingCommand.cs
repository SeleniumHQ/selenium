namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// If executionContextId is empty, adds binding with the given name on the
    /// global objects of all inspected contexts, including those created later,
    /// bindings survive reloads.
    /// If executionContextId is specified, adds binding only on global object of
    /// given execution context.
    /// Binding function takes exactly one argument, this argument should be string,
    /// in case of any other input, function throws an exception.
    /// Each binding function call produces Runtime.bindingCalled notification.
    /// </summary>
    public sealed class AddBindingCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.addBinding";
        
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
        /// <summary>
        /// Gets or sets the executionContextId
        /// </summary>
        [JsonProperty("executionContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ExecutionContextId
        {
            get;
            set;
        }
    }

    public sealed class AddBindingCommandResponse : ICommandResponse<AddBindingCommandSettings>
    {
    }
}