"""DEBUG = True
SECRET_KEY = 'temporary_secret_key'  # make sure to change this

SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/angular_flask.db' """
import os

basedir = os.path.abspath(os.path.dirname(__file__))

print 'basedir is: ', basedir

class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = "\xed\x9c\xac\xcd4\x83k\xd1\x17\xd54\xe71\x03\xaf\xd8\x04\xe3\xcd\xaa\xf4\x97\x82\x1e"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'posts.db')


class ProductionConfig(Config):
    DEBUG = False


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
