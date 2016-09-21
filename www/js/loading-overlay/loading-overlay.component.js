angular.module('loadingOverlayModule')
    .component('loadingOverlay', {
        templateUrl: 'js/loading-overlay/loading-overlay.template.html',
        bindings: {
            loading: '=',
        }
    });
