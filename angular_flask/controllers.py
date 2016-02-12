import os, json, uuid

from flask import Flask, request, Response, jsonify, g
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort
from sqlalchemy.orm.exc import NoResultFound
from flask.ext.httpauth import HTTPBasicAuth
from angular_flask import app
from PIL import Image

from flask.ext.login import LoginManager, login_user, logout_user, current_user, login_required

login_manager = LoginManager()
login_manager.init_app(app)

# routing for API endpoints, generated from the models designated as API_MODELS
from angular_flask.core import api_manager
from angular_flask.models import *

"""for model_name in app.config['API_MODELS']:
    model_class = app.config['API_MODELS'][model_name]
    api_manager.create_api(model_class, methods=['GET', 'POST'])"""

session = api_manager.session
auth = HTTPBasicAuth()

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])


# Override default error message
@app.errorhandler(400)
def custom400(error):
    response = jsonify({'message': error.description})
    response.status_code = 400
    response.status_text = 'error. Bad Request'
    return response


# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/about')
@app.route('/blog')
@app.route('/posts')
@app.route('/posts/<int:id>')
@app.route('/register')
@app.route('/me/posts')
@app.route('/<string:username>')
def basic_pages(**kwargs):
    return make_response(open('angular_flask/templates/index.html').read())
    #return render_template('index.html')


@app.route('/new')
def new_post():
    print 'user', current_user
    if current_user.is_authenticated:
        return make_response(open('angular_flask/templates/index.html').read())
    else:
        return redirect('/login')


# Serve images
@app.route('/img/<type>/<filename>')
def uploaded_file(type, filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'] + '/' + type, filename)


# Endpoint for all posts
@app.route('/blog/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.join(User)
    return jsonify(posts=[post.serialize for post in posts])


# get specific post
@app.route('/blog/api/posts/<int:id>', methods=['GET'])
def get_post(id):
    try:
        post = Post.query.filter_by(id=id).one()
        return jsonify(post=post.serialize)
    except NoResultFound:
        return render_template('404.html'), 404


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


# Add a new post
@app.route('/blog/api/posts/new', methods=['POST'])
def add_post():
    """if not request.json or not 'title' in request.json:
        abort(400)"""
    title = json.loads(request.form['content'])
    body = json.loads(request.form['content2'])
    if request.files:
        # Generate unique file name
        image = request.files['file']
        img = Image.open(image)
        maxsize = (1028, 1028)
        filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
        img.thumbnail(maxsize, Image.ANTIALIAS)
        img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/covers', filename))
        post = Post(title=title["title"], body=body, cover_photo='../img/covers/' + filename,
                    author=current_user)
    else:
        post = Post(title=title["title"], body=body, author=current_user)
    session.add(post)
    session.commit()
    return redirect('/')


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


# Register new user
@app.route('/blog/api/users', methods=['POST'])
def new_user():
    print 'received user ', request.files
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
        # Generate unique file name
        ava = request.files['file']
        filename = str(uuid.uuid4()) + '.' + ava.filename.rsplit('.', 1)[1]
        img = Image.open(ava)
        maxsize = (480, 480)
        img.thumbnail(maxsize, Image.ANTIALIAS)
        img.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/avatars', filename))
        u = User(username=username, email=email, avatar='../img/avatars/' + filename)
    else:
        u = User(username=username, email=email)
    u.hash_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({'username': u.username}), 201


@app.route('/blog/api/users/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify({'username': user.username})


# Get all post by a user
@app.route('/blog/api/users/<int:id>/posts', methods=['GET'])
def get_user_posts(id):
    user = User.query.get(id)
    return jsonify(posts=[post.serialize for post in user.posts])


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return make_response(open('angular_flask/templates/index.html').read())
    username = request.json.get('username')
    password = request.json.get('password')
    if not verify_password(username, password):
        return abort(400, 'Incorrect Username or Password')
    user = User.query.filter_by(username=username).first()
    return jsonify({'username': user.username, 'ava': user.avatar, 'id': user.id})


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
    # g.user = user
    login_user(user)
    print 'logged in the user', current_user.username
    return True


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    if current_user.is_authenticated:
        logout_user()
    return redirect('/posts')


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.route('/blog/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600})
