import os
from flask import Flask
from flask_sslify import SSLify


app = Flask(__name__, instance_relative_config=True)
if 'DYNO' in os.environ:
    sslify = SSLify(app)

app.config.from_object('config')
app.config.from_pyfile('config.py', True)

import angular_flask.core
import angular_flask.models
import angular_flask.controllers
