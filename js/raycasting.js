var Example = Example || {};

var decomp;

if (!decomp) {
    decomp = Common._requireGlobal('decomp', 'poly-decomp');
}

Example.raycasting = function () {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Query = Matter.Query,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Events = Matter.Events,
        World = Matter.World,
        Vertices = Matter.Vertices,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    

    // add bodies left side
    var stack = Composites.stack(100, 180, 2, 4, 20, 0, function(x, y) {
        return Bodies.rectangle(x, y, 40, 100);
    });

    // add bodies right side
    var stack2 = Composites.stack(400, 250, 4, 8, 20, 0, function(x, y) {
        return Bodies.rectangle(x, y, 30, 40);
    });

    var triangle = Vertices.fromPath('81 171 199 22 201 177');

    World.add(world, [
        stack2,
        stack,
        Bodies.fromVertices(300, 200, triangle),

        Bodies.rectangle(400, 250, 300, 20, { isStatic: true }), // static platform
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var isDragging = false;
    var cutStart={x:0,y:0};
    var cutEnd={x:0,y:0};

    Events.on(render, 'afterRender', function () {
        var mouse = mouseConstraint.mouse,
            context = render.context,
            bodies = Composite.allBodies(engine.world),
            startPoint = { x: 400, y: 100 },
            endPoint = mouse.position;

        var collisions = Query.ray(bodies, startPoint, endPoint);

        Render.startViewTransform(render);


        if(!isDragging) {
            if (mouseConstraint.mouse.button === 0) {
                // LMB down
                cutEnd.x = cutStart.x = mouse.position.x;
                cutEnd.y = cutStart.y = mouse.position.y;
                isDragging = true;
            }
        }


        context.beginPath();

        if (isDragging) {
            //dragging active
            cutEnd.x = mouse.position.x;
            cutEnd.y = mouse.position.y;

            context.moveTo(cutStart.x, cutStart.y);
            context.lineTo(cutEnd.x, cutEnd.y);
            context.strokeStyle = '#ff5';
            context.lineWidth = 1.0;
            context.stroke();

            var cutCollisions = Query.ray(bodies, cutStart, cutEnd);
            var cutLine = [[cutStart.x, cutStart.y], [cutEnd.x, cutEnd.y]];
            for (var i = 0; i < cutCollisions.length; i++) {
                var collision = cutCollisions[i];

                // check along the edge lines
                var vertices = collision.body.vertices;
                for (let j = 0; j < vertices.length; j++) {
                    var edge = [ [vertices[j].x, vertices[j].y], [vertices[(j+1)>vertices.length-1?(0):(j+1)].x, vertices[(j+1)>vertices.length-1?(0):(j+1)].y] ];
                    var isIntersect = decomp.lineSegIntersect(cutLine[0], cutLine[1], edge[0], edge[1]);
                    if(isIntersect){
                        var intersection = decomp.lineIntersect(cutLine, edge);
                        context.rect(intersection[0] - 3.5, intersection[1] - 3.5, 4, 4);
                    }
                }
            }

            if (mouseConstraint.mouse.button === -1) {
                isDragging = false;

                // cut the shapes
                cutTheBodies(cutCollisions, cutLine);
            }
        }

        // Raycasting Example 
        // context.moveTo(startPoint.x, startPoint.y);
        // context.lineTo(endPoint.x, endPoint.y);
        // if (collisions.length > 0) {
        //     context.strokeStyle = '#125';
        // } else {
        //     context.strokeStyle = '#fff';
        // }
        // context.lineWidth = 0.5;
        // context.stroke();

        for (var i = 0; i < collisions.length; i++) {
            var collision = collisions[i];
            context.rect(collision.bodyA.position.x - 4.5, collision.bodyA.position.y - 4.5, 8, 8);

            // intersection of line with one of the vertices
            // var mouseLine = [[startPoint.x, startPoint.y], [endPoint.x, endPoint.y]];
            // var oneEdgeLine = [
            //     [collision.bodyA.vertices[0].x, collision.bodyA.vertices[0].y],
            //     [collision.bodyA.vertices[1].x, collision.bodyA.vertices[1].y],
            // ];
            // var intersection = decomp.lineIntersect(mouseLine, oneEdgeLine);
            //console.log(intersection);
            // context.rect(intersection[0] - 2.5, intersection[1] - 2.5, 4, 4);
        }

        context.fillStyle = 'rgba(255,125,0,0.7)';
        context.fill();

        Render.endViewTransform(render);
    });

    function cutTheBodies(cutCollisions, cutLine) {
        console.log('cutTheBodies');
        for (var i = 0; i < cutCollisions.length; i++) {
            var collision = cutCollisions[i];

            if(collision.body.isStatic)
            {
                console.log('Static Body. Do not Cut!');
                continue;
            }
            // check along the edge lines
            var vertices = collision.body.vertices;
            var cutPoints=[];
            var cutIndexes=[];

            for (let j = 0; j < vertices.length; j++) {
                var edge = [ [vertices[j].x, vertices[j].y], [vertices[(j+1)>vertices.length-1?(0):(j+1)].x, vertices[(j+1)>vertices.length-1?(0):(j+1)].y] ];
                var isIntersect = decomp.lineSegIntersect(cutLine[0], cutLine[1], edge[0], edge[1]);
                if(isIntersect){
                    cutIndexes.push(j);
                    var intersection = decomp.lineIntersect(cutLine, edge);
                    cutPoints.push(intersection);
                    //context.rect(intersection[0] - 3.5, intersection[1] - 3.5, 4, 4);
                }
            }

            if(cutIndexes.length==2){
                console.log('can cut the body');

                //remove the parent body
                World.remove(world, collision.body, true);

                // create two bodies
                var body1Path='', body2Path='';
                for (let j = 0; j < vertices.length; j++) {
                    body1Path+= vertices[j].x +' '+ vertices[j].y+' ';
                    if(j==cutIndexes[0]){
                        // add two cut points
                        body1Path+= cutPoints[0][0]+' '+cutPoints[0][1]+' ';
                        body1Path+= cutPoints[1][0]+' '+cutPoints[1][1]+' ';
                        j = cutIndexes[1];
                        continue;
                    }
                }
                // console.log('body1Path='+body1Path);

                var body1Vertices = Vertices.fromPath(body1Path)
                var body1Pos = Vertices.centre(body1Vertices);
                var body1 = Bodies.fromVertices(body1Pos.x, body1Pos.y, body1Vertices);
                World.add(world, body1);

                // similarly for body 2
                // starts with the cut index 1
                body2Path+= cutPoints[0][0]+' '+cutPoints[0][1]+' ';
                for (let j = cutIndexes[0]+1; j < vertices.length; j++) {
                    body2Path+= vertices[j].x +' '+ vertices[j].y+' ';
                    if(j==cutIndexes[1]){
                        // add other cut point
                        body2Path+= cutPoints[1][0]+' '+cutPoints[1][1]+' ';
                        break;
                    }
                }
                // console.log('body2Path='+body2Path);

                var body2Vertices = Vertices.fromPath(body2Path)
                var body2Pos = Vertices.centre(body2Vertices);
                var body2 = Bodies.fromVertices(body2Pos.x, body2Pos.y, body2Vertices);
                World.add(world, body2);
            }
        }
    }

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    // World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};