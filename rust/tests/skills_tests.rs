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

use std::fs;
use std::path::Path;

mod common;
use common::get_selenium_manager;

#[test]
fn skills_test() {
    let mut cmd = get_selenium_manager();
    cmd.arg("--init-skills").assert().success();

    let skills_file = Path::new("skills.md");
    assert!(skills_file.exists());

    let content = fs::read_to_string(skills_file).expect("Unable to read skills.md");
    assert!(content.contains("# Selenium Skills & Best Practices"));
    assert!(content.contains("### Java"));
    assert!(content.contains("### Python"));
    assert!(content.contains("### JavaScript (Node.js)"));
    assert!(content.contains("### .NET (C#)"));
    assert!(content.contains("### Ruby"));
    assert!(content.contains("## Best Practices"));

    // Clean up
    fs::remove_file(skills_file).expect("Unable to delete skills.md");
}
