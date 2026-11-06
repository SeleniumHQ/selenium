#!/bin/sh -e

java="java"
if test -n "$JAVA_HOME"; then
    java="$JAVA_HOME/bin/java"
fi
# shellcheck disable=SC2086 # JAVA_ARGS may hold several arguments
exec "$java" $JAVA_ARGS -jar "$0" "$@"
exit 1
