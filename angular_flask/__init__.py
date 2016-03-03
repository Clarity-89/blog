import os
from flask import Flask

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname('data'))
basedir_img = os.path.abspath(os.path.dirname('angular_flask'))
app.config["SECRET_KEY"] = "\xed\x9c\xac\xcd4\x83k\xd1\x17\xd54\xe71\x03\xaf\xd8\x04\xe3\xcd\xaa\xf4\x97\x82\x1e"
#app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(basedir, 'data/posts.db')
app.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://admin:111111@localhost:5432/posts'
app.config["DEBUG"] = True
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['UPLOAD_FOLDER'] = os.path.join(basedir_img, 'angular_flask/static/img')

import angular_flask.core
import angular_flask.models
import angular_flask.controllers
