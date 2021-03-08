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
    --publish_version 3.14.15 \\
    --publish path/to/file/one.txt path/to/file/two.txt \\
    --acl "public-read"

This will publish
    http://releases.storage.googleapis.com/3.14.15/one.txt
    http://releases.storage.googleapis.com/3.14.15/two.txt
"""

import argparse
import logging
import mimetypes
import os.path
import sys


try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print ('Could not import the library that provides oauthlib integration for Google Auth\n'
           + 'Download available at https://github.com/googleapis/google-auth-library-python-oauthlib\n'
           + 'or run `pip install google-auth-oauthlib`')
    sys.exit(1)

try:
    from google.cloud import storage
except ImportError:
    print ('Could not import Python Client for Google Cloud Storage\n'
           + 'Download available at https://github.com/googleapis/python-storage\n'
           + 'or run `pip install google-cloud-storage`')
    sys.exit(1)

OAUTH_SCOPE = ['https://www.googleapis.com/auth/devstorage.full_control']

mimetypes.add_type("application/java-archive", ".jar")


def create_args_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--client_secrets',
        default='client_secrets.json',
        help='the OAuth 2.0 client secrets file to use (default: client_secrets.json)')
    parser.add_argument(
        '--save_credentials',
        default=False,
        action='store_true',
        help='should OAuth 2.0 credentials be saved to a local file or not (default: false)')
    parser.add_argument(
        '--credentials_file',
        default='credentials.json',
        help='a file to save OAuth 2.0 credentials to (default: credentials.json)')
    parser.add_argument(
        '--project_id',
        help='the Cloud Storage project id')
    parser.add_argument(
        '--bucket',
        help='the bucket to upload to')
    parser.add_argument(
        '--publish_version',
        help='the version being published (e.g. 1.23)')
    parser.add_argument(
        '--acl',
        default='private',
        choices=['private', 'public-read', 'authenticated-read'],
        help='the ACLs to assign to the uploaded files')
    parser.add_argument(
        '--publish',
        nargs='+',
        help='files to publish to Cloud Storage')
    parser.add_argument(
        '--logging_level',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        default='INFO',
        help='the level of logging detail')
    return parser


def _authenticate(client_secrets, save_credentials=False, credentials_file=None):
    if os.path.isfile(credentials_file):
        credentials = Credentials.from_authorized_user_file(credentials_file)
        if credentials is not None:
            return credentials

    flow = InstalledAppFlow.from_client_secrets_file(client_secrets, scopes=OAUTH_SCOPE)
    flow.run_local_server()
    credentials = flow.credentials
    if save_credentials:
        with open(credentials_file, 'w') as f:
            f.write(credentials.to_json())
    return credentials


def _upload(bucket, file_path, object_name, acl):
    blob = bucket.blob(object_name)
    # blob.delete()
    blob.upload_from_filename(file_path, predefined_acl=acl)
    return blob.public_url


def main():
    parser = create_args_parser()
    args = parser.parse_args()

    logging.basicConfig(level=args.logging_level)

    def die(message):
        logging.fatal(message)
        sys.exit(2)

    if args.client_secrets is None:
        die('You must specify a client secrets file via --client_secrets')
    if args.project_id is None:
        die('You must specify a project ID via --project_id')
    if args.bucket is None:
        die('You must specify a bucket via --bucket')
    if args.publish_version is None:
        die('You must specify a published version identifier via --publish_version')

    credentials = _authenticate(args.client_secrets, args.save_credentials, args.credentials_file)
    client = storage.Client(project=args.project_id, credentials=credentials)
    bucket = client.get_bucket(args.bucket)

    published = []
    for f in args.publish:
        object_name = '%s/%s' % (args.publish_version, os.path.basename(f))
        logging.info('Publishing %s as %s', f, object_name)
        public_url = _upload(bucket, f, object_name, args.acl)
        published.append(public_url)

    if published:
        logging.info('Published:\n    %s' % '\n    '.join(published))


if __name__ == '__main__':
    main()
