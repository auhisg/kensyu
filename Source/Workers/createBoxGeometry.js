/* This file is automatically rebuilt by the Cesium build process. */
define(['./BoxGeometry-22fe37ba', './when-8166c7dd', './GeometryOffsetAttribute-b8bf80ba', './RuntimeError-1ff80201', './Transforms-f4065d1e', './Matrix2-53a99ae0', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './VertexFormat-47fb135f'], (function (BoxGeometry, when, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, VertexFormat) { 'use strict';

  function createBoxGeometry(boxGeometry, offset) {
    if (when.defined(offset)) {
      boxGeometry = BoxGeometry.BoxGeometry.unpack(boxGeometry, offset);
    }
    return BoxGeometry.BoxGeometry.createGeometry(boxGeometry);
  }

  return createBoxGeometry;

}));
