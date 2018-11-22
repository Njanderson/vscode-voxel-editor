class VoxelEditor {
    constructor(voxelSize = 50) {
        this._voxelSize = voxelSize;
        this._renderer = this._GetRenderer();
        this._camera = this._GetCamera();

        // Create scene
        this._scene = this._GetScene();

        // Add controls
        this._controls = this._GetControls(this._camera);

        // Add to scene

        // Lighting
        this._lights = this._GetLights();
        for (var lightIndex in this._lights) {
            this._scene.add(this._lights[lightIndex]);
        }

        // Grid helper
        this._grid = this._GetGrid();
        this._scene.add(this._grid);

        // Voxel placing highlighter
        this._rollOverMesh = this._GetRolloverMesh();
        this._scene.add(this._rollOverMesh);

        this._voxels = [];

        this._Animate(this);
    }

    get VoxelSize() {
        return this._voxelSize;
    }

    RenderScene(parent) {
        parent.appendChild(this._renderer.domElement);
        parent.addEventListener(
            "mousemove",
            event => this._OnDocumentMouseMove(event),
            false
        );
    }

    _GetRolloverMesh() {
        let rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        let rollOverMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            opacity: 0.5,
            transparent: true
        });
        let rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
        rollOverMesh.position.set(50, 100, 0);
        return rollOverMesh;
    }

    _GetScene(color = 0xf0f0f0) {
        let scene = new THREE.Scene();
        scene.background = new THREE.Color(color);
        return scene;
    }

    _GetGrid() {
        return new THREE.GridHelper(1000, 20);
    }

    _GetLights() {
        let lights = [];
        let ambientLight = new THREE.AmbientLight(0x606060);
        lights.push(ambientLight);
        let directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1, 0.75, 0.5).normalize();
        lights.push(directionalLight);
        // Add lighting here!
        return lights;
    }

    _GetCamera() {
        let camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );

        camera.position.set(500, 800, 1300);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    _GetRenderer() {
        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        return renderer;
    }

    _OnDocumentMouseMove(event) {
        event.preventDefault();

        let mouse = new THREE.Vector2();
        mouse.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this._camera);

        let voxelIntersects = raycaster.intersectObjects(this._voxels);
        let gridIntersects = raycaster.intersectObjects([this._grid]);

        let intersects = voxelIntersects.concat(gridIntersects);

        // If there is an intersection, place a block
        // on top of the intersected element
        if (intersects.length > 0) {
            let intersect = intersects[0];

            // Bump out point by the face normal;
            // this will leave the mesh pushed too far
            this._rollOverMesh.position
                .copy(intersect.point)
                .add(intersect.face.normal);

            // Round to the nearest half of a voxel cube size
            this._rollOverMesh.position
                .divideScalar(voxelSize)
                .floor()
                .multiplyScalar(voxelSize)
                .addScalar(voxelSize / 2);
        }
    }

    _GetControls(camera) {
        let controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        return controls;
    }

    // Define CW rotation as positive
    _OnRotate(rotation) {

    }

    _RenderInternal() {
        this._renderer.render(this._scene, this._camera);
        this._controls.update();
    }

    _Animate(toAnimate) {
        // Create closure to hold reference to toAnimate
        requestAnimationFrame(() => this._Animate(toAnimate));
        toAnimate._RenderInternal();
    }
}
