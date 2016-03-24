import json

from flask import request, jsonify, g
from flask import render_template, send_from_directory
from flask import make_response, abort

from flask.ext.login import LoginManager, login_user, logout_user, current_user

from angular_flask.core import api_manager
from angular_flask.utils import *

login_manager = LoginManager()
login_manager.init_app(app)
session = api_manager.session


# Override default error message
@app.errorhandler(400)
def custom400(error):
    response = jsonify({'message': error.description})
    response.status_code = 400
    response.status_text = 'error. Bad Request'
    return response


@app.route('/')
@app.route('/about')
@app.route('/blog')
@app.route('/posts')
@app.route('/posts/<string:slug>')
@app.route('/register')
@app.route('/me/posts')
@app.route('/me/profile')
@app.route('/users/<string:username>')
@app.route('/new')
def basic_pages(**kwargs):
    # return make_response(open('angular_flask/templates/index.html').read())
    """
    Routing for basic pages (pass routing onto the Angular app) and if variable params are
    passed check that db entry exists for them
    :param kwargs:
    :return: index.html or 404.html templates
    """
    if kwargs and kwargs.get('slug'):
        entry = Post.query.filter_by(slug=kwargs['slug']).first()
        if entry is None:
            return render_template('404.html')
    elif kwargs and kwargs.get('username'):
        entry = User.query.filter_by(username=kwargs['username']).first()
        if entry is None:
            return render_template('404.html')
    return render_template('index.html')


# Serve images
@app.route('/img/<type>/<filename>')
def uploaded_file(type, filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'] + type, filename)


# Endpoint for all public posts
@app.route('/blog/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.filter_by(public=True).all()
    return jsonify(posts=[post.serialize for post in posts])


# Get specific post or add post to favorites
@app.route('/blog/api/posts/<string:slug>', methods=['GET', 'POST'])
def get_post(slug):
    if request.method == 'GET':
        post = Post.query.filter_by(slug=slug).first()
        if post is None:
            abort(404, 'Post not found')
        elif post.public is not True and post.author != current_user:
            abort(401)
        else:
            return jsonify(post=post.serialize, comments=[c.serialize for c in post.comments])
    elif request.method == 'POST':
        post = Post.query.filter_by(slug=slug).one()
        user = current_user
        if user in post.favorited_by:
            post.favorited_by.remove(user)
        else:
            post.favorited_by.append(user)
        post.favorited = len(post.favorited_by)
        session.commit()
        return jsonify(post=post.serialize, favs=[fav.serialize for fav in post.favorited_by])


# Add a new post
@app.route('/blog/api/posts/new', methods=['POST'])
def add_post():
    p = json.loads(request.form['post'])
    title = p.get('title')
    body = p.get('body')
    public = p.get('public')
    if request.files:
        filename = save_image('covers', None)
        post = Post(title=title, body=body, photo=app.config['IMG_FOLDER'] + 'covers/' + filename,
                    public=public, author=current_user)
    else:
        post = Post(title=title, body=body, public=public, author=current_user)
    post.slugify(title)
    session.add(post)
    session.commit()
    return jsonify({'slug': post.slug})


# Edit post
@app.route('/blog/api/posts/<int:id>/edit', methods=['POST'])
def edit_post(id):
    p = json.loads(request.form['post'])
    post = Post.query.filter_by(id=id).first()
    if post is None:
        abort(400, 'Post does not exist')
    post.title = p.get('title')
    post.body = p.get('body')
    public = p.get('public')
    if public:
        post.public = public
    if request.files:
        save_image('covers', post)
    db.session.commit()
    return jsonify({'slug': post.slug})


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
        filename = save_image('avatars', None)
        u = User(username=username, email=email, photo=app.config['IMG_FOLDER'] + 'avatars/' + filename)
    else:
        u = User(username=username, email=email)
    u.hash_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({'username': u.username}), 201


# Get individual user by id
@app.route('/blog/api/users/<string:username>')
def get_user(username):
    user = User.query.filter_by(username=username).first()
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
    name = user.get('name')
    bio = user.get('bio')
    email = user.get('email')
    new_password = user.get('newPassword')
    password = user.get('password')
    u = User.query.filter_by(username=username).first()
    if u is None:
        abort(400, 'User does not exist')
    u.email = email
    u.name = name
    u.bio = bio
    if request.files:
        save_image('avatars', u)
    if new_password:
        if not u.verify_password(password):
            return abort(400, 'password')
        else:
            u.hash_password(new_password)
    db.session.add(u)
    db.session.commit()
    return jsonify(user=u.serialize, favs=[fav.serialize for fav in u.favorited])


# Get all posts by a user
@app.route('/blog/api/users/<string:username>/posts', methods=['GET'])
def get_user_posts(username):
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify(posts=[post.serialize for post in user.posts])
    else:
        abort(400, 'No user found')


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


@app.route('/logout', methods=['POST'])
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
def server_error(e):
    return render_template('404.html'), 500


@app.route('/blog/api/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600})
