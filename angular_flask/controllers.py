import os

from flask import Flask, request, Response, jsonify
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort

from angular_flask import app

# routing for API endpoints, generated from the models designated as API_MODELS
from angular_flask.core import api_manager
from angular_flask.models import *

for model_name in app.config['API_MODELS']:
    model_class = app.config['API_MODELS'][model_name]
    api_manager.create_api(model_class, methods=['GET', 'POST'])

session = api_manager.session


# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/about')
@app.route('/blog')
def basic_pages(**kwargs):
    # return make_response(open('angular_flask/templates/index.html').read())
    return render_template('index.html')


# routing for CRUD-style endpoints
# passes routing onto the angular frontend if the requested resource exists
from sqlalchemy.sql import exists

crud_url_models = app.config['CRUD_URL_MODELS']


@app.route('/<model_name>/')
@app.route('/<model_name>/<item_id>')
def rest_pages(model_name, item_id=None):
    if model_name in crud_url_models:
        model_class = crud_url_models[model_name]
        if item_id is None or session.query(exists().where(
                        model_class.id == item_id)).scalar():
            return make_response(open(
                    'angular_flask/templates/index.html').read())
    abort(404)


posts = [
    {
        "body": "Welcome to my blog. I will be putting up posts about various topics, so make sure to check back soon.",
        "title": "My First Blog Post"
    },
    {
        "body": "It is day two of my blogging efforts, and a lot has changed since I last wrote. Well, not really...",
        "title": "My Second Blog Post"
    },
    {
        'body': "Modern web applications have beautiful URLs. This helps people remember the URLs, which is especially handy for applications that are used from mobile devices with slower network connections. If the user can directly go to the desired page without having to hit the index page it is more likely they will like the page and come back next time.",
        'title': "Flask"
    }
]


# Endpoint for all posts
@app.route('/blog/api/posts')
def get_posts():
    return jsonify({'posts': posts})


# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
