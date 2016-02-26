from datetime import datetime
import time
from angular_flask.core import db
from angular_flask import app
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from flask.ext.login import UserMixin

favorites = db.Table('favorites',
                     db.Column('post_id', db.Integer, db.ForeignKey('post.id')),
                     db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
                     )


class Post(db.Model):
    __tablename__ = 'post'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(240))
    body = db.Column(db.String())
    cover_photo = db.Column(db.String(), default='../img/covers/default.jpg')
    # Store time as integer in milliseconds
    date = db.Column(db.Integer, default=int(round(time.time() * 1000)))
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'))
    favorited = db.Column(db.Integer, default=0)
    favorited_by = db.relationship('User', secondary=favorites, backref=db.backref('favorited', lazy='dynamic'))
    comments = db.relationship('Comment', backref='post', lazy='dynamic')

    @property
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'cover_photo': self.cover_photo,
            'date': self.date,
            'author': self.author.username,
            'avatar': self.author.avatar,
            'favorited': self.favorited
        }

    def __init__(self, title, body, author, cover_photo='../img/covers/default.jpg', ):
        self.title = title
        self.body = body
        self.cover_photo = cover_photo
        self.author = author


def __repr__(self):
    return '<id {}>'.format(self.id)  # models for which we want to create API endpoints


class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32))
    email = db.Column(db.String(32))
    avatar = db.Column(db.String(), default='../img/avatars/default.png')
    password_hash = db.Column(db.String(128))
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=600):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    def __repr__(self):
        return '<User %r>' % self.username

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

    @property
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
        }


class Comment(db.Model):
    __tablename__ = 'comment'

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String())
    date = db.Column(db.Integer, default=int(round(time.time() * 1000)))
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'))
    post_id = db.Column(db.String(32), db.ForeignKey('post.id'))

    @property
    def serialize(self):
        return {
            'id': self.id,
            'body': self.body,
            'date': self.date,
            'author': self.author.username,
            'author_ava': self.author.avatar
        }
