module.exports = {
    bundle: {
        vendor: {
            styles: [
                './node_modules/textangular/dist/*.css',
                './node_modules/bootstrap/dist/css/bootstrap.css',
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-material/angular-material.layouts.css'
            ],
            options: {
                rev: false
            }
        }
    }
};