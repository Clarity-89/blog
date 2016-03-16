
from passlib.apps import custom_app_context as pwd_context
from angular_flask.core import app, db
from angular_flask.models import Post, User
from flask.ext.script import Manager
from flask_migrate import Migrate, MigrateCommand

migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)


@manager.command
def init_db():
    db.create_all()
    password = pwd_context.encrypt('111111')
    u = User(username='Admin', email='me@test.com', password_hash=password)
    p = Post(title='First post', slug='first-post',
                        body="Welcome to my blog. I will be putting up posts about various topics, so make sure to check back soon.",
                        author=u)
    db.session.add(u)
    db.session.add(p)
    db.session.commit()
    print 'Initialized the db'


@manager.command
def drop_db():
    db.drop_all()
    print 'Dropped the db'


if __name__ == '__main__':
    manager.run()
