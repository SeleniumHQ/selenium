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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Ignore;
import org.junit.Test;

@Ignore("Rollup functionality is not implemented. Also addScript is not implemented")
public class TestRollup extends InternalSelenseTestBase {
  @Test
  public void testRollup() {
    // TODO(simon): re-enable this. It looks like the addScript method is not right
    selenium.addScript(getRollupScript(), "rollup");
    selenium.open("test_rollup.html");
    selenium.rollup("cake", "");
    selenium.rollup("biscuits", "n=1");
    verifyFalse(selenium.isChecked("name=one"));
    verifyTrue(selenium.isChecked("name=dos"));
    verifyTrue(selenium.isChecked("name=san"));
    selenium.rollup("biscuits", "n=2");
    verifyTrue(selenium.isChecked("name=one"));
    verifyFalse(selenium.isChecked("name=dos"));
    verifyTrue(selenium.isChecked("name=san"));
    selenium.rollup("biscuits", "n=3");
    verifyFalse(selenium.isChecked("name=one"));
    verifyTrue(selenium.isChecked("name=dos"));
    verifyFalse(selenium.isChecked("name=san"));
    selenium.rollup("steamed spinach", "");
    selenium.removeScript("rollup");
  }

  private String getRollupScript() {
    return "var rm = new RollupManager();\n"
        + "\n"
        + "rm.addRollupRule({\n"
        + "    name: 'cake'\n"
        + "    , description: \"Why we're all here\"\n"
        + "    , commandMatchers: []\n"
        + "    , expandedCommands: [\n"
        + "          new Command('verifyNotChecked', 'name=one')\n"
        + "        , new Command('verifyNotChecked', 'name=dos')\n"
        + "        , new Command('verifyNotChecked', 'name=san')\n"
        + "        , new Command('click', 'name=san')\n"
        + "        , new Command('click', 'name=dos')\n"
        + "        , new Command('click', 'name=one')\n"
        + "        , new Command('verifyText', 'id=message', 'HAPPY BIRTHDAY!')\n"
        + "    ]\n"
        + "});\n"
        + "\n"
        + "rm.addRollupRule({\n"
        + "    name: 'biscuits'\n"
        + "    , description: \"The rest of the time\"\n"
        + "    , commandMatchers: []\n"
        + "    , getExpandedCommands: function(args) {\n"
        + "        var commands = [];\n"
        + "        if (args.n >= 1) {\n"
        + "            commands.push(new Command('click', 'name=one'));\n"
        + "        }\n"
        + "        if (args.n >= 2) {\n"
        + "            commands.push(new Command('click', 'name=dos'));\n"
        + "        }\n"
        + "        if (args.n >= 3) {\n"
        + "            commands.push(new Command('click', 'name=san'));\n"
        + "        }\n"
        + "        return commands;\n"
        + "    }\n"
        + "});\n"
        + "\n"
        + "rm.addRollupRule({\n"
        + "    name: 'steamed spinach'\n"
        + "    , description: \"No complaints\"\n"
        + "    , commandMatchers: []\n"
        + "    , expandedCommands: [\n"
        + "          new Command('rollup', 'biscuits', 'n=2')\n"
        + "        , new Command('rollup', 'biscuits', 'n=1')\n"
        + "        , new Command('rollup', 'cake')\n"
        + "    ]\n"
        + "});";
  }
}
