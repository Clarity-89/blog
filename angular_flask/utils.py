"""
Helper functions for controllers.py
"""

import os, boto3, uuid, io, re
from PIL import Image
from flask.ext.httpauth import HTTPBasicAuth

from flask import request, abort
from angular_flask.models import *

_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')
auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username_or_token, password):
    """
    Check passwords validity against token or username
    :param username_or_token:
    :param password:
    :return:
    """
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username=username_or_token).first()
        if not user:
            return abort(400, 'username')
        elif not user.verify_password(password):
            return abort(400, 'password')
    return True


def allowed_file(filename):
    """
    Check if file extension is in allowed extensions
    :param filename: Name of the file to be checked
    :return: True or False
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def save_image(img_type, elem):
    """
    Save post cover or user avatar to local filesystem in dev or to S3 in prod
    :param img_type: 'avatars' or 'covers'
    :param elem: post or user obj on which to save the image
    :return: name of the file to be saved
    """
    image = request.files['file']
    if elem:
        filename = elem.photo.rsplit('/', 1)[-1]
        # Do not overwrite default image but generate unique file name instead
        if filename == 'default.jpg':
            filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
            elem.photo = app.config['IMG_FOLDER'] + img_type + '/' + filename
    else:
        filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
    img = Image.open(image)
    if img_type == 'avatars':
        size = 512
    else:
        size = 1024
    maxsize = (size, size)
    img.thumbnail(maxsize, Image.ANTIALIAS)
    if 'DYNO' in os.environ:  # check if the app is running on Heroku server
        s3 = boto3.resource('s3')
        output = io.BytesIO()
        img.save(output, format='JPEG')
        s3.Object('theeblog', img_type + '/' + filename).put(Body=output.getvalue())
    else:  # Otherwise save to local filesystem
        img.save(os.path.join(app.config['UPLOAD_FOLDER'] + img_type, filename))
    return filename


def slugify(text, delim=u'-'):
    """
    Generates an ASCII-only slug.
    :param text: text to be slugified
    :param delim: delimiter for slug
    :return:
    """
    result = []
    for word in _punct_re.split(text.lower()):
        word = word.encode('translit/long')
        if word:
            result.append(word)
    return unicode(delim.join(result))
