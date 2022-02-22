/* This file is automatically rebuilt by the Cesium build process. */
define(['./CylinderGeometry-f779e0e1', './when-8166c7dd', './GeometryOffsetAttribute-b8bf80ba', './RuntimeError-1ff80201', './Transforms-f4065d1e', './Matrix2-53a99ae0', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './CylinderGeometryLibrary-22ca57dc', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './IndexDatatype-61849c3e', './VertexFormat-47fb135f'], (function (CylinderGeometry, when, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, CylinderGeometryLibrary, GeometryAttribute, GeometryAttributes, IndexDatatype, VertexFormat) { 'use strict';

  function createCylinderGeometry(cylinderGeometry, offset) {
    if (when.defined(offset)) {
      cylinderGeometry = CylinderGeometry.CylinderGeometry.unpack(cylinderGeometry, offset);
    }
    return CylinderGeometry.CylinderGeometry.createGeometry(cylinderGeometry);
  }

  return createCylinderGeometry;

}));
