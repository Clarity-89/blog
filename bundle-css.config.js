module.exports = {
    bundle: {
        main: {
            styles: [
                './angular_flask/static/src/css/*.css',
                './node_modules/textangular/dist/*.css',
                ],
            options: {
                rev: false
            }
        }
    }
};