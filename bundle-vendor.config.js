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
                './node_modules/textangular/dist/textAngularSetup.js'
            ],
            options: {
                rev: false
            }
        }
    }
};