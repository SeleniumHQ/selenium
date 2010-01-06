using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public class Command
    {
        private SessionId commandSessionId;
        private Context commandContext;
        private DriverCommand commandName;
        private object[] commandParameters;

        public Command(SessionId sessionId, Context context, DriverCommand name, object[] parameters)
        {
            commandSessionId = sessionId;
            commandContext = context;
            if (parameters == null)
            {
                parameters = new object[0];
            }
            else
            {
                commandParameters = parameters;
            }
            commandName = name;
        }

        [JsonProperty("sessionId")]
        public SessionId SessionId
        {
            get { return commandSessionId; }
        }

        [JsonProperty("context")]
        public Context Context
        {
            get { return commandContext; }
        }

        [JsonProperty("commandName")]
        public DriverCommand Name
        {
            get { return commandName; }
        }

        [JsonProperty("parameters")]
        public object[] Parameters
        {
            get { return commandParameters; }
        }

        public override string ToString()
        {
            return "[" + SessionId + ", " + Context + "]: " + Name + " " + Parameters.ToString();
        }
    }
}
