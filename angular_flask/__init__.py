import os
import json
from flask import Flask, request, Response
from flask import render_template, send_from_directory, url_for

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname('data'))


app.config["SECRET_KEY"] = "\xed\x9c\xac\xcd4\x83k\xd1\x17\xd54\xe71\x03\xaf\xd8\x04\xe3\xcd\xaa\xf4\x97\x82\x1e"
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(basedir, 'data/posts.db')
app.config["DEBUG"] = True
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


import angular_flask.core
import angular_flask.models
import angular_flask.controllers
