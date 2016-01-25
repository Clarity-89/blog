module.exports = {
    bundle: {
        main: {
            styles: [
                /*'./node_modules/textangular/dist/*.css',*/
                './angular_flask/static/src/css/*.css'
            ],
            options: {
                rev: false
            }
        }
    }
};