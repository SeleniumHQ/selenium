namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns properties of a given object. Object group of the result is inherited from the target
    /// object.
    /// </summary>
    public sealed class GetPropertiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.getProperties";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the object to return properties for.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// If true, returns properties belonging only to the element itself, not to its prototype
        /// chain.
        /// </summary>
        [JsonProperty("ownProperties", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? OwnProperties
        {
            get;
            set;
        }
        /// <summary>
        /// If true, returns accessor properties (with getter/setter) only; internal properties are not
        /// returned either.
        /// </summary>
        [JsonProperty("accessorPropertiesOnly", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? AccessorPropertiesOnly
        {
            get;
            set;
        }
        /// <summary>
        /// Whether preview should be generated for the results.
        /// </summary>
        [JsonProperty("generatePreview", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? GeneratePreview
        {
            get;
            set;
        }
    }

    public sealed class GetPropertiesCommandResponse : ICommandResponse<GetPropertiesCommandSettings>
    {
        /// <summary>
        /// Object properties.
        ///</summary>
        [JsonProperty("result")]
        public PropertyDescriptor[] Result
        {
            get;
            set;
        }
        /// <summary>
        /// Internal object properties (only of the element itself).
        ///</summary>
        [JsonProperty("internalProperties", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public InternalPropertyDescriptor[] InternalProperties
        {
            get;
            set;
        }
        /// <summary>
        /// Object private properties.
        ///</summary>
        [JsonProperty("privateProperties", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public PrivatePropertyDescriptor[] PrivateProperties
        {
            get;
            set;
        }
        /// <summary>
        /// Exception details.
        ///</summary>
        [JsonProperty("exceptionDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ExceptionDetails ExceptionDetails
        {
            get;
            set;
        }
    }
}