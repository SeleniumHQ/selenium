// <copyright file="SourceActions.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Input;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(KeySourceActions), "key")]
[JsonDerivedType(typeof(PointerSourceActions), "pointer")]
[JsonDerivedType(typeof(WheelSourceActions), "wheel")]
[JsonDerivedType(typeof(NoneSourceActions), "none")]
public abstract record SourceActions;

public abstract record SourceActions<TSourceAction>(string Id, ImmutableArray<TSourceAction> Actions)
    : SourceActions where TSourceAction : ISourceAction;

public interface ISourceAction;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(KeyDownAction), "keyDown")]
[JsonDerivedType(typeof(KeyUpAction), "keyUp")]
public interface IKeySourceAction : ISourceAction;

public sealed record KeySourceActions(string Id, ImmutableArray<IKeySourceAction> Actions)
    : SourceActions<IKeySourceAction>(Id, Actions)
{
    [Obsolete("This helper method will be removed in a future version. Use KeyDownAction and KeyUpAction directly instead.")]
    public KeySourceActions Type(string text) => this with
    {
        Actions = [.. Actions, .. text.SelectMany<char, IKeySourceAction>(c => [new KeyDownAction(c), new KeyUpAction(c)])]
    };
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(PointerDownAction), "pointerDown")]
[JsonDerivedType(typeof(PointerUpAction), "pointerUp")]
[JsonDerivedType(typeof(PointerMoveAction), "pointerMove")]
public interface IPointerSourceAction : ISourceAction;

public sealed record PointerSourceActions(string Id, ImmutableArray<IPointerSourceAction> Actions)
    : SourceActions<IPointerSourceAction>(Id, Actions)
{
    public PointerParameters? Parameters { get; init; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(WheelScrollAction), "scroll")]
public interface IWheelSourceAction : ISourceAction;

public sealed record WheelSourceActions(string Id, ImmutableArray<IWheelSourceAction> Actions)
    : SourceActions<IWheelSourceAction>(Id, Actions);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
public interface INoneSourceAction : ISourceAction;

public sealed record NoneSourceActions(string Id, ImmutableArray<INoneSourceAction> Actions)
    : SourceActions<INoneSourceAction>(Id, Actions);

public sealed record KeyDownAction(char Value) : IKeySourceAction;

public sealed record KeyUpAction(char Value) : IKeySourceAction;

public sealed record PointerDownAction(long Button) : IPointerSourceAction, IPointerCommonProperties
{
    public long? Width { get; init; }
    public long? Height { get; init; }
    public double? Pressure { get; init; }
    public double? TangentialPressure { get; init; }
    public long? Twist { get; init; }
    public double? AltitudeAngle { get; init; }
    public double? AzimuthAngle { get; init; }
}

public sealed record PointerUpAction(long Button) : IPointerSourceAction;

public sealed record PointerMoveAction(double X, double Y) : IPointerSourceAction, IPointerCommonProperties
{
    public long? Duration { get; init; }

    public Origin? Origin { get; init; }

    public long? Width { get; init; }
    public long? Height { get; init; }
    public double? Pressure { get; init; }
    public double? TangentialPressure { get; init; }
    public long? Twist { get; init; }
    public double? AltitudeAngle { get; init; }
    public double? AzimuthAngle { get; init; }
}

public sealed record WheelScrollAction(long X, long Y, long DeltaX, long DeltaY) : IWheelSourceAction
{
    public long? Duration { get; init; }

    public Origin? Origin { get; init; }
}

public sealed record PauseAction : ISourceAction, IKeySourceAction, IPointerSourceAction, IWheelSourceAction, INoneSourceAction
{
    public long? Duration { get; init; }
}

public sealed record PointerParameters
{
    public PointerType? PointerType { get; init; }
}

[JsonConverter(typeof(CamelCaseEnumConverter<PointerType>))]
public enum PointerType
{
    Mouse,
    Pen,
    Touch
}

public interface IPointerCommonProperties
{
    public long? Width { get; init; }

    public long? Height { get; init; }

    public double? Pressure { get; init; }

    public double? TangentialPressure { get; init; }

    public long? Twist { get; init; }

    public double? AltitudeAngle { get; init; }

    public double? AzimuthAngle { get; init; }
}
