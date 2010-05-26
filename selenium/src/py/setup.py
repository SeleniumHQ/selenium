from distutils.core import setup

setup(
    name = "selenium",
    version = "1.0.3",
    description = "A Python language binding for Selenium RC",
    author = "Jason Huggins",
    author_email = "hugs@saucelabs.com",
    url = "http://seleniumhq.org/",
    license = "Apache 2.0",
    classifiers= [
        "Development Status :: 6 - Mature",
        "Topic :: Utilities",
        "License :: OSI Approved :: Apache Software License",
        "Intended Audience :: Developers",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
        "Topic :: Software Development :: Testing",
    ],
    py_modules=["selenium"],
)
