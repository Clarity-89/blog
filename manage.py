import os
import json
import argparse
import requests

from angular_flask.core import app, db
from angular_flask.models import Post
from flask.ext.script import Manager, prompt_bool


manager = Manager(app)


@manager.command
def initdb():
    db.create_all()
    db.session.add(Post(title='First post', body="Welcome to my blog. I will be putting up posts about various topics, so make sure to check back soon.",
                        author='alex'))
    db.session.commit()
    print 'Initialized the db'


@manager.command
def dropdb():
    db.drop_all()


if __name__ == '__main__':
    manager.run()
