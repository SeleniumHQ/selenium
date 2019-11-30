namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Changes return value in top frame. Available only at return break position.
    /// </summary>
    public sealed class SetReturnValueCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setReturnValue";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// New return value.
        /// </summary>
        [JsonProperty("newValue")]
        public Runtime.CallArgument NewValue
        {
            get;
            set;
        }
    }

    public sealed class SetReturnValueCommandResponse : ICommandResponse<SetReturnValueCommandSettings>
    {
    }
}