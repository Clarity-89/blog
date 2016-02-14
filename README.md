## A blog app made with Angular.js (front-end) and Flask Python Microframework (back-end).
 
### To run it on your local machine:

 1. Clone this repo

 2. Install all the necessary packages (best done inside of a virtual environment)

    > pip install -r requirements.txt

    In case you get an error 'failed building wheel for pillow' or smth similar and
    you're on Debian or Ubuntu you probably need to install Python’s development libraries for Pillow via
    > sudo apt-get install python-dev python-setuptools 
    
    and then install Pillow again with
    > pip install pillow

 3. Run the app

    > python runserver.py
    
 4. Initialize the db (the server must still be running, so open a new terminal window first)

    > python manage.py init_db 
    
    (this will create a 'posts' db with one sample post and a user 'Admin' with email 'me@test.com' and password '111111')

 5. Install necessary packages
    > npm install
    
 6. Bundle all the necessary files (this will create a 'dist' directory in the 'static' folder)
    > gulp build 
 
 7. Start watching JS files for changes to automatically re-bundle them (note that this only watches your custom Js files, if you're adding an Angular module or 
 other third-party libs you need to manually add the path to it to 'bundle-vendor.config.js' and call gulp bundle-vendor to update the vendor.js file).
    > gulp watch
 
 8. The site should be ready and running at http://localhost:5000/

