(function() {
  // TODO: Make this a compiled Typescript file
  const vscode = acquireVsCodeApi();

  //   var scene = new THREE.Scene();
  //   scene.background = new THREE.Color( 0xf0f0f0 );

  //   var camera = new THREE.PerspectiveCamera(
  //     75,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     1000
  //   );

  // var renderer;
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  //   document.body.appendChild(renderer.domElement);

  //   var geometry = new THREE.BoxGeometry(1, 1, 1);
  //   var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //   var cube = new THREE.Mesh(geometry, material);
  //   scene.add(cube);

  //   function animate() {
  //     requestAnimationFrame(animate);
  //     cube.rotation.x += 0.01;
  //     cube.rotation.y += 0.01;
  //     renderer.render(scene, camera);
  //   }
  //   animate();

  //   camera.position.z = 5;
  var camera, scene, renderer;
  var plane, cube;
  var mouse, raycaster, isShiftDown = false;
  var rollOverMesh, rollOverMaterial;
  var cubeGeo, cubeMaterial;
  var objects = [];

  function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
      var intersect = intersects[ 0 ];
      rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
      rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
    }
    render();
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      var intersect = intersects[0];
      // delete cube
      if (isShiftDown) {
        if (intersect.object !== plane) {
          scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object), 1);
        }
        // create cube
      } else {
        var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
        scene.add(voxel);
        objects.push(voxel);
      }
      render();
    }
  }

  function onDocumentKeyDown( event ) {
    switch ( event.keyCode ) {
      case 16: isShiftDown = true; break;
    }
  }
  function onDocumentKeyUp( event ) {
    switch ( event.keyCode ) {
      case 16: isShiftDown = false; break;
    }
  }
  function render() {
    renderer.render( scene, camera );
  }

  function getScene() {
    // See: https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_voxelpainter.html

    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // roll-over helpers
    var rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    var rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true
    });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);

    rollOverMesh.position = new THREE.Vector3();
    rollOverMesh.position.set(50, 100, 0);

    scene.add(rollOverMesh);

    // cubes
    cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xfeb74c,
      map: new THREE.TextureLoader().load(
        "textures/square-outline-textured.png"
      )
    });

    // grid
    var gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ visible: false })
    );

    scene.add(plane);
    objects.push(plane);

    // lights
    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    render();
  }

  getScene();

  // Handle the message inside the webview
  window.addEventListener("message", event => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case "display":
        let display = document.getElementById("display");
        display.textContent = message.text;
        break;
      case "echo":
        vscode.postMessage(message);
        break;
      case "voxel":
        break;
    }
  });
})();
