#!/usr/bin/env bash

# We try not to rely on there being anything installed on the
# local machine so although it would be nice to use `jq` here
# we don't do so. This means that a selenium build needs very
# little installed by the user

function emit_headers() {
  echo "{\"headers\":{\"Authorization\":[\"Bearer ${1}\"]}}"
  exit 0
}

function netrc_password() {
  if [ ! -e "$HOME/.netrc" ]; then
    return
  fi

  cat $HOME/.netrc | sed -e 's/#.*//' | awk -v host="$1" -v field=password '{
        if ($1 == "machine") {
          found = ($2 == host);
        } else if (found && ($1 == field)) {
          print $2;
          exit
        } else if (found && $1 == "machine") {
          found = false
        }
    }'
}

function get() {
  INPUT=$1

  if [ -z "$(echo "$INPUT" | grep "gypsum.cluster")" ]; then
    exit 0
  fi

  if [ -n "$GITHUB_TOKEN" ]; then
    emit_headers "$GITHUB_TOKEN"
  fi

  if [ -n "$ENGFLOW_GITHUB_TOKEN" ]; then
    emit_headers "${ENGFLOW_GITHUB_TOKEN}"
  fi

  NETRC="$(netrc_password github.com)"
  if [ -n "${NETRC}" ]; then
    emit_headers "${NETRC}"
  fi

  KEYCHAIN="$(security find-generic-password -a selenium -s 'Selenium EngFlow' -w )" 2>/dev/null
  if [ -n "$KEYCHAIN" ]; then
    emit_headers "${KEYCHAIN}"
  fi

  echo "{\"headers\":{}}"
  exit 0
}

function set() {
    security add-generic-password -a selenium -s 'Selenium EngFlow' -w "$1"
    exit 0
}

cmd=$1

case $cmd in
"get")
  get "$(</dev/stdin)"
  ;;

"set")
  set "$(</dev/stdin)"
  ;;

"test")
  get '{"uri":"https://gypsum.cluster.engflow.com/google.devtools.build.v1.PublishBuildEvent"}'
  ;;

*)
  exit 1
  ;;
esac
