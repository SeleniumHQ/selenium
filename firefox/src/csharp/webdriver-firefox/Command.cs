using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox
{
    internal class Command
    {
        private Context commandContext = new Context();
        private string commandElementId = string.Empty;
        private string commandName = string.Empty;
        //private object[] commandParameters;
        private object commandParameters;

        public Command(Context context, string commandName, object parameters)
            : this(context, null, commandName, parameters)
        {
        }

        public Command(Context context, string elementId, string name, object parameters)
        {
            if (context != null)
            {
                commandContext = context;
            }
            commandElementId = elementId;
            commandName = name;
            commandParameters = parameters;
        }

        [JsonProperty(PropertyName = "context")]
        public Context Context
        {
            get { return commandContext; }
        }

        [JsonProperty(PropertyName = "elementId", NullValueHandling = NullValueHandling.Ignore)]
        public string ElementId
        {
            get { return commandElementId; }
        }

        [JsonProperty(PropertyName = "commandName")]
        public string Name
        {
            get { return commandName; }
        }

        [JsonProperty(PropertyName = "parameters")]
        public object Parameters
        {
            get { return commandParameters; }
        }
    }
}
