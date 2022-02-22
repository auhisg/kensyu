/* This file is automatically rebuilt by the Cesium build process. */
define(['./PrimitivePipeline-fb0b0690', './createTaskProcessorWorker', './Transforms-f4065d1e', './Matrix2-53a99ae0', './RuntimeError-1ff80201', './when-8166c7dd', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './GeometryPipeline-de9cd92d', './AttributeCompression-384003fd', './EncodedCartesian3-fa3d2f5d', './IndexDatatype-61849c3e', './IntersectionTests-319a18fc', './Plane-d60c1860', './WebMercatorProjection-acf685bb'], (function (PrimitivePipeline, createTaskProcessorWorker, Transforms, Matrix2, RuntimeError, when, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, WebMercatorProjection) { 'use strict';

  function combineGeometry(packedParameters, transferableObjects) {
    const parameters = PrimitivePipeline.PrimitivePipeline.unpackCombineGeometryParameters(
      packedParameters
    );
    const results = PrimitivePipeline.PrimitivePipeline.combineGeometry(parameters);
    return PrimitivePipeline.PrimitivePipeline.packCombineGeometryResults(
      results,
      transferableObjects
    );
  }
  var combineGeometry$1 = createTaskProcessorWorker(combineGeometry);

  return combineGeometry$1;

}));
