import os
from flask import Flask
from flask_sslify import SSLify
import angular_flask.core
import angular_flask.models
import angular_flask.controllers

app = Flask(__name__)
if 'DYNO' in os.environ:
    sslify = SSLify(app)

basedir = os.path.abspath(os.path.dirname('data'))
basedir_img = os.path.abspath(os.path.dirname('angular_flask'))
app.config["SECRET_KEY"] = "secret_key"
# app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(basedir, 'data/posts.db')
app.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://admin:111111@localhost:5432/posts'
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config["DEBUG"] = True
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['UPLOAD_FOLDER'] = os.path.join(basedir_img, 'angular_flask/static/img')


