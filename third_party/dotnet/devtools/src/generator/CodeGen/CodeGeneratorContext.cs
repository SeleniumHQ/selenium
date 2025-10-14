using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System.Collections.Generic;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents the current context of the code generator.
    /// </summary>
    public sealed class CodeGeneratorContext(DomainDefinition domain, Dictionary<string, TypeInfo> knownTypes)
    {
        public DomainDefinition Domain { get; } = domain;

        public Dictionary<string, TypeInfo> KnownTypes { get; } = knownTypes;
    }
}
