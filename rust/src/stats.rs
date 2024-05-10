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

use crate::format_one_arg;
use reqwest::header::CONTENT_TYPE;
use reqwest::header::USER_AGENT;
use reqwest::Client;
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
