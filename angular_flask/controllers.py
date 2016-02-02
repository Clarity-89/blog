import os, json, uuid

from flask import Flask, request, Response, jsonify, g
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort
from sqlalchemy.orm.exc import NoResultFound
from flask.ext.httpauth import HTTPBasicAuth
from angular_flask import app
from angular_flask.core import db

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
def basic_pages(**kwargs):
    # return make_response(open('angular_flask/templates/index.html').read())
    return render_template('index.html')


@app.route('/new')
def new_post():
    print 'user', current_user
    if current_user.is_authenticated:
        return render_template('index.html')
    else:
        return redirect('/login')


# Serve images
@app.route('/img/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Endpoint for all posts
@app.route('/blog/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
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
        filename = str(uuid.uuid4()) + '.' + image.filename.rsplit('.', 1)[1]
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        post = Post(title=title["title"], body=body, cover_photo='../img/' + filename,
                    author='alex')
    else:
        post = Post(title=title["title"], body=body, author='alex')
    session.add(post)
    session.commit()
    return redirect('/')


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


# Register new user
@app.route('/blog/api/users', methods=['POST'])
def new_user():
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    print 'received user ', request.json
    if username is None or password is None:
        abort(400)  # missing arguments
    if User.query.filter_by(username=username).first() is not None:
        abort(400, 'User already exists')
    elif User.query.filter_by(email=email).first() is not None:
        abort(400, 'Email already exists')
    user = User(username=username, email=email)
    user.hash_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'username': user.username}), 201, {'Location': url_for('get_user', id=user.id, _external=True)}


@app.route('/blog/api/users/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify({'username': user.username})


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('index.html')
    username = request.json.get('username')
    password = request.json.get('password')
    if not verify_password(username, password):
        return abort(400, 'Incorrect Username or Password')
    return redirect('/posts')


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    if current_user.is_authenticated:
        logout_user()
        print 'logged out the user', current_user
    return redirect('/posts')


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username=username_or_token).first()
        if not user or not user.verify_password(password):
            return False
    # g.user = user
    login_user(user)
    print 'logged in the user', user
    return True


@app.route('/blog/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600})
