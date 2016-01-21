module.exports = {
    bundle: {
        main: {
            scripts: [
                './angular_flask/static/src/js/*.js'
            ],
            styles: './angular_flask/static/src/css/*.css',
            options: {
                uglify: false,
                rev: false
            }
        },
        vendor: {
            scripts: [
                './node_modules/angular/angular.js',
                './node_modules/angular-resource/angular-resource.js',
                './node_modules/angular-route/angular-route.js',
                './node_modules/jquery/dist/jquery.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-material/angular-material.js'
            ],
            options: {
                rev: false
            }
        }
    }
};