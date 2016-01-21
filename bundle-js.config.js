module.exports = {
    bundle: {
        main: {
            scripts: [
                './angular_flask/static/src/js/*.js'
            ],
            options: {
                uglify: false,
                rev: false
            }
        }
    }
};