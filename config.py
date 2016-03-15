import os

basedir_img = os.path.abspath(os.path.dirname('angular_flask'))

SECRET_KEY = os.environ.get('SECRET_KEY')
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

DEBUG = False
SQLALCHEMY_TRACK_MODIFICATIONS = False
UPLOAD_FOLDER = os.path.join(basedir_img, 'angular_flask/static/img/')
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
IMG_FOLDER = 'https://s3-eu-west-1.amazonaws.com/theeblog/'
