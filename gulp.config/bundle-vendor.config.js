module.exports = {
    bundle: {
        vendor: {
            scripts: [
                './node_modules/angular/angular.js',
                './node_modules/angular-resource/angular-resource.js',
                './node_modules/angular-route/angular-route.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-material/angular-material.js',
                './node_modules/textangular/dist/textAngular.js',
                './node_modules/textangular/dist/textAngular-rangy.min.js',
                './node_modules/textangular/dist/textAngular-sanitize.js',
                './node_modules/textangular/dist/textAngularSetup.js',
                './node_modules/angular-messages/angular-messages.js',
                './node_modules/angular-password/angular-password.js',
                './node_modules/angular-cookies/angular-cookies.js',
                './node_modules/angular-mocks/angular-mocks.js',
                './node_modules/moment/moment.js'

            ],
            styles: [
                './node_modules/textangular/dist/*.css',
                './node_modules/bootstrap/dist/css/bootstrap.css',
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-material/angular-material.layouts.css',
                './node_modules/font-awesome/css/font-awesome.min.css'
            ],
            options: {
                rev: false
            }
        }
    }
};