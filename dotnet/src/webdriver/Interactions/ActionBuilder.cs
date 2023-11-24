// <copyright file="ActionBuilder.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Provides methods that allow the creation of action sequences to enable
    /// advanced user interactions.
    /// </summary>
    public class ActionBuilder
    {
        private Dictionary<InputDevice, ActionSequence> sequences = new Dictionary<InputDevice, ActionSequence>();

        /// <summary>
        /// Adds an action to the built set of actions. Adding an action will
        /// add a "tick" to the set of all actions to be executed.
        /// </summary>
        /// <param name="actionToAdd">The action to add to the set of actions</param>
        /// <returns>A self reference.</returns>
        public ActionBuilder AddAction(Interaction actionToAdd)
        {
            this.AddActions(actionToAdd);
            return this;
        }

        /// <summary>
        /// Adds an action to the built set of actions. Adding an action will
        /// add a "tick" to the set of all actions to be executed. Only one action
        /// for each input device may be added for a single tick.
        /// </summary>
        /// <param name="actionsToAdd">The set actions to add to the existing set of actions.</param>
        /// <returns>A self reference.</returns>
        public ActionBuilder AddActions(params Interaction[] actionsToAdd)
        {
            this.ProcessTick(actionsToAdd);
            return this;
        }

        /// <summary>
        /// Converts the set of actions in this <see cref="ActionBuilder"/> to a <see cref="List{ActionSequence}"/>.
        /// </summary>
        /// <returns>A <see cref="IList{ActionSequence}"/> suitable for transmission across the wire.
        /// The collection returned is read-only.</returns>
        public IList<ActionSequence> ToActionSequenceList()
        {
            return new List<ActionSequence>(this.sequences.Values).AsReadOnly();
        }

        /// <summary>
        /// Resets the list of sequences.
        /// </summary>
        public void ClearSequences()
        {
            this.sequences = new Dictionary<InputDevice, ActionSequence>();
        }

        /// <summary>
        /// Returns a string that represents the current <see cref="ActionBuilder"/>.
        /// </summary>
        /// <returns>A string that represents the current <see cref="ActionBuilder"/>.</returns>
        public override string ToString()
        {
            StringBuilder builder = new StringBuilder();
            foreach (ActionSequence sequence in this.sequences.Values)
            {
                builder.AppendLine(sequence.ToString());
            }

            return builder.ToString();
        }

        private void ProcessTick(params Interaction[] interactionsToAdd)
        {
            List<InputDevice> usedDevices = new List<InputDevice>();
            foreach (Interaction interaction in interactionsToAdd)
            {
                InputDevice actionDevice = interaction.SourceDevice;
                if (usedDevices.Contains(actionDevice))
                {
                    throw new ArgumentException("You can only add one action per device for a single tick.");
                }
            }

            List<InputDevice> unusedDevices = new List<InputDevice>(this.sequences.Keys);
            foreach (Interaction interaction in interactionsToAdd)
            {
                ActionSequence sequence = this.FindSequence(interaction.SourceDevice);
                sequence.AddAction(interaction);
                unusedDevices.Remove(interaction.SourceDevice);
            }

            foreach (InputDevice unusedDevice in unusedDevices)
            {
                ActionSequence sequence = this.sequences[unusedDevice];
                sequence.AddAction(new PauseInteraction(unusedDevice, TimeSpan.Zero));
            }
        }

        private ActionSequence FindSequence(InputDevice device)
        {
            if (this.sequences.ContainsKey(device))
            {
                return this.sequences[device];
            }

            int longestSequenceLength = 0;
            foreach (KeyValuePair<InputDevice, ActionSequence> pair in this.sequences)
            {
                longestSequenceLength = Math.Max(longestSequenceLength, pair.Value.Count);
            }

            ActionSequence sequence = new ActionSequence(device, longestSequenceLength);
            this.sequences[device] = sequence;

            return sequence;
        }
    }
}
