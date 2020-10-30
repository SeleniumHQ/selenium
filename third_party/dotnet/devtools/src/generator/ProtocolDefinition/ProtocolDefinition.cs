namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;

    public sealed class ProtocolDefinition : IDefinition
    {
        public ProtocolDefinition()
        {
            Domains = new Collection<DomainDefinition>();
        }

        [JsonProperty(PropertyName = "browserVersion", Required = Required.Always)]
        public ProtocolVersionDefinition BrowserVersion
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "version", Required = Required.Always)]
        public Version Version
        {
            get;
            set;
        }

        [JsonProperty(PropertyName = "domains", Required = Required.Always)]
        public ICollection<DomainDefinition> Domains
        {
            get;
            set;
        }
    }
}
