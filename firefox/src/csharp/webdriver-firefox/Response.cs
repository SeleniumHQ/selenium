using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the response returned by a command.
    /// </summary>
    internal class Response
    {
        #region Private members
        private string methodName;
        private Context context;
        private object responseValue;
        private bool isError; 
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="Response"/> class.
        /// </summary>
        public Response()
        {
        } 
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the value of this response.
        /// </summary>
        [JsonProperty("response")]
        [JsonConverter(typeof(ResponseValueJsonConverter))]
        public object ResponseValue
        {
            get { return responseValue; }
            set { responseValue = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether this response is an error.
        /// </summary>
        [JsonProperty("isError")]
        public bool IsError
        {
            get { return isError; }
            set { isError = value; }
        }

        /// <summary>
        /// Gets or sets the name of the command this is the response for.
        /// </summary>
        [JsonProperty("commandName")]
        public string Command
        {
            get { return methodName; }
            set { methodName = value; }
        }

        /// <summary>
        /// Gets or sets the <see cref="Context"/> for this response.
        /// </summary>
        [JsonProperty("context")]
        internal Context Context
        {
            get { return context; }
            set { context = value; }
        } 
        #endregion

        #region Methods
        /// <summary>
        /// Throws the specified exception, if necessary.
        /// </summary>
        /// <param name="exceptionClass">A <see cref="System.Type"/> object describing a <see cref="System.Exception"/>.</param>
        internal void IfNecessaryThrow(Type exceptionClass)
        {
            if (!isError)
            {
                return;
            }

            if (responseValue.ToString().StartsWith("element is obsolete", StringComparison.OrdinalIgnoreCase))
            {
                throw new StaleElementReferenceException("Element is obsolete");
            }

            if (responseValue.ToString().StartsWith("Element is not currently visible", StringComparison.OrdinalIgnoreCase))
            {
                throw new ElementNotVisibleException("Element is not visible, and so cannot be interacted with");
            }

            Exception toThrow = null;
            try
            {
                ConstructorInfo constructor = exceptionClass.GetConstructor(new Type[] { typeof(string) });

                string name = "unknown";
                string message = string.Empty;
                Dictionary<string, object> info = responseValue as Dictionary<string, object>;
                if (info != null)
                {
                    if (info.ContainsKey("name"))
                    {
                        name = info["name"].ToString();
                    }

                    message = info["message"].ToString();
                }
                else
                {
                    message = responseValue.ToString();
                }

                toThrow = (Exception)constructor.Invoke(new object[] { string.Format(CultureInfo.InvariantCulture, "{0}: {1}", name, message) });
            }
            catch (Exception)
            {
                throw new WebDriverException(ResponseValue.ToString());
            }

            throw toThrow;
        } 
        #endregion
    }
}
