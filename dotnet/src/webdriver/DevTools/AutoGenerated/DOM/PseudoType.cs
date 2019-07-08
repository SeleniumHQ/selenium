namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Pseudo element type.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum PseudoType
    {
        [EnumMember(Value = "first-line")]
        FirstLine,
        [EnumMember(Value = "first-letter")]
        FirstLetter,
        [EnumMember(Value = "before")]
        Before,
        [EnumMember(Value = "after")]
        After,
        [EnumMember(Value = "backdrop")]
        Backdrop,
        [EnumMember(Value = "selection")]
        Selection,
        [EnumMember(Value = "first-line-inherited")]
        FirstLineInherited,
        [EnumMember(Value = "scrollbar")]
        Scrollbar,
        [EnumMember(Value = "scrollbar-thumb")]
        ScrollbarThumb,
        [EnumMember(Value = "scrollbar-button")]
        ScrollbarButton,
        [EnumMember(Value = "scrollbar-track")]
        ScrollbarTrack,
        [EnumMember(Value = "scrollbar-track-piece")]
        ScrollbarTrackPiece,
        [EnumMember(Value = "scrollbar-corner")]
        ScrollbarCorner,
        [EnumMember(Value = "resizer")]
        Resizer,
        [EnumMember(Value = "input-list-button")]
        InputListButton,
    }
}