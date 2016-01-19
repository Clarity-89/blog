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

    @property
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'date': self.date,
            'author': self.author,
            'favorited': self.favorited
        }

    def __init__(self, title, body, author):
        self.title = title
        self.body = body
        self.author = author


def __repr__(self):
    return '<id {}>'.format(self.id)  # models for which we want to create API endpoints


