"""Script for publishing new versions of Selenium to cloud storage.

When you run this script, it will use OAuth 2.0 to authenticate with
Google Cloud Storage before attempting to upload any files. This script
will fail if the authenticated account does not have write access to the
indicated bucket.

By default, this script will use the adjacent client_secrets.json for
OAuth authentication; this may be changed with the --client_secrets
flag.

Example usage:

python publish_release.py \\
    --client_secrets my_secrets.json \\
    --project_id foo:bar \\
    --bucket releases \\
    --publish_version 1.50 \\
    --publish path/to/file/one.txt \\
    --publish path/to/file/two.txt \\
    --acl "public-read"

This will publish
    http://releases.storage.googleapis.com/1.50/one.txt
    http://releases.storage.googleapis.com/1.50/two.txt
"""

import logging
import mimetypes
from  optparse import OptionParser
import os
import sys

try:
    import gflags
except ImportError:
     print ('Could not import gflags\n'
            'Download available at https://code.google.com/p/'
           'python-gflags/downloads/\nor run `easy_install python-gflags`')
     sys.exit(1)

try:
    import httplib2
except ImportError:
     print ('Could not import httplib2\n'
            'Download available at https://code.google.com/p/httplib2/'
           'downloads/\nor run `easy_install httplib2`')
     sys.exit(1)

try:
    import oauth2client.client as oauthclient
    import oauth2client.file as oauthfile
    import oauth2client.tools as oauthtools
except ImportError:
    print ('Could not import oauth2client\n'
           'Download available at https://code.google.com/p/'
           'google-api-python-client/downloads\nor run '
           '`easy_install oauth2client`')
    sys.exit(1)


FLAGS = gflags.FLAGS

gflags.DEFINE_enum(
    'logging_level', 'INFO', ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    'Set the level of logging detail.')
gflags.DEFINE_string(
    'client_secrets',
    os.path.join(os.path.dirname(__file__), 'client_secrets.json'),
    'The OAuth 2.0 client secrets file to use')
gflags.DEFINE_string(
    'project_id', None, 'The Cloud Storage project id')
gflags.DEFINE_string(
    'bucket', None, 'The bucket to upload to')
gflags.DEFINE_string(
    'publish_version', None, 'The version being published (e.g. 1.23)')
gflags.DEFINE_multistring(
    'publish', [],
    'A file to publish to Cloud Storage; this may be specified multiple times')
gflags.DEFINE_enum(
    'acl', 'private', ['private', 'public-read', 'authenticated-read'],
    'The ACLs to assign to the uploaded files')


API_VERSION = '2'
DEFAULT_SECRETS_FILE = os.path.join(os.path.dirname(__file__),
                                    'client_secrets.json')
OAUTH_CREDENTIALS_FILE = '.credentials.dat'
OAUTH_SCOPE = 'https://www.googleapis.com/auth/devstorage.full_control'

mimetypes.add_type("application/java-archive", ".jar")

class Error(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message

    def __str__(self):
        return '%s: %s' % (repr(self.status), repr(self.message))


def _upload(auth_http, project_id, bucket_name, file_path, object_name, acl):
    """Uploads a file to Google Cloud Storage.

    Args:
        auth_http: An authorized httplib2.Http instance.
        project_id: The project to upload to.
        bucket_name: The bucket to upload to.
        file_path: Path to the file to upload.
        object_name: The name within the bucket to upload to.
        acl: The ACL to assign to the uploaded file.
    """
    with open(file_path, 'rb') as f:
        data = f.read()
    content_type, content_encoding = mimetypes.guess_type(file_path)

    headers = {
        'x-goog-project-id': project_id,
        'x-goog-api-version': API_VERSION,
        'x-goog-acl': acl,
        'Content-Length': '%d' % len(data)
    }
    if content_type: headers['Content-Type'] = content_type
    if content_type: headers['Content-Encoding'] = content_encoding

    try:
        response, content = auth_http.request(
            'http://%s.storage.googleapis.com/%s' % (bucket_name, object_name),
            method='PUT',
            headers=headers,
            body=data)
    except httplib2.ServerNotFoundError, se:
        raise Error(404, 'Server not found.')

    if response.status >= 300:
        raise Error(response.status, response.reason)

    return content


def _authenticate(secrets_file):
    """Runs the OAuth 2.0 installed application flow.

    Returns:
      An authorized httplib2.Http instance.
    """
    flow = oauthclient.flow_from_clientsecrets(
        secrets_file,
        scope=OAUTH_SCOPE,
        message=('Failed to initialized OAuth 2.0 flow with secrets '
                 'file: %s' % secrets_file))
    storage = oauthfile.Storage(OAUTH_CREDENTIALS_FILE)
    credentials = storage.get()
    if credentials is None or credentials.invalid:
        credentials = oauthtools.run_flow(flow, storage, oauthtools.argparser.parse_args(args=[]))
    http = httplib2.Http()
    return credentials.authorize(http)


def main(argv):
    try:
        argv = FLAGS(argv)
    except gflags.FlagsError, e:
        logging.error('%s\\nUsage: %s ARGS\\n%s', e, argv[0], FLAGS)
        sys.exit(1)

    numeric_level = getattr(logging, FLAGS.logging_level.upper())
    if not isinstance(numeric_level, int):
        logging.error('Invalid log level: %s' % FLAGS.logging_level)
        sys.exit(1)
    logging.basicConfig(level=numeric_level)
    if FLAGS.logging_level == 'DEBUG':
        httplib2.debuglevel = 1

    def die(message):
        logging.fatal(message)
        sys.exit(2)

    if FLAGS.client_secrets is None:
        die('You must specify a client secrets file via --client_secrets')
    if FLAGS.project_id is None:
        die('You must specify a project ID via --project_id')
    if not FLAGS.bucket:
        die('You must specify a bucket via --bucket')
    if FLAGS.publish_version is None:
        die('You must specify a published version identifier via '
            '--publish_version')

    auth_http = _authenticate(FLAGS.client_secrets)
    published = []
    for f in FLAGS.publish:
        object_name = '%s/%s' % (FLAGS.publish_version, os.path.basename(f))
        logging.info('Publishing %s as %s', f, object_name)
        _upload(auth_http, FLAGS.project_id, FLAGS.bucket, f, object_name,
                FLAGS.acl)
        published.append(object_name)

    if published:
        base_url = 'http://%s.storage.googleapis.com/' % FLAGS.bucket
        logging.info('Published:\n    %s' %
            '\n    '.join([base_url + p for p in published]))


if __name__ == '__main__':
    main(sys.argv)
