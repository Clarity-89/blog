import translitcodec, re, itertools
from datetime import datetime
from angular_flask.core import db
from angular_flask import app
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from flask.ext.login import UserMixin

_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')

favorites = db.Table('favorites',
                     db.Column('post_id', db.Integer, db.ForeignKey('post.id')),
                     db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
                     )


class Post(db.Model):
    __tablename__ = 'post'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(240))
    slug = db.Column(db.String(240), unique=True)
    body = db.Column(db.String())
    photo = db.Column(db.String(), default='../img/covers/default.jpg')
    date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    favorited = db.Column(db.Integer, default=0)
    favorited_by = db.relationship('User', secondary=favorites, backref=db.backref('favorited', lazy='dynamic'))
    comments = db.relationship('Comment', cascade="all, delete-orphan", backref='post', lazy='dynamic')

    def slugify(self, text, delim=u'-'):
        """
        Generates an ASCII-only slug with unique index in case of slug name clashes and saves it to db.
        :param text: text to be made into slug
        :param delim: delimiter for slug
        """
        result = []
        for word in _punct_re.split(text.lower()):
            word = word.encode('translit/long')
            if word:
                result.append(word)

        slug = orig = unicode(delim.join(result))

        for x in itertools.count(0):
            if not Post.query.filter_by(slug=slug).first():
                break
            slug = '%s-%d' % (orig, x)

        self.slug = slug

    @property
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'body': self.body,
            'cover_photo': self.photo,
            'date': self.date,
            'author': self.author.username,
            'avatar': self.author.photo,
            'favorited': self.favorited,
            'favorited_by': [user.serialize for user in self.favorited_by],
            'comments': [comment.serialize for comment in self.comments],
            'author_id': self.user_id
        }

    def __init__(self, title, slug, body, author, photo='../img/covers/default.jpg'):
        self.title = title
        self.body = body
        self.slug = slug,
        self.photo = photo
        self.author = author

    def get_slug(self):
        return self.slug

    def __repr__(self):
        return self.id


class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32))
    name = db.Column(db.String(64), nullable=True)
    bio = db.Column(db.Text(), nullable=True)
    email = db.Column(db.String(32))
    photo = db.Column(db.String(), default='../img/avatars/default.jpg')
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
            'name': self.name,
            'bio': self.bio,
            'email': self.email,
            'avatar': self.photo,
        }


class Comment(db.Model):
    __tablename__ = 'comment'

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String())
    date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))

    @property
    def serialize(self):
        return {
            'id': self.id,
            'body': self.body,
            'date': self.date,
            'author': self.author.username,
            'author_ava': self.author.photo
        }
