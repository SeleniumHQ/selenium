using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
using System.Collections.Generic;

namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    /// <summary>
    /// Represents a code generator that generates code files for a specific IDefinition type.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public interface ICodeGenerator<T>
        where T : class, IDefinition
    {
        /// <summary>
        /// Generates one or more code files for the specified IDefinition item
        /// </summary>
        /// <param name="item"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        IDictionary<string, string> GenerateCode(T item, CodeGeneratorContext context);
    }
}
