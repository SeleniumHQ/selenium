namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol type.
    /// </summary>
    public sealed class TypeInfo
    {
        public bool ByRef
        {
            get;
            set;
        }

        public string Namespace
        {
            get;
            set;
        }

        public bool IsPrimitive
        {
            get;
            set;
        }

        public string TypeName
        {
            get;
            set;
        }

        public string SourcePath
        {
            get;
            set;
        }
    }
}
