namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// advance: If the scheduler runs out of immediate work, the virtual time base may fast forward to
    /// allow the next delayed task (if any) to run; pause: The virtual time base may not advance;
    /// pauseIfNetworkFetchesPending: The virtual time base may not advance if there are any pending
    /// resource fetches.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum VirtualTimePolicy
    {
        [EnumMember(Value = "advance")]
        Advance,
        [EnumMember(Value = "pause")]
        Pause,
        [EnumMember(Value = "pauseIfNetworkFetchesPending")]
        PauseIfNetworkFetchesPending,
    }
}