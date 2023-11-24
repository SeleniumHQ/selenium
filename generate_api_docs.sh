#!/usr/bin/env bash

API_DOCS_LANGUAGE=$1

case ${API_DOCS_LANGUAGE} in
java)
  ./go javadocs || exit
  ;;
py)
  tox -c py/tox.ini -e docs || exit
  ;;
rb)
  bazel run //rb:docs || exit
  docs="$(bazel cquery --output=files //rb:docs 2> /dev/null).runfiles/selenium/docs/api/rb"
  ;;
dotnet)
  # dotnet sdk should be installed
  # bazel should be installed
  dotnet tool update -g docfx
  docfx dotnet/docs/docfx.json
  ;;
*)
  echo "Selenium API docs generation"
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  echo "Usage:"
  echo ""
  echo "./generate_api_docs.sh java|rb|py"
  echo -e "\t Example:"
  echo -e "\t Generating API docs for the Ruby bindings"
  echo -e "\t ./generate_api_docs.sh rb"
  exit 1
  ;;
esac

# switch to gh-pages and copy the files
git checkout gh-pages || exit
# make sure that our local version is up to date.
git pull || exit

case ${API_DOCS_LANGUAGE} in
java)
  rm -rf docs/api/java
  mv build/javadoc docs/api/java
  ;;
py)
  rm -rf docs/api/py
  mv build/docs/api/py docs/api/py
  ;;
rb)
  rm -rf docs/api/rb
  mv $docs docs/api/rb
  ;;
dotnet)
  rm -rf docs/api/dotnet
  mv build/docs/api/dotnet docs/api/dotnet
  ;;
*)
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  exit 1
  ;;
esac

git add -A docs/api

read -p "Do you want to commit the changes? (Y/n):" changes </dev/tty

if [ -z $changes ]; then
  changes=Y
fi

case "$changes" in
Y | y) echo "" ;;
N | n) exit ;;
*) exit ;;
esac

echo "Committing changes"
git commit -am "updating API docs"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to trunk branch"
git checkout trunk
