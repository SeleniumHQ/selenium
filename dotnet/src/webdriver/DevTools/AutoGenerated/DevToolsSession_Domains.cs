namespace OpenQA.Selenium.DevTools
{
    using System;
    
    public partial class DevToolsSession
    {
        private Lazy<Browser.BrowserAdapter> m_Browser;
        private Lazy<DOM.DOMAdapter> m_DOM;
        private Lazy<DOMDebugger.DOMDebuggerAdapter> m_DOMDebugger;
        private Lazy<Emulation.EmulationAdapter> m_Emulation;
        private Lazy<IO.IOAdapter> m_IO;
        private Lazy<Input.InputAdapter> m_Input;
        private Lazy<Log.LogAdapter> m_Log;
        private Lazy<Network.NetworkAdapter> m_Network;
        private Lazy<Page.PageAdapter> m_Page;
        private Lazy<Performance.PerformanceAdapter> m_Performance;
        private Lazy<Security.SecurityAdapter> m_Security;
        private Lazy<Target.TargetAdapter> m_Target;
        private Lazy<Console.ConsoleAdapter> m_Console;
        private Lazy<Debugger.DebuggerAdapter> m_Debugger;
        private Lazy<Profiler.ProfilerAdapter> m_Profiler;
        private Lazy<Runtime.RuntimeAdapter> m_Runtime;
        private Lazy<Schema.SchemaAdapter> m_Schema;

        public DevToolsSession()
        {
            m_Browser = new Lazy<Browser.BrowserAdapter>(() => new Browser.BrowserAdapter(this));
            m_DOM = new Lazy<DOM.DOMAdapter>(() => new DOM.DOMAdapter(this));
            m_DOMDebugger = new Lazy<DOMDebugger.DOMDebuggerAdapter>(() => new DOMDebugger.DOMDebuggerAdapter(this));
            m_Emulation = new Lazy<Emulation.EmulationAdapter>(() => new Emulation.EmulationAdapter(this));
            m_IO = new Lazy<IO.IOAdapter>(() => new IO.IOAdapter(this));
            m_Input = new Lazy<Input.InputAdapter>(() => new Input.InputAdapter(this));
            m_Log = new Lazy<Log.LogAdapter>(() => new Log.LogAdapter(this));
            m_Network = new Lazy<Network.NetworkAdapter>(() => new Network.NetworkAdapter(this));
            m_Page = new Lazy<Page.PageAdapter>(() => new Page.PageAdapter(this));
            m_Performance = new Lazy<Performance.PerformanceAdapter>(() => new Performance.PerformanceAdapter(this));
            m_Security = new Lazy<Security.SecurityAdapter>(() => new Security.SecurityAdapter(this));
            m_Target = new Lazy<Target.TargetAdapter>(() => new Target.TargetAdapter(this));
            m_Console = new Lazy<Console.ConsoleAdapter>(() => new Console.ConsoleAdapter(this));
            m_Debugger = new Lazy<Debugger.DebuggerAdapter>(() => new Debugger.DebuggerAdapter(this));
            m_Profiler = new Lazy<Profiler.ProfilerAdapter>(() => new Profiler.ProfilerAdapter(this));
            m_Runtime = new Lazy<Runtime.RuntimeAdapter>(() => new Runtime.RuntimeAdapter(this));
            m_Schema = new Lazy<Schema.SchemaAdapter>(() => new Schema.SchemaAdapter(this));
        }

        /// <summary>
        /// Gets the adapter for the Browser domain.
        /// </summary>
        public Browser.BrowserAdapter Browser
        {
            get { return m_Browser.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the DOM domain.
        /// </summary>
        public DOM.DOMAdapter DOM
        {
            get { return m_DOM.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the DOMDebugger domain.
        /// </summary>
        public DOMDebugger.DOMDebuggerAdapter DOMDebugger
        {
            get { return m_DOMDebugger.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Emulation domain.
        /// </summary>
        public Emulation.EmulationAdapter Emulation
        {
            get { return m_Emulation.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the IO domain.
        /// </summary>
        public IO.IOAdapter IO
        {
            get { return m_IO.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Input domain.
        /// </summary>
        public Input.InputAdapter Input
        {
            get { return m_Input.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Log domain.
        /// </summary>
        public Log.LogAdapter Log
        {
            get { return m_Log.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Network domain.
        /// </summary>
        public Network.NetworkAdapter Network
        {
            get { return m_Network.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Page domain.
        /// </summary>
        public Page.PageAdapter Page
        {
            get { return m_Page.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Performance domain.
        /// </summary>
        public Performance.PerformanceAdapter Performance
        {
            get { return m_Performance.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Security domain.
        /// </summary>
        public Security.SecurityAdapter Security
        {
            get { return m_Security.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Target domain.
        /// </summary>
        public Target.TargetAdapter Target
        {
            get { return m_Target.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Console domain.
        /// </summary>
        public Console.ConsoleAdapter Console
        {
            get { return m_Console.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Debugger domain.
        /// </summary>
        public Debugger.DebuggerAdapter Debugger
        {
            get { return m_Debugger.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Profiler domain.
        /// </summary>
        public Profiler.ProfilerAdapter Profiler
        {
            get { return m_Profiler.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Runtime domain.
        /// </summary>
        public Runtime.RuntimeAdapter Runtime
        {
            get { return m_Runtime.Value; }
        }
        
        /// <summary>
        /// Gets the adapter for the Schema domain.
        /// </summary>
        public Schema.SchemaAdapter Schema
        {
            get { return m_Schema.Value; }
        }
        
    }
}
