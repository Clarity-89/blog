from datetime import datetime

from angular_flask.core import db
from angular_flask import app


class Post(db.Model):
    __tablename__ = 'post'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(240))
    body = db.Column(db.String())
    date = db.Column(db.DateTime, default=datetime.utcnow)
    author = db.Column(db.String(32))
    favorited = db.Column(db.Integer, default=0)

    def __init__(self, title, body, author):
        self.title = title
        self.body = body
        self.author = author


def __repr__(self):
    return '<id {}>'.format(self.id)  # models for which we want to create API endpoints
app.config['API_MODELS'] = {'post': Post}

# models for which we want to create CRUD-style URL endpoints,
# and pass the routing onto our AngularJS application
app.config['CRUD_URL_MODELS'] = {'post': Post}
