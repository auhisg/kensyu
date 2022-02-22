/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './FrustumGeometry-0cad9248', './Transforms-f4065d1e', './Matrix2-53a99ae0', './RuntimeError-1ff80201', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './Plane-d60c1860', './VertexFormat-47fb135f'], (function (when, FrustumGeometry, Transforms, Matrix2, RuntimeError, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, Plane, VertexFormat) { 'use strict';

  function createFrustumGeometry(frustumGeometry, offset) {
    if (when.defined(offset)) {
      frustumGeometry = FrustumGeometry.FrustumGeometry.unpack(frustumGeometry, offset);
    }
    return FrustumGeometry.FrustumGeometry.createGeometry(frustumGeometry);
  }

  return createFrustumGeometry;

}));
