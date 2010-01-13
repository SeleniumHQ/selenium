using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Reflection;
using System.Globalization;

namespace OpenQA.Selenium.Firefox
{
    internal class Response
    {
        private string methodName;
        private Context context;
        private object responseValue;
        private bool isError;

        public Response()
        {
        }

        [JsonProperty("context")]
        internal Context Context
        {
            get { return context; }
            set { context = value; }
        }

        [JsonProperty("response")]
        [JsonConverter(typeof(ResponseValueJsonConverter))]
        public object ResponseValue
        {
            get { return responseValue; }
            set { responseValue = value; }
        }

        [JsonProperty("isError")]
        public bool IsError
        {
            get { return isError; }
            set { isError = value; }
        }

        [JsonProperty("commandName")]
        public string Command
        {
            get { return methodName; }
            set { methodName = value; }
        }

        public object GetExtraResult(string fieldName)
        {
            object extraResultValue = null;
            Dictionary<string, object> resultObject = responseValue as Dictionary<string, object>;
            if (resultObject != null)
            {
                extraResultValue = resultObject[fieldName];
            }
            return extraResultValue;
        }

        public void IfNecessaryThrow(Type exceptionClass)
        {
            if (!isError)
                return;

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
    }
}
