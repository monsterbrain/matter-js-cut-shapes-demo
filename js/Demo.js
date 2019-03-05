/**
* The Matter.js demo page controller and example runner.
*
* NOTE: For the actual example code, refer to the source files in `/examples/`.
*
* @class Demo
*/

(function() {
    var sourceLinkRoot = 'https://github.com/monsterbrain/matter-js-cut-shapes-demo/js';

    var demo = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js',
            url: 'https://github.com/liabru/matter-js',
            reset: true,
            source: true,
            // inspector: true,
            // tools: true,
            fullscreen: true,
            exampleSelect: true
        },
        // tools: {
        //     inspector: true,
        //     gui: true
        // },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: true,
        startExample: 'raycasting',
        examples: [
            {
                name: 'Shape Cutting',
                id: 'raycasting',
                init: Example.raycasting,
                sourceLink: sourceLinkRoot + '/raycasting.js'
            }
        ]
    });

    document.body.appendChild(demo.dom.root);

    MatterTools.Demo.start(demo);
})();
