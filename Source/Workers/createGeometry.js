/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './PrimitivePipeline-fb0b0690', './createTaskProcessorWorker', './Transforms-f4065d1e', './Matrix2-53a99ae0', './RuntimeError-1ff80201', './ComponentDatatype-7bff63c1', './WebGLConstants-7dccdc96', './combine-ed18558d', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './GeometryPipeline-de9cd92d', './AttributeCompression-384003fd', './EncodedCartesian3-fa3d2f5d', './IndexDatatype-61849c3e', './IntersectionTests-319a18fc', './Plane-d60c1860', './WebMercatorProjection-acf685bb'], (function (when, PrimitivePipeline, createTaskProcessorWorker, Transforms, Matrix2, RuntimeError, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, WebMercatorProjection) { 'use strict';

  /* global require */

  const moduleCache = {};

  function getModule(moduleName) {
    let module = moduleCache[moduleName];
    if (!when.defined(module)) {
      if (typeof exports === "object") {
        // Use CommonJS-style require.
        moduleCache[module] = module = require("Workers/" + moduleName);
      } else {
        // Use AMD-style require.
        // in web workers, require is synchronous
        require(["Workers/" + moduleName], function (f) {
          module = f;
          moduleCache[module] = f;
        });
      }
    }
    return module;
  }

  function createGeometry(parameters, transferableObjects) {
    const subTasks = parameters.subTasks;
    const length = subTasks.length;
    const resultsOrPromises = new Array(length);

    for (let i = 0; i < length; i++) {
      const task = subTasks[i];
      const geometry = task.geometry;
      const moduleName = task.moduleName;

      if (when.defined(moduleName)) {
        const createFunction = getModule(moduleName);
        resultsOrPromises[i] = createFunction(geometry, task.offset);
      } else {
        //Already created geometry
        resultsOrPromises[i] = geometry;
      }
    }

    return when.when.all(resultsOrPromises, function (results) {
      return PrimitivePipeline.PrimitivePipeline.packCreateGeometryResults(
        results,
        transferableObjects
      );
    });
  }
  var createGeometry$1 = createTaskProcessorWorker(createGeometry);

  return createGeometry$1;

}));
