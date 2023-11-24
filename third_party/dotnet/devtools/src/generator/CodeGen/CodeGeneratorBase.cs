namespace OpenQA.Selenium.DevToolsGenerator.CodeGen
{
    using Microsoft.Extensions.DependencyInjection;
    using OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition;
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// Represents a base implementation of a code generator.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public abstract class CodeGeneratorBase<T> : ICodeGenerator<T>
        where T : IDefinition
    {
        private readonly IServiceProvider m_serviceProvider;
        private readonly Lazy<CodeGenerationSettings> m_settings;
        private readonly Lazy<TemplatesManager> m_templatesManager;

        /// <summary>
        /// Gets the service provider associated with the generator.
        /// </summary>
        public IServiceProvider ServiceProvider
        {
            get { return m_serviceProvider; }
        }

        /// <summary>
        /// Gets the code generation settings associated with the generator.
        /// </summary>
        public CodeGenerationSettings Settings
        {
            get { return m_settings.Value; }
        }

        /// <summary>
        /// Gets a template manager associated with the generator.
        /// </summary>
        public TemplatesManager TemplatesManager
        {
            get { return m_templatesManager.Value; }
        }

        protected CodeGeneratorBase(IServiceProvider serviceProvider)
        {
            m_serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
            m_settings = new Lazy<CodeGenerationSettings>(() => m_serviceProvider.GetRequiredService<CodeGenerationSettings>());
            m_templatesManager = new Lazy<TemplatesManager>(() => m_serviceProvider.GetRequiredService<TemplatesManager>());
        }

        public abstract IDictionary<string, string> GenerateCode(T item, CodeGeneratorContext context);
    }
}
