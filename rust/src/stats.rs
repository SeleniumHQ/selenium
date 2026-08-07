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

use crate::config::str_to_os;
use crate::format_one_arg;
use reqwest::Client;
use reqwest::header::CONTENT_TYPE;
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use std::sync::mpsc::Sender;
use std::time::Duration;

const PLAUSIBLE_URL: &str = "https://plausible.io/api/event";
const SM_USER_AGENT: &str = "Selenium Manager {}";
const APP_JSON: &str = "application/json";
const PAGE_VIEW: &str = "pageview";
const SELENIUM_DOMAIN: &str = "manager.selenium.dev";
const SM_STATS_URL: &str = "https://{}/sm-usage";
const REQUEST_TIMEOUT_SEC: u64 = 3;

const STATS_OTHER: &str = "other";

const VALID_LANGUAGE_BINDINGS: &[&str] =
    &["java", "javascript", "python", "csharp", "ruby", "rust"];

const VALID_VERSION_LABELS: &[&str] = &["stable", "beta", "dev", "canary", "nightly", "esr"];

#[derive(Default, Serialize, Deserialize)]
pub struct Data {
    pub name: String,
    pub url: String,
    pub domain: String,
    pub props: Props,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct Props {
    pub browser: String,
    pub browser_version: String,
    pub os: String,
    pub arch: String,
    pub lang: String,
    pub selenium_version: String,
}

impl Props {
    // browser, arch and selenium_version are already bounded upstream (unrecognized browsers
    // error out, arch is bucketed by get_normalized_arch, selenium_version is the crate version).
    // os, browser_version and language_binding still carry raw CLI/env input here, so they are
    // constrained to a vetted vocabulary before being reported to Plausible.
    pub fn sanitized(
        browser: &str,
        browser_version: &str,
        os: &str,
        arch: &str,
        language_binding: &str,
        selenium_version: &str,
    ) -> Self {
        Props {
            browser: browser.to_ascii_lowercase(),
            browser_version: sanitize_browser_version(browser_version),
            os: sanitize_os(os),
            arch: arch.to_ascii_lowercase(),
            lang: sanitize_language_binding(language_binding),
            selenium_version: selenium_version.to_ascii_lowercase(),
        }
    }
}

fn sanitize_os(os: &str) -> String {
    match str_to_os(os) {
        Ok(parsed_os) => parsed_os.to_str_vector()[0].to_string(),
        Err(_) => STATS_OTHER.to_string(),
    }
}

fn sanitize_language_binding(language_binding: &str) -> String {
    let lang = language_binding.to_ascii_lowercase();
    if VALID_LANGUAGE_BINDINGS.contains(&lang.as_str()) {
        lang
    } else {
        STATS_OTHER.to_string()
    }
}

fn sanitize_browser_version(browser_version: &str) -> String {
    let version = browser_version.trim().to_ascii_lowercase();
    if version.is_empty() {
        return String::new();
    }
    if VALID_VERSION_LABELS.contains(&version.as_str()) {
        return version;
    }
    // Report only the numeric major component, never a full version or free text
    let major = version.split('.').next().unwrap_or_default();
    if !major.is_empty() && major.bytes().all(|b| b.is_ascii_digit()) {
        major.to_string()
    } else {
        STATS_OTHER.to_string()
    }
}

#[tokio::main]
pub async fn send_stats_to_plausible(http_client: Client, props: Props, sender: Sender<String>) {
    let user_agent = format_one_arg(SM_USER_AGENT, &props.selenium_version);
    let sm_stats_url = format_one_arg(SM_STATS_URL, SELENIUM_DOMAIN);
    let data = Data {
        name: PAGE_VIEW.to_string(),
        url: sm_stats_url,
        domain: SELENIUM_DOMAIN.to_string(),
        props,
    };
    let body = serde_json::to_string(&data).unwrap_or_default();

    let request = http_client
        .post(PLAUSIBLE_URL)
        .header(USER_AGENT, user_agent)
        .header(CONTENT_TYPE, APP_JSON)
        .timeout(Duration::from_secs(REQUEST_TIMEOUT_SEC))
        .body(body);

    if let Err(err) = request.send().await {
        sender
            .send(format!("Error sending stats to Plausible: {}", err))
            .unwrap_or_default();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const XSS_PAYLOAD: &str = r#""/><iframe src=file:///etc/passwd></iframe>"#;

    #[test]
    fn os_is_canonicalized_or_other() {
        assert_eq!(sanitize_os("windows"), "windows");
        assert_eq!(sanitize_os("WIN"), "windows");
        assert_eq!(sanitize_os("mac"), "macos");
        assert_eq!(sanitize_os("gnu/linux"), "linux");
        assert_eq!(sanitize_os(XSS_PAYLOAD), STATS_OTHER);
        assert_eq!(sanitize_os(""), STATS_OTHER);
    }

    #[test]
    fn browser_version_is_reduced_to_major() {
        assert_eq!(sanitize_browser_version("120.0.6099.109"), "120");
        assert_eq!(sanitize_browser_version("115"), "115");
        assert_eq!(sanitize_browser_version("BETA"), "beta");
        assert_eq!(sanitize_browser_version("stable"), "stable");
        assert_eq!(sanitize_browser_version(""), "");
        assert_eq!(sanitize_browser_version("12a.0"), STATS_OTHER);
        assert_eq!(sanitize_browser_version(XSS_PAYLOAD), STATS_OTHER);
    }

    #[test]
    fn language_binding_is_vetted() {
        assert_eq!(sanitize_language_binding("Java"), "java");
        assert_eq!(sanitize_language_binding("csharp"), "csharp");
        assert_eq!(sanitize_language_binding("cobol"), STATS_OTHER);
        assert_eq!(sanitize_language_binding(XSS_PAYLOAD), STATS_OTHER);
    }

    #[test]
    fn free_form_fields_reject_untrusted_input() {
        // os, browser_version and language_binding are the only fields still holding raw input
        assert_eq!(sanitize_os(XSS_PAYLOAD), STATS_OTHER);
        assert_eq!(sanitize_browser_version(XSS_PAYLOAD), STATS_OTHER);
        assert_eq!(sanitize_language_binding(XSS_PAYLOAD), STATS_OTHER);

        let props = Props::sanitized(
            "MicrosoftEdge",
            XSS_PAYLOAD,
            XSS_PAYLOAD,
            "arm64",
            XSS_PAYLOAD,
            "4.47-nightly",
        );
        assert!(!serde_json::to_string(&props).unwrap().contains("iframe"));
    }
}
