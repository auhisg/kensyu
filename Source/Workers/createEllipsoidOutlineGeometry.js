/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './EllipsoidOutlineGeometry-edb4ea56', './GeometryOffsetAttribute-b8bf80ba', './RuntimeError-1ff80201', './Transforms-f4065d1e', './Matrix2-53a99ae0', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './IndexDatatype-61849c3e'], (function (when, EllipsoidOutlineGeometry, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, IndexDatatype) { 'use strict';

  function createEllipsoidOutlineGeometry(ellipsoidGeometry, offset) {
    if (when.defined(ellipsoidGeometry.buffer)) {
      ellipsoidGeometry = EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.unpack(
        ellipsoidGeometry,
        offset
      );
    }
    return EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidOutlineGeometry;

}));
