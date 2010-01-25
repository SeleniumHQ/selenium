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
        private bool nativeMethod;

        /// <summary>
        /// Gets or sets the value of the filename in the stack
        /// </summary>
        [JsonProperty("fileName")]
        public string FileName
        {
            get { return fileName; }
            set { fileName = value; }
        }

        /// <summary>
        /// Gets or sets the value of the Class name in the stack trace
        /// </summary>
        [JsonProperty("className")]
        public string ClassName
        {
            get { return className; }
            set { className = value; }
        }

        /// <summary>
        /// Gets or sets the line number
        /// </summary>
        [JsonProperty("lineNumber")]
        public int LineNumber
        {
            get { return lineNumber; }
            set { lineNumber = value; }
        }

        /// <summary>
        /// Gets or sets the Method name in the stack trace
        /// </summary>
        [JsonProperty("methodName")]
        public string MethodName
        {
            get { return methodName; }
            set { methodName = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether it was a native method
        /// </summary>
        [JsonProperty("nativeMethod")]
        public bool NativeMethod
        {
            get { return nativeMethod; }
            set { nativeMethod = value; }
        }
    }
}
