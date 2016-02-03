from datetime import datetime
import time
from angular_flask.core import db
from angular_flask import app
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from flask.ext.login import UserMixin


class Post(db.Model):
    __tablename__ = 'post'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(240))
    body = db.Column(db.String())
    cover_photo = db.Column(db.String(), default='../img/default.jpg')
    # Store time as integer in milliseconds
    date = db.Column(db.Integer, default=int(round(time.time() * 1000)))
    author = db.Column(db.String(32))
    favorited = db.Column(db.Integer, default=0)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'cover_photo': self.cover_photo,
            'date': self.date,
            'author': self.author,
            'favorited': self.favorited
        }

    def __init__(self, title, body, author, cover_photo='../img/default.jpg', ):
        self.title = title
        self.body = body
        self.cover_photo = cover_photo
        self.author = author


def __repr__(self):
    return '<id {}>'.format(self.id)  # models for which we want to create API endpoints


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32))
    email = db.Column(db.String(32))
    password_hash = db.Column(db.String(128))

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=600):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    def __repr__(self):
        return '<User %r>' % (self.username)\


    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None  # valid token, but expired
        except BadSignature:
            return None  # invalid token
        user = User.query.get(data['id'])
        return user



