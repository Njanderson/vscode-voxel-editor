// TODO: If I ever make my own backend for this...

class RayTracer {
    constructor(camera_pos, focal_len, resolution) {
      this.camera_pos = camera_pos;
      this.focal_len = focal_len;
      this.resolution = resolution;
    }

    getIntersection(scene) {
        for (var componentIndex in scene.components) {
            var component = scene.components[componentIndex];
            // TODO: Bounding box acceleration
            for (var voxelIndex in component.voxels) {
                var voxel = component.voxels[voxelIndex];
                // Does this ray intersect this voxel?
                // The axis alignment of these voxels makes this a bit easier...
                
            }
        }
    }

    // TODO: Remove this
    traceScene(scene) {
      for (var x = 0; x < resolution.x; x++) {
        for (var y = 0; y < resolution.y; y++) {
            // Trace a ray for every pixel of our resolution
            this.getIntersection(scene);
        }
      }
    }
}