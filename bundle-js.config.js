module.exports = {
    bundle: {
        main: {
            scripts: [
                './angular_flask/static/src/js/*.js',
                './angular_flask/static/src/js/controllers/*.js'
            ],
            options: {
                uglify: false,
                rev: false
            }
        }
    }
};