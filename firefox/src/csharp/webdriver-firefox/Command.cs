using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents a command sent to the WebDriver Firefox extension.
    /// </summary>
    internal class Command
    {
        #region Private members
        private Context commandContext = new Context();
        private string commandElementId = string.Empty;
        private string commandName = string.Empty;
        private object commandParameters; 
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="Command"/> class using the specified context, command name, and parameters.
        /// </summary>
        /// <param name="context">The <see cref="Context"/> of the command.</param>
        /// <param name="name">The name of the command.</param>
        /// <param name="parameters">The parameters for the command.</param>
        public Command(Context context, string name, object parameters)
            : this(context, null, name, parameters)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Command"/> class using the specified context, element ID, command name, and parameters.
        /// </summary>
        /// <param name="context">The <see cref="Context"/> of the command.</param>
        /// <param name="elementId">The ID of the element to execute the command on.</param>
        /// <param name="name">The name of the command.</param>
        /// <param name="parameters">The parameters for the command.</param>
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
        #endregion

        #region Properties
        /// <summary>
        /// Gets the <see cref="Context"/> of the command.
        /// </summary>
        [JsonProperty(PropertyName = "context")]
        public Context Context
        {
            get { return commandContext; }
        }

        /// <summary>
        /// Gets the element ID on which to execute the command.
        /// </summary>
        [JsonProperty(PropertyName = "elementId", NullValueHandling = NullValueHandling.Ignore)]
        public string ElementId
        {
            get { return commandElementId; }
        }

        /// <summary>
        /// Gets the name of the command.
        /// </summary>
        [JsonProperty(PropertyName = "commandName")]
        public string Name
        {
            get { return commandName; }
        }

        /// <summary>
        /// Gets an object representing the parameters of the command.
        /// </summary>
        [JsonProperty(PropertyName = "parameters")]
        public object Parameters
        {
            get { return commandParameters; }
        } 
        #endregion
    }
}
