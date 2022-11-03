//! Selenium Error codes
//!
//! This module contains all the selenium error code for cmd and lib . The main
//! type in this module is `ErrorCode` which is not intended to be used through
//! this module but rather the `selenium::ErrorCode` type.
//!
//! # Examples
//!
//! ```
//! use selenium::ErrorCode;
//!
//! assert!(ErrorCode::UnknownPath);
//! ```

use std::borrow::Cow;
use std::error::Error;
use std::fmt;

use http::StatusCode;
use serde::Serialize;

use crate::error::ErrorCode::InvalidSessionId;

/// Result of a webdriver operation.
pub type WebDriverResult<T> = Result<T, WebDriverError>;

/// ErrorCode - will have all the error code in Selenium error
#[derive(Debug, PartialEq, Eq, Hash)]
#[non_exhaustive]
pub enum ErrorCode {
    /// Occurs if the given session ID is not in the list of active sessions,
    /// meaning the session either does not exist or that it’s not active.
    InvalidSessionId,
    /// Unknown WebDriver command.
    UnknownPath,
}

/// implementation for webdriver that
impl ErrorCode {
    /// Returns the correct HTTP status code associated with the error type.
    pub fn http_status(&self) -> StatusCode {
        use self::ErrorCode::*;
        match *self {
            InvalidSessionId => StatusCode::NOT_FOUND,
            UnknownPath => StatusCode::NOT_FOUND,
        }
    }
}

impl fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.description())
    }
}

impl Error for ErrorCode {}

// This macro implements conversions between the error string literal and the
// corresponding ErrorCode variant.
macro_rules! define_error_strings {
    ($($variant:ident => $error_str:literal $(| $error_str_aliases:literal)*$(,)?),*) => {
        impl ErrorCode {
            /// Get the error string associated with this `ErrorCode`.
            pub fn description(&self) -> &'static str {
                use self::ErrorCode::*;
                match self {
                    $(
                        $variant => $error_str,
                    )*
                }
            }
        }
    }
}

define_error_strings! {
    InvalidSessionId => "Invalid session id ",
    UnknownPath => "UnknownPath",
}

/// Error returned from a webdriver operation.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
#[allow(missing_docs)]
pub enum WebDriverError {
    #[error("command error: {0}")]
    Cmd(ErrorCode),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("io error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Custom Error Sample: to demo how to create one !!! Don't use this one ")]
    SampleCustomError(WebDriverErrorArgs),
}

/// Error details returned by WebDriver.
#[derive(Debug, Serialize)]
pub struct WebDriverErrorArgs {
    /// Description of this error provided by WebDriver.
    pub message: Cow<'static, str>,
    /// Stacktrace of this error provided by WebDriver.
    pub stacktrace: String,
    /// Optional Value populated by some commands.
    pub data: Option<serde_json::Value>,
}

impl WebDriverErrorArgs {
    /// Create a new `WebDriverErrorArgs`.
    pub fn new(message: impl Into<Cow<'static, str>>) -> Self {
        Self {
            message: message.into(),
            stacktrace: String::new(),
            data: None,
        }
    }
}

impl fmt::Display for WebDriverError {
    #[allow(deprecated)]
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match *self {
            WebDriverError::Cmd(ref e) => write!(f, "{}", e),
            WebDriverError::Json(ref e) => write!(f, "{}", e),
            WebDriverError::IoError(ref e) => write!(f, "{}", e),
            WebDriverError::SampleCustomError(ref e) => write!(f, "{:?}", e),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::error::ErrorCode;

    #[test]
    fn raise_cmd_error() {
      assert_eq!(ErrorCode::UnknownPath, ErrorCode::UnknownPath, "Error code does not match")
    }
}
