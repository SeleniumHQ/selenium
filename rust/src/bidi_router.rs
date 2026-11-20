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

//! Bookkeeping that lets several BiDi clients share one upstream connection: which events each
//! client subscribed to, and which top-level browsing context an event belongs to.

use serde_json::Value;
use std::collections::HashMap;

/// A `session.subscribe` made by one client, as the remote end acknowledged it.
#[derive(Clone, Debug, PartialEq)]
pub struct Subscription {
    pub id: String,
    pub events: Vec<String>,
    /// Top-level browsing contexts the subscription is limited to (`None`: all of them).
    pub contexts: Option<Vec<String>>,
}

impl Subscription {
    fn covers(&self, method: &str) -> bool {
        self.events.iter().any(|event| {
            event == method
                || method
                    .strip_prefix(event.as_str())
                    .is_some_and(|rest| rest.starts_with('.'))
        })
    }
}

/// Parent of every known browsing context, kept from `browsingContext` events.
#[derive(Default)]
pub struct ContextTree {
    parents: HashMap<String, String>,
}

impl ContextTree {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn on_event(&mut self, method: &str, params: &Value) {
        let Some(context) = params["context"].as_str() else {
            return;
        };
        match method {
            "browsingContext.contextCreated" => {
                if let Some(parent) = params["parent"].as_str() {
                    self.parents.insert(context.to_string(), parent.to_string());
                }
            }
            "browsingContext.contextDestroyed" => {
                self.parents.remove(context);
            }
            _ => {}
        }
    }

    pub fn top_level(&self, context: &str) -> String {
        let mut current = context;
        while let Some(parent) = self.parents.get(current) {
            current = parent;
        }
        current.to_string()
    }
}

/// Subscriptions made by one client.
#[derive(Default)]
pub struct Subscriptions {
    active: Vec<Subscription>,
}

impl Subscriptions {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add(&mut self, sub: Subscription) {
        self.active.push(sub);
    }

    pub fn remove_ids(&mut self, ids: &[String]) {
        self.active.retain(|sub| !ids.contains(&sub.id));
    }

    /// Legacy `session.unsubscribe` by event names.
    pub fn remove_events(&mut self, events: &[String]) {
        for sub in &mut self.active {
            sub.events.retain(|event| !events.contains(event));
        }
        self.active.retain(|sub| !sub.events.is_empty());
    }

    /// Whether the remote end would have sent this event to the client on its own. Events whose
    /// context is unknown are not delivered to context-scoped subscriptions.
    pub fn delivers(&self, method: &str, params: &Value, tree: &ContextTree) -> bool {
        self.active.iter().any(|sub| {
            sub.covers(method)
                && match &sub.contexts {
                    None => true,
                    Some(contexts) => event_context(params)
                        .map(|context| tree.top_level(context))
                        .is_some_and(|top| contexts.contains(&top)),
                }
        })
    }
}

pub fn event_context(params: &Value) -> Option<&str> {
    params["context"]
        .as_str()
        .or_else(|| params["source"]["context"].as_str())
}

/// The subscription a `session.subscribe` command created, from its parameters and result.
pub fn subscription_from(params: &Value, result: &Value) -> Option<Subscription> {
    let strings = |value: &Value| -> Option<Vec<String>> {
        value.as_array().map(|items| {
            items
                .iter()
                .filter_map(|item| item.as_str().map(str::to_string))
                .collect()
        })
    };
    Some(Subscription {
        id: result["subscription"].as_str()?.to_string(),
        events: strings(&params["events"]).unwrap_or_default(),
        contexts: strings(&params["contexts"]),
    })
}

/// Like `subscription_from`, but remote ends that predate subscription ids still get the
/// subscription recorded; with an empty id only a legacy unsubscribe by event names removes it.
pub fn subscription_for(params: &Value, result: &Value) -> Subscription {
    subscription_from(params, result).unwrap_or_else(|| {
        let mut sub = subscription_from(params, &serde_json::json!({"subscription": ""}))
            .expect("a subscription with an id");
        sub.id = String::new();
        sub
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn sub(events: &[&str], contexts: Option<&[&str]>) -> Subscription {
        Subscription {
            id: "sub-1".to_string(),
            events: events.iter().map(|e| e.to_string()).collect(),
            contexts: contexts.map(|c| c.iter().map(|c| c.to_string()).collect()),
        }
    }

    fn subscriptions(sub: Subscription) -> Subscriptions {
        let mut subscriptions = Subscriptions::new();
        subscriptions.add(sub);
        subscriptions
    }

    #[test]
    fn event_name_and_module_match() {
        let tree = ContextTree::new();
        let params = json!({"source": {"context": "top"}});
        assert!(subscriptions(sub(&["log"], None)).delivers("log.entryAdded", &params, &tree));
        assert!(
            !subscriptions(sub(&["network.responseCompleted"], None)).delivers(
                "network.beforeRequestSent",
                &params,
                &tree
            )
        );
    }

    #[test]
    fn context_scoped_matches_top_level_context() {
        let mut tree = ContextTree::new();
        tree.on_event(
            "browsingContext.contextCreated",
            &json!({"context": "child", "parent": "top"}),
        );
        let scoped = subscriptions(sub(&["log.entryAdded"], Some(&["top"])));
        assert!(scoped.delivers(
            "log.entryAdded",
            &json!({"source": {"context": "child"}}),
            &tree
        ));
        assert!(!scoped.delivers(
            "log.entryAdded",
            &json!({"source": {"context": "other"}}),
            &tree
        ));
    }

    #[test]
    fn event_without_context_is_not_delivered_to_context_scoped() {
        let scoped = subscriptions(sub(&["log.entryAdded"], Some(&["top"])));
        assert!(!scoped.delivers("log.entryAdded", &json!({}), &ContextTree::new()));
    }

    #[test]
    fn legacy_remove_events_drops_matching_subscriptions() {
        let mut subscriptions = subscriptions(sub(&["log.entryAdded"], None));
        subscriptions.remove_events(&["log.entryAdded".to_string()]);
        assert!(!subscriptions.delivers("log.entryAdded", &json!({}), &ContextTree::new()));
    }

    #[test]
    fn subscription_from_requires_id() {
        let params = json!({"events": ["log.entryAdded"], "contexts": ["top"]});
        let parsed = subscription_from(&params, &json!({"subscription": "sub-7"})).unwrap();
        assert_eq!(parsed.id, "sub-7");
        assert_eq!(parsed.events, ["log.entryAdded"]);
        assert_eq!(parsed.contexts, Some(vec!["top".to_string()]));
        assert!(subscription_from(&params, &json!({})).is_none());
    }

    #[test]
    fn subscriptions_without_id_are_kept_until_a_legacy_unsubscribe() {
        let params = json!({"events": ["log.entryAdded"]});
        let mut subscriptions = Subscriptions::new();
        subscriptions.add(subscription_for(&params, &json!({})));
        let tree = ContextTree::new();
        assert!(subscriptions.delivers("log.entryAdded", &json!({}), &tree));
        subscriptions.remove_ids(&["sub-1".to_string()]);
        assert!(subscriptions.delivers("log.entryAdded", &json!({}), &tree));
        subscriptions.remove_events(&["log.entryAdded".to_string()]);
        assert!(!subscriptions.delivers("log.entryAdded", &json!({}), &tree));
    }
}
