/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './EllipsoidGeometry-95b5eddb', './GeometryOffsetAttribute-b8bf80ba', './RuntimeError-1ff80201', './Transforms-f4065d1e', './Matrix2-53a99ae0', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './IndexDatatype-61849c3e', './VertexFormat-47fb135f'], (function (when, EllipsoidGeometry, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, IndexDatatype, VertexFormat) { 'use strict';

  function createEllipsoidGeometry(ellipsoidGeometry, offset) {
    if (when.defined(offset)) {
      ellipsoidGeometry = EllipsoidGeometry.EllipsoidGeometry.unpack(ellipsoidGeometry, offset);
    }
    return EllipsoidGeometry.EllipsoidGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidGeometry;

}));
