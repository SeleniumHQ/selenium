# Used to create a development image for working on Selenium
FROM shs96c/selenium-remote-build:latest

USER root

RUN apt-get update -qqy && apt-get install -y wget curl gnupg2

# So we can install browsers later
RUN wget https://packages.microsoft.com/config/ubuntu/21.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list

ENV DEBIAN_FRONTEND=noninteractive

# Things needed by bazel
RUN apt-get update -qqy && \
    apt-get -qy install build-essential \
                        git-all \
                        ca-certificates \
                        libssl-dev openssl \
                        openjdk-11-jdk \
                        ruby-full && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

ADD https://github.com/bazelbuild/bazelisk/releases/download/v1.12.0/bazelisk-linux-amd64 /usr/bin/bazelisk
RUN chmod 755 /usr/bin/bazelisk && ln -sf /usr/bin/bazelisk /usr/bin/bazel

RUN chmod 777 /
USER dev
WORKDIR /home/dev
RUN git clone --depth 1 https://github.com/SeleniumHQ/selenium.git /home/dev/selenium
RUN echo "build --//common:pin_browsers" >>/home/dev/selenium/.bazelrc.local
RUN echo "build --//common:headless" >>/home/dev/selenium/.bazelrc.local
#USER root
