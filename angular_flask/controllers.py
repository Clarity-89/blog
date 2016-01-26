import os, json, uuid

from flask import Flask, request, Response, jsonify
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort
from sqlalchemy.orm.exc import NoResultFound
from werkzeug import secure_filename

from angular_flask import app
from angular_flask.core import db
from angular_flask.models import Post

# routing for API endpoints, generated from the models designated as API_MODELS
from angular_flask.core import api_manager
from angular_flask.models import *

"""for model_name in app.config['API_MODELS']:
    model_class = app.config['API_MODELS'][model_name]
    api_manager.create_api(model_class, methods=['GET', 'POST'])"""

session = api_manager.session

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])


# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/about')
@app.route('/blog')
@app.route('/new')
def basic_pages(**kwargs):
    print os.path.join(app.config['UPLOAD_FOLDER'])
    # return make_response(open('angular_flask/templates/index.html').read())
    return render_template('index.html')


# Serve images
@app.route('/img/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)


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


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('uploaded_file',
                                    filename=filename))
    return


# Add a new post
@app.route('/blog/api/posts/new', methods=['POST'])
def add_post():
    """if not request.json or not 'title' in request.json:
        abort(400)"""
    title = json.loads(request.form['content'])
    body = json.loads(request.form['content2'])
    print 'form', json.loads(request.form['content2'])
    file = request.files['file']
    if file and allowed_file(file.filename):
        # Generate unique file name
        filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1]
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        post = Post(title=title["title"], body=body, cover_photo='../img/' + filename,
                    author='alex')
    else:
        post = Post(title=title["title"], body=body, author='alex')
    session.add(post)
    session.commit()
    return redirect('/')


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
