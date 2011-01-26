using System;
using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Gives properties to get a stack trace
    /// </summary>
    public class StackTraceElement
    {
        private string fileName;
        private string className;
        private int lineNumber;
        private string methodName;

        /// <summary>
        /// Initializes a new instance of the <see cref="StackTraceElement"/> class.
        /// </summary>
        public StackTraceElement()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="StackTraceElement"/> class using the given property values.
        /// </summary>
        /// <param name="elementAttributes">A <see cref="Dictionary{K, V}"/> containing the names and values for the properties of this <see cref="StackTraceElement"/>.</param>
        public StackTraceElement(Dictionary<string, object> elementAttributes)
        {
            if (elementAttributes.ContainsKey("className"))
            {
                this.className = elementAttributes["className"].ToString();
            }

            if (elementAttributes.ContainsKey("methodName"))
            {
                this.methodName = elementAttributes["methodName"].ToString();
            }

            if (elementAttributes.ContainsKey("lineNumber"))
            {
                this.lineNumber = Convert.ToInt32(elementAttributes["lineNumber"], CultureInfo.InvariantCulture);
            }

            if (elementAttributes.ContainsKey("fileName"))
            {
                this.fileName = elementAttributes["fileName"].ToString();
            }
        }

        /// <summary>
        /// Gets or sets the value of the filename in the stack
        /// </summary>
        [JsonProperty("fileName")]
        public string FileName
        {
            get { return this.fileName; }
            set { this.fileName = value; }
        }

        /// <summary>
        /// Gets or sets the value of the Class name in the stack trace
        /// </summary>
        [JsonProperty("className")]
        public string ClassName
        {
            get { return this.className; }
            set { this.className = value; }
        }

        /// <summary>
        /// Gets or sets the line number
        /// </summary>
        [JsonProperty("lineNumber")]
        public int LineNumber
        {
            get { return this.lineNumber; }
            set { this.lineNumber = value; }
        }

        /// <summary>
        /// Gets or sets the Method name in the stack trace
        /// </summary>
        [JsonProperty("methodName")]
        public string MethodName
        {
            get { return this.methodName; }
            set { this.methodName = value; }
        }

        /// <summary>
        /// Gets a string representation of the object.
        /// </summary>
        /// <returns>A string representation of the object.</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "at {0}.{1} ({2), {3}", this.className, this.methodName, this.fileName, this.lineNumber);
        }
    }
}
