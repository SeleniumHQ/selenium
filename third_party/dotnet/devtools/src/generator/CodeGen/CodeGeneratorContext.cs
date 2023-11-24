namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
    using System.Collections.Generic;

    /// <summary>
    /// Represents the current context of the code generator.
    /// </summary>
    public sealed class CodeGeneratorContext
    {
        public DomainDefinition Domain
        {
            get;
            set;
        }

        public Dictionary<string, TypeInfo> KnownTypes
        {
            get;
            set;
        }
    }
}
