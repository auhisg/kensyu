/* This file is automatically rebuilt by the Cesium build process. */
define(['./Matrix2-53a99ae0', './when-8166c7dd', './EllipseGeometry-54cf1655', './RuntimeError-1ff80201', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './GeometryOffsetAttribute-b8bf80ba', './Transforms-f4065d1e', './combine-ed18558d', './EllipseGeometryLibrary-bbc21411', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './GeometryInstance-b0afb8ae', './GeometryPipeline-de9cd92d', './AttributeCompression-384003fd', './EncodedCartesian3-fa3d2f5d', './IndexDatatype-61849c3e', './IntersectionTests-319a18fc', './Plane-d60c1860', './VertexFormat-47fb135f'], (function (Matrix2, when, EllipseGeometry, RuntimeError, ComponentDatatype, WebGLConstants, GeometryOffsetAttribute, Transforms, combine, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, VertexFormat) { 'use strict';

  function createEllipseGeometry(ellipseGeometry, offset) {
    if (when.defined(offset)) {
      ellipseGeometry = EllipseGeometry.EllipseGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Matrix2.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Matrix2.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseGeometry.EllipseGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseGeometry;

}));
