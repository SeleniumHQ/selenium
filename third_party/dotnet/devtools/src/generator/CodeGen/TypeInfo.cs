namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents information about a Chrome Debugger Protocol type.
    /// </summary>
    public sealed class TypeInfo(string typeName, bool isPrimitive)
    {
        public bool ByRef { get; set; }

        public string? Namespace { get; set; }

        public bool IsPrimitive { get; } = isPrimitive;

        public string TypeName { get; } = typeName;

        public string? SourcePath { get; set; }
    }
}
