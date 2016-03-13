import os, json, uuid, io

from flask import Flask, request, jsonify, g
from flask import render_template, send_from_directory
from flask import make_response, abort
from sqlalchemy.orm.exc import NoResultFound
from flask.ext.httpauth import HTTPBasicAuth

from PIL import Image
import boto3

from flask.ext.login import LoginManager, login_user, logout_user, current_user

# routing for API endpoints, generated from the models designated as API_MODELS
from angular_flask.core import api_manager
from angular_flask.models import *

login_manager = LoginManager()
login_manager.init_app(app)
session = api_manager.session
auth = HTTPBasicAuth()

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

covers_path = 'https://s3-eu-west-1.amazonaws.com/theeblog/covers/'
avas_path = 'https://s3-eu-west-1.amazonaws.com/theeblog/avatars/'


# Override default error message
@app.errorhandler(400)
def custom400(error):
    response = jsonify({'message': error.description})
    response.status_code = 400
    response.status_text = 'error. Bad Request'
    return response


# Routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/about')
@app.route('/blog')
@app.route('/posts')
@app.route('/posts/<int:id>')
@app.route('/register')
@app.route('/me/posts')
@app.route('/me/profile')
@app.route('/users/<string:username>')
@app.route('/new')
def basic_pages(**kwargs):
    # return make_response(open('angular_flask/templates/index.html').read())
    return render_template('index.html')


# Serve images
@app.route('/img/<type>/<filename>')
def uploaded_file(type, filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'] + '/' + type, filename)


# Endpoint for all posts
@app.route('/blog/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.join(User)
    return jsonify(posts=[post.serialize for post in posts])


# Get specific post or add post to favorites
@app.route('/blog/api/posts/<int:id>', methods=['GET', 'POST'])
def get_post(id):
    if request.method == 'GET':
        try:
            post = Post.query.filter_by(id=id).one()
            return jsonify(post=post.serialize, comments=[c.serialize for c in post.comments])
        except NoResultFound:
            return render_template('404.html'), 404
    elif request.method == 'POST':
        post = Post.query.filter_by(id=id).one()
        user = current_user
        if user in post.favorited_by:
            post.favorited_by.remove(user)
        else:
            post.favorited_by.append(user)
        post.favorited = len(post.favorited_by)
        session.commit()
        return jsonify(post=post.serialize, favs=[fav.serialize for fav in post.favorited_by])


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


# Add a new post
@app.route('/blog/api/posts/new', methods=['POST'])
def add_post():
    p = json.loads(request.form['post'])
    title = p.get('title')
    body = p.get('body')
    if request.files:
        # Amazon S3
        s3 = boto3.resource('s3')
        # Generate unique file name
        image = request.files['file']
        img = Image.open(image)
        filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
        maxsize = (1024, 1024)
        img.thumbnail(maxsize, Image.ANTIALIAS)
        output = io.BytesIO()
        img.save(output, format='JPEG')
        s3.Object('theeblog', 'covers/' + filename).put(Body=output.getvalue())
        # img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/covers', filename))
        post = Post(title=title, body=body, cover_photo=covers_path + filename,
                    author=current_user)
    else:
        post = Post(title=title, body=body, author=current_user)
    session.add(post)
    session.commit()
    return jsonify({'id': post.id})


# Edit post
@app.route('/blog/api/posts/<int:id>/edit', methods=['POST'])
def edit_post(id):
    post = json.loads(request.form['post'])
    title = post.get('title')
    body = post.get('body')
    p = Post.query.filter_by(id=id).first()
    if p is None:
        abort(400, 'Post does not exist')
    p.title = title
    p.body = body
    if request.files:
        s3 = boto3.resource('s3')
        image = request.files['file']
        filename = p.cover_photo.rsplit('/', 1)[-1]
        # Do not overwrite default image but generate unique file name instead
        if filename == 'default.jpg':
            filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
            p.cover_photo = covers_path + filename
        img = Image.open(image)
        maxsize = (1024, 1024)
        img.thumbnail(maxsize, Image.ANTIALIAS)
        output = io.BytesIO()
        img.save(output, format='JPEG')
        s3.Object('theeblog', 'covers/' + filename).put(Body=output.getvalue())
        # img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/covers', filename))
    db.session.commit()
    return jsonify({'id': p.id})


# Delete post
@app.route('/blog/api/posts/<int:id>/delete', methods=['POST'])
def delete_post(id):
    post = Post.query.filter_by(id=id).first()
    if post is None:
        abort(404, 'Post not found')
    if post.author != current_user:
        abort(400)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'delete successful'})


# Add a comment to a post
@app.route('/blog/api/posts/<int:id>/comments/new', methods=['POST'])
def add_comment(id):
    body = request.json
    post = Post.query.filter_by(id=id).first()
    if body is None:
        abort(400, "Cannot save empty comment")
    if post is None:
        abort(400, "Post with given id is not found")
    c = Comment(body=body, author=current_user, post=post)
    db.session.add(c)
    db.session.commit()
    return jsonify(comments=[c.serialize for c in post.comments])


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


# Register new user
@app.route('/blog/api/users', methods=['POST'])
def new_user():
    user = json.loads(request.form['user'])
    username = user.get('username')
    email = user.get('email')
    password = user.get('password')
    if username is None or password is None:
        abort(400)  # missing arguments
    if User.query.filter_by(username=username).first() is not None:
        abort(400, 'User already exists')
    if User.query.filter_by(email=email).first() is not None:
        abort(400, 'Email already exists')
    if request.files:
        s3 = boto3.resource('s3')
        # Generate unique file name
        ava = request.files['file']
        filename = str(uuid.uuid4()) + '.' + ava.filename.rsplit('.', 1)[1]
        img = Image.open(ava)
        maxsize = (480, 480)
        img.thumbnail(maxsize, Image.ANTIALIAS)
        output = io.BytesIO()
        img.save(output, format='JPEG')
        s3.Object('theeblog', 'avatars/' + filename).put(Body=output.getvalue())
        # img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/avatars', filename))
        u = User(username=username, email=email, avatar=avas_path + filename)
    else:
        u = User(username=username, email=email)
    u.hash_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({'username': u.username}), 201


# Get individual user by id
@app.route('/blog/api/users/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify(user=user.serialize, favs=[fav.serialize for fav in user.favorited])


# Check if user is logged in
@app.route('/blog/api/current_user')
def get_curr_user():
    if current_user.is_anonymous:
        return jsonify({'message': 'no user'})
    else:
        return jsonify({'message': 'logged in'})


# Edit user details
@app.route('/blog/api/users/edit', methods=['POST'])
def edit_user():
    user = json.loads(request.form['user'])
    username = user.get('username')
    email = user.get('email')
    new_password = user.get('newPassword')
    password = user.get('password')
    u = User.query.filter_by(username=username).first()
    if u is None:
        abort(400, 'User does not exist')
    u.email = email
    if request.files:
        s3 = boto3.resource('s3')
        ava = request.files['file']
        filename = u.avatar.rsplit('/', 1)[-1]
        # Do not overwrite default ava but generate unique file name instead
        if filename == 'default.png':
            filename = str(uuid.uuid4()) + '.' + ava.filename.rsplit('.', 1)[1]
            u.avatar = avas_path + filename
        img = Image.open(ava)
        maxsize = (480, 480)
        img.thumbnail(maxsize, Image.ANTIALIAS)
        # img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/avatars', filename))
        output = io.BytesIO()
        img.save(output, format='JPEG')
        s3.Object('theeblog', 'avatars/' + filename).put(Body=output.getvalue())
    if new_password:
        if not u.verify_password(password):
            return abort(400, 'password')
        else:
            u.hash_password(new_password)
    db.session.add(u)
    db.session.commit()
    return jsonify(user=u.serialize, favs=[fav.serialize for fav in u.favorited])


# Get all posts by a user
@app.route('/blog/api/users/<int:id>/posts', methods=['GET'])
def get_user_posts(id):
    user = User.query.get(id)
    return jsonify(posts=[post.serialize for post in user.posts])


# Login user
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return make_response(open('angular_flask/templates/index.html').read())
    username = request.json.get('username')
    password = request.json.get('password')
    if not verify_password(username, password):
        return abort(400, 'Incorrect Username or Password')
    user = User.query.filter_by(username=username).first()
    login_user(user)
    return jsonify(user=user.serialize, favs=[fav.serialize for fav in user.favorited])


@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username=username_or_token).first()
        if not user:
            return abort(400, 'username')
        elif not user.verify_password(password):
            return abort(400, 'password')
    return True


@app.route('/logout', methods=['POST'])
# @login_required
def logout():
    if current_user.is_authenticated:
        logout_user()
    return jsonify({'message': 'logout successfully'})


# Special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def page_not_found(e):
    return render_template('404.html'), 500


@app.route('/blog/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600})
