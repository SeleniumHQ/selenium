//! # Selenium
//! API for programmatically interacting with web pages through WebDriver.
//! Rust language bindings for Selenium WebDriver.
//!
//! The selenium package is used to automate web browser interaction from Rust
//!
//! Selenium requires a driver to interface with the chosen browser.
//! Firefox, for example, requires geckodriver, which needs to be installed before the below examples can be run.
//! Make sure it's in your PATH, e. g., place it in /usr/bin or /usr/local/bin.
//!
//! Failure to observe this step will give you an error selenium.error.WebDriverError.
//! WebDriverError: Message: 'geckodriver' executable needs to be in PATH.
//!
//! Other supported browsers will have their own drivers available. Links to some of the more popular browser drivers follow.
//! This crate uses the [WebDriver protocol] to drive a conforming (potentially headless) browser
//! through relatively operations such as "click this element", "submit this form", etc.
//!
//! [WebDriver protocol]: https://www.w3.org/TR/webdriver/
#![deny(missing_docs)]
#![allow(rustdoc::missing_doc_code_examples, rustdoc::private_doc_tests)]
pub use error::{ErrorCode, WebDriverError, WebDriverResult};


mod error;

