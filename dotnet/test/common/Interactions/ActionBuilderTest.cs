// <copyright file="ActionBuilderTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Interactions;

[TestFixture]
public class ActionBuilderTest
{
    [Test]
    public void OutputsPointerEventsToDictionary()
    {
        ActionBuilder actionBuilder = new ActionBuilder();

        var pointerInputDevice = new PointerInputDevice(PointerKind.Pen);
        var properties = new PointerInputDevice.PointerEventProperties()
        {
            Width = 10,
            Height = 11,
            Pressure = 0.5,
            TangentialPressure = 0.1,
            TiltX = 15,
            TiltY = 15,
            Twist = 30,
            AltitudeAngle = 0.1,
            AzimuthAngle = 0.1
        };

        var action = pointerInputDevice.CreatePointerDown(MouseButton.Left, properties);
        actionBuilder.AddAction(action);
        var sequence = actionBuilder.ToActionSequenceList();

        var dictionary = sequence[0].ToDictionary();
        Console.WriteLine(dictionary);
        Assert.That(dictionary, Does.ContainKey("type").WithValue("pointer"));
        Assert.That(dictionary["id"], Is.Not.Null);
        Assert.That(dictionary["parameters"], Is.Not.Null);

        var parameters = new Dictionary<string, object> { { "pointerType", "pen" } };
        Assert.That(dictionary["parameters"], Is.EquivalentTo(parameters));

        var events = new Dictionary<string, object>
        {
            {"width", 10},
            {"height", 11},
            {"pressure", 0.5},
            {"tangentialPressure", 0.1},
            {"tiltX", 15},
            {"tiltY", 15},
            {"twist", 30},
            {"altitudeAngle", 0.1},
            {"azimuthAngle", 0.1},
            {"type", "pointerDown"},
            {"button", 0}
        };
        var actions = (IList<object>)dictionary["actions"];
        Assert.That(actions[0], Is.EquivalentTo(events));
    }
}
