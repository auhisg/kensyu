/* This file is automatically rebuilt by the Cesium build process. */
define(['exports', './GeometryOffsetAttribute-b8bf80ba', './Transforms-f4065d1e', './Matrix2-53a99ae0', './RuntimeError-1ff80201', './ComponentDatatype-7bff63c1', './when-8166c7dd', './EllipseGeometryLibrary-bbc21411', './GeometryAttribute-de44b214', './GeometryAttributes-50becc99', './GeometryInstance-b0afb8ae', './GeometryPipeline-de9cd92d', './IndexDatatype-61849c3e', './VertexFormat-47fb135f'], (function (exports, GeometryOffsetAttribute, Transforms, Matrix2, RuntimeError, ComponentDatatype, when, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryPipeline, IndexDatatype, VertexFormat) { 'use strict';

  const scratchCartesian1 = new Matrix2.Cartesian3();
  const scratchCartesian2 = new Matrix2.Cartesian3();
  const scratchCartesian3 = new Matrix2.Cartesian3();
  const scratchCartesian4 = new Matrix2.Cartesian3();
  const texCoordScratch = new Matrix2.Cartesian2();
  const textureMatrixScratch = new Matrix2.Matrix3();
  const tangentMatrixScratch = new Matrix2.Matrix3();
  const quaternionScratch = new Transforms.Quaternion();

  const scratchNormal = new Matrix2.Cartesian3();
  const scratchTangent = new Matrix2.Cartesian3();
  const scratchBitangent = new Matrix2.Cartesian3();

  const scratchCartographic = new Matrix2.Cartographic();
  const projectedCenterScratch = new Matrix2.Cartesian3();

  const scratchMinTexCoord = new Matrix2.Cartesian2();
  const scratchMaxTexCoord = new Matrix2.Cartesian2();

  function computeTopBottomAttributes(positions, options, extrude) {
    const vertexFormat = options.vertexFormat;
    const center = options.center;
    const semiMajorAxis = options.semiMajorAxis;
    const semiMinorAxis = options.semiMinorAxis;
    const ellipsoid = options.ellipsoid;
    const stRotation = options.stRotation;
    const size = extrude ? (positions.length / 3) * 2 : positions.length / 3;
    const shadowVolume = options.shadowVolume;

    const textureCoordinates = vertexFormat.st
      ? new Float32Array(size * 2)
      : undefined;
    const normals = vertexFormat.normal ? new Float32Array(size * 3) : undefined;
    const tangents = vertexFormat.tangent
      ? new Float32Array(size * 3)
      : undefined;
    const bitangents = vertexFormat.bitangent
      ? new Float32Array(size * 3)
      : undefined;

    const extrudeNormals = shadowVolume ? new Float32Array(size * 3) : undefined;

    let textureCoordIndex = 0;

    // Raise positions to a height above the ellipsoid and compute the
    // texture coordinates, normals, tangents, and bitangents.
    let normal = scratchNormal;
    let tangent = scratchTangent;
    let bitangent = scratchBitangent;

    const projection = new Transforms.GeographicProjection(ellipsoid);
    const projectedCenter = projection.project(
      ellipsoid.cartesianToCartographic(center, scratchCartographic),
      projectedCenterScratch
    );

    const geodeticNormal = ellipsoid.scaleToGeodeticSurface(
      center,
      scratchCartesian1
    );
    ellipsoid.geodeticSurfaceNormal(geodeticNormal, geodeticNormal);

    let textureMatrix = textureMatrixScratch;
    let tangentMatrix = tangentMatrixScratch;
    if (stRotation !== 0) {
      let rotation = Transforms.Quaternion.fromAxisAngle(
        geodeticNormal,
        stRotation,
        quaternionScratch
      );
      textureMatrix = Matrix2.Matrix3.fromQuaternion(rotation, textureMatrix);

      rotation = Transforms.Quaternion.fromAxisAngle(
        geodeticNormal,
        -stRotation,
        quaternionScratch
      );
      tangentMatrix = Matrix2.Matrix3.fromQuaternion(rotation, tangentMatrix);
    } else {
      textureMatrix = Matrix2.Matrix3.clone(Matrix2.Matrix3.IDENTITY, textureMatrix);
      tangentMatrix = Matrix2.Matrix3.clone(Matrix2.Matrix3.IDENTITY, tangentMatrix);
    }

    const minTexCoord = Matrix2.Cartesian2.fromElements(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      scratchMinTexCoord
    );
    const maxTexCoord = Matrix2.Cartesian2.fromElements(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      scratchMaxTexCoord
    );

    let length = positions.length;
    const bottomOffset = extrude ? length : 0;
    const stOffset = (bottomOffset / 3) * 2;
    for (let i = 0; i < length; i += 3) {
      const i1 = i + 1;
      const i2 = i + 2;
      const position = Matrix2.Cartesian3.fromArray(positions, i, scratchCartesian1);

      if (vertexFormat.st) {
        const rotatedPoint = Matrix2.Matrix3.multiplyByVector(
          textureMatrix,
          position,
          scratchCartesian2
        );
        const projectedPoint = projection.project(
          ellipsoid.cartesianToCartographic(rotatedPoint, scratchCartographic),
          scratchCartesian3
        );
        Matrix2.Cartesian3.subtract(projectedPoint, projectedCenter, projectedPoint);

        texCoordScratch.x =
          (projectedPoint.x + semiMajorAxis) / (2.0 * semiMajorAxis);
        texCoordScratch.y =
          (projectedPoint.y + semiMinorAxis) / (2.0 * semiMinorAxis);

        minTexCoord.x = Math.min(texCoordScratch.x, minTexCoord.x);
        minTexCoord.y = Math.min(texCoordScratch.y, minTexCoord.y);
        maxTexCoord.x = Math.max(texCoordScratch.x, maxTexCoord.x);
        maxTexCoord.y = Math.max(texCoordScratch.y, maxTexCoord.y);

        if (extrude) {
          textureCoordinates[textureCoordIndex + stOffset] = texCoordScratch.x;
          textureCoordinates[textureCoordIndex + 1 + stOffset] =
            texCoordScratch.y;
        }

        textureCoordinates[textureCoordIndex++] = texCoordScratch.x;
        textureCoordinates[textureCoordIndex++] = texCoordScratch.y;
      }

      if (
        vertexFormat.normal ||
        vertexFormat.tangent ||
        vertexFormat.bitangent ||
        shadowVolume
      ) {
        normal = ellipsoid.geodeticSurfaceNormal(position, normal);

        if (shadowVolume) {
          extrudeNormals[i + bottomOffset] = -normal.x;
          extrudeNormals[i1 + bottomOffset] = -normal.y;
          extrudeNormals[i2 + bottomOffset] = -normal.z;
        }

        if (
          vertexFormat.normal ||
          vertexFormat.tangent ||
          vertexFormat.bitangent
        ) {
          if (vertexFormat.tangent || vertexFormat.bitangent) {
            tangent = Matrix2.Cartesian3.normalize(
              Matrix2.Cartesian3.cross(Matrix2.Cartesian3.UNIT_Z, normal, tangent),
              tangent
            );
            Matrix2.Matrix3.multiplyByVector(tangentMatrix, tangent, tangent);
          }
          if (vertexFormat.normal) {
            normals[i] = normal.x;
            normals[i1] = normal.y;
            normals[i2] = normal.z;
            if (extrude) {
              normals[i + bottomOffset] = -normal.x;
              normals[i1 + bottomOffset] = -normal.y;
              normals[i2 + bottomOffset] = -normal.z;
            }
          }

          if (vertexFormat.tangent) {
            tangents[i] = tangent.x;
            tangents[i1] = tangent.y;
            tangents[i2] = tangent.z;
            if (extrude) {
              tangents[i + bottomOffset] = -tangent.x;
              tangents[i1 + bottomOffset] = -tangent.y;
              tangents[i2 + bottomOffset] = -tangent.z;
            }
          }

          if (vertexFormat.bitangent) {
            bitangent = Matrix2.Cartesian3.normalize(
              Matrix2.Cartesian3.cross(normal, tangent, bitangent),
              bitangent
            );
            bitangents[i] = bitangent.x;
            bitangents[i1] = bitangent.y;
            bitangents[i2] = bitangent.z;
            if (extrude) {
              bitangents[i + bottomOffset] = bitangent.x;
              bitangents[i1 + bottomOffset] = bitangent.y;
              bitangents[i2 + bottomOffset] = bitangent.z;
            }
          }
        }
      }
    }

    if (vertexFormat.st) {
      length = textureCoordinates.length;
      for (let k = 0; k < length; k += 2) {
        textureCoordinates[k] =
          (textureCoordinates[k] - minTexCoord.x) /
          (maxTexCoord.x - minTexCoord.x);
        textureCoordinates[k + 1] =
          (textureCoordinates[k + 1] - minTexCoord.y) /
          (maxTexCoord.y - minTexCoord.y);
      }
    }

    const attributes = new GeometryAttributes.GeometryAttributes();

    if (vertexFormat.position) {
      const finalPositions = EllipseGeometryLibrary.EllipseGeometryLibrary.raisePositionsToHeight(
        positions,
        options,
        extrude
      );
      attributes.position = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: finalPositions,
      });
    }

    if (vertexFormat.st) {
      attributes.st = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: textureCoordinates,
      });
    }

    if (vertexFormat.normal) {
      attributes.normal = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: normals,
      });
    }

    if (vertexFormat.tangent) {
      attributes.tangent = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: tangents,
      });
    }

    if (vertexFormat.bitangent) {
      attributes.bitangent = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: bitangents,
      });
    }

    if (shadowVolume) {
      attributes.extrudeDirection = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: extrudeNormals,
      });
    }

    if (extrude && when.defined(options.offsetAttribute)) {
      let offsetAttribute = new Uint8Array(size);
      if (options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.TOP) {
        offsetAttribute = GeometryOffsetAttribute.arrayFill(offsetAttribute, 1, 0, size / 2);
      } else {
        const offsetValue =
          options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE ? 0 : 1;
        offsetAttribute = GeometryOffsetAttribute.arrayFill(offsetAttribute, offsetValue);
      }

      attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 1,
        values: offsetAttribute,
      });
    }

    return attributes;
  }

  function topIndices(numPts) {
    // numTriangles in half = 3 + 8 + 12 + ... = -1 + 4 + (4 + 4) + (4 + 4 + 4) + ... = -1 + 4 * (1 + 2 + 3 + ...)
    //              = -1 + 4 * ((n * ( n + 1)) / 2)
    // total triangles = 2 * numTrangles in half
    // indices = total triangles * 3;
    // Substitute numPts for n above

    const indices = new Array(12 * (numPts * (numPts + 1)) - 6);
    let indicesIndex = 0;
    let prevIndex;
    let numInterior;
    let positionIndex;
    let i;
    let j;
    // Indices triangles to the 'right' of the north vector

    prevIndex = 0;
    positionIndex = 1;
    for (i = 0; i < 3; i++) {
      indices[indicesIndex++] = positionIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;
    }

    for (i = 2; i < numPts + 1; ++i) {
      positionIndex = i * (i + 1) - 1;
      prevIndex = (i - 1) * i - 1;

      indices[indicesIndex++] = positionIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;

      numInterior = 2 * i;
      for (j = 0; j < numInterior - 1; ++j) {
        indices[indicesIndex++] = positionIndex;
        indices[indicesIndex++] = prevIndex++;
        indices[indicesIndex++] = prevIndex;

        indices[indicesIndex++] = positionIndex++;
        indices[indicesIndex++] = prevIndex;
        indices[indicesIndex++] = positionIndex;
      }

      indices[indicesIndex++] = positionIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;
    }

    // Indices for center column of triangles
    numInterior = numPts * 2;
    ++positionIndex;
    ++prevIndex;
    for (i = 0; i < numInterior - 1; ++i) {
      indices[indicesIndex++] = positionIndex;
      indices[indicesIndex++] = prevIndex++;
      indices[indicesIndex++] = prevIndex;

      indices[indicesIndex++] = positionIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;
    }

    indices[indicesIndex++] = positionIndex;
    indices[indicesIndex++] = prevIndex++;
    indices[indicesIndex++] = prevIndex;

    indices[indicesIndex++] = positionIndex++;
    indices[indicesIndex++] = prevIndex++;
    indices[indicesIndex++] = prevIndex;

    // Reverse the process creating indices to the 'left' of the north vector
    ++prevIndex;
    for (i = numPts - 1; i > 1; --i) {
      indices[indicesIndex++] = prevIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;

      numInterior = 2 * i;
      for (j = 0; j < numInterior - 1; ++j) {
        indices[indicesIndex++] = positionIndex;
        indices[indicesIndex++] = prevIndex++;
        indices[indicesIndex++] = prevIndex;

        indices[indicesIndex++] = positionIndex++;
        indices[indicesIndex++] = prevIndex;
        indices[indicesIndex++] = positionIndex;
      }

      indices[indicesIndex++] = prevIndex++;
      indices[indicesIndex++] = prevIndex++;
      indices[indicesIndex++] = positionIndex++;
    }

    for (i = 0; i < 3; i++) {
      indices[indicesIndex++] = prevIndex++;
      indices[indicesIndex++] = prevIndex;
      indices[indicesIndex++] = positionIndex;
    }
    return indices;
  }

  let boundingSphereCenter = new Matrix2.Cartesian3();

  function computeEllipse(options) {
    const center = options.center;
    boundingSphereCenter = Matrix2.Cartesian3.multiplyByScalar(
      options.ellipsoid.geodeticSurfaceNormal(center, boundingSphereCenter),
      options.height,
      boundingSphereCenter
    );
    boundingSphereCenter = Matrix2.Cartesian3.add(
      center,
      boundingSphereCenter,
      boundingSphereCenter
    );
    const boundingSphere = new Transforms.BoundingSphere(
      boundingSphereCenter,
      options.semiMajorAxis
    );
    const cep = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      options,
      true,
      false
    );
    const positions = cep.positions;
    const numPts = cep.numPts;
    const attributes = computeTopBottomAttributes(positions, options, false);
    let indices = topIndices(numPts);
    indices = IndexDatatype.IndexDatatype.createTypedArray(positions.length / 3, indices);
    return {
      boundingSphere: boundingSphere,
      attributes: attributes,
      indices: indices,
    };
  }

  function computeWallAttributes(positions, options) {
    const vertexFormat = options.vertexFormat;
    const center = options.center;
    const semiMajorAxis = options.semiMajorAxis;
    const semiMinorAxis = options.semiMinorAxis;
    const ellipsoid = options.ellipsoid;
    const height = options.height;
    const extrudedHeight = options.extrudedHeight;
    const stRotation = options.stRotation;
    const size = (positions.length / 3) * 2;

    const finalPositions = new Float64Array(size * 3);
    const textureCoordinates = vertexFormat.st
      ? new Float32Array(size * 2)
      : undefined;
    const normals = vertexFormat.normal ? new Float32Array(size * 3) : undefined;
    const tangents = vertexFormat.tangent
      ? new Float32Array(size * 3)
      : undefined;
    const bitangents = vertexFormat.bitangent
      ? new Float32Array(size * 3)
      : undefined;

    const shadowVolume = options.shadowVolume;
    const extrudeNormals = shadowVolume ? new Float32Array(size * 3) : undefined;

    let textureCoordIndex = 0;

    // Raise positions to a height above the ellipsoid and compute the
    // texture coordinates, normals, tangents, and bitangents.
    let normal = scratchNormal;
    let tangent = scratchTangent;
    let bitangent = scratchBitangent;

    const projection = new Transforms.GeographicProjection(ellipsoid);
    const projectedCenter = projection.project(
      ellipsoid.cartesianToCartographic(center, scratchCartographic),
      projectedCenterScratch
    );

    const geodeticNormal = ellipsoid.scaleToGeodeticSurface(
      center,
      scratchCartesian1
    );
    ellipsoid.geodeticSurfaceNormal(geodeticNormal, geodeticNormal);
    const rotation = Transforms.Quaternion.fromAxisAngle(
      geodeticNormal,
      stRotation,
      quaternionScratch
    );
    const textureMatrix = Matrix2.Matrix3.fromQuaternion(rotation, textureMatrixScratch);

    const minTexCoord = Matrix2.Cartesian2.fromElements(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      scratchMinTexCoord
    );
    const maxTexCoord = Matrix2.Cartesian2.fromElements(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      scratchMaxTexCoord
    );

    let length = positions.length;
    const stOffset = (length / 3) * 2;
    for (let i = 0; i < length; i += 3) {
      const i1 = i + 1;
      const i2 = i + 2;
      let position = Matrix2.Cartesian3.fromArray(positions, i, scratchCartesian1);
      let extrudedPosition;

      if (vertexFormat.st) {
        const rotatedPoint = Matrix2.Matrix3.multiplyByVector(
          textureMatrix,
          position,
          scratchCartesian2
        );
        const projectedPoint = projection.project(
          ellipsoid.cartesianToCartographic(rotatedPoint, scratchCartographic),
          scratchCartesian3
        );
        Matrix2.Cartesian3.subtract(projectedPoint, projectedCenter, projectedPoint);

        texCoordScratch.x =
          (projectedPoint.x + semiMajorAxis) / (2.0 * semiMajorAxis);
        texCoordScratch.y =
          (projectedPoint.y + semiMinorAxis) / (2.0 * semiMinorAxis);

        minTexCoord.x = Math.min(texCoordScratch.x, minTexCoord.x);
        minTexCoord.y = Math.min(texCoordScratch.y, minTexCoord.y);
        maxTexCoord.x = Math.max(texCoordScratch.x, maxTexCoord.x);
        maxTexCoord.y = Math.max(texCoordScratch.y, maxTexCoord.y);

        textureCoordinates[textureCoordIndex + stOffset] = texCoordScratch.x;
        textureCoordinates[textureCoordIndex + 1 + stOffset] = texCoordScratch.y;

        textureCoordinates[textureCoordIndex++] = texCoordScratch.x;
        textureCoordinates[textureCoordIndex++] = texCoordScratch.y;
      }

      position = ellipsoid.scaleToGeodeticSurface(position, position);
      extrudedPosition = Matrix2.Cartesian3.clone(position, scratchCartesian2);
      normal = ellipsoid.geodeticSurfaceNormal(position, normal);

      if (shadowVolume) {
        extrudeNormals[i + length] = -normal.x;
        extrudeNormals[i1 + length] = -normal.y;
        extrudeNormals[i2 + length] = -normal.z;
      }

      let scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
        normal,
        height,
        scratchCartesian4
      );
      position = Matrix2.Cartesian3.add(position, scaledNormal, position);
      scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
        normal,
        extrudedHeight,
        scaledNormal
      );
      extrudedPosition = Matrix2.Cartesian3.add(
        extrudedPosition,
        scaledNormal,
        extrudedPosition
      );

      if (vertexFormat.position) {
        finalPositions[i + length] = extrudedPosition.x;
        finalPositions[i1 + length] = extrudedPosition.y;
        finalPositions[i2 + length] = extrudedPosition.z;

        finalPositions[i] = position.x;
        finalPositions[i1] = position.y;
        finalPositions[i2] = position.z;
      }

      if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
        bitangent = Matrix2.Cartesian3.clone(normal, bitangent);
        const next = Matrix2.Cartesian3.fromArray(
          positions,
          (i + 3) % length,
          scratchCartesian4
        );
        Matrix2.Cartesian3.subtract(next, position, next);
        const bottom = Matrix2.Cartesian3.subtract(
          extrudedPosition,
          position,
          scratchCartesian3
        );

        normal = Matrix2.Cartesian3.normalize(
          Matrix2.Cartesian3.cross(bottom, next, normal),
          normal
        );

        if (vertexFormat.normal) {
          normals[i] = normal.x;
          normals[i1] = normal.y;
          normals[i2] = normal.z;

          normals[i + length] = normal.x;
          normals[i1 + length] = normal.y;
          normals[i2 + length] = normal.z;
        }

        if (vertexFormat.tangent) {
          tangent = Matrix2.Cartesian3.normalize(
            Matrix2.Cartesian3.cross(bitangent, normal, tangent),
            tangent
          );
          tangents[i] = tangent.x;
          tangents[i1] = tangent.y;
          tangents[i2] = tangent.z;

          tangents[i + length] = tangent.x;
          tangents[i + 1 + length] = tangent.y;
          tangents[i + 2 + length] = tangent.z;
        }

        if (vertexFormat.bitangent) {
          bitangents[i] = bitangent.x;
          bitangents[i1] = bitangent.y;
          bitangents[i2] = bitangent.z;

          bitangents[i + length] = bitangent.x;
          bitangents[i1 + length] = bitangent.y;
          bitangents[i2 + length] = bitangent.z;
        }
      }
    }

    if (vertexFormat.st) {
      length = textureCoordinates.length;
      for (let k = 0; k < length; k += 2) {
        textureCoordinates[k] =
          (textureCoordinates[k] - minTexCoord.x) /
          (maxTexCoord.x - minTexCoord.x);
        textureCoordinates[k + 1] =
          (textureCoordinates[k + 1] - minTexCoord.y) /
          (maxTexCoord.y - minTexCoord.y);
      }
    }

    const attributes = new GeometryAttributes.GeometryAttributes();

    if (vertexFormat.position) {
      attributes.position = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: finalPositions,
      });
    }

    if (vertexFormat.st) {
      attributes.st = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: textureCoordinates,
      });
    }

    if (vertexFormat.normal) {
      attributes.normal = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: normals,
      });
    }

    if (vertexFormat.tangent) {
      attributes.tangent = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: tangents,
      });
    }

    if (vertexFormat.bitangent) {
      attributes.bitangent = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: bitangents,
      });
    }

    if (shadowVolume) {
      attributes.extrudeDirection = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: extrudeNormals,
      });
    }

    if (when.defined(options.offsetAttribute)) {
      let offsetAttribute = new Uint8Array(size);
      if (options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.TOP) {
        offsetAttribute = GeometryOffsetAttribute.arrayFill(offsetAttribute, 1, 0, size / 2);
      } else {
        const offsetValue =
          options.offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE ? 0 : 1;
        offsetAttribute = GeometryOffsetAttribute.arrayFill(offsetAttribute, offsetValue);
      }
      attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute: 1,
        values: offsetAttribute,
      });
    }

    return attributes;
  }

  function computeWallIndices(positions) {
    const length = positions.length / 3;
    const indices = IndexDatatype.IndexDatatype.createTypedArray(length, length * 6);
    let index = 0;
    for (let i = 0; i < length; i++) {
      const UL = i;
      const LL = i + length;
      const UR = (UL + 1) % length;
      const LR = UR + length;
      indices[index++] = UL;
      indices[index++] = LL;
      indices[index++] = UR;
      indices[index++] = UR;
      indices[index++] = LL;
      indices[index++] = LR;
    }

    return indices;
  }

  const topBoundingSphere = new Transforms.BoundingSphere();
  const bottomBoundingSphere = new Transforms.BoundingSphere();

  function computeExtrudedEllipse(options) {
    const center = options.center;
    const ellipsoid = options.ellipsoid;
    const semiMajorAxis = options.semiMajorAxis;
    let scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
      ellipsoid.geodeticSurfaceNormal(center, scratchCartesian1),
      options.height,
      scratchCartesian1
    );
    topBoundingSphere.center = Matrix2.Cartesian3.add(
      center,
      scaledNormal,
      topBoundingSphere.center
    );
    topBoundingSphere.radius = semiMajorAxis;

    scaledNormal = Matrix2.Cartesian3.multiplyByScalar(
      ellipsoid.geodeticSurfaceNormal(center, scaledNormal),
      options.extrudedHeight,
      scaledNormal
    );
    bottomBoundingSphere.center = Matrix2.Cartesian3.add(
      center,
      scaledNormal,
      bottomBoundingSphere.center
    );
    bottomBoundingSphere.radius = semiMajorAxis;

    const cep = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      options,
      true,
      true
    );
    const positions = cep.positions;
    const numPts = cep.numPts;
    const outerPositions = cep.outerPositions;
    const boundingSphere = Transforms.BoundingSphere.union(
      topBoundingSphere,
      bottomBoundingSphere
    );
    const topBottomAttributes = computeTopBottomAttributes(
      positions,
      options,
      true
    );
    let indices = topIndices(numPts);
    const length = indices.length;
    indices.length = length * 2;
    const posLength = positions.length / 3;
    for (let i = 0; i < length; i += 3) {
      indices[i + length] = indices[i + 2] + posLength;
      indices[i + 1 + length] = indices[i + 1] + posLength;
      indices[i + 2 + length] = indices[i] + posLength;
    }

    const topBottomIndices = IndexDatatype.IndexDatatype.createTypedArray(
      (posLength * 2) / 3,
      indices
    );

    const topBottomGeo = new GeometryAttribute.Geometry({
      attributes: topBottomAttributes,
      indices: topBottomIndices,
      primitiveType: GeometryAttribute.PrimitiveType.TRIANGLES,
    });

    const wallAttributes = computeWallAttributes(outerPositions, options);
    indices = computeWallIndices(outerPositions);
    const wallIndices = IndexDatatype.IndexDatatype.createTypedArray(
      (outerPositions.length * 2) / 3,
      indices
    );

    const wallGeo = new GeometryAttribute.Geometry({
      attributes: wallAttributes,
      indices: wallIndices,
      primitiveType: GeometryAttribute.PrimitiveType.TRIANGLES,
    });

    const geo = GeometryPipeline.GeometryPipeline.combineInstances([
      new GeometryInstance.GeometryInstance({
        geometry: topBottomGeo,
      }),
      new GeometryInstance.GeometryInstance({
        geometry: wallGeo,
      }),
    ]);

    return {
      boundingSphere: boundingSphere,
      attributes: geo[0].attributes,
      indices: geo[0].indices,
    };
  }

  function computeRectangle(
    center,
    semiMajorAxis,
    semiMinorAxis,
    rotation,
    granularity,
    ellipsoid,
    result
  ) {
    const cep = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: center,
        semiMajorAxis: semiMajorAxis,
        semiMinorAxis: semiMinorAxis,
        rotation: rotation,
        granularity: granularity,
      },
      false,
      true
    );
    const positionsFlat = cep.outerPositions;
    const positionsCount = positionsFlat.length / 3;
    const positions = new Array(positionsCount);
    for (let i = 0; i < positionsCount; ++i) {
      positions[i] = Matrix2.Cartesian3.fromArray(positionsFlat, i * 3);
    }
    const rectangle = Matrix2.Rectangle.fromCartesianArray(positions, ellipsoid, result);
    // Rectangle width goes beyond 180 degrees when the ellipse crosses a pole.
    // When this happens, make the rectangle into a "circle" around the pole
    if (rectangle.width > ComponentDatatype.CesiumMath.PI) {
      rectangle.north =
        rectangle.north > 0.0
          ? ComponentDatatype.CesiumMath.PI_OVER_TWO - ComponentDatatype.CesiumMath.EPSILON7
          : rectangle.north;
      rectangle.south =
        rectangle.south < 0.0
          ? ComponentDatatype.CesiumMath.EPSILON7 - ComponentDatatype.CesiumMath.PI_OVER_TWO
          : rectangle.south;
      rectangle.east = ComponentDatatype.CesiumMath.PI;
      rectangle.west = -ComponentDatatype.CesiumMath.PI;
    }
    return rectangle;
  }

  /**
   * A description of an ellipse on an ellipsoid. Ellipse geometry can be rendered with both {@link Primitive} and {@link GroundPrimitive}.
   *
   * @alias EllipseGeometry
   * @constructor
   *
   * @param {Object} options Object with the following properties:
   * @param {Cartesian3} options.center The ellipse's center point in the fixed frame.
   * @param {Number} options.semiMajorAxis The length of the ellipse's semi-major axis in meters.
   * @param {Number} options.semiMinorAxis The length of the ellipse's semi-minor axis in meters.
   * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] The ellipsoid the ellipse will be on.
   * @param {Number} [options.height=0.0] The distance in meters between the ellipse and the ellipsoid surface.
   * @param {Number} [options.extrudedHeight] The distance in meters between the ellipse's extruded face and the ellipsoid surface.
   * @param {Number} [options.rotation=0.0] The angle of rotation counter-clockwise from north.
   * @param {Number} [options.stRotation=0.0] The rotation of the texture coordinates counter-clockwise from north.
   * @param {Number} [options.granularity=CesiumMath.RADIANS_PER_DEGREE] The angular distance between points on the ellipse in radians.
   * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
   *
   * @exception {DeveloperError} semiMajorAxis and semiMinorAxis must be greater than zero.
   * @exception {DeveloperError} semiMajorAxis must be greater than or equal to the semiMinorAxis.
   * @exception {DeveloperError} granularity must be greater than zero.
   *
   *
   * @example
   * // Create an ellipse.
   * const ellipse = new Cesium.EllipseGeometry({
   *   center : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
   *   semiMajorAxis : 500000.0,
   *   semiMinorAxis : 300000.0,
   *   rotation : Cesium.Math.toRadians(60.0)
   * });
   * const geometry = Cesium.EllipseGeometry.createGeometry(ellipse);
   *
   * @see EllipseGeometry.createGeometry
   */
  function EllipseGeometry(options) {
    options = when.defaultValue(options, when.defaultValue.EMPTY_OBJECT);

    const center = options.center;
    const ellipsoid = when.defaultValue(options.ellipsoid, Matrix2.Ellipsoid.WGS84);
    const semiMajorAxis = options.semiMajorAxis;
    const semiMinorAxis = options.semiMinorAxis;
    const granularity = when.defaultValue(
      options.granularity,
      ComponentDatatype.CesiumMath.RADIANS_PER_DEGREE
    );
    const vertexFormat = when.defaultValue(options.vertexFormat, VertexFormat.VertexFormat.DEFAULT);

    //>>includeStart('debug', pragmas.debug);
    RuntimeError.Check.defined("options.center", center);
    RuntimeError.Check.typeOf.number("options.semiMajorAxis", semiMajorAxis);
    RuntimeError.Check.typeOf.number("options.semiMinorAxis", semiMinorAxis);
    if (semiMajorAxis < semiMinorAxis) {
      throw new RuntimeError.DeveloperError(
        "semiMajorAxis must be greater than or equal to the semiMinorAxis."
      );
    }
    if (granularity <= 0.0) {
      throw new RuntimeError.DeveloperError("granularity must be greater than zero.");
    }
    //>>includeEnd('debug');

    const height = when.defaultValue(options.height, 0.0);
    const extrudedHeight = when.defaultValue(options.extrudedHeight, height);

    this._center = Matrix2.Cartesian3.clone(center);
    this._semiMajorAxis = semiMajorAxis;
    this._semiMinorAxis = semiMinorAxis;
    this._ellipsoid = Matrix2.Ellipsoid.clone(ellipsoid);
    this._rotation = when.defaultValue(options.rotation, 0.0);
    this._stRotation = when.defaultValue(options.stRotation, 0.0);
    this._height = Math.max(extrudedHeight, height);
    this._granularity = granularity;
    this._vertexFormat = VertexFormat.VertexFormat.clone(vertexFormat);
    this._extrudedHeight = Math.min(extrudedHeight, height);
    this._shadowVolume = when.defaultValue(options.shadowVolume, false);
    this._workerName = "createEllipseGeometry";
    this._offsetAttribute = options.offsetAttribute;

    this._rectangle = undefined;
    this._textureCoordinateRotationPoints = undefined;
  }

  /**
   * The number of elements used to pack the object into an array.
   * @type {Number}
   */
  EllipseGeometry.packedLength =
    Matrix2.Cartesian3.packedLength +
    Matrix2.Ellipsoid.packedLength +
    VertexFormat.VertexFormat.packedLength +
    9;

  /**
   * Stores the provided instance into the provided array.
   *
   * @param {EllipseGeometry} value The value to pack.
   * @param {Number[]} array The array to pack into.
   * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
   *
   * @returns {Number[]} The array that was packed into
   */
  EllipseGeometry.pack = function (value, array, startingIndex) {
    //>>includeStart('debug', pragmas.debug);
    RuntimeError.Check.defined("value", value);
    RuntimeError.Check.defined("array", array);
    //>>includeEnd('debug');

    startingIndex = when.defaultValue(startingIndex, 0);

    Matrix2.Cartesian3.pack(value._center, array, startingIndex);
    startingIndex += Matrix2.Cartesian3.packedLength;

    Matrix2.Ellipsoid.pack(value._ellipsoid, array, startingIndex);
    startingIndex += Matrix2.Ellipsoid.packedLength;

    VertexFormat.VertexFormat.pack(value._vertexFormat, array, startingIndex);
    startingIndex += VertexFormat.VertexFormat.packedLength;

    array[startingIndex++] = value._semiMajorAxis;
    array[startingIndex++] = value._semiMinorAxis;
    array[startingIndex++] = value._rotation;
    array[startingIndex++] = value._stRotation;
    array[startingIndex++] = value._height;
    array[startingIndex++] = value._granularity;
    array[startingIndex++] = value._extrudedHeight;
    array[startingIndex++] = value._shadowVolume ? 1.0 : 0.0;
    array[startingIndex] = when.defaultValue(value._offsetAttribute, -1);

    return array;
  };

  const scratchCenter = new Matrix2.Cartesian3();
  const scratchEllipsoid = new Matrix2.Ellipsoid();
  const scratchVertexFormat = new VertexFormat.VertexFormat();
  const scratchOptions = {
    center: scratchCenter,
    ellipsoid: scratchEllipsoid,
    vertexFormat: scratchVertexFormat,
    semiMajorAxis: undefined,
    semiMinorAxis: undefined,
    rotation: undefined,
    stRotation: undefined,
    height: undefined,
    granularity: undefined,
    extrudedHeight: undefined,
    shadowVolume: undefined,
    offsetAttribute: undefined,
  };

  /**
   * Retrieves an instance from a packed array.
   *
   * @param {Number[]} array The packed array.
   * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
   * @param {EllipseGeometry} [result] The object into which to store the result.
   * @returns {EllipseGeometry} The modified result parameter or a new EllipseGeometry instance if one was not provided.
   */
  EllipseGeometry.unpack = function (array, startingIndex, result) {
    //>>includeStart('debug', pragmas.debug);
    RuntimeError.Check.defined("array", array);
    //>>includeEnd('debug');

    startingIndex = when.defaultValue(startingIndex, 0);

    const center = Matrix2.Cartesian3.unpack(array, startingIndex, scratchCenter);
    startingIndex += Matrix2.Cartesian3.packedLength;

    const ellipsoid = Matrix2.Ellipsoid.unpack(array, startingIndex, scratchEllipsoid);
    startingIndex += Matrix2.Ellipsoid.packedLength;

    const vertexFormat = VertexFormat.VertexFormat.unpack(
      array,
      startingIndex,
      scratchVertexFormat
    );
    startingIndex += VertexFormat.VertexFormat.packedLength;

    const semiMajorAxis = array[startingIndex++];
    const semiMinorAxis = array[startingIndex++];
    const rotation = array[startingIndex++];
    const stRotation = array[startingIndex++];
    const height = array[startingIndex++];
    const granularity = array[startingIndex++];
    const extrudedHeight = array[startingIndex++];
    const shadowVolume = array[startingIndex++] === 1.0;
    const offsetAttribute = array[startingIndex];

    if (!when.defined(result)) {
      scratchOptions.height = height;
      scratchOptions.extrudedHeight = extrudedHeight;
      scratchOptions.granularity = granularity;
      scratchOptions.stRotation = stRotation;
      scratchOptions.rotation = rotation;
      scratchOptions.semiMajorAxis = semiMajorAxis;
      scratchOptions.semiMinorAxis = semiMinorAxis;
      scratchOptions.shadowVolume = shadowVolume;
      scratchOptions.offsetAttribute =
        offsetAttribute === -1 ? undefined : offsetAttribute;

      return new EllipseGeometry(scratchOptions);
    }

    result._center = Matrix2.Cartesian3.clone(center, result._center);
    result._ellipsoid = Matrix2.Ellipsoid.clone(ellipsoid, result._ellipsoid);
    result._vertexFormat = VertexFormat.VertexFormat.clone(vertexFormat, result._vertexFormat);
    result._semiMajorAxis = semiMajorAxis;
    result._semiMinorAxis = semiMinorAxis;
    result._rotation = rotation;
    result._stRotation = stRotation;
    result._height = height;
    result._granularity = granularity;
    result._extrudedHeight = extrudedHeight;
    result._shadowVolume = shadowVolume;
    result._offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;

    return result;
  };

  /**
   * Computes the bounding rectangle based on the provided options
   *
   * @param {Object} options Object with the following properties:
   * @param {Cartesian3} options.center The ellipse's center point in the fixed frame.
   * @param {Number} options.semiMajorAxis The length of the ellipse's semi-major axis in meters.
   * @param {Number} options.semiMinorAxis The length of the ellipse's semi-minor axis in meters.
   * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] The ellipsoid the ellipse will be on.
   * @param {Number} [options.rotation=0.0] The angle of rotation counter-clockwise from north.
   * @param {Number} [options.granularity=CesiumMath.RADIANS_PER_DEGREE] The angular distance between points on the ellipse in radians.
   * @param {Rectangle} [result] An object in which to store the result
   *
   * @returns {Rectangle} The result rectangle
   */
  EllipseGeometry.computeRectangle = function (options, result) {
    options = when.defaultValue(options, when.defaultValue.EMPTY_OBJECT);

    const center = options.center;
    const ellipsoid = when.defaultValue(options.ellipsoid, Matrix2.Ellipsoid.WGS84);
    const semiMajorAxis = options.semiMajorAxis;
    const semiMinorAxis = options.semiMinorAxis;
    const granularity = when.defaultValue(
      options.granularity,
      ComponentDatatype.CesiumMath.RADIANS_PER_DEGREE
    );
    const rotation = when.defaultValue(options.rotation, 0.0);

    //>>includeStart('debug', pragmas.debug);
    RuntimeError.Check.defined("options.center", center);
    RuntimeError.Check.typeOf.number("options.semiMajorAxis", semiMajorAxis);
    RuntimeError.Check.typeOf.number("options.semiMinorAxis", semiMinorAxis);
    if (semiMajorAxis < semiMinorAxis) {
      throw new RuntimeError.DeveloperError(
        "semiMajorAxis must be greater than or equal to the semiMinorAxis."
      );
    }
    if (granularity <= 0.0) {
      throw new RuntimeError.DeveloperError("granularity must be greater than zero.");
    }
    //>>includeEnd('debug');

    return computeRectangle(
      center,
      semiMajorAxis,
      semiMinorAxis,
      rotation,
      granularity,
      ellipsoid,
      result
    );
  };

  /**
   * Computes the geometric representation of a ellipse on an ellipsoid, including its vertices, indices, and a bounding sphere.
   *
   * @param {EllipseGeometry} ellipseGeometry A description of the ellipse.
   * @returns {Geometry|undefined} The computed vertices and indices.
   */
  EllipseGeometry.createGeometry = function (ellipseGeometry) {
    if (
      ellipseGeometry._semiMajorAxis <= 0.0 ||
      ellipseGeometry._semiMinorAxis <= 0.0
    ) {
      return;
    }

    const height = ellipseGeometry._height;
    const extrudedHeight = ellipseGeometry._extrudedHeight;
    const extrude = !ComponentDatatype.CesiumMath.equalsEpsilon(
      height,
      extrudedHeight,
      0,
      ComponentDatatype.CesiumMath.EPSILON2
    );

    ellipseGeometry._center = ellipseGeometry._ellipsoid.scaleToGeodeticSurface(
      ellipseGeometry._center,
      ellipseGeometry._center
    );
    const options = {
      center: ellipseGeometry._center,
      semiMajorAxis: ellipseGeometry._semiMajorAxis,
      semiMinorAxis: ellipseGeometry._semiMinorAxis,
      ellipsoid: ellipseGeometry._ellipsoid,
      rotation: ellipseGeometry._rotation,
      height: height,
      granularity: ellipseGeometry._granularity,
      vertexFormat: ellipseGeometry._vertexFormat,
      stRotation: ellipseGeometry._stRotation,
    };
    let geometry;
    if (extrude) {
      options.extrudedHeight = extrudedHeight;
      options.shadowVolume = ellipseGeometry._shadowVolume;
      options.offsetAttribute = ellipseGeometry._offsetAttribute;
      geometry = computeExtrudedEllipse(options);
    } else {
      geometry = computeEllipse(options);

      if (when.defined(ellipseGeometry._offsetAttribute)) {
        const length = geometry.attributes.position.values.length;
        const applyOffset = new Uint8Array(length / 3);
        const offsetValue =
          ellipseGeometry._offsetAttribute === GeometryOffsetAttribute.GeometryOffsetAttribute.NONE
            ? 0
            : 1;
        GeometryOffsetAttribute.arrayFill(applyOffset, offsetValue);
        geometry.attributes.applyOffset = new GeometryAttribute.GeometryAttribute({
          componentDatatype: ComponentDatatype.ComponentDatatype.UNSIGNED_BYTE,
          componentsPerAttribute: 1,
          values: applyOffset,
        });
      }
    }

    return new GeometryAttribute.Geometry({
      attributes: geometry.attributes,
      indices: geometry.indices,
      primitiveType: GeometryAttribute.PrimitiveType.TRIANGLES,
      boundingSphere: geometry.boundingSphere,
      offsetAttribute: ellipseGeometry._offsetAttribute,
    });
  };

  /**
   * @private
   */
  EllipseGeometry.createShadowVolume = function (
    ellipseGeometry,
    minHeightFunc,
    maxHeightFunc
  ) {
    const granularity = ellipseGeometry._granularity;
    const ellipsoid = ellipseGeometry._ellipsoid;

    const minHeight = minHeightFunc(granularity, ellipsoid);
    const maxHeight = maxHeightFunc(granularity, ellipsoid);

    return new EllipseGeometry({
      center: ellipseGeometry._center,
      semiMajorAxis: ellipseGeometry._semiMajorAxis,
      semiMinorAxis: ellipseGeometry._semiMinorAxis,
      ellipsoid: ellipsoid,
      rotation: ellipseGeometry._rotation,
      stRotation: ellipseGeometry._stRotation,
      granularity: granularity,
      extrudedHeight: minHeight,
      height: maxHeight,
      vertexFormat: VertexFormat.VertexFormat.POSITION_ONLY,
      shadowVolume: true,
    });
  };

  function textureCoordinateRotationPoints(ellipseGeometry) {
    const stRotation = -ellipseGeometry._stRotation;
    if (stRotation === 0.0) {
      return [0, 0, 0, 1, 1, 0];
    }

    const cep = EllipseGeometryLibrary.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: ellipseGeometry._center,
        semiMajorAxis: ellipseGeometry._semiMajorAxis,
        semiMinorAxis: ellipseGeometry._semiMinorAxis,
        rotation: ellipseGeometry._rotation,
        granularity: ellipseGeometry._granularity,
      },
      false,
      true
    );
    const positionsFlat = cep.outerPositions;
    const positionsCount = positionsFlat.length / 3;
    const positions = new Array(positionsCount);
    for (let i = 0; i < positionsCount; ++i) {
      positions[i] = Matrix2.Cartesian3.fromArray(positionsFlat, i * 3);
    }

    const ellipsoid = ellipseGeometry._ellipsoid;
    const boundingRectangle = ellipseGeometry.rectangle;
    return GeometryAttribute.Geometry._textureCoordinateRotationPoints(
      positions,
      stRotation,
      ellipsoid,
      boundingRectangle
    );
  }

  Object.defineProperties(EllipseGeometry.prototype, {
    /**
     * @private
     */
    rectangle: {
      get: function () {
        if (!when.defined(this._rectangle)) {
          this._rectangle = computeRectangle(
            this._center,
            this._semiMajorAxis,
            this._semiMinorAxis,
            this._rotation,
            this._granularity,
            this._ellipsoid
          );
        }
        return this._rectangle;
      },
    },
    /**
     * For remapping texture coordinates when rendering EllipseGeometries as GroundPrimitives.
     * @private
     */
    textureCoordinateRotationPoints: {
      get: function () {
        if (!when.defined(this._textureCoordinateRotationPoints)) {
          this._textureCoordinateRotationPoints = textureCoordinateRotationPoints(
            this
          );
        }
        return this._textureCoordinateRotationPoints;
      },
    },
  });

  exports.EllipseGeometry = EllipseGeometry;

}));
