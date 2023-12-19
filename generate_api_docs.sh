#!/usr/bin/env bash

API_DOCS_LANGUAGE=$1
BRANCH_NAME=${2:-trunk}

case ${API_DOCS_LANGUAGE} in
java)
  ./go java:docs || exit
  ;;
py)
  ./go py:docs || exit
  ;;
rb)
  ./go rb:docs || exit
  ;;
dotnet)
  ./go dotnet:docs || exit
  ;;
all)
  ./go all:docs || exit
  ;;
*)
  echo "Selenium API docs generation"
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  echo "Usage:"
  echo ""
  echo "./generate_api_docs.sh java|rb|py|dotnet|all"
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
  cp -r build/docs/api/java docs/api/java
  ;;
py)
  rm -rf docs/api/py
  cp -r build/docs/api/py docs/api/py
  ;;
rb)
  rm -rf docs/api/rb
  cp -r build/docs/api/rb docs/api/rb
  ;;
dotnet)
  rm -rf docs/api/dotnet
  cp -r build/docs/api/dotnet docs/api/dotnet
  ;;
all)
  rm -rf docs/api/java
  rm -rf docs/api/py
  rm -rf docs/api/rb
  rm -rf docs/api/dotnet
  cp -r build/docs/api/* docs/api/
  ;;
*)
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  exit 1
  ;;
esac

git add -A docs/api || exit

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
git commit -am "updating API docs for $API_DOCS_LANGUAGE"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to designated branch"
git checkout $BRANCH_NAME
