/* This file is automatically rebuilt by the Cesium build process. */
define(['./Matrix2-53a99ae0', './when-8166c7dd', './EllipseOutlineGeometry-aa5b79e8', './RuntimeError-1ff80201', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './GeometryOffsetAttribute-b8bf80ba', './Transforms-f4065d1e', './combine-ed18558d', './EllipseGeometryLibrary-bbc21411', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './IndexDatatype-61849c3e'], (function (Matrix2, when, EllipseOutlineGeometry, RuntimeError, ComponentDatatype, WebGLConstants, GeometryOffsetAttribute, Transforms, combine, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, IndexDatatype) { 'use strict';

  function createEllipseOutlineGeometry(ellipseGeometry, offset) {
    if (when.defined(offset)) {
      ellipseGeometry = EllipseOutlineGeometry.EllipseOutlineGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Matrix2.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Matrix2.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseOutlineGeometry.EllipseOutlineGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseOutlineGeometry;

}));
