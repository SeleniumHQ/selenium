namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    using Newtonsoft.Json;
    using OpenQA.Selenium.DevToolsGenerator.Converters;

    public abstract class ProtocolDefinitionItem : IDefinition
    {

        [JsonProperty(PropertyName = "deprecated")]
        public bool Deprecated
        {
            get;
            set;
        }

        public string Description
        {
            get => InitialDescription != null ? InitialDescription.Replace("<", "&lt;").Replace(">", "&gt;") : null;
            set => InitialDescription = value;
        }

        [JsonProperty(PropertyName = "experimental")]
        [JsonConverter(typeof(BooleanJsonConverter))]
        public bool Experimental
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "name")]
        public virtual string Name
        {
            get;
            set;
        }

        public override string ToString()
        {
            return Name;
        }

        [JsonProperty(PropertyName = "description")]
        protected string InitialDescription
        {
            get;
            set;
        }
    }
}
