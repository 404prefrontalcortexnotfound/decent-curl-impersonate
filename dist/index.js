var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// src/index.ts
import { spawn as spawn2 } from "node:child_process";
import { dirname as dirname2, resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// src/worker-client.ts
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// ../../node_modules/@sinclair/typebox/build/esm/value/guard/guard.mjs
function IsAsyncIterator(value) {
  return IsObject(value) && globalThis.Symbol.asyncIterator in value;
}
function IsIterator(value) {
  return IsObject(value) && globalThis.Symbol.iterator in value;
}
function IsStandardObject(value) {
  return IsObject(value) && (globalThis.Object.getPrototypeOf(value) === Object.prototype || globalThis.Object.getPrototypeOf(value) === null);
}
function IsPromise(value) {
  return value instanceof globalThis.Promise;
}
function IsDate(value) {
  return value instanceof Date && globalThis.Number.isFinite(value.getTime());
}
function IsMap(value) {
  return value instanceof globalThis.Map;
}
function IsSet(value) {
  return value instanceof globalThis.Set;
}
function IsTypedArray(value) {
  return globalThis.ArrayBuffer.isView(value);
}
function IsUint8Array(value) {
  return value instanceof globalThis.Uint8Array;
}
function HasPropertyKey(value, key) {
  return key in value;
}
function IsObject(value) {
  return value !== null && typeof value === "object";
}
function IsArray(value) {
  return globalThis.Array.isArray(value) && !globalThis.ArrayBuffer.isView(value);
}
function IsUndefined(value) {
  return value === undefined;
}
function IsNull(value) {
  return value === null;
}
function IsBoolean(value) {
  return typeof value === "boolean";
}
function IsNumber(value) {
  return typeof value === "number";
}
function IsInteger(value) {
  return globalThis.Number.isInteger(value);
}
function IsBigInt(value) {
  return typeof value === "bigint";
}
function IsString(value) {
  return typeof value === "string";
}
function IsFunction(value) {
  return typeof value === "function";
}
function IsSymbol(value) {
  return typeof value === "symbol";
}
function IsValueType(value) {
  return IsBigInt(value) || IsBoolean(value) || IsNull(value) || IsNumber(value) || IsString(value) || IsSymbol(value) || IsUndefined(value);
}
// ../../node_modules/@sinclair/typebox/build/esm/system/policy.mjs
var TypeSystemPolicy;
(function(TypeSystemPolicy2) {
  TypeSystemPolicy2.InstanceMode = "default";
  TypeSystemPolicy2.ExactOptionalPropertyTypes = false;
  TypeSystemPolicy2.AllowArrayObject = false;
  TypeSystemPolicy2.AllowNaN = false;
  TypeSystemPolicy2.AllowNullVoid = false;
  function IsExactOptionalProperty(value, key) {
    return TypeSystemPolicy2.ExactOptionalPropertyTypes ? key in value : value[key] !== undefined;
  }
  TypeSystemPolicy2.IsExactOptionalProperty = IsExactOptionalProperty;
  function IsObjectLike(value) {
    const isObject = IsObject(value);
    return TypeSystemPolicy2.AllowArrayObject ? isObject : isObject && !IsArray(value);
  }
  TypeSystemPolicy2.IsObjectLike = IsObjectLike;
  function IsRecordLike(value) {
    return IsObjectLike(value) && !(value instanceof Date) && !(value instanceof Uint8Array);
  }
  TypeSystemPolicy2.IsRecordLike = IsRecordLike;
  function IsNumberLike(value) {
    return TypeSystemPolicy2.AllowNaN ? IsNumber(value) : Number.isFinite(value);
  }
  TypeSystemPolicy2.IsNumberLike = IsNumberLike;
  function IsVoidLike(value) {
    const isUndefined = IsUndefined(value);
    return TypeSystemPolicy2.AllowNullVoid ? isUndefined || value === null : isUndefined;
  }
  TypeSystemPolicy2.IsVoidLike = IsVoidLike;
})(TypeSystemPolicy || (TypeSystemPolicy = {}));

// ../../node_modules/@sinclair/typebox/build/esm/type/registry/format.mjs
var exports_format = {};
__export(exports_format, {
  Set: () => Set2,
  Has: () => Has,
  Get: () => Get,
  Entries: () => Entries,
  Delete: () => Delete,
  Clear: () => Clear
});
var map = new Map;
function Entries() {
  return new Map(map);
}
function Clear() {
  return map.clear();
}
function Delete(format) {
  return map.delete(format);
}
function Has(format) {
  return map.has(format);
}
function Set2(format, func) {
  map.set(format, func);
}
function Get(format) {
  return map.get(format);
}
// ../../node_modules/@sinclair/typebox/build/esm/type/registry/type.mjs
var exports_type = {};
__export(exports_type, {
  Set: () => Set3,
  Has: () => Has2,
  Get: () => Get2,
  Entries: () => Entries2,
  Delete: () => Delete2,
  Clear: () => Clear2
});
var map2 = new Map;
function Entries2() {
  return new Map(map2);
}
function Clear2() {
  return map2.clear();
}
function Delete2(kind) {
  return map2.delete(kind);
}
function Has2(kind) {
  return map2.has(kind);
}
function Set3(kind, func) {
  map2.set(kind, func);
}
function Get2(kind) {
  return map2.get(kind);
}
// ../../node_modules/@sinclair/typebox/build/esm/type/guard/value.mjs
var exports_value = {};
__export(exports_value, {
  IsUndefined: () => IsUndefined2,
  IsUint8Array: () => IsUint8Array2,
  IsSymbol: () => IsSymbol2,
  IsString: () => IsString2,
  IsRegExp: () => IsRegExp,
  IsObject: () => IsObject2,
  IsNumber: () => IsNumber2,
  IsNull: () => IsNull2,
  IsIterator: () => IsIterator2,
  IsFunction: () => IsFunction2,
  IsDate: () => IsDate2,
  IsBoolean: () => IsBoolean2,
  IsBigInt: () => IsBigInt2,
  IsAsyncIterator: () => IsAsyncIterator2,
  IsArray: () => IsArray2,
  HasPropertyKey: () => HasPropertyKey2
});
function HasPropertyKey2(value, key) {
  return key in value;
}
function IsAsyncIterator2(value) {
  return IsObject2(value) && !IsArray2(value) && !IsUint8Array2(value) && Symbol.asyncIterator in value;
}
function IsArray2(value) {
  return Array.isArray(value);
}
function IsBigInt2(value) {
  return typeof value === "bigint";
}
function IsBoolean2(value) {
  return typeof value === "boolean";
}
function IsDate2(value) {
  return value instanceof globalThis.Date;
}
function IsFunction2(value) {
  return typeof value === "function";
}
function IsIterator2(value) {
  return IsObject2(value) && !IsArray2(value) && !IsUint8Array2(value) && Symbol.iterator in value;
}
function IsNull2(value) {
  return value === null;
}
function IsNumber2(value) {
  return typeof value === "number";
}
function IsObject2(value) {
  return typeof value === "object" && value !== null;
}
function IsRegExp(value) {
  return value instanceof globalThis.RegExp;
}
function IsString2(value) {
  return typeof value === "string";
}
function IsSymbol2(value) {
  return typeof value === "symbol";
}
function IsUint8Array2(value) {
  return value instanceof globalThis.Uint8Array;
}
function IsUndefined2(value) {
  return value === undefined;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/create/immutable.mjs
function ImmutableArray(value) {
  return globalThis.Object.freeze(value).map((value2) => Immutable(value2));
}
function ImmutableDate(value) {
  return value;
}
function ImmutableUint8Array(value) {
  return value;
}
function ImmutableRegExp(value) {
  return value;
}
function ImmutableObject(value) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    result[key] = Immutable(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    result[key] = Immutable(value[key]);
  }
  return globalThis.Object.freeze(result);
}
function Immutable(value) {
  return IsArray2(value) ? ImmutableArray(value) : IsDate2(value) ? ImmutableDate(value) : IsUint8Array2(value) ? ImmutableUint8Array(value) : IsRegExp(value) ? ImmutableRegExp(value) : IsObject2(value) ? ImmutableObject(value) : value;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/clone/value.mjs
function ArrayType(value) {
  return value.map((value2) => Visit(value2));
}
function DateType(value) {
  return new Date(value.getTime());
}
function Uint8ArrayType(value) {
  return new Uint8Array(value);
}
function RegExpType(value) {
  return new RegExp(value.source, value.flags);
}
function ObjectType(value) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    result[key] = Visit(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    result[key] = Visit(value[key]);
  }
  return result;
}
function Visit(value) {
  return IsArray2(value) ? ArrayType(value) : IsDate2(value) ? DateType(value) : IsUint8Array2(value) ? Uint8ArrayType(value) : IsRegExp(value) ? RegExpType(value) : IsObject2(value) ? ObjectType(value) : value;
}
function Clone(value) {
  return Visit(value);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/create/type.mjs
function CreateType(schema, options) {
  const result = options !== undefined ? { ...options, ...schema } : schema;
  switch (TypeSystemPolicy.InstanceMode) {
    case "freeze":
      return Immutable(result);
    case "clone":
      return Clone(result);
    default:
      return result;
  }
}

// ../../node_modules/@sinclair/typebox/build/esm/type/symbols/symbols.mjs
var TransformKind = Symbol.for("TypeBox.Transform");
var ReadonlyKind = Symbol.for("TypeBox.Readonly");
var OptionalKind = Symbol.for("TypeBox.Optional");
var Hint = Symbol.for("TypeBox.Hint");
var Kind = Symbol.for("TypeBox.Kind");

// ../../node_modules/@sinclair/typebox/build/esm/type/unsafe/unsafe.mjs
function Unsafe(options = {}) {
  return CreateType({ [Kind]: options[Kind] ?? "Unsafe" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/error/error.mjs
class TypeBoxError extends Error {
  constructor(message) {
    super(message);
  }
}

// ../../node_modules/@sinclair/typebox/build/esm/type/mapped/mapped-result.mjs
function MappedResult(properties) {
  return CreateType({
    [Kind]: "MappedResult",
    properties
  });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/discard/discard.mjs
function DiscardKey(value, key) {
  const { [key]: _, ...rest } = value;
  return rest;
}
function Discard(value, keys) {
  return keys.reduce((acc, key) => DiscardKey(acc, key), value);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/array/array.mjs
function Array2(items, options) {
  return CreateType({ [Kind]: "Array", type: "array", items }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/async-iterator/async-iterator.mjs
function AsyncIterator(items, options) {
  return CreateType({ [Kind]: "AsyncIterator", type: "AsyncIterator", items }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/constructor/constructor.mjs
function Constructor(parameters, returns, options) {
  return CreateType({ [Kind]: "Constructor", type: "Constructor", parameters, returns }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/function/function.mjs
function Function2(parameters, returns, options) {
  return CreateType({ [Kind]: "Function", type: "Function", parameters, returns }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/computed/computed.mjs
function Computed(target, parameters, options) {
  return CreateType({ [Kind]: "Computed", target, parameters }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/never/never.mjs
function Never(options) {
  return CreateType({ [Kind]: "Never", not: {} }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/guard/kind.mjs
function IsReadonly(value) {
  return IsObject2(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional(value) {
  return IsObject2(value) && value[OptionalKind] === "Optional";
}
function IsAny(value) {
  return IsKindOf(value, "Any");
}
function IsArgument(value) {
  return IsKindOf(value, "Argument");
}
function IsArray3(value) {
  return IsKindOf(value, "Array");
}
function IsAsyncIterator3(value) {
  return IsKindOf(value, "AsyncIterator");
}
function IsBigInt3(value) {
  return IsKindOf(value, "BigInt");
}
function IsBoolean3(value) {
  return IsKindOf(value, "Boolean");
}
function IsComputed(value) {
  return IsKindOf(value, "Computed");
}
function IsConstructor(value) {
  return IsKindOf(value, "Constructor");
}
function IsDate3(value) {
  return IsKindOf(value, "Date");
}
function IsFunction3(value) {
  return IsKindOf(value, "Function");
}
function IsInteger2(value) {
  return IsKindOf(value, "Integer");
}
function IsIntersect(value) {
  return IsKindOf(value, "Intersect");
}
function IsIterator3(value) {
  return IsKindOf(value, "Iterator");
}
function IsKindOf(value, kind) {
  return IsObject2(value) && Kind in value && value[Kind] === kind;
}
function IsLiteralValue(value) {
  return IsBoolean2(value) || IsNumber2(value) || IsString2(value);
}
function IsLiteral(value) {
  return IsKindOf(value, "Literal");
}
function IsMappedKey(value) {
  return IsKindOf(value, "MappedKey");
}
function IsMappedResult(value) {
  return IsKindOf(value, "MappedResult");
}
function IsNever(value) {
  return IsKindOf(value, "Never");
}
function IsNot(value) {
  return IsKindOf(value, "Not");
}
function IsNull3(value) {
  return IsKindOf(value, "Null");
}
function IsNumber3(value) {
  return IsKindOf(value, "Number");
}
function IsObject3(value) {
  return IsKindOf(value, "Object");
}
function IsPromise2(value) {
  return IsKindOf(value, "Promise");
}
function IsRecord(value) {
  return IsKindOf(value, "Record");
}
function IsRef(value) {
  return IsKindOf(value, "Ref");
}
function IsRegExp2(value) {
  return IsKindOf(value, "RegExp");
}
function IsString3(value) {
  return IsKindOf(value, "String");
}
function IsSymbol3(value) {
  return IsKindOf(value, "Symbol");
}
function IsTemplateLiteral(value) {
  return IsKindOf(value, "TemplateLiteral");
}
function IsThis(value) {
  return IsKindOf(value, "This");
}
function IsTransform(value) {
  return IsObject2(value) && TransformKind in value;
}
function IsTuple(value) {
  return IsKindOf(value, "Tuple");
}
function IsUndefined3(value) {
  return IsKindOf(value, "Undefined");
}
function IsUnion(value) {
  return IsKindOf(value, "Union");
}
function IsUint8Array3(value) {
  return IsKindOf(value, "Uint8Array");
}
function IsUnknown(value) {
  return IsKindOf(value, "Unknown");
}
function IsUnsafe(value) {
  return IsKindOf(value, "Unsafe");
}
function IsVoid(value) {
  return IsKindOf(value, "Void");
}
function IsKind(value) {
  return IsObject2(value) && Kind in value && IsString2(value[Kind]);
}
function IsSchema(value) {
  return IsAny(value) || IsArgument(value) || IsArray3(value) || IsBoolean3(value) || IsBigInt3(value) || IsAsyncIterator3(value) || IsComputed(value) || IsConstructor(value) || IsDate3(value) || IsFunction3(value) || IsInteger2(value) || IsIntersect(value) || IsIterator3(value) || IsLiteral(value) || IsMappedKey(value) || IsMappedResult(value) || IsNever(value) || IsNot(value) || IsNull3(value) || IsNumber3(value) || IsObject3(value) || IsPromise2(value) || IsRecord(value) || IsRef(value) || IsRegExp2(value) || IsString3(value) || IsSymbol3(value) || IsTemplateLiteral(value) || IsThis(value) || IsTuple(value) || IsUndefined3(value) || IsUnion(value) || IsUint8Array3(value) || IsUnknown(value) || IsUnsafe(value) || IsVoid(value) || IsKind(value);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/optional/optional.mjs
function RemoveOptional(schema) {
  return CreateType(Discard(schema, [OptionalKind]));
}
function AddOptional(schema) {
  return CreateType({ ...schema, [OptionalKind]: "Optional" });
}
function OptionalWithFlag(schema, F) {
  return F === false ? RemoveOptional(schema) : AddOptional(schema);
}
function Optional(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? OptionalFromMappedResult(schema, F) : OptionalWithFlag(schema, F);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/optional/optional-from-mapped-result.mjs
function FromProperties(P, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Optional(P[K2], F);
  return Acc;
}
function FromMappedResult(R, F) {
  return FromProperties(R.properties, F);
}
function OptionalFromMappedResult(R, F) {
  const P = FromMappedResult(R, F);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-create.mjs
function IntersectCreate(T, options = {}) {
  const allObjects = T.every((schema) => IsObject3(schema));
  const clonedUnevaluatedProperties = IsSchema(options.unevaluatedProperties) ? { unevaluatedProperties: options.unevaluatedProperties } : {};
  return CreateType(options.unevaluatedProperties === false || IsSchema(options.unevaluatedProperties) || allObjects ? { ...clonedUnevaluatedProperties, [Kind]: "Intersect", type: "object", allOf: T } : { ...clonedUnevaluatedProperties, [Kind]: "Intersect", allOf: T }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-evaluated.mjs
function IsIntersectOptional(types) {
  return types.every((left) => IsOptional(left));
}
function RemoveOptionalFromType(type) {
  return Discard(type, [OptionalKind]);
}
function RemoveOptionalFromRest(types) {
  return types.map((left) => IsOptional(left) ? RemoveOptionalFromType(left) : left);
}
function ResolveIntersect(types, options) {
  return IsIntersectOptional(types) ? Optional(IntersectCreate(RemoveOptionalFromRest(types), options)) : IntersectCreate(RemoveOptionalFromRest(types), options);
}
function IntersectEvaluated(types, options = {}) {
  if (types.length === 1)
    return CreateType(types[0], options);
  if (types.length === 0)
    return Never(options);
  if (types.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return ResolveIntersect(types, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intersect/intersect.mjs
function Intersect(types, options) {
  if (types.length === 1)
    return CreateType(types[0], options);
  if (types.length === 0)
    return Never(options);
  if (types.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return IntersectCreate(types, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/union/union-create.mjs
function UnionCreate(T, options) {
  return CreateType({ [Kind]: "Union", anyOf: T }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/union/union-evaluated.mjs
function IsUnionOptional(types) {
  return types.some((type) => IsOptional(type));
}
function RemoveOptionalFromRest2(types) {
  return types.map((left) => IsOptional(left) ? RemoveOptionalFromType2(left) : left);
}
function RemoveOptionalFromType2(T) {
  return Discard(T, [OptionalKind]);
}
function ResolveUnion(types, options) {
  const isOptional = IsUnionOptional(types);
  return isOptional ? Optional(UnionCreate(RemoveOptionalFromRest2(types), options)) : UnionCreate(RemoveOptionalFromRest2(types), options);
}
function UnionEvaluated(T, options) {
  return T.length === 1 ? CreateType(T[0], options) : T.length === 0 ? Never(options) : ResolveUnion(T, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/union/union.mjs
function Union(types, options) {
  return types.length === 0 ? Never(options) : types.length === 1 ? CreateType(types[0], options) : UnionCreate(types, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/parse.mjs
class TemplateLiteralParserError extends TypeBoxError {
}
function Unescape(pattern) {
  return pattern.replace(/\\\$/g, "$").replace(/\\\*/g, "*").replace(/\\\^/g, "^").replace(/\\\|/g, "|").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
}
function IsNonEscaped(pattern, index, char) {
  return pattern[index] === char && pattern.charCodeAt(index - 1) !== 92;
}
function IsOpenParen(pattern, index) {
  return IsNonEscaped(pattern, index, "(");
}
function IsCloseParen(pattern, index) {
  return IsNonEscaped(pattern, index, ")");
}
function IsSeparator(pattern, index) {
  return IsNonEscaped(pattern, index, "|");
}
function IsGroup(pattern) {
  if (!(IsOpenParen(pattern, 0) && IsCloseParen(pattern, pattern.length - 1)))
    return false;
  let count = 0;
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (count === 0 && index !== pattern.length - 1)
      return false;
  }
  return true;
}
function InGroup(pattern) {
  return pattern.slice(1, pattern.length - 1);
}
function IsPrecedenceOr(pattern) {
  let count = 0;
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0)
      return true;
  }
  return false;
}
function IsPrecedenceAnd(pattern) {
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      return true;
  }
  return false;
}
function Or(pattern) {
  let [count, start] = [0, 0];
  const expressions = [];
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0) {
      const range2 = pattern.slice(start, index);
      if (range2.length > 0)
        expressions.push(TemplateLiteralParse(range2));
      start = index + 1;
    }
  }
  const range = pattern.slice(start);
  if (range.length > 0)
    expressions.push(TemplateLiteralParse(range));
  if (expressions.length === 0)
    return { type: "const", const: "" };
  if (expressions.length === 1)
    return expressions[0];
  return { type: "or", expr: expressions };
}
function And(pattern) {
  function Group(value, index) {
    if (!IsOpenParen(value, index))
      throw new TemplateLiteralParserError(`TemplateLiteralParser: Index must point to open parens`);
    let count = 0;
    for (let scan = index;scan < value.length; scan++) {
      if (IsOpenParen(value, scan))
        count += 1;
      if (IsCloseParen(value, scan))
        count -= 1;
      if (count === 0)
        return [index, scan];
    }
    throw new TemplateLiteralParserError(`TemplateLiteralParser: Unclosed group parens in expression`);
  }
  function Range(pattern2, index) {
    for (let scan = index;scan < pattern2.length; scan++) {
      if (IsOpenParen(pattern2, scan))
        return [index, scan];
    }
    return [index, pattern2.length];
  }
  const expressions = [];
  for (let index = 0;index < pattern.length; index++) {
    if (IsOpenParen(pattern, index)) {
      const [start, end] = Group(pattern, index);
      const range = pattern.slice(start, end + 1);
      expressions.push(TemplateLiteralParse(range));
      index = end;
    } else {
      const [start, end] = Range(pattern, index);
      const range = pattern.slice(start, end);
      if (range.length > 0)
        expressions.push(TemplateLiteralParse(range));
      index = end - 1;
    }
  }
  return expressions.length === 0 ? { type: "const", const: "" } : expressions.length === 1 ? expressions[0] : { type: "and", expr: expressions };
}
function TemplateLiteralParse(pattern) {
  return IsGroup(pattern) ? TemplateLiteralParse(InGroup(pattern)) : IsPrecedenceOr(pattern) ? Or(pattern) : IsPrecedenceAnd(pattern) ? And(pattern) : { type: "const", const: Unescape(pattern) };
}
function TemplateLiteralParseExact(pattern) {
  return TemplateLiteralParse(pattern.slice(1, pattern.length - 1));
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/finite.mjs
class TemplateLiteralFiniteError extends TypeBoxError {
}
function IsNumberExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "0" && expression.expr[1].type === "const" && expression.expr[1].const === "[1-9][0-9]*";
}
function IsBooleanExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "true" && expression.expr[1].type === "const" && expression.expr[1].const === "false";
}
function IsStringExpression(expression) {
  return expression.type === "const" && expression.const === ".*";
}
function IsTemplateLiteralExpressionFinite(expression) {
  return IsNumberExpression(expression) || IsStringExpression(expression) ? false : IsBooleanExpression(expression) ? true : expression.type === "and" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "or" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "const" ? true : (() => {
    throw new TemplateLiteralFiniteError(`Unknown expression type`);
  })();
}
function IsTemplateLiteralFinite(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/generate.mjs
class TemplateLiteralGenerateError extends TypeBoxError {
}
function* GenerateReduce(buffer) {
  if (buffer.length === 1)
    return yield* buffer[0];
  for (const left of buffer[0]) {
    for (const right of GenerateReduce(buffer.slice(1))) {
      yield `${left}${right}`;
    }
  }
}
function* GenerateAnd(expression) {
  return yield* GenerateReduce(expression.expr.map((expr) => [...TemplateLiteralExpressionGenerate(expr)]));
}
function* GenerateOr(expression) {
  for (const expr of expression.expr)
    yield* TemplateLiteralExpressionGenerate(expr);
}
function* GenerateConst(expression) {
  return yield expression.const;
}
function* TemplateLiteralExpressionGenerate(expression) {
  return expression.type === "and" ? yield* GenerateAnd(expression) : expression.type === "or" ? yield* GenerateOr(expression) : expression.type === "const" ? yield* GenerateConst(expression) : (() => {
    throw new TemplateLiteralGenerateError("Unknown expression");
  })();
}
function TemplateLiteralGenerate(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression) ? [...TemplateLiteralExpressionGenerate(expression)] : [];
}

// ../../node_modules/@sinclair/typebox/build/esm/type/literal/literal.mjs
function Literal(value, options) {
  return CreateType({
    [Kind]: "Literal",
    const: value,
    type: typeof value
  }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/boolean/boolean.mjs
function Boolean2(options) {
  return CreateType({ [Kind]: "Boolean", type: "boolean" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/bigint/bigint.mjs
function BigInt2(options) {
  return CreateType({ [Kind]: "BigInt", type: "bigint" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/number/number.mjs
function Number2(options) {
  return CreateType({ [Kind]: "Number", type: "number" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/string/string.mjs
function String2(options) {
  return CreateType({ [Kind]: "String", type: "string" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/syntax.mjs
function* FromUnion(syntax) {
  const trim = syntax.trim().replace(/"|'/g, "");
  return trim === "boolean" ? yield Boolean2() : trim === "number" ? yield Number2() : trim === "bigint" ? yield BigInt2() : trim === "string" ? yield String2() : yield (() => {
    const literals = trim.split("|").map((literal) => Literal(literal.trim()));
    return literals.length === 0 ? Never() : literals.length === 1 ? literals[0] : UnionEvaluated(literals);
  })();
}
function* FromTerminal(syntax) {
  if (syntax[1] !== "{") {
    const L = Literal("$");
    const R = FromSyntax(syntax.slice(1));
    return yield* [L, ...R];
  }
  for (let i = 2;i < syntax.length; i++) {
    if (syntax[i] === "}") {
      const L = FromUnion(syntax.slice(2, i));
      const R = FromSyntax(syntax.slice(i + 1));
      return yield* [...L, ...R];
    }
  }
  yield Literal(syntax);
}
function* FromSyntax(syntax) {
  for (let i = 0;i < syntax.length; i++) {
    if (syntax[i] === "$") {
      const L = Literal(syntax.slice(0, i));
      const R = FromTerminal(syntax.slice(i));
      return yield* [L, ...R];
    }
  }
  yield Literal(syntax);
}
function TemplateLiteralSyntax(syntax) {
  return [...FromSyntax(syntax)];
}

// ../../node_modules/@sinclair/typebox/build/esm/type/patterns/patterns.mjs
var PatternBoolean = "(true|false)";
var PatternNumber = "(0|[1-9][0-9]*)";
var PatternString = "(.*)";
var PatternNever = "(?!.*)";
var PatternBooleanExact = `^${PatternBoolean}$`;
var PatternNumberExact = `^${PatternNumber}$`;
var PatternStringExact = `^${PatternString}$`;
var PatternNeverExact = `^${PatternNever}$`;

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/pattern.mjs
class TemplateLiteralPatternError extends TypeBoxError {
}
function Escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Visit2(schema, acc) {
  return IsTemplateLiteral(schema) ? schema.pattern.slice(1, schema.pattern.length - 1) : IsUnion(schema) ? `(${schema.anyOf.map((schema2) => Visit2(schema2, acc)).join("|")})` : IsNumber3(schema) ? `${acc}${PatternNumber}` : IsInteger2(schema) ? `${acc}${PatternNumber}` : IsBigInt3(schema) ? `${acc}${PatternNumber}` : IsString3(schema) ? `${acc}${PatternString}` : IsLiteral(schema) ? `${acc}${Escape(schema.const.toString())}` : IsBoolean3(schema) ? `${acc}${PatternBoolean}` : (() => {
    throw new TemplateLiteralPatternError(`Unexpected Kind '${schema[Kind]}'`);
  })();
}
function TemplateLiteralPattern(kinds) {
  return `^${kinds.map((schema) => Visit2(schema, "")).join("")}$`;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/union.mjs
function TemplateLiteralToUnion(schema) {
  const R = TemplateLiteralGenerate(schema);
  const L = R.map((S) => Literal(S));
  return UnionEvaluated(L);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/template-literal/template-literal.mjs
function TemplateLiteral(unresolved, options) {
  const pattern = IsString2(unresolved) ? TemplateLiteralPattern(TemplateLiteralSyntax(unresolved)) : TemplateLiteralPattern(unresolved);
  return CreateType({ [Kind]: "TemplateLiteral", type: "string", pattern }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-property-keys.mjs
function FromTemplateLiteral(templateLiteral) {
  const keys = TemplateLiteralGenerate(templateLiteral);
  return keys.map((key) => key.toString());
}
function FromUnion2(types) {
  const result = [];
  for (const type of types)
    result.push(...IndexPropertyKeys(type));
  return result;
}
function FromLiteral(literalValue) {
  return [literalValue.toString()];
}
function IndexPropertyKeys(type) {
  return [...new Set(IsTemplateLiteral(type) ? FromTemplateLiteral(type) : IsUnion(type) ? FromUnion2(type.anyOf) : IsLiteral(type) ? FromLiteral(type.const) : IsNumber3(type) ? ["[number]"] : IsInteger2(type) ? ["[number]"] : [])];
}

// ../../node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-result.mjs
function FromProperties2(type, properties, options) {
  const result = {};
  for (const K2 of Object.getOwnPropertyNames(properties)) {
    result[K2] = Index(type, IndexPropertyKeys(properties[K2]), options);
  }
  return result;
}
function FromMappedResult2(type, mappedResult, options) {
  return FromProperties2(type, mappedResult.properties, options);
}
function IndexFromMappedResult(type, mappedResult, options) {
  const properties = FromMappedResult2(type, mappedResult, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/indexed/indexed.mjs
function FromRest(types, key) {
  return types.map((type) => IndexFromPropertyKey(type, key));
}
function FromIntersectRest(types) {
  return types.filter((type) => !IsNever(type));
}
function FromIntersect(types, key) {
  return IntersectEvaluated(FromIntersectRest(FromRest(types, key)));
}
function FromUnionRest(types) {
  return types.some((L) => IsNever(L)) ? [] : types;
}
function FromUnion3(types, key) {
  return UnionEvaluated(FromUnionRest(FromRest(types, key)));
}
function FromTuple(types, key) {
  return key in types ? types[key] : key === "[number]" ? UnionEvaluated(types) : Never();
}
function FromArray(type, key) {
  return key === "[number]" ? type : Never();
}
function FromProperty(properties, propertyKey) {
  return propertyKey in properties ? properties[propertyKey] : Never();
}
function IndexFromPropertyKey(type, propertyKey) {
  return IsIntersect(type) ? FromIntersect(type.allOf, propertyKey) : IsUnion(type) ? FromUnion3(type.anyOf, propertyKey) : IsTuple(type) ? FromTuple(type.items ?? [], propertyKey) : IsArray3(type) ? FromArray(type.items, propertyKey) : IsObject3(type) ? FromProperty(type.properties, propertyKey) : Never();
}
function IndexFromPropertyKeys(type, propertyKeys) {
  return propertyKeys.map((propertyKey) => IndexFromPropertyKey(type, propertyKey));
}
function FromSchema(type, propertyKeys) {
  return UnionEvaluated(IndexFromPropertyKeys(type, propertyKeys));
}
function Index(type, key, options) {
  if (IsRef(type) || IsRef(key)) {
    const error = `Index types using Ref parameters require both Type and Key to be of TSchema`;
    if (!IsSchema(type) || !IsSchema(key))
      throw new TypeBoxError(error);
    return Computed("Index", [type, key]);
  }
  if (IsMappedResult(key))
    return IndexFromMappedResult(type, key, options);
  if (IsMappedKey(key))
    return IndexFromMappedKey(type, key, options);
  return CreateType(IsSchema(key) ? FromSchema(type, IndexPropertyKeys(key)) : FromSchema(type, key), options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-key.mjs
function MappedIndexPropertyKey(type, key, options) {
  return { [key]: Index(type, [key], Clone(options)) };
}
function MappedIndexPropertyKeys(type, propertyKeys, options) {
  return propertyKeys.reduce((result, left) => {
    return { ...result, ...MappedIndexPropertyKey(type, left, options) };
  }, {});
}
function MappedIndexProperties(type, mappedKey, options) {
  return MappedIndexPropertyKeys(type, mappedKey.keys, options);
}
function IndexFromMappedKey(type, mappedKey, options) {
  const properties = MappedIndexProperties(type, mappedKey, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/iterator/iterator.mjs
function Iterator(items, options) {
  return CreateType({ [Kind]: "Iterator", type: "Iterator", items }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/object/object.mjs
function RequiredArray(properties) {
  return globalThis.Object.keys(properties).filter((key) => !IsOptional(properties[key]));
}
function _Object_(properties, options) {
  const required = RequiredArray(properties);
  const schema = required.length > 0 ? { [Kind]: "Object", type: "object", required, properties } : { [Kind]: "Object", type: "object", properties };
  return CreateType(schema, options);
}
var Object2 = _Object_;

// ../../node_modules/@sinclair/typebox/build/esm/type/promise/promise.mjs
function Promise2(item, options) {
  return CreateType({ [Kind]: "Promise", type: "Promise", item }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/readonly/readonly.mjs
function RemoveReadonly(schema) {
  return CreateType(Discard(schema, [ReadonlyKind]));
}
function AddReadonly(schema) {
  return CreateType({ ...schema, [ReadonlyKind]: "Readonly" });
}
function ReadonlyWithFlag(schema, F) {
  return F === false ? RemoveReadonly(schema) : AddReadonly(schema);
}
function Readonly(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? ReadonlyFromMappedResult(schema, F) : ReadonlyWithFlag(schema, F);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/readonly/readonly-from-mapped-result.mjs
function FromProperties3(K, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Readonly(K[K2], F);
  return Acc;
}
function FromMappedResult3(R, F) {
  return FromProperties3(R.properties, F);
}
function ReadonlyFromMappedResult(R, F) {
  const P = FromMappedResult3(R, F);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/tuple/tuple.mjs
function Tuple(types, options) {
  return CreateType(types.length > 0 ? { [Kind]: "Tuple", type: "array", items: types, additionalItems: false, minItems: types.length, maxItems: types.length } : { [Kind]: "Tuple", type: "array", minItems: types.length, maxItems: types.length }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/sets/set.mjs
function SetIncludes(T, S) {
  return T.includes(S);
}
function SetDistinct(T) {
  return [...new Set(T)];
}
function SetIntersect(T, S) {
  return T.filter((L) => S.includes(L));
}
function SetIntersectManyResolve(T, Init) {
  return T.reduce((Acc, L) => {
    return SetIntersect(Acc, L);
  }, Init);
}
function SetIntersectMany(T) {
  return T.length === 1 ? T[0] : T.length > 1 ? SetIntersectManyResolve(T.slice(1), T[0]) : [];
}
function SetUnionMany(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...L);
  return Acc;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/mapped/mapped.mjs
function FromMappedResult4(K, P) {
  return K in P ? FromSchemaType(K, P[K]) : MappedResult(P);
}
function MappedKeyToKnownMappedResultProperties(K) {
  return { [K]: Literal(K) };
}
function MappedKeyToUnknownMappedResultProperties(P) {
  const Acc = {};
  for (const L of P)
    Acc[L] = Literal(L);
  return Acc;
}
function MappedKeyToMappedResultProperties(K, P) {
  return SetIncludes(P, K) ? MappedKeyToKnownMappedResultProperties(K) : MappedKeyToUnknownMappedResultProperties(P);
}
function FromMappedKey(K, P) {
  const R = MappedKeyToMappedResultProperties(K, P);
  return FromMappedResult4(K, R);
}
function FromRest2(K, T) {
  return T.map((L) => FromSchemaType(K, L));
}
function FromProperties4(K, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(T))
    Acc[K2] = FromSchemaType(K, T[K2]);
  return Acc;
}
function FromSchemaType(K, T) {
  const options = { ...T };
  return IsOptional(T) ? Optional(FromSchemaType(K, Discard(T, [OptionalKind]))) : IsReadonly(T) ? Readonly(FromSchemaType(K, Discard(T, [ReadonlyKind]))) : IsMappedResult(T) ? FromMappedResult4(K, T.properties) : IsMappedKey(T) ? FromMappedKey(K, T.keys) : IsConstructor(T) ? Constructor(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsFunction3(T) ? Function2(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsAsyncIterator3(T) ? AsyncIterator(FromSchemaType(K, T.items), options) : IsIterator3(T) ? Iterator(FromSchemaType(K, T.items), options) : IsIntersect(T) ? Intersect(FromRest2(K, T.allOf), options) : IsUnion(T) ? Union(FromRest2(K, T.anyOf), options) : IsTuple(T) ? Tuple(FromRest2(K, T.items ?? []), options) : IsObject3(T) ? Object2(FromProperties4(K, T.properties), options) : IsArray3(T) ? Array2(FromSchemaType(K, T.items), options) : IsPromise2(T) ? Promise2(FromSchemaType(K, T.item), options) : T;
}
function MappedFunctionReturnType(K, T) {
  const Acc = {};
  for (const L of K)
    Acc[L] = FromSchemaType(L, T);
  return Acc;
}
function Mapped(key, map3, options) {
  const K = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const RT = map3({ [Kind]: "MappedKey", keys: K });
  const R = MappedFunctionReturnType(K, RT);
  return Object2(R, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/ref/ref.mjs
function Ref(...args) {
  const [$ref, options] = typeof args[0] === "string" ? [args[0], args[1]] : [args[0].$id, args[1]];
  if (typeof $ref !== "string")
    throw new TypeBoxError("Ref: $ref must be a string");
  return CreateType({ [Kind]: "Ref", $ref }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-property-keys.mjs
function FromRest3(types) {
  const result = [];
  for (const L of types)
    result.push(KeyOfPropertyKeys(L));
  return result;
}
function FromIntersect2(types) {
  const propertyKeysArray = FromRest3(types);
  const propertyKeys = SetUnionMany(propertyKeysArray);
  return propertyKeys;
}
function FromUnion4(types) {
  const propertyKeysArray = FromRest3(types);
  const propertyKeys = SetIntersectMany(propertyKeysArray);
  return propertyKeys;
}
function FromTuple2(types) {
  return types.map((_, indexer) => indexer.toString());
}
function FromArray2(_) {
  return ["[number]"];
}
function FromProperties5(T) {
  return globalThis.Object.getOwnPropertyNames(T);
}
function FromPatternProperties(patternProperties) {
  if (!includePatternProperties)
    return [];
  const patternPropertyKeys = globalThis.Object.getOwnPropertyNames(patternProperties);
  return patternPropertyKeys.map((key) => {
    return key[0] === "^" && key[key.length - 1] === "$" ? key.slice(1, key.length - 1) : key;
  });
}
function KeyOfPropertyKeys(type) {
  return IsIntersect(type) ? FromIntersect2(type.allOf) : IsUnion(type) ? FromUnion4(type.anyOf) : IsTuple(type) ? FromTuple2(type.items ?? []) : IsArray3(type) ? FromArray2(type.items) : IsObject3(type) ? FromProperties5(type.properties) : IsRecord(type) ? FromPatternProperties(type.patternProperties) : [];
}
var includePatternProperties = false;
function KeyOfPattern(schema) {
  includePatternProperties = true;
  const keys = KeyOfPropertyKeys(schema);
  includePatternProperties = false;
  const pattern = keys.map((key) => `(${key})`);
  return `^(${pattern.join("|")})$`;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/keyof/keyof.mjs
function FromComputed(target, parameters) {
  return Computed("KeyOf", [Computed(target, parameters)]);
}
function FromRef($ref) {
  return Computed("KeyOf", [Ref($ref)]);
}
function KeyOfFromType(type, options) {
  const propertyKeys = KeyOfPropertyKeys(type);
  const propertyKeyTypes = KeyOfPropertyKeysToRest(propertyKeys);
  const result = UnionEvaluated(propertyKeyTypes);
  return CreateType(result, options);
}
function KeyOfPropertyKeysToRest(propertyKeys) {
  return propertyKeys.map((L) => L === "[number]" ? Number2() : Literal(L));
}
function KeyOf(type, options) {
  return IsComputed(type) ? FromComputed(type.target, type.parameters) : IsRef(type) ? FromRef(type.$ref) : IsMappedResult(type) ? KeyOfFromMappedResult(type, options) : KeyOfFromType(type, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-from-mapped-result.mjs
function FromProperties6(properties, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = KeyOf(properties[K2], Clone(options));
  return result;
}
function FromMappedResult5(mappedResult, options) {
  return FromProperties6(mappedResult.properties, options);
}
function KeyOfFromMappedResult(mappedResult, options) {
  const properties = FromMappedResult5(mappedResult, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-property-entries.mjs
function KeyOfPropertyEntries(schema) {
  const keys = KeyOfPropertyKeys(schema);
  const schemas = IndexFromPropertyKeys(schema, keys);
  return keys.map((_, index) => [keys[index], schemas[index]]);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extends/extends-undefined.mjs
function Intersect2(schema) {
  return schema.allOf.every((schema2) => ExtendsUndefinedCheck(schema2));
}
function Union2(schema) {
  return schema.anyOf.some((schema2) => ExtendsUndefinedCheck(schema2));
}
function Not(schema) {
  return !ExtendsUndefinedCheck(schema.not);
}
function ExtendsUndefinedCheck(schema) {
  return schema[Kind] === "Intersect" ? Intersect2(schema) : schema[Kind] === "Union" ? Union2(schema) : schema[Kind] === "Not" ? Not(schema) : schema[Kind] === "Undefined" ? true : false;
}

// ../../node_modules/@sinclair/typebox/build/esm/errors/function.mjs
function DefaultErrorFunction(error) {
  switch (error.errorType) {
    case ValueErrorType.ArrayContains:
      return "Expected array to contain at least one matching value";
    case ValueErrorType.ArrayMaxContains:
      return `Expected array to contain no more than ${error.schema.maxContains} matching values`;
    case ValueErrorType.ArrayMinContains:
      return `Expected array to contain at least ${error.schema.minContains} matching values`;
    case ValueErrorType.ArrayMaxItems:
      return `Expected array length to be less or equal to ${error.schema.maxItems}`;
    case ValueErrorType.ArrayMinItems:
      return `Expected array length to be greater or equal to ${error.schema.minItems}`;
    case ValueErrorType.ArrayUniqueItems:
      return "Expected array elements to be unique";
    case ValueErrorType.Array:
      return "Expected array";
    case ValueErrorType.AsyncIterator:
      return "Expected AsyncIterator";
    case ValueErrorType.BigIntExclusiveMaximum:
      return `Expected bigint to be less than ${error.schema.exclusiveMaximum}`;
    case ValueErrorType.BigIntExclusiveMinimum:
      return `Expected bigint to be greater than ${error.schema.exclusiveMinimum}`;
    case ValueErrorType.BigIntMaximum:
      return `Expected bigint to be less or equal to ${error.schema.maximum}`;
    case ValueErrorType.BigIntMinimum:
      return `Expected bigint to be greater or equal to ${error.schema.minimum}`;
    case ValueErrorType.BigIntMultipleOf:
      return `Expected bigint to be a multiple of ${error.schema.multipleOf}`;
    case ValueErrorType.BigInt:
      return "Expected bigint";
    case ValueErrorType.Boolean:
      return "Expected boolean";
    case ValueErrorType.DateExclusiveMinimumTimestamp:
      return `Expected Date timestamp to be greater than ${error.schema.exclusiveMinimumTimestamp}`;
    case ValueErrorType.DateExclusiveMaximumTimestamp:
      return `Expected Date timestamp to be less than ${error.schema.exclusiveMaximumTimestamp}`;
    case ValueErrorType.DateMinimumTimestamp:
      return `Expected Date timestamp to be greater or equal to ${error.schema.minimumTimestamp}`;
    case ValueErrorType.DateMaximumTimestamp:
      return `Expected Date timestamp to be less or equal to ${error.schema.maximumTimestamp}`;
    case ValueErrorType.DateMultipleOfTimestamp:
      return `Expected Date timestamp to be a multiple of ${error.schema.multipleOfTimestamp}`;
    case ValueErrorType.Date:
      return "Expected Date";
    case ValueErrorType.Function:
      return "Expected function";
    case ValueErrorType.IntegerExclusiveMaximum:
      return `Expected integer to be less than ${error.schema.exclusiveMaximum}`;
    case ValueErrorType.IntegerExclusiveMinimum:
      return `Expected integer to be greater than ${error.schema.exclusiveMinimum}`;
    case ValueErrorType.IntegerMaximum:
      return `Expected integer to be less or equal to ${error.schema.maximum}`;
    case ValueErrorType.IntegerMinimum:
      return `Expected integer to be greater or equal to ${error.schema.minimum}`;
    case ValueErrorType.IntegerMultipleOf:
      return `Expected integer to be a multiple of ${error.schema.multipleOf}`;
    case ValueErrorType.Integer:
      return "Expected integer";
    case ValueErrorType.IntersectUnevaluatedProperties:
      return "Unexpected property";
    case ValueErrorType.Intersect:
      return "Expected all values to match";
    case ValueErrorType.Iterator:
      return "Expected Iterator";
    case ValueErrorType.Literal:
      return `Expected ${typeof error.schema.const === "string" ? `'${error.schema.const}'` : error.schema.const}`;
    case ValueErrorType.Never:
      return "Never";
    case ValueErrorType.Not:
      return "Value should not match";
    case ValueErrorType.Null:
      return "Expected null";
    case ValueErrorType.NumberExclusiveMaximum:
      return `Expected number to be less than ${error.schema.exclusiveMaximum}`;
    case ValueErrorType.NumberExclusiveMinimum:
      return `Expected number to be greater than ${error.schema.exclusiveMinimum}`;
    case ValueErrorType.NumberMaximum:
      return `Expected number to be less or equal to ${error.schema.maximum}`;
    case ValueErrorType.NumberMinimum:
      return `Expected number to be greater or equal to ${error.schema.minimum}`;
    case ValueErrorType.NumberMultipleOf:
      return `Expected number to be a multiple of ${error.schema.multipleOf}`;
    case ValueErrorType.Number:
      return "Expected number";
    case ValueErrorType.Object:
      return "Expected object";
    case ValueErrorType.ObjectAdditionalProperties:
      return "Unexpected property";
    case ValueErrorType.ObjectMaxProperties:
      return `Expected object to have no more than ${error.schema.maxProperties} properties`;
    case ValueErrorType.ObjectMinProperties:
      return `Expected object to have at least ${error.schema.minProperties} properties`;
    case ValueErrorType.ObjectRequiredProperty:
      return "Expected required property";
    case ValueErrorType.Promise:
      return "Expected Promise";
    case ValueErrorType.RegExp:
      return "Expected string to match regular expression";
    case ValueErrorType.StringFormatUnknown:
      return `Unknown format '${error.schema.format}'`;
    case ValueErrorType.StringFormat:
      return `Expected string to match '${error.schema.format}' format`;
    case ValueErrorType.StringMaxLength:
      return `Expected string length less or equal to ${error.schema.maxLength}`;
    case ValueErrorType.StringMinLength:
      return `Expected string length greater or equal to ${error.schema.minLength}`;
    case ValueErrorType.StringPattern:
      return `Expected string to match '${error.schema.pattern}'`;
    case ValueErrorType.String:
      return "Expected string";
    case ValueErrorType.Symbol:
      return "Expected symbol";
    case ValueErrorType.TupleLength:
      return `Expected tuple to have ${error.schema.maxItems || 0} elements`;
    case ValueErrorType.Tuple:
      return "Expected tuple";
    case ValueErrorType.Uint8ArrayMaxByteLength:
      return `Expected byte length less or equal to ${error.schema.maxByteLength}`;
    case ValueErrorType.Uint8ArrayMinByteLength:
      return `Expected byte length greater or equal to ${error.schema.minByteLength}`;
    case ValueErrorType.Uint8Array:
      return "Expected Uint8Array";
    case ValueErrorType.Undefined:
      return "Expected undefined";
    case ValueErrorType.Union:
      return "Expected union value";
    case ValueErrorType.Void:
      return "Expected void";
    case ValueErrorType.Kind:
      return `Expected kind '${error.schema[Kind]}'`;
    default:
      return "Unknown error type";
  }
}
var errorFunction = DefaultErrorFunction;
function GetErrorFunction() {
  return errorFunction;
}

// ../../node_modules/@sinclair/typebox/build/esm/value/deref/deref.mjs
class TypeDereferenceError extends TypeBoxError {
  constructor(schema) {
    super(`Unable to dereference schema with $id '${schema.$ref}'`);
    this.schema = schema;
  }
}
function Resolve(schema, references) {
  const target = references.find((target2) => target2.$id === schema.$ref);
  if (target === undefined)
    throw new TypeDereferenceError(schema);
  return Deref(target, references);
}
function Pushref(schema, references) {
  if (!IsString(schema.$id) || references.some((target) => target.$id === schema.$id))
    return references;
  references.push(schema);
  return references;
}
function Deref(schema, references) {
  return schema[Kind] === "This" || schema[Kind] === "Ref" ? Resolve(schema, references) : schema;
}

// ../../node_modules/@sinclair/typebox/build/esm/value/hash/hash.mjs
class ValueHashError extends TypeBoxError {
  constructor(value) {
    super(`Unable to hash value`);
    this.value = value;
  }
}
var ByteMarker;
(function(ByteMarker2) {
  ByteMarker2[ByteMarker2["Undefined"] = 0] = "Undefined";
  ByteMarker2[ByteMarker2["Null"] = 1] = "Null";
  ByteMarker2[ByteMarker2["Boolean"] = 2] = "Boolean";
  ByteMarker2[ByteMarker2["Number"] = 3] = "Number";
  ByteMarker2[ByteMarker2["String"] = 4] = "String";
  ByteMarker2[ByteMarker2["Object"] = 5] = "Object";
  ByteMarker2[ByteMarker2["Array"] = 6] = "Array";
  ByteMarker2[ByteMarker2["Date"] = 7] = "Date";
  ByteMarker2[ByteMarker2["Uint8Array"] = 8] = "Uint8Array";
  ByteMarker2[ByteMarker2["Symbol"] = 9] = "Symbol";
  ByteMarker2[ByteMarker2["BigInt"] = 10] = "BigInt";
})(ByteMarker || (ByteMarker = {}));
var Accumulator = BigInt("14695981039346656037");
var [Prime, Size] = [BigInt("1099511628211"), BigInt("18446744073709551616")];
var Bytes = Array.from({ length: 256 }).map((_, i) => BigInt(i));
var F64 = new Float64Array(1);
var F64In = new DataView(F64.buffer);
var F64Out = new Uint8Array(F64.buffer);
function* NumberToBytes(value) {
  const byteCount = value === 0 ? 1 : Math.ceil(Math.floor(Math.log2(value) + 1) / 8);
  for (let i = 0;i < byteCount; i++) {
    yield value >> 8 * (byteCount - 1 - i) & 255;
  }
}
function ArrayType2(value) {
  FNV1A64(ByteMarker.Array);
  for (const item of value) {
    Visit3(item);
  }
}
function BooleanType(value) {
  FNV1A64(ByteMarker.Boolean);
  FNV1A64(value ? 1 : 0);
}
function BigIntType(value) {
  FNV1A64(ByteMarker.BigInt);
  F64In.setBigInt64(0, value);
  for (const byte of F64Out) {
    FNV1A64(byte);
  }
}
function DateType2(value) {
  FNV1A64(ByteMarker.Date);
  Visit3(value.getTime());
}
function NullType(value) {
  FNV1A64(ByteMarker.Null);
}
function NumberType(value) {
  FNV1A64(ByteMarker.Number);
  F64In.setFloat64(0, value);
  for (const byte of F64Out) {
    FNV1A64(byte);
  }
}
function ObjectType2(value) {
  FNV1A64(ByteMarker.Object);
  for (const key of globalThis.Object.getOwnPropertyNames(value).sort()) {
    Visit3(key);
    Visit3(value[key]);
  }
}
function StringType(value) {
  FNV1A64(ByteMarker.String);
  for (let i = 0;i < value.length; i++) {
    for (const byte of NumberToBytes(value.charCodeAt(i))) {
      FNV1A64(byte);
    }
  }
}
function SymbolType(value) {
  FNV1A64(ByteMarker.Symbol);
  Visit3(value.description);
}
function Uint8ArrayType2(value) {
  FNV1A64(ByteMarker.Uint8Array);
  for (let i = 0;i < value.length; i++) {
    FNV1A64(value[i]);
  }
}
function UndefinedType(value) {
  return FNV1A64(ByteMarker.Undefined);
}
function Visit3(value) {
  if (IsArray(value))
    return ArrayType2(value);
  if (IsBoolean(value))
    return BooleanType(value);
  if (IsBigInt(value))
    return BigIntType(value);
  if (IsDate(value))
    return DateType2(value);
  if (IsNull(value))
    return NullType(value);
  if (IsNumber(value))
    return NumberType(value);
  if (IsObject(value))
    return ObjectType2(value);
  if (IsString(value))
    return StringType(value);
  if (IsSymbol(value))
    return SymbolType(value);
  if (IsUint8Array(value))
    return Uint8ArrayType2(value);
  if (IsUndefined(value))
    return UndefinedType(value);
  throw new ValueHashError(value);
}
function FNV1A64(byte) {
  Accumulator = Accumulator ^ Bytes[byte];
  Accumulator = Accumulator * Prime % Size;
}
function Hash(value) {
  Accumulator = BigInt("14695981039346656037");
  Visit3(value);
  return Accumulator;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/any/any.mjs
function Any(options) {
  return CreateType({ [Kind]: "Any" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/unknown/unknown.mjs
function Unknown(options) {
  return CreateType({ [Kind]: "Unknown" }, options);
}
// ../../node_modules/@sinclair/typebox/build/esm/type/guard/type.mjs
var exports_type2 = {};
__export(exports_type2, {
  TypeGuardUnknownTypeError: () => TypeGuardUnknownTypeError,
  IsVoid: () => IsVoid2,
  IsUnsafe: () => IsUnsafe2,
  IsUnknown: () => IsUnknown2,
  IsUnionLiteral: () => IsUnionLiteral,
  IsUnion: () => IsUnion2,
  IsUndefined: () => IsUndefined4,
  IsUint8Array: () => IsUint8Array4,
  IsTuple: () => IsTuple2,
  IsTransform: () => IsTransform2,
  IsThis: () => IsThis2,
  IsTemplateLiteral: () => IsTemplateLiteral2,
  IsSymbol: () => IsSymbol4,
  IsString: () => IsString4,
  IsSchema: () => IsSchema2,
  IsRegExp: () => IsRegExp3,
  IsRef: () => IsRef2,
  IsRecursive: () => IsRecursive,
  IsRecord: () => IsRecord2,
  IsReadonly: () => IsReadonly2,
  IsProperties: () => IsProperties,
  IsPromise: () => IsPromise3,
  IsOptional: () => IsOptional2,
  IsObject: () => IsObject4,
  IsNumber: () => IsNumber4,
  IsNull: () => IsNull4,
  IsNot: () => IsNot2,
  IsNever: () => IsNever2,
  IsMappedResult: () => IsMappedResult2,
  IsMappedKey: () => IsMappedKey2,
  IsLiteralValue: () => IsLiteralValue2,
  IsLiteralString: () => IsLiteralString,
  IsLiteralNumber: () => IsLiteralNumber,
  IsLiteralBoolean: () => IsLiteralBoolean,
  IsLiteral: () => IsLiteral2,
  IsKindOf: () => IsKindOf2,
  IsKind: () => IsKind2,
  IsIterator: () => IsIterator4,
  IsIntersect: () => IsIntersect2,
  IsInteger: () => IsInteger3,
  IsImport: () => IsImport,
  IsFunction: () => IsFunction4,
  IsDate: () => IsDate4,
  IsConstructor: () => IsConstructor2,
  IsComputed: () => IsComputed2,
  IsBoolean: () => IsBoolean4,
  IsBigInt: () => IsBigInt4,
  IsAsyncIterator: () => IsAsyncIterator4,
  IsArray: () => IsArray4,
  IsArgument: () => IsArgument2,
  IsAny: () => IsAny2
});
class TypeGuardUnknownTypeError extends TypeBoxError {
}
var KnownTypes = [
  "Argument",
  "Any",
  "Array",
  "AsyncIterator",
  "BigInt",
  "Boolean",
  "Computed",
  "Constructor",
  "Date",
  "Enum",
  "Function",
  "Integer",
  "Intersect",
  "Iterator",
  "Literal",
  "MappedKey",
  "MappedResult",
  "Not",
  "Null",
  "Number",
  "Object",
  "Promise",
  "Record",
  "Ref",
  "RegExp",
  "String",
  "Symbol",
  "TemplateLiteral",
  "This",
  "Tuple",
  "Undefined",
  "Union",
  "Uint8Array",
  "Unknown",
  "Void"
];
function IsPattern(value) {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}
function IsControlCharacterFree(value) {
  if (!IsString2(value))
    return false;
  for (let i = 0;i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 7 && code <= 13 || code === 27 || code === 127) {
      return false;
    }
  }
  return true;
}
function IsAdditionalProperties(value) {
  return IsOptionalBoolean(value) || IsSchema2(value);
}
function IsOptionalBigInt(value) {
  return IsUndefined2(value) || IsBigInt2(value);
}
function IsOptionalNumber(value) {
  return IsUndefined2(value) || IsNumber2(value);
}
function IsOptionalBoolean(value) {
  return IsUndefined2(value) || IsBoolean2(value);
}
function IsOptionalString(value) {
  return IsUndefined2(value) || IsString2(value);
}
function IsOptionalPattern(value) {
  return IsUndefined2(value) || IsString2(value) && IsControlCharacterFree(value) && IsPattern(value);
}
function IsOptionalFormat(value) {
  return IsUndefined2(value) || IsString2(value) && IsControlCharacterFree(value);
}
function IsOptionalSchema(value) {
  return IsUndefined2(value) || IsSchema2(value);
}
function IsReadonly2(value) {
  return IsObject2(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional2(value) {
  return IsObject2(value) && value[OptionalKind] === "Optional";
}
function IsAny2(value) {
  return IsKindOf2(value, "Any") && IsOptionalString(value.$id);
}
function IsArgument2(value) {
  return IsKindOf2(value, "Argument") && IsNumber2(value.index);
}
function IsArray4(value) {
  return IsKindOf2(value, "Array") && value.type === "array" && IsOptionalString(value.$id) && IsSchema2(value.items) && IsOptionalNumber(value.minItems) && IsOptionalNumber(value.maxItems) && IsOptionalBoolean(value.uniqueItems) && IsOptionalSchema(value.contains) && IsOptionalNumber(value.minContains) && IsOptionalNumber(value.maxContains);
}
function IsAsyncIterator4(value) {
  return IsKindOf2(value, "AsyncIterator") && value.type === "AsyncIterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsBigInt4(value) {
  return IsKindOf2(value, "BigInt") && value.type === "bigint" && IsOptionalString(value.$id) && IsOptionalBigInt(value.exclusiveMaximum) && IsOptionalBigInt(value.exclusiveMinimum) && IsOptionalBigInt(value.maximum) && IsOptionalBigInt(value.minimum) && IsOptionalBigInt(value.multipleOf);
}
function IsBoolean4(value) {
  return IsKindOf2(value, "Boolean") && value.type === "boolean" && IsOptionalString(value.$id);
}
function IsComputed2(value) {
  return IsKindOf2(value, "Computed") && IsString2(value.target) && IsArray2(value.parameters) && value.parameters.every((schema) => IsSchema2(schema));
}
function IsConstructor2(value) {
  return IsKindOf2(value, "Constructor") && value.type === "Constructor" && IsOptionalString(value.$id) && IsArray2(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsDate4(value) {
  return IsKindOf2(value, "Date") && value.type === "Date" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximumTimestamp) && IsOptionalNumber(value.exclusiveMinimumTimestamp) && IsOptionalNumber(value.maximumTimestamp) && IsOptionalNumber(value.minimumTimestamp) && IsOptionalNumber(value.multipleOfTimestamp);
}
function IsFunction4(value) {
  return IsKindOf2(value, "Function") && value.type === "Function" && IsOptionalString(value.$id) && IsArray2(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsImport(value) {
  return IsKindOf2(value, "Import") && HasPropertyKey2(value, "$defs") && IsObject2(value.$defs) && IsProperties(value.$defs) && HasPropertyKey2(value, "$ref") && IsString2(value.$ref) && value.$ref in value.$defs;
}
function IsInteger3(value) {
  return IsKindOf2(value, "Integer") && value.type === "integer" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsProperties(value) {
  return IsObject2(value) && Object.entries(value).every(([key, schema]) => IsControlCharacterFree(key) && IsSchema2(schema));
}
function IsIntersect2(value) {
  return IsKindOf2(value, "Intersect") && (IsString2(value.type) && value.type !== "object" ? false : true) && IsArray2(value.allOf) && value.allOf.every((schema) => IsSchema2(schema) && !IsTransform2(schema)) && IsOptionalString(value.type) && (IsOptionalBoolean(value.unevaluatedProperties) || IsOptionalSchema(value.unevaluatedProperties)) && IsOptionalString(value.$id);
}
function IsIterator4(value) {
  return IsKindOf2(value, "Iterator") && value.type === "Iterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsKindOf2(value, kind) {
  return IsObject2(value) && Kind in value && value[Kind] === kind;
}
function IsLiteralString(value) {
  return IsLiteral2(value) && IsString2(value.const);
}
function IsLiteralNumber(value) {
  return IsLiteral2(value) && IsNumber2(value.const);
}
function IsLiteralBoolean(value) {
  return IsLiteral2(value) && IsBoolean2(value.const);
}
function IsLiteral2(value) {
  return IsKindOf2(value, "Literal") && IsOptionalString(value.$id) && IsLiteralValue2(value.const);
}
function IsLiteralValue2(value) {
  return IsBoolean2(value) || IsNumber2(value) || IsString2(value);
}
function IsMappedKey2(value) {
  return IsKindOf2(value, "MappedKey") && IsArray2(value.keys) && value.keys.every((key) => IsNumber2(key) || IsString2(key));
}
function IsMappedResult2(value) {
  return IsKindOf2(value, "MappedResult") && IsProperties(value.properties);
}
function IsNever2(value) {
  return IsKindOf2(value, "Never") && IsObject2(value.not) && Object.getOwnPropertyNames(value.not).length === 0;
}
function IsNot2(value) {
  return IsKindOf2(value, "Not") && IsSchema2(value.not);
}
function IsNull4(value) {
  return IsKindOf2(value, "Null") && value.type === "null" && IsOptionalString(value.$id);
}
function IsNumber4(value) {
  return IsKindOf2(value, "Number") && value.type === "number" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsObject4(value) {
  return IsKindOf2(value, "Object") && value.type === "object" && IsOptionalString(value.$id) && IsProperties(value.properties) && IsAdditionalProperties(value.additionalProperties) && IsOptionalNumber(value.minProperties) && IsOptionalNumber(value.maxProperties);
}
function IsPromise3(value) {
  return IsKindOf2(value, "Promise") && value.type === "Promise" && IsOptionalString(value.$id) && IsSchema2(value.item);
}
function IsRecord2(value) {
  return IsKindOf2(value, "Record") && value.type === "object" && IsOptionalString(value.$id) && IsAdditionalProperties(value.additionalProperties) && IsObject2(value.patternProperties) && ((schema) => {
    const keys = Object.getOwnPropertyNames(schema.patternProperties);
    return keys.length === 1 && IsPattern(keys[0]) && IsObject2(schema.patternProperties) && IsSchema2(schema.patternProperties[keys[0]]);
  })(value);
}
function IsRecursive(value) {
  return IsObject2(value) && Hint in value && value[Hint] === "Recursive";
}
function IsRef2(value) {
  return IsKindOf2(value, "Ref") && IsOptionalString(value.$id) && IsString2(value.$ref);
}
function IsRegExp3(value) {
  return IsKindOf2(value, "RegExp") && IsOptionalString(value.$id) && IsString2(value.source) && IsString2(value.flags) && IsOptionalNumber(value.maxLength) && IsOptionalNumber(value.minLength);
}
function IsString4(value) {
  return IsKindOf2(value, "String") && value.type === "string" && IsOptionalString(value.$id) && IsOptionalNumber(value.minLength) && IsOptionalNumber(value.maxLength) && IsOptionalPattern(value.pattern) && IsOptionalFormat(value.format);
}
function IsSymbol4(value) {
  return IsKindOf2(value, "Symbol") && value.type === "symbol" && IsOptionalString(value.$id);
}
function IsTemplateLiteral2(value) {
  return IsKindOf2(value, "TemplateLiteral") && value.type === "string" && IsString2(value.pattern) && value.pattern[0] === "^" && value.pattern[value.pattern.length - 1] === "$";
}
function IsThis2(value) {
  return IsKindOf2(value, "This") && IsOptionalString(value.$id) && IsString2(value.$ref);
}
function IsTransform2(value) {
  return IsObject2(value) && TransformKind in value;
}
function IsTuple2(value) {
  return IsKindOf2(value, "Tuple") && value.type === "array" && IsOptionalString(value.$id) && IsNumber2(value.minItems) && IsNumber2(value.maxItems) && value.minItems === value.maxItems && (IsUndefined2(value.items) && IsUndefined2(value.additionalItems) && value.minItems === 0 || IsArray2(value.items) && value.items.every((schema) => IsSchema2(schema)));
}
function IsUndefined4(value) {
  return IsKindOf2(value, "Undefined") && value.type === "undefined" && IsOptionalString(value.$id);
}
function IsUnionLiteral(value) {
  return IsUnion2(value) && value.anyOf.every((schema) => IsLiteralString(schema) || IsLiteralNumber(schema));
}
function IsUnion2(value) {
  return IsKindOf2(value, "Union") && IsOptionalString(value.$id) && IsObject2(value) && IsArray2(value.anyOf) && value.anyOf.every((schema) => IsSchema2(schema));
}
function IsUint8Array4(value) {
  return IsKindOf2(value, "Uint8Array") && value.type === "Uint8Array" && IsOptionalString(value.$id) && IsOptionalNumber(value.minByteLength) && IsOptionalNumber(value.maxByteLength);
}
function IsUnknown2(value) {
  return IsKindOf2(value, "Unknown") && IsOptionalString(value.$id);
}
function IsUnsafe2(value) {
  return IsKindOf2(value, "Unsafe");
}
function IsVoid2(value) {
  return IsKindOf2(value, "Void") && value.type === "void" && IsOptionalString(value.$id);
}
function IsKind2(value) {
  return IsObject2(value) && Kind in value && IsString2(value[Kind]) && !KnownTypes.includes(value[Kind]);
}
function IsSchema2(value) {
  return IsObject2(value) && (IsAny2(value) || IsArgument2(value) || IsArray4(value) || IsBoolean4(value) || IsBigInt4(value) || IsAsyncIterator4(value) || IsComputed2(value) || IsConstructor2(value) || IsDate4(value) || IsFunction4(value) || IsInteger3(value) || IsIntersect2(value) || IsIterator4(value) || IsLiteral2(value) || IsMappedKey2(value) || IsMappedResult2(value) || IsNever2(value) || IsNot2(value) || IsNull4(value) || IsNumber4(value) || IsObject4(value) || IsPromise3(value) || IsRecord2(value) || IsRef2(value) || IsRegExp3(value) || IsString4(value) || IsSymbol4(value) || IsTemplateLiteral2(value) || IsThis2(value) || IsTuple2(value) || IsUndefined4(value) || IsUnion2(value) || IsUint8Array4(value) || IsUnknown2(value) || IsUnsafe2(value) || IsVoid2(value) || IsKind2(value));
}
// ../../node_modules/@sinclair/typebox/build/esm/type/extends/extends-check.mjs
class ExtendsResolverError extends TypeBoxError {
}
var ExtendsResult;
(function(ExtendsResult2) {
  ExtendsResult2[ExtendsResult2["Union"] = 0] = "Union";
  ExtendsResult2[ExtendsResult2["True"] = 1] = "True";
  ExtendsResult2[ExtendsResult2["False"] = 2] = "False";
})(ExtendsResult || (ExtendsResult = {}));
function IntoBooleanResult(result) {
  return result === ExtendsResult.False ? result : ExtendsResult.True;
}
function Throw(message) {
  throw new ExtendsResolverError(message);
}
function IsStructuralRight(right) {
  return exports_type2.IsNever(right) || exports_type2.IsIntersect(right) || exports_type2.IsUnion(right) || exports_type2.IsUnknown(right) || exports_type2.IsAny(right);
}
function StructuralRight(left, right) {
  return exports_type2.IsNever(right) ? FromNeverRight(left, right) : exports_type2.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type2.IsUnion(right) ? FromUnionRight(left, right) : exports_type2.IsUnknown(right) ? FromUnknownRight(left, right) : exports_type2.IsAny(right) ? FromAnyRight(left, right) : Throw("StructuralRight");
}
function FromAnyRight(left, right) {
  return ExtendsResult.True;
}
function FromAny(left, right) {
  return exports_type2.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type2.IsUnion(right) && right.anyOf.some((schema) => exports_type2.IsAny(schema) || exports_type2.IsUnknown(schema)) ? ExtendsResult.True : exports_type2.IsUnion(right) ? ExtendsResult.Union : exports_type2.IsUnknown(right) ? ExtendsResult.True : exports_type2.IsAny(right) ? ExtendsResult.True : ExtendsResult.Union;
}
function FromArrayRight(left, right) {
  return exports_type2.IsUnknown(left) ? ExtendsResult.False : exports_type2.IsAny(left) ? ExtendsResult.Union : exports_type2.IsNever(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromArray3(left, right) {
  return exports_type2.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type2.IsArray(right) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.items, right.items));
}
function FromAsyncIterator(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type2.IsAsyncIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.items, right.items));
}
function FromBigInt(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsBigInt(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBooleanRight(left, right) {
  return exports_type2.IsLiteralBoolean(left) ? ExtendsResult.True : exports_type2.IsBoolean(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBoolean(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsBoolean(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromConstructor(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : !exports_type2.IsConstructor(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit4(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.returns, right.returns));
}
function FromDate(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsDate(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromFunction(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : !exports_type2.IsFunction(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit4(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.returns, right.returns));
}
function FromIntegerRight(left, right) {
  return exports_type2.IsLiteral(left) && exports_value.IsNumber(left.const) ? ExtendsResult.True : exports_type2.IsNumber(left) || exports_type2.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromInteger(left, right) {
  return exports_type2.IsInteger(right) || exports_type2.IsNumber(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : ExtendsResult.False;
}
function FromIntersectRight(left, right) {
  return right.allOf.every((schema) => Visit4(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIntersect3(left, right) {
  return left.allOf.some((schema) => Visit4(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIterator(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !exports_type2.IsIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.items, right.items));
}
function FromLiteral2(left, right) {
  return exports_type2.IsLiteral(right) && right.const === left.const ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsString(right) ? FromStringRight(left, right) : exports_type2.IsNumber(right) ? FromNumberRight(left, right) : exports_type2.IsInteger(right) ? FromIntegerRight(left, right) : exports_type2.IsBoolean(right) ? FromBooleanRight(left, right) : ExtendsResult.False;
}
function FromNeverRight(left, right) {
  return ExtendsResult.False;
}
function FromNever(left, right) {
  return ExtendsResult.True;
}
function UnwrapTNot(schema) {
  let [current, depth] = [schema, 0];
  while (true) {
    if (!exports_type2.IsNot(current))
      break;
    current = current.not;
    depth += 1;
  }
  return depth % 2 === 0 ? current : Unknown();
}
function FromNot(left, right) {
  return exports_type2.IsNot(left) ? Visit4(UnwrapTNot(left), right) : exports_type2.IsNot(right) ? Visit4(left, UnwrapTNot(right)) : Throw("Invalid fallthrough for Not");
}
function FromNull(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsNull(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumberRight(left, right) {
  return exports_type2.IsLiteralNumber(left) ? ExtendsResult.True : exports_type2.IsNumber(left) || exports_type2.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumber(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsInteger(right) || exports_type2.IsNumber(right) ? ExtendsResult.True : ExtendsResult.False;
}
function IsObjectPropertyCount(schema, count) {
  return Object.getOwnPropertyNames(schema.properties).length === count;
}
function IsObjectStringLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectSymbolLike(schema) {
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "description" in schema.properties && exports_type2.IsUnion(schema.properties.description) && schema.properties.description.anyOf.length === 2 && (exports_type2.IsString(schema.properties.description.anyOf[0]) && exports_type2.IsUndefined(schema.properties.description.anyOf[1]) || exports_type2.IsString(schema.properties.description.anyOf[1]) && exports_type2.IsUndefined(schema.properties.description.anyOf[0]));
}
function IsObjectNumberLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBooleanLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBigIntLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectDateLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectUint8ArrayLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectFunctionLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit4(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectConstructorLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectArrayLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit4(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectPromiseLike(schema) {
  const then = Function2([Any()], Any());
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "then" in schema.properties && IntoBooleanResult(Visit4(schema.properties["then"], then)) === ExtendsResult.True;
}
function Property(left, right) {
  return Visit4(left, right) === ExtendsResult.False ? ExtendsResult.False : exports_type2.IsOptional(left) && !exports_type2.IsOptional(right) ? ExtendsResult.False : ExtendsResult.True;
}
function FromObjectRight(left, right) {
  return exports_type2.IsUnknown(left) ? ExtendsResult.False : exports_type2.IsAny(left) ? ExtendsResult.Union : exports_type2.IsNever(left) || exports_type2.IsLiteralString(left) && IsObjectStringLike(right) || exports_type2.IsLiteralNumber(left) && IsObjectNumberLike(right) || exports_type2.IsLiteralBoolean(left) && IsObjectBooleanLike(right) || exports_type2.IsSymbol(left) && IsObjectSymbolLike(right) || exports_type2.IsBigInt(left) && IsObjectBigIntLike(right) || exports_type2.IsString(left) && IsObjectStringLike(right) || exports_type2.IsSymbol(left) && IsObjectSymbolLike(right) || exports_type2.IsNumber(left) && IsObjectNumberLike(right) || exports_type2.IsInteger(left) && IsObjectNumberLike(right) || exports_type2.IsBoolean(left) && IsObjectBooleanLike(right) || exports_type2.IsUint8Array(left) && IsObjectUint8ArrayLike(right) || exports_type2.IsDate(left) && IsObjectDateLike(right) || exports_type2.IsConstructor(left) && IsObjectConstructorLike(right) || exports_type2.IsFunction(left) && IsObjectFunctionLike(right) ? ExtendsResult.True : exports_type2.IsRecord(left) && exports_type2.IsString(RecordKey(left)) ? (() => {
    return right[Hint] === "Record" ? ExtendsResult.True : ExtendsResult.False;
  })() : exports_type2.IsRecord(left) && exports_type2.IsNumber(RecordKey(left)) ? (() => {
    return IsObjectPropertyCount(right, 0) ? ExtendsResult.True : ExtendsResult.False;
  })() : ExtendsResult.False;
}
function FromObject(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : !exports_type2.IsObject(right) ? ExtendsResult.False : (() => {
    for (const key of Object.getOwnPropertyNames(right.properties)) {
      if (!(key in left.properties) && !exports_type2.IsOptional(right.properties[key])) {
        return ExtendsResult.False;
      }
      if (exports_type2.IsOptional(right.properties[key])) {
        return ExtendsResult.True;
      }
      if (Property(left.properties[key], right.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })();
}
function FromPromise(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) && IsObjectPromiseLike(right) ? ExtendsResult.True : !exports_type2.IsPromise(right) ? ExtendsResult.False : IntoBooleanResult(Visit4(left.item, right.item));
}
function RecordKey(schema) {
  return PatternNumberExact in schema.patternProperties ? Number2() : (PatternStringExact in schema.patternProperties) ? String2() : Throw("Unknown record key pattern");
}
function RecordValue(schema) {
  return PatternNumberExact in schema.patternProperties ? schema.patternProperties[PatternNumberExact] : (PatternStringExact in schema.patternProperties) ? schema.patternProperties[PatternStringExact] : Throw("Unable to get record value schema");
}
function FromRecordRight(left, right) {
  const [Key, Value] = [RecordKey(right), RecordValue(right)];
  return exports_type2.IsLiteralString(left) && exports_type2.IsNumber(Key) && IntoBooleanResult(Visit4(left, Value)) === ExtendsResult.True ? ExtendsResult.True : exports_type2.IsUint8Array(left) && exports_type2.IsNumber(Key) ? Visit4(left, Value) : exports_type2.IsString(left) && exports_type2.IsNumber(Key) ? Visit4(left, Value) : exports_type2.IsArray(left) && exports_type2.IsNumber(Key) ? Visit4(left, Value) : exports_type2.IsObject(left) ? (() => {
    for (const key of Object.getOwnPropertyNames(left.properties)) {
      if (Property(Value, left.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })() : ExtendsResult.False;
}
function FromRecord(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : !exports_type2.IsRecord(right) ? ExtendsResult.False : Visit4(RecordValue(left), RecordValue(right));
}
function FromRegExp(left, right) {
  const L = exports_type2.IsRegExp(left) ? String2() : left;
  const R = exports_type2.IsRegExp(right) ? String2() : right;
  return Visit4(L, R);
}
function FromStringRight(left, right) {
  return exports_type2.IsLiteral(left) && exports_value.IsString(left.const) ? ExtendsResult.True : exports_type2.IsString(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromString(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsString(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromSymbol(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsSymbol(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromTemplateLiteral2(left, right) {
  return exports_type2.IsTemplateLiteral(left) ? Visit4(TemplateLiteralToUnion(left), right) : exports_type2.IsTemplateLiteral(right) ? Visit4(left, TemplateLiteralToUnion(right)) : Throw("Invalid fallthrough for TemplateLiteral");
}
function IsArrayOfTuple(left, right) {
  return exports_type2.IsArray(right) && left.items !== undefined && left.items.every((schema) => Visit4(schema, right.items) === ExtendsResult.True);
}
function FromTupleRight(left, right) {
  return exports_type2.IsNever(left) ? ExtendsResult.True : exports_type2.IsUnknown(left) ? ExtendsResult.False : exports_type2.IsAny(left) ? ExtendsResult.Union : ExtendsResult.False;
}
function FromTuple3(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : exports_type2.IsArray(right) && IsArrayOfTuple(left, right) ? ExtendsResult.True : !exports_type2.IsTuple(right) ? ExtendsResult.False : exports_value.IsUndefined(left.items) && !exports_value.IsUndefined(right.items) || !exports_value.IsUndefined(left.items) && exports_value.IsUndefined(right.items) ? ExtendsResult.False : exports_value.IsUndefined(left.items) && !exports_value.IsUndefined(right.items) ? ExtendsResult.True : left.items.every((schema, index) => Visit4(schema, right.items[index]) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUint8Array(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsUint8Array(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUndefined(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsRecord(right) ? FromRecordRight(left, right) : exports_type2.IsVoid(right) ? FromVoidRight(left, right) : exports_type2.IsUndefined(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnionRight(left, right) {
  return right.anyOf.some((schema) => Visit4(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnion5(left, right) {
  return left.anyOf.every((schema) => Visit4(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnknownRight(left, right) {
  return ExtendsResult.True;
}
function FromUnknown(left, right) {
  return exports_type2.IsNever(right) ? FromNeverRight(left, right) : exports_type2.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type2.IsUnion(right) ? FromUnionRight(left, right) : exports_type2.IsAny(right) ? FromAnyRight(left, right) : exports_type2.IsString(right) ? FromStringRight(left, right) : exports_type2.IsNumber(right) ? FromNumberRight(left, right) : exports_type2.IsInteger(right) ? FromIntegerRight(left, right) : exports_type2.IsBoolean(right) ? FromBooleanRight(left, right) : exports_type2.IsArray(right) ? FromArrayRight(left, right) : exports_type2.IsTuple(right) ? FromTupleRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsUnknown(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoidRight(left, right) {
  return exports_type2.IsUndefined(left) ? ExtendsResult.True : exports_type2.IsUndefined(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoid(left, right) {
  return exports_type2.IsIntersect(right) ? FromIntersectRight(left, right) : exports_type2.IsUnion(right) ? FromUnionRight(left, right) : exports_type2.IsUnknown(right) ? FromUnknownRight(left, right) : exports_type2.IsAny(right) ? FromAnyRight(left, right) : exports_type2.IsObject(right) ? FromObjectRight(left, right) : exports_type2.IsVoid(right) ? ExtendsResult.True : ExtendsResult.False;
}
function Visit4(left, right) {
  return exports_type2.IsTemplateLiteral(left) || exports_type2.IsTemplateLiteral(right) ? FromTemplateLiteral2(left, right) : exports_type2.IsRegExp(left) || exports_type2.IsRegExp(right) ? FromRegExp(left, right) : exports_type2.IsNot(left) || exports_type2.IsNot(right) ? FromNot(left, right) : exports_type2.IsAny(left) ? FromAny(left, right) : exports_type2.IsArray(left) ? FromArray3(left, right) : exports_type2.IsBigInt(left) ? FromBigInt(left, right) : exports_type2.IsBoolean(left) ? FromBoolean(left, right) : exports_type2.IsAsyncIterator(left) ? FromAsyncIterator(left, right) : exports_type2.IsConstructor(left) ? FromConstructor(left, right) : exports_type2.IsDate(left) ? FromDate(left, right) : exports_type2.IsFunction(left) ? FromFunction(left, right) : exports_type2.IsInteger(left) ? FromInteger(left, right) : exports_type2.IsIntersect(left) ? FromIntersect3(left, right) : exports_type2.IsIterator(left) ? FromIterator(left, right) : exports_type2.IsLiteral(left) ? FromLiteral2(left, right) : exports_type2.IsNever(left) ? FromNever(left, right) : exports_type2.IsNull(left) ? FromNull(left, right) : exports_type2.IsNumber(left) ? FromNumber(left, right) : exports_type2.IsObject(left) ? FromObject(left, right) : exports_type2.IsRecord(left) ? FromRecord(left, right) : exports_type2.IsString(left) ? FromString(left, right) : exports_type2.IsSymbol(left) ? FromSymbol(left, right) : exports_type2.IsTuple(left) ? FromTuple3(left, right) : exports_type2.IsPromise(left) ? FromPromise(left, right) : exports_type2.IsUint8Array(left) ? FromUint8Array(left, right) : exports_type2.IsUndefined(left) ? FromUndefined(left, right) : exports_type2.IsUnion(left) ? FromUnion5(left, right) : exports_type2.IsUnknown(left) ? FromUnknown(left, right) : exports_type2.IsVoid(left) ? FromVoid(left, right) : Throw(`Unknown left type operand '${left[Kind]}'`);
}
function ExtendsCheck(left, right) {
  return Visit4(left, right);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-result.mjs
function FromProperties7(P, Right, True, False, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extends(P[K2], Right, True, False, Clone(options));
  return Acc;
}
function FromMappedResult6(Left, Right, True, False, options) {
  return FromProperties7(Left.properties, Right, True, False, options);
}
function ExtendsFromMappedResult(Left, Right, True, False, options) {
  const P = FromMappedResult6(Left, Right, True, False, options);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extends/extends.mjs
function ExtendsResolve(left, right, trueType, falseType) {
  const R = ExtendsCheck(left, right);
  return R === ExtendsResult.Union ? Union([trueType, falseType]) : R === ExtendsResult.True ? trueType : falseType;
}
function Extends(L, R, T, F, options) {
  return IsMappedResult(L) ? ExtendsFromMappedResult(L, R, T, F, options) : IsMappedKey(L) ? CreateType(ExtendsFromMappedKey(L, R, T, F, options)) : CreateType(ExtendsResolve(L, R, T, F), options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-key.mjs
function FromPropertyKey(K, U, L, R, options) {
  return {
    [K]: Extends(Literal(K), U, L, R, Clone(options))
  };
}
function FromPropertyKeys(K, U, L, R, options) {
  return K.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey(LK, U, L, R, options) };
  }, {});
}
function FromMappedKey2(K, U, L, R, options) {
  return FromPropertyKeys(K.keys, U, L, R, options);
}
function ExtendsFromMappedKey(T, U, L, R, options) {
  const P = FromMappedKey2(T, U, L, R, options);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/check/check.mjs
class ValueCheckUnknownTypeError extends TypeBoxError {
  constructor(schema) {
    super(`Unknown type`);
    this.schema = schema;
  }
}
function IsAnyOrUnknown(schema) {
  return schema[Kind] === "Any" || schema[Kind] === "Unknown";
}
function IsDefined(value) {
  return value !== undefined;
}
function FromAny2(schema, references, value) {
  return true;
}
function FromArgument(schema, references, value) {
  return true;
}
function FromArray4(schema, references, value) {
  if (!IsArray(value))
    return false;
  if (IsDefined(schema.minItems) && !(value.length >= schema.minItems)) {
    return false;
  }
  if (IsDefined(schema.maxItems) && !(value.length <= schema.maxItems)) {
    return false;
  }
  for (const element of value) {
    if (!Visit5(schema.items, references, element))
      return false;
  }
  if (schema.uniqueItems === true && !function() {
    const set = new Set;
    for (const element of value) {
      const hashed = Hash(element);
      if (set.has(hashed)) {
        return false;
      } else {
        set.add(hashed);
      }
    }
    return true;
  }()) {
    return false;
  }
  if (!(IsDefined(schema.contains) || IsNumber(schema.minContains) || IsNumber(schema.maxContains))) {
    return true;
  }
  const containsSchema = IsDefined(schema.contains) ? schema.contains : Never();
  const containsCount = value.reduce((acc, value2) => Visit5(containsSchema, references, value2) ? acc + 1 : acc, 0);
  if (containsCount === 0) {
    return false;
  }
  if (IsNumber(schema.minContains) && containsCount < schema.minContains) {
    return false;
  }
  if (IsNumber(schema.maxContains) && containsCount > schema.maxContains) {
    return false;
  }
  return true;
}
function FromAsyncIterator2(schema, references, value) {
  return IsAsyncIterator(value);
}
function FromBigInt2(schema, references, value) {
  if (!IsBigInt(value))
    return false;
  if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    return false;
  }
  if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    return false;
  }
  if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
    return false;
  }
  if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
    return false;
  }
  if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === BigInt(0))) {
    return false;
  }
  return true;
}
function FromBoolean2(schema, references, value) {
  return IsBoolean(value);
}
function FromConstructor2(schema, references, value) {
  return Visit5(schema.returns, references, value.prototype);
}
function FromDate2(schema, references, value) {
  if (!IsDate(value))
    return false;
  if (IsDefined(schema.exclusiveMaximumTimestamp) && !(value.getTime() < schema.exclusiveMaximumTimestamp)) {
    return false;
  }
  if (IsDefined(schema.exclusiveMinimumTimestamp) && !(value.getTime() > schema.exclusiveMinimumTimestamp)) {
    return false;
  }
  if (IsDefined(schema.maximumTimestamp) && !(value.getTime() <= schema.maximumTimestamp)) {
    return false;
  }
  if (IsDefined(schema.minimumTimestamp) && !(value.getTime() >= schema.minimumTimestamp)) {
    return false;
  }
  if (IsDefined(schema.multipleOfTimestamp) && !(value.getTime() % schema.multipleOfTimestamp === 0)) {
    return false;
  }
  return true;
}
function FromFunction2(schema, references, value) {
  return IsFunction(value);
}
function FromImport(schema, references, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit5(target, [...references, ...definitions], value);
}
function FromInteger2(schema, references, value) {
  if (!IsInteger(value)) {
    return false;
  }
  if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    return false;
  }
  if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    return false;
  }
  if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
    return false;
  }
  if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
    return false;
  }
  if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
    return false;
  }
  return true;
}
function FromIntersect4(schema, references, value) {
  const check1 = schema.allOf.every((schema2) => Visit5(schema2, references, value));
  if (schema.unevaluatedProperties === false) {
    const keyPattern = new RegExp(KeyOfPattern(schema));
    const check2 = Object.getOwnPropertyNames(value).every((key) => keyPattern.test(key));
    return check1 && check2;
  } else if (IsSchema(schema.unevaluatedProperties)) {
    const keyCheck = new RegExp(KeyOfPattern(schema));
    const check2 = Object.getOwnPropertyNames(value).every((key) => keyCheck.test(key) || Visit5(schema.unevaluatedProperties, references, value[key]));
    return check1 && check2;
  } else {
    return check1;
  }
}
function FromIterator2(schema, references, value) {
  return IsIterator(value);
}
function FromLiteral3(schema, references, value) {
  return value === schema.const;
}
function FromNever2(schema, references, value) {
  return false;
}
function FromNot2(schema, references, value) {
  return !Visit5(schema.not, references, value);
}
function FromNull2(schema, references, value) {
  return IsNull(value);
}
function FromNumber2(schema, references, value) {
  if (!TypeSystemPolicy.IsNumberLike(value))
    return false;
  if (IsDefined(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    return false;
  }
  if (IsDefined(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    return false;
  }
  if (IsDefined(schema.minimum) && !(value >= schema.minimum)) {
    return false;
  }
  if (IsDefined(schema.maximum) && !(value <= schema.maximum)) {
    return false;
  }
  if (IsDefined(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
    return false;
  }
  return true;
}
function FromObject2(schema, references, value) {
  if (!TypeSystemPolicy.IsObjectLike(value))
    return false;
  if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
    return false;
  }
  if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
    return false;
  }
  const knownKeys = Object.getOwnPropertyNames(schema.properties);
  for (const knownKey of knownKeys) {
    const property = schema.properties[knownKey];
    if (schema.required && schema.required.includes(knownKey)) {
      if (!Visit5(property, references, value[knownKey])) {
        return false;
      }
      if ((ExtendsUndefinedCheck(property) || IsAnyOrUnknown(property)) && !(knownKey in value)) {
        return false;
      }
    } else {
      if (TypeSystemPolicy.IsExactOptionalProperty(value, knownKey) && !Visit5(property, references, value[knownKey])) {
        return false;
      }
    }
  }
  if (schema.additionalProperties === false) {
    const valueKeys = Object.getOwnPropertyNames(value);
    if (schema.required && schema.required.length === knownKeys.length && valueKeys.length === knownKeys.length) {
      return true;
    } else {
      return valueKeys.every((valueKey) => knownKeys.includes(valueKey));
    }
  } else if (typeof schema.additionalProperties === "object") {
    const valueKeys = Object.getOwnPropertyNames(value);
    return valueKeys.every((key) => knownKeys.includes(key) || Visit5(schema.additionalProperties, references, value[key]));
  } else {
    return true;
  }
}
function FromPromise2(schema, references, value) {
  return IsPromise(value);
}
function FromRecord2(schema, references, value) {
  if (!TypeSystemPolicy.IsRecordLike(value)) {
    return false;
  }
  if (IsDefined(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
    return false;
  }
  if (IsDefined(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
    return false;
  }
  const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
  const regex = new RegExp(patternKey);
  const check1 = Object.entries(value).every(([key, value2]) => {
    return regex.test(key) ? Visit5(patternSchema, references, value2) : true;
  });
  const check2 = typeof schema.additionalProperties === "object" ? Object.entries(value).every(([key, value2]) => {
    return !regex.test(key) ? Visit5(schema.additionalProperties, references, value2) : true;
  }) : true;
  const check3 = schema.additionalProperties === false ? Object.getOwnPropertyNames(value).every((key) => {
    return regex.test(key);
  }) : true;
  return check1 && check2 && check3;
}
function FromRef2(schema, references, value) {
  return Visit5(Deref(schema, references), references, value);
}
function FromRegExp2(schema, references, value) {
  const regex = new RegExp(schema.source, schema.flags);
  if (IsDefined(schema.minLength)) {
    if (!(value.length >= schema.minLength))
      return false;
  }
  if (IsDefined(schema.maxLength)) {
    if (!(value.length <= schema.maxLength))
      return false;
  }
  return regex.test(value);
}
function FromString2(schema, references, value) {
  if (!IsString(value)) {
    return false;
  }
  if (IsDefined(schema.minLength)) {
    if (!(value.length >= schema.minLength))
      return false;
  }
  if (IsDefined(schema.maxLength)) {
    if (!(value.length <= schema.maxLength))
      return false;
  }
  if (IsDefined(schema.pattern)) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value))
      return false;
  }
  if (IsDefined(schema.format)) {
    if (!exports_format.Has(schema.format))
      return false;
    const func = exports_format.Get(schema.format);
    return func(value);
  }
  return true;
}
function FromSymbol2(schema, references, value) {
  return IsSymbol(value);
}
function FromTemplateLiteral3(schema, references, value) {
  return IsString(value) && new RegExp(schema.pattern).test(value);
}
function FromThis(schema, references, value) {
  return Visit5(Deref(schema, references), references, value);
}
function FromTuple4(schema, references, value) {
  if (!IsArray(value)) {
    return false;
  }
  if (schema.items === undefined && !(value.length === 0)) {
    return false;
  }
  if (!(value.length === schema.maxItems)) {
    return false;
  }
  if (!schema.items) {
    return true;
  }
  for (let i = 0;i < schema.items.length; i++) {
    if (!Visit5(schema.items[i], references, value[i]))
      return false;
  }
  return true;
}
function FromUndefined2(schema, references, value) {
  return IsUndefined(value);
}
function FromUnion6(schema, references, value) {
  return schema.anyOf.some((inner) => Visit5(inner, references, value));
}
function FromUint8Array2(schema, references, value) {
  if (!IsUint8Array(value)) {
    return false;
  }
  if (IsDefined(schema.maxByteLength) && !(value.length <= schema.maxByteLength)) {
    return false;
  }
  if (IsDefined(schema.minByteLength) && !(value.length >= schema.minByteLength)) {
    return false;
  }
  return true;
}
function FromUnknown2(schema, references, value) {
  return true;
}
function FromVoid2(schema, references, value) {
  return TypeSystemPolicy.IsVoidLike(value);
}
function FromKind(schema, references, value) {
  if (!exports_type.Has(schema[Kind]))
    return false;
  const func = exports_type.Get(schema[Kind]);
  return func(schema, value);
}
function Visit5(schema, references, value) {
  const references_ = IsDefined(schema.$id) ? Pushref(schema, references) : references;
  const schema_ = schema;
  switch (schema_[Kind]) {
    case "Any":
      return FromAny2(schema_, references_, value);
    case "Argument":
      return FromArgument(schema_, references_, value);
    case "Array":
      return FromArray4(schema_, references_, value);
    case "AsyncIterator":
      return FromAsyncIterator2(schema_, references_, value);
    case "BigInt":
      return FromBigInt2(schema_, references_, value);
    case "Boolean":
      return FromBoolean2(schema_, references_, value);
    case "Constructor":
      return FromConstructor2(schema_, references_, value);
    case "Date":
      return FromDate2(schema_, references_, value);
    case "Function":
      return FromFunction2(schema_, references_, value);
    case "Import":
      return FromImport(schema_, references_, value);
    case "Integer":
      return FromInteger2(schema_, references_, value);
    case "Intersect":
      return FromIntersect4(schema_, references_, value);
    case "Iterator":
      return FromIterator2(schema_, references_, value);
    case "Literal":
      return FromLiteral3(schema_, references_, value);
    case "Never":
      return FromNever2(schema_, references_, value);
    case "Not":
      return FromNot2(schema_, references_, value);
    case "Null":
      return FromNull2(schema_, references_, value);
    case "Number":
      return FromNumber2(schema_, references_, value);
    case "Object":
      return FromObject2(schema_, references_, value);
    case "Promise":
      return FromPromise2(schema_, references_, value);
    case "Record":
      return FromRecord2(schema_, references_, value);
    case "Ref":
      return FromRef2(schema_, references_, value);
    case "RegExp":
      return FromRegExp2(schema_, references_, value);
    case "String":
      return FromString2(schema_, references_, value);
    case "Symbol":
      return FromSymbol2(schema_, references_, value);
    case "TemplateLiteral":
      return FromTemplateLiteral3(schema_, references_, value);
    case "This":
      return FromThis(schema_, references_, value);
    case "Tuple":
      return FromTuple4(schema_, references_, value);
    case "Undefined":
      return FromUndefined2(schema_, references_, value);
    case "Union":
      return FromUnion6(schema_, references_, value);
    case "Uint8Array":
      return FromUint8Array2(schema_, references_, value);
    case "Unknown":
      return FromUnknown2(schema_, references_, value);
    case "Void":
      return FromVoid2(schema_, references_, value);
    default:
      if (!exports_type.Has(schema_[Kind]))
        throw new ValueCheckUnknownTypeError(schema_);
      return FromKind(schema_, references_, value);
  }
}
function Check(...args) {
  return args.length === 3 ? Visit5(args[0], args[1], args[2]) : Visit5(args[0], [], args[1]);
}

// ../../node_modules/@sinclair/typebox/build/esm/errors/errors.mjs
var ValueErrorType;
(function(ValueErrorType2) {
  ValueErrorType2[ValueErrorType2["ArrayContains"] = 0] = "ArrayContains";
  ValueErrorType2[ValueErrorType2["ArrayMaxContains"] = 1] = "ArrayMaxContains";
  ValueErrorType2[ValueErrorType2["ArrayMaxItems"] = 2] = "ArrayMaxItems";
  ValueErrorType2[ValueErrorType2["ArrayMinContains"] = 3] = "ArrayMinContains";
  ValueErrorType2[ValueErrorType2["ArrayMinItems"] = 4] = "ArrayMinItems";
  ValueErrorType2[ValueErrorType2["ArrayUniqueItems"] = 5] = "ArrayUniqueItems";
  ValueErrorType2[ValueErrorType2["Array"] = 6] = "Array";
  ValueErrorType2[ValueErrorType2["AsyncIterator"] = 7] = "AsyncIterator";
  ValueErrorType2[ValueErrorType2["BigIntExclusiveMaximum"] = 8] = "BigIntExclusiveMaximum";
  ValueErrorType2[ValueErrorType2["BigIntExclusiveMinimum"] = 9] = "BigIntExclusiveMinimum";
  ValueErrorType2[ValueErrorType2["BigIntMaximum"] = 10] = "BigIntMaximum";
  ValueErrorType2[ValueErrorType2["BigIntMinimum"] = 11] = "BigIntMinimum";
  ValueErrorType2[ValueErrorType2["BigIntMultipleOf"] = 12] = "BigIntMultipleOf";
  ValueErrorType2[ValueErrorType2["BigInt"] = 13] = "BigInt";
  ValueErrorType2[ValueErrorType2["Boolean"] = 14] = "Boolean";
  ValueErrorType2[ValueErrorType2["DateExclusiveMaximumTimestamp"] = 15] = "DateExclusiveMaximumTimestamp";
  ValueErrorType2[ValueErrorType2["DateExclusiveMinimumTimestamp"] = 16] = "DateExclusiveMinimumTimestamp";
  ValueErrorType2[ValueErrorType2["DateMaximumTimestamp"] = 17] = "DateMaximumTimestamp";
  ValueErrorType2[ValueErrorType2["DateMinimumTimestamp"] = 18] = "DateMinimumTimestamp";
  ValueErrorType2[ValueErrorType2["DateMultipleOfTimestamp"] = 19] = "DateMultipleOfTimestamp";
  ValueErrorType2[ValueErrorType2["Date"] = 20] = "Date";
  ValueErrorType2[ValueErrorType2["Function"] = 21] = "Function";
  ValueErrorType2[ValueErrorType2["IntegerExclusiveMaximum"] = 22] = "IntegerExclusiveMaximum";
  ValueErrorType2[ValueErrorType2["IntegerExclusiveMinimum"] = 23] = "IntegerExclusiveMinimum";
  ValueErrorType2[ValueErrorType2["IntegerMaximum"] = 24] = "IntegerMaximum";
  ValueErrorType2[ValueErrorType2["IntegerMinimum"] = 25] = "IntegerMinimum";
  ValueErrorType2[ValueErrorType2["IntegerMultipleOf"] = 26] = "IntegerMultipleOf";
  ValueErrorType2[ValueErrorType2["Integer"] = 27] = "Integer";
  ValueErrorType2[ValueErrorType2["IntersectUnevaluatedProperties"] = 28] = "IntersectUnevaluatedProperties";
  ValueErrorType2[ValueErrorType2["Intersect"] = 29] = "Intersect";
  ValueErrorType2[ValueErrorType2["Iterator"] = 30] = "Iterator";
  ValueErrorType2[ValueErrorType2["Kind"] = 31] = "Kind";
  ValueErrorType2[ValueErrorType2["Literal"] = 32] = "Literal";
  ValueErrorType2[ValueErrorType2["Never"] = 33] = "Never";
  ValueErrorType2[ValueErrorType2["Not"] = 34] = "Not";
  ValueErrorType2[ValueErrorType2["Null"] = 35] = "Null";
  ValueErrorType2[ValueErrorType2["NumberExclusiveMaximum"] = 36] = "NumberExclusiveMaximum";
  ValueErrorType2[ValueErrorType2["NumberExclusiveMinimum"] = 37] = "NumberExclusiveMinimum";
  ValueErrorType2[ValueErrorType2["NumberMaximum"] = 38] = "NumberMaximum";
  ValueErrorType2[ValueErrorType2["NumberMinimum"] = 39] = "NumberMinimum";
  ValueErrorType2[ValueErrorType2["NumberMultipleOf"] = 40] = "NumberMultipleOf";
  ValueErrorType2[ValueErrorType2["Number"] = 41] = "Number";
  ValueErrorType2[ValueErrorType2["ObjectAdditionalProperties"] = 42] = "ObjectAdditionalProperties";
  ValueErrorType2[ValueErrorType2["ObjectMaxProperties"] = 43] = "ObjectMaxProperties";
  ValueErrorType2[ValueErrorType2["ObjectMinProperties"] = 44] = "ObjectMinProperties";
  ValueErrorType2[ValueErrorType2["ObjectRequiredProperty"] = 45] = "ObjectRequiredProperty";
  ValueErrorType2[ValueErrorType2["Object"] = 46] = "Object";
  ValueErrorType2[ValueErrorType2["Promise"] = 47] = "Promise";
  ValueErrorType2[ValueErrorType2["RegExp"] = 48] = "RegExp";
  ValueErrorType2[ValueErrorType2["StringFormatUnknown"] = 49] = "StringFormatUnknown";
  ValueErrorType2[ValueErrorType2["StringFormat"] = 50] = "StringFormat";
  ValueErrorType2[ValueErrorType2["StringMaxLength"] = 51] = "StringMaxLength";
  ValueErrorType2[ValueErrorType2["StringMinLength"] = 52] = "StringMinLength";
  ValueErrorType2[ValueErrorType2["StringPattern"] = 53] = "StringPattern";
  ValueErrorType2[ValueErrorType2["String"] = 54] = "String";
  ValueErrorType2[ValueErrorType2["Symbol"] = 55] = "Symbol";
  ValueErrorType2[ValueErrorType2["TupleLength"] = 56] = "TupleLength";
  ValueErrorType2[ValueErrorType2["Tuple"] = 57] = "Tuple";
  ValueErrorType2[ValueErrorType2["Uint8ArrayMaxByteLength"] = 58] = "Uint8ArrayMaxByteLength";
  ValueErrorType2[ValueErrorType2["Uint8ArrayMinByteLength"] = 59] = "Uint8ArrayMinByteLength";
  ValueErrorType2[ValueErrorType2["Uint8Array"] = 60] = "Uint8Array";
  ValueErrorType2[ValueErrorType2["Undefined"] = 61] = "Undefined";
  ValueErrorType2[ValueErrorType2["Union"] = 62] = "Union";
  ValueErrorType2[ValueErrorType2["Void"] = 63] = "Void";
})(ValueErrorType || (ValueErrorType = {}));

class ValueErrorsUnknownTypeError extends TypeBoxError {
  constructor(schema) {
    super("Unknown type");
    this.schema = schema;
  }
}
function EscapeKey(key) {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}
function IsDefined2(value) {
  return value !== undefined;
}

class ValueErrorIterator {
  constructor(iterator) {
    this.iterator = iterator;
  }
  [Symbol.iterator]() {
    return this.iterator;
  }
  First() {
    const next = this.iterator.next();
    return next.done ? undefined : next.value;
  }
}
function Create(errorType, schema, path, value, errors = []) {
  return {
    type: errorType,
    schema,
    path,
    value,
    message: GetErrorFunction()({ errorType, path, schema, value, errors }),
    errors
  };
}
function* FromAny3(schema, references, path, value) {}
function* FromArgument2(schema, references, path, value) {}
function* FromArray5(schema, references, path, value) {
  if (!IsArray(value)) {
    return yield Create(ValueErrorType.Array, schema, path, value);
  }
  if (IsDefined2(schema.minItems) && !(value.length >= schema.minItems)) {
    yield Create(ValueErrorType.ArrayMinItems, schema, path, value);
  }
  if (IsDefined2(schema.maxItems) && !(value.length <= schema.maxItems)) {
    yield Create(ValueErrorType.ArrayMaxItems, schema, path, value);
  }
  for (let i = 0;i < value.length; i++) {
    yield* Visit6(schema.items, references, `${path}/${i}`, value[i]);
  }
  if (schema.uniqueItems === true && !function() {
    const set = new Set;
    for (const element of value) {
      const hashed = Hash(element);
      if (set.has(hashed)) {
        return false;
      } else {
        set.add(hashed);
      }
    }
    return true;
  }()) {
    yield Create(ValueErrorType.ArrayUniqueItems, schema, path, value);
  }
  if (!(IsDefined2(schema.contains) || IsDefined2(schema.minContains) || IsDefined2(schema.maxContains))) {
    return;
  }
  const containsSchema = IsDefined2(schema.contains) ? schema.contains : Never();
  const containsCount = value.reduce((acc, value2, index) => Visit6(containsSchema, references, `${path}${index}`, value2).next().done === true ? acc + 1 : acc, 0);
  if (containsCount === 0) {
    yield Create(ValueErrorType.ArrayContains, schema, path, value);
  }
  if (IsNumber(schema.minContains) && containsCount < schema.minContains) {
    yield Create(ValueErrorType.ArrayMinContains, schema, path, value);
  }
  if (IsNumber(schema.maxContains) && containsCount > schema.maxContains) {
    yield Create(ValueErrorType.ArrayMaxContains, schema, path, value);
  }
}
function* FromAsyncIterator3(schema, references, path, value) {
  if (!IsAsyncIterator(value))
    yield Create(ValueErrorType.AsyncIterator, schema, path, value);
}
function* FromBigInt3(schema, references, path, value) {
  if (!IsBigInt(value))
    return yield Create(ValueErrorType.BigInt, schema, path, value);
  if (IsDefined2(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    yield Create(ValueErrorType.BigIntExclusiveMaximum, schema, path, value);
  }
  if (IsDefined2(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    yield Create(ValueErrorType.BigIntExclusiveMinimum, schema, path, value);
  }
  if (IsDefined2(schema.maximum) && !(value <= schema.maximum)) {
    yield Create(ValueErrorType.BigIntMaximum, schema, path, value);
  }
  if (IsDefined2(schema.minimum) && !(value >= schema.minimum)) {
    yield Create(ValueErrorType.BigIntMinimum, schema, path, value);
  }
  if (IsDefined2(schema.multipleOf) && !(value % schema.multipleOf === BigInt(0))) {
    yield Create(ValueErrorType.BigIntMultipleOf, schema, path, value);
  }
}
function* FromBoolean3(schema, references, path, value) {
  if (!IsBoolean(value))
    yield Create(ValueErrorType.Boolean, schema, path, value);
}
function* FromConstructor3(schema, references, path, value) {
  yield* Visit6(schema.returns, references, path, value.prototype);
}
function* FromDate3(schema, references, path, value) {
  if (!IsDate(value))
    return yield Create(ValueErrorType.Date, schema, path, value);
  if (IsDefined2(schema.exclusiveMaximumTimestamp) && !(value.getTime() < schema.exclusiveMaximumTimestamp)) {
    yield Create(ValueErrorType.DateExclusiveMaximumTimestamp, schema, path, value);
  }
  if (IsDefined2(schema.exclusiveMinimumTimestamp) && !(value.getTime() > schema.exclusiveMinimumTimestamp)) {
    yield Create(ValueErrorType.DateExclusiveMinimumTimestamp, schema, path, value);
  }
  if (IsDefined2(schema.maximumTimestamp) && !(value.getTime() <= schema.maximumTimestamp)) {
    yield Create(ValueErrorType.DateMaximumTimestamp, schema, path, value);
  }
  if (IsDefined2(schema.minimumTimestamp) && !(value.getTime() >= schema.minimumTimestamp)) {
    yield Create(ValueErrorType.DateMinimumTimestamp, schema, path, value);
  }
  if (IsDefined2(schema.multipleOfTimestamp) && !(value.getTime() % schema.multipleOfTimestamp === 0)) {
    yield Create(ValueErrorType.DateMultipleOfTimestamp, schema, path, value);
  }
}
function* FromFunction3(schema, references, path, value) {
  if (!IsFunction(value))
    yield Create(ValueErrorType.Function, schema, path, value);
}
function* FromImport2(schema, references, path, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  yield* Visit6(target, [...references, ...definitions], path, value);
}
function* FromInteger3(schema, references, path, value) {
  if (!IsInteger(value))
    return yield Create(ValueErrorType.Integer, schema, path, value);
  if (IsDefined2(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    yield Create(ValueErrorType.IntegerExclusiveMaximum, schema, path, value);
  }
  if (IsDefined2(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    yield Create(ValueErrorType.IntegerExclusiveMinimum, schema, path, value);
  }
  if (IsDefined2(schema.maximum) && !(value <= schema.maximum)) {
    yield Create(ValueErrorType.IntegerMaximum, schema, path, value);
  }
  if (IsDefined2(schema.minimum) && !(value >= schema.minimum)) {
    yield Create(ValueErrorType.IntegerMinimum, schema, path, value);
  }
  if (IsDefined2(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
    yield Create(ValueErrorType.IntegerMultipleOf, schema, path, value);
  }
}
function* FromIntersect5(schema, references, path, value) {
  let hasError = false;
  for (const inner of schema.allOf) {
    for (const error of Visit6(inner, references, path, value)) {
      hasError = true;
      yield error;
    }
  }
  if (hasError) {
    return yield Create(ValueErrorType.Intersect, schema, path, value);
  }
  if (schema.unevaluatedProperties === false) {
    const keyCheck = new RegExp(KeyOfPattern(schema));
    for (const valueKey of Object.getOwnPropertyNames(value)) {
      if (!keyCheck.test(valueKey)) {
        yield Create(ValueErrorType.IntersectUnevaluatedProperties, schema, `${path}/${valueKey}`, value);
      }
    }
  }
  if (typeof schema.unevaluatedProperties === "object") {
    const keyCheck = new RegExp(KeyOfPattern(schema));
    for (const valueKey of Object.getOwnPropertyNames(value)) {
      if (!keyCheck.test(valueKey)) {
        const next = Visit6(schema.unevaluatedProperties, references, `${path}/${valueKey}`, value[valueKey]).next();
        if (!next.done)
          yield next.value;
      }
    }
  }
}
function* FromIterator3(schema, references, path, value) {
  if (!IsIterator(value))
    yield Create(ValueErrorType.Iterator, schema, path, value);
}
function* FromLiteral4(schema, references, path, value) {
  if (!(value === schema.const))
    yield Create(ValueErrorType.Literal, schema, path, value);
}
function* FromNever3(schema, references, path, value) {
  yield Create(ValueErrorType.Never, schema, path, value);
}
function* FromNot3(schema, references, path, value) {
  if (Visit6(schema.not, references, path, value).next().done === true)
    yield Create(ValueErrorType.Not, schema, path, value);
}
function* FromNull3(schema, references, path, value) {
  if (!IsNull(value))
    yield Create(ValueErrorType.Null, schema, path, value);
}
function* FromNumber3(schema, references, path, value) {
  if (!TypeSystemPolicy.IsNumberLike(value))
    return yield Create(ValueErrorType.Number, schema, path, value);
  if (IsDefined2(schema.exclusiveMaximum) && !(value < schema.exclusiveMaximum)) {
    yield Create(ValueErrorType.NumberExclusiveMaximum, schema, path, value);
  }
  if (IsDefined2(schema.exclusiveMinimum) && !(value > schema.exclusiveMinimum)) {
    yield Create(ValueErrorType.NumberExclusiveMinimum, schema, path, value);
  }
  if (IsDefined2(schema.maximum) && !(value <= schema.maximum)) {
    yield Create(ValueErrorType.NumberMaximum, schema, path, value);
  }
  if (IsDefined2(schema.minimum) && !(value >= schema.minimum)) {
    yield Create(ValueErrorType.NumberMinimum, schema, path, value);
  }
  if (IsDefined2(schema.multipleOf) && !(value % schema.multipleOf === 0)) {
    yield Create(ValueErrorType.NumberMultipleOf, schema, path, value);
  }
}
function* FromObject3(schema, references, path, value) {
  if (!TypeSystemPolicy.IsObjectLike(value))
    return yield Create(ValueErrorType.Object, schema, path, value);
  if (IsDefined2(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
    yield Create(ValueErrorType.ObjectMinProperties, schema, path, value);
  }
  if (IsDefined2(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
    yield Create(ValueErrorType.ObjectMaxProperties, schema, path, value);
  }
  const requiredKeys = Array.isArray(schema.required) ? schema.required : [];
  const knownKeys = Object.getOwnPropertyNames(schema.properties);
  const unknownKeys = Object.getOwnPropertyNames(value);
  for (const requiredKey of requiredKeys) {
    if (unknownKeys.includes(requiredKey))
      continue;
    yield Create(ValueErrorType.ObjectRequiredProperty, schema.properties[requiredKey], `${path}/${EscapeKey(requiredKey)}`, undefined);
  }
  if (schema.additionalProperties === false) {
    for (const valueKey of unknownKeys) {
      if (!knownKeys.includes(valueKey)) {
        yield Create(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
      }
    }
  }
  if (typeof schema.additionalProperties === "object") {
    for (const valueKey of unknownKeys) {
      if (knownKeys.includes(valueKey))
        continue;
      yield* Visit6(schema.additionalProperties, references, `${path}/${EscapeKey(valueKey)}`, value[valueKey]);
    }
  }
  for (const knownKey of knownKeys) {
    const property = schema.properties[knownKey];
    if (schema.required && schema.required.includes(knownKey)) {
      yield* Visit6(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
      if (ExtendsUndefinedCheck(schema) && !(knownKey in value)) {
        yield Create(ValueErrorType.ObjectRequiredProperty, property, `${path}/${EscapeKey(knownKey)}`, undefined);
      }
    } else {
      if (TypeSystemPolicy.IsExactOptionalProperty(value, knownKey)) {
        yield* Visit6(property, references, `${path}/${EscapeKey(knownKey)}`, value[knownKey]);
      }
    }
  }
}
function* FromPromise3(schema, references, path, value) {
  if (!IsPromise(value))
    yield Create(ValueErrorType.Promise, schema, path, value);
}
function* FromRecord3(schema, references, path, value) {
  if (!TypeSystemPolicy.IsRecordLike(value))
    return yield Create(ValueErrorType.Object, schema, path, value);
  if (IsDefined2(schema.minProperties) && !(Object.getOwnPropertyNames(value).length >= schema.minProperties)) {
    yield Create(ValueErrorType.ObjectMinProperties, schema, path, value);
  }
  if (IsDefined2(schema.maxProperties) && !(Object.getOwnPropertyNames(value).length <= schema.maxProperties)) {
    yield Create(ValueErrorType.ObjectMaxProperties, schema, path, value);
  }
  const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
  const regex = new RegExp(patternKey);
  for (const [propertyKey, propertyValue] of Object.entries(value)) {
    if (regex.test(propertyKey))
      yield* Visit6(patternSchema, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
  }
  if (typeof schema.additionalProperties === "object") {
    for (const [propertyKey, propertyValue] of Object.entries(value)) {
      if (!regex.test(propertyKey))
        yield* Visit6(schema.additionalProperties, references, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
    }
  }
  if (schema.additionalProperties === false) {
    for (const [propertyKey, propertyValue] of Object.entries(value)) {
      if (regex.test(propertyKey))
        continue;
      return yield Create(ValueErrorType.ObjectAdditionalProperties, schema, `${path}/${EscapeKey(propertyKey)}`, propertyValue);
    }
  }
}
function* FromRef3(schema, references, path, value) {
  yield* Visit6(Deref(schema, references), references, path, value);
}
function* FromRegExp3(schema, references, path, value) {
  if (!IsString(value))
    return yield Create(ValueErrorType.String, schema, path, value);
  if (IsDefined2(schema.minLength) && !(value.length >= schema.minLength)) {
    yield Create(ValueErrorType.StringMinLength, schema, path, value);
  }
  if (IsDefined2(schema.maxLength) && !(value.length <= schema.maxLength)) {
    yield Create(ValueErrorType.StringMaxLength, schema, path, value);
  }
  const regex = new RegExp(schema.source, schema.flags);
  if (!regex.test(value)) {
    return yield Create(ValueErrorType.RegExp, schema, path, value);
  }
}
function* FromString3(schema, references, path, value) {
  if (!IsString(value))
    return yield Create(ValueErrorType.String, schema, path, value);
  if (IsDefined2(schema.minLength) && !(value.length >= schema.minLength)) {
    yield Create(ValueErrorType.StringMinLength, schema, path, value);
  }
  if (IsDefined2(schema.maxLength) && !(value.length <= schema.maxLength)) {
    yield Create(ValueErrorType.StringMaxLength, schema, path, value);
  }
  if (IsString(schema.pattern)) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      yield Create(ValueErrorType.StringPattern, schema, path, value);
    }
  }
  if (IsString(schema.format)) {
    if (!exports_format.Has(schema.format)) {
      yield Create(ValueErrorType.StringFormatUnknown, schema, path, value);
    } else {
      const format = exports_format.Get(schema.format);
      if (!format(value)) {
        yield Create(ValueErrorType.StringFormat, schema, path, value);
      }
    }
  }
}
function* FromSymbol3(schema, references, path, value) {
  if (!IsSymbol(value))
    yield Create(ValueErrorType.Symbol, schema, path, value);
}
function* FromTemplateLiteral4(schema, references, path, value) {
  if (!IsString(value))
    return yield Create(ValueErrorType.String, schema, path, value);
  const regex = new RegExp(schema.pattern);
  if (!regex.test(value)) {
    yield Create(ValueErrorType.StringPattern, schema, path, value);
  }
}
function* FromThis2(schema, references, path, value) {
  yield* Visit6(Deref(schema, references), references, path, value);
}
function* FromTuple5(schema, references, path, value) {
  if (!IsArray(value))
    return yield Create(ValueErrorType.Tuple, schema, path, value);
  if (schema.items === undefined && !(value.length === 0)) {
    return yield Create(ValueErrorType.TupleLength, schema, path, value);
  }
  if (!(value.length === schema.maxItems)) {
    return yield Create(ValueErrorType.TupleLength, schema, path, value);
  }
  if (!schema.items) {
    return;
  }
  for (let i = 0;i < schema.items.length; i++) {
    yield* Visit6(schema.items[i], references, `${path}/${i}`, value[i]);
  }
}
function* FromUndefined3(schema, references, path, value) {
  if (!IsUndefined(value))
    yield Create(ValueErrorType.Undefined, schema, path, value);
}
function* FromUnion7(schema, references, path, value) {
  if (Check(schema, references, value))
    return;
  const errors = schema.anyOf.map((variant) => new ValueErrorIterator(Visit6(variant, references, path, value)));
  yield Create(ValueErrorType.Union, schema, path, value, errors);
}
function* FromUint8Array3(schema, references, path, value) {
  if (!IsUint8Array(value))
    return yield Create(ValueErrorType.Uint8Array, schema, path, value);
  if (IsDefined2(schema.maxByteLength) && !(value.length <= schema.maxByteLength)) {
    yield Create(ValueErrorType.Uint8ArrayMaxByteLength, schema, path, value);
  }
  if (IsDefined2(schema.minByteLength) && !(value.length >= schema.minByteLength)) {
    yield Create(ValueErrorType.Uint8ArrayMinByteLength, schema, path, value);
  }
}
function* FromUnknown3(schema, references, path, value) {}
function* FromVoid3(schema, references, path, value) {
  if (!TypeSystemPolicy.IsVoidLike(value))
    yield Create(ValueErrorType.Void, schema, path, value);
}
function* FromKind2(schema, references, path, value) {
  const check = exports_type.Get(schema[Kind]);
  if (!check(schema, value))
    yield Create(ValueErrorType.Kind, schema, path, value);
}
function* Visit6(schema, references, path, value) {
  const references_ = IsDefined2(schema.$id) ? [...references, schema] : references;
  const schema_ = schema;
  switch (schema_[Kind]) {
    case "Any":
      return yield* FromAny3(schema_, references_, path, value);
    case "Argument":
      return yield* FromArgument2(schema_, references_, path, value);
    case "Array":
      return yield* FromArray5(schema_, references_, path, value);
    case "AsyncIterator":
      return yield* FromAsyncIterator3(schema_, references_, path, value);
    case "BigInt":
      return yield* FromBigInt3(schema_, references_, path, value);
    case "Boolean":
      return yield* FromBoolean3(schema_, references_, path, value);
    case "Constructor":
      return yield* FromConstructor3(schema_, references_, path, value);
    case "Date":
      return yield* FromDate3(schema_, references_, path, value);
    case "Function":
      return yield* FromFunction3(schema_, references_, path, value);
    case "Import":
      return yield* FromImport2(schema_, references_, path, value);
    case "Integer":
      return yield* FromInteger3(schema_, references_, path, value);
    case "Intersect":
      return yield* FromIntersect5(schema_, references_, path, value);
    case "Iterator":
      return yield* FromIterator3(schema_, references_, path, value);
    case "Literal":
      return yield* FromLiteral4(schema_, references_, path, value);
    case "Never":
      return yield* FromNever3(schema_, references_, path, value);
    case "Not":
      return yield* FromNot3(schema_, references_, path, value);
    case "Null":
      return yield* FromNull3(schema_, references_, path, value);
    case "Number":
      return yield* FromNumber3(schema_, references_, path, value);
    case "Object":
      return yield* FromObject3(schema_, references_, path, value);
    case "Promise":
      return yield* FromPromise3(schema_, references_, path, value);
    case "Record":
      return yield* FromRecord3(schema_, references_, path, value);
    case "Ref":
      return yield* FromRef3(schema_, references_, path, value);
    case "RegExp":
      return yield* FromRegExp3(schema_, references_, path, value);
    case "String":
      return yield* FromString3(schema_, references_, path, value);
    case "Symbol":
      return yield* FromSymbol3(schema_, references_, path, value);
    case "TemplateLiteral":
      return yield* FromTemplateLiteral4(schema_, references_, path, value);
    case "This":
      return yield* FromThis2(schema_, references_, path, value);
    case "Tuple":
      return yield* FromTuple5(schema_, references_, path, value);
    case "Undefined":
      return yield* FromUndefined3(schema_, references_, path, value);
    case "Union":
      return yield* FromUnion7(schema_, references_, path, value);
    case "Uint8Array":
      return yield* FromUint8Array3(schema_, references_, path, value);
    case "Unknown":
      return yield* FromUnknown3(schema_, references_, path, value);
    case "Void":
      return yield* FromVoid3(schema_, references_, path, value);
    default:
      if (!exports_type.Has(schema_[Kind]))
        throw new ValueErrorsUnknownTypeError(schema);
      return yield* FromKind2(schema_, references_, path, value);
  }
}
function Errors(...args) {
  const iterator = args.length === 3 ? Visit6(args[0], args[1], "", args[2]) : Visit6(args[0], [], "", args[1]);
  return new ValueErrorIterator(iterator);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/assert/assert.mjs
var __classPrivateFieldSet = function(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AssertError_instances;
var _AssertError_iterator;
var _AssertError_Iterator;

class AssertError extends TypeBoxError {
  constructor(iterator) {
    const error = iterator.First();
    super(error === undefined ? "Invalid Value" : error.message);
    _AssertError_instances.add(this);
    _AssertError_iterator.set(this, undefined);
    __classPrivateFieldSet(this, _AssertError_iterator, iterator, "f");
    this.error = error;
  }
  Errors() {
    return new ValueErrorIterator(__classPrivateFieldGet(this, _AssertError_instances, "m", _AssertError_Iterator).call(this));
  }
}
_AssertError_iterator = new WeakMap, _AssertError_instances = new WeakSet, _AssertError_Iterator = function* _AssertError_Iterator2() {
  if (this.error)
    yield this.error;
  yield* __classPrivateFieldGet(this, _AssertError_iterator, "f");
};
function AssertValue(schema, references, value) {
  if (Check(schema, references, value))
    return;
  throw new AssertError(Errors(schema, references, value));
}
function Assert(...args) {
  return args.length === 3 ? AssertValue(args[0], args[1], args[2]) : AssertValue(args[0], [], args[1]);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/clone/clone.mjs
function FromObject4(value) {
  const Acc = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    Acc[key] = Clone2(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    Acc[key] = Clone2(value[key]);
  }
  return Acc;
}
function FromArray6(value) {
  return value.map((element) => Clone2(element));
}
function FromTypedArray(value) {
  return value.slice();
}
function FromMap(value) {
  return new Map(Clone2([...value.entries()]));
}
function FromSet(value) {
  return new Set(Clone2([...value.entries()]));
}
function FromDate4(value) {
  return new Date(value.toISOString());
}
function FromValue(value) {
  return value;
}
function Clone2(value) {
  if (IsArray(value))
    return FromArray6(value);
  if (IsDate(value))
    return FromDate4(value);
  if (IsTypedArray(value))
    return FromTypedArray(value);
  if (IsMap(value))
    return FromMap(value);
  if (IsSet(value))
    return FromSet(value);
  if (IsObject(value))
    return FromObject4(value);
  if (IsValueType(value))
    return FromValue(value);
  throw new Error("ValueClone: Unable to clone value");
}

// ../../node_modules/@sinclair/typebox/build/esm/value/create/create.mjs
class ValueCreateError extends TypeBoxError {
  constructor(schema, message) {
    super(message);
    this.schema = schema;
  }
}
function FromDefault(value) {
  return IsFunction(value) ? value() : Clone2(value);
}
function FromAny4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return {};
  }
}
function FromArgument3(schema, references) {
  return {};
}
function FromArray7(schema, references) {
  if (schema.uniqueItems === true && !HasPropertyKey(schema, "default")) {
    throw new ValueCreateError(schema, "Array with the uniqueItems constraint requires a default value");
  } else if ("contains" in schema && !HasPropertyKey(schema, "default")) {
    throw new ValueCreateError(schema, "Array with the contains constraint requires a default value");
  } else if ("default" in schema) {
    return FromDefault(schema.default);
  } else if (schema.minItems !== undefined) {
    return Array.from({ length: schema.minItems }).map((item) => {
      return Visit7(schema.items, references);
    });
  } else {
    return [];
  }
}
function FromAsyncIterator4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return async function* () {}();
  }
}
function FromBigInt4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return BigInt(0);
  }
}
function FromBoolean4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return false;
  }
}
function FromConstructor4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    const value = Visit7(schema.returns, references);
    if (typeof value === "object" && !Array.isArray(value)) {
      return class {
        constructor() {
          for (const [key, val] of Object.entries(value)) {
            const self = this;
            self[key] = val;
          }
        }
      };
    } else {
      return class {
      };
    }
  }
}
function FromDate5(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if (schema.minimumTimestamp !== undefined) {
    return new Date(schema.minimumTimestamp);
  } else {
    return new Date;
  }
}
function FromFunction4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return () => Visit7(schema.returns, references);
  }
}
function FromImport3(schema, references) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit7(target, [...references, ...definitions]);
}
function FromInteger4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if (schema.minimum !== undefined) {
    return schema.minimum;
  } else {
    return 0;
  }
}
function FromIntersect6(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    const value = schema.allOf.reduce((acc, schema2) => {
      const next = Visit7(schema2, references);
      return typeof next === "object" ? { ...acc, ...next } : next;
    }, {});
    if (!Check(schema, references, value))
      throw new ValueCreateError(schema, "Intersect produced invalid value. Consider using a default value.");
    return value;
  }
}
function FromIterator4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return function* () {}();
  }
}
function FromLiteral5(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return schema.const;
  }
}
function FromNever4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    throw new ValueCreateError(schema, "Never types cannot be created. Consider using a default value.");
  }
}
function FromNot4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    throw new ValueCreateError(schema, "Not types must have a default value");
  }
}
function FromNull4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return null;
  }
}
function FromNumber4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if (schema.minimum !== undefined) {
    return schema.minimum;
  } else {
    return 0;
  }
}
function FromObject5(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    const required = new Set(schema.required);
    const Acc = {};
    for (const [key, subschema] of Object.entries(schema.properties)) {
      if (!required.has(key))
        continue;
      Acc[key] = Visit7(subschema, references);
    }
    return Acc;
  }
}
function FromPromise4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return Promise.resolve(Visit7(schema.item, references));
  }
}
function FromRecord4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return {};
  }
}
function FromRef4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return Visit7(Deref(schema, references), references);
  }
}
function FromRegExp4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    throw new ValueCreateError(schema, "RegExp types cannot be created. Consider using a default value.");
  }
}
function FromString4(schema, references) {
  if (schema.pattern !== undefined) {
    if (!HasPropertyKey(schema, "default")) {
      throw new ValueCreateError(schema, "String types with patterns must specify a default value");
    } else {
      return FromDefault(schema.default);
    }
  } else if (schema.format !== undefined) {
    if (!HasPropertyKey(schema, "default")) {
      throw new ValueCreateError(schema, "String types with formats must specify a default value");
    } else {
      return FromDefault(schema.default);
    }
  } else {
    if (HasPropertyKey(schema, "default")) {
      return FromDefault(schema.default);
    } else if (schema.minLength !== undefined) {
      return Array.from({ length: schema.minLength }).map(() => " ").join("");
    } else {
      return "";
    }
  }
}
function FromSymbol4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if ("value" in schema) {
    return Symbol.for(schema.value);
  } else {
    return Symbol();
  }
}
function FromTemplateLiteral5(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  }
  if (!IsTemplateLiteralFinite(schema))
    throw new ValueCreateError(schema, "Can only create template literals that produce a finite variants. Consider using a default value.");
  const generated = TemplateLiteralGenerate(schema);
  return generated[0];
}
function FromThis3(schema, references) {
  if (recursiveDepth++ > recursiveMaxDepth)
    throw new ValueCreateError(schema, "Cannot create recursive type as it appears possibly infinite. Consider using a default.");
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return Visit7(Deref(schema, references), references);
  }
}
function FromTuple6(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  }
  if (schema.items === undefined) {
    return [];
  } else {
    return Array.from({ length: schema.minItems }).map((_, index) => Visit7(schema.items[index], references));
  }
}
function FromUndefined4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return;
  }
}
function FromUnion8(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if (schema.anyOf.length === 0) {
    throw new Error("ValueCreate.Union: Cannot create Union with zero variants");
  } else {
    return Visit7(schema.anyOf[0], references);
  }
}
function FromUint8Array4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else if (schema.minByteLength !== undefined) {
    return new Uint8Array(schema.minByteLength);
  } else {
    return new Uint8Array(0);
  }
}
function FromUnknown4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return {};
  }
}
function FromVoid4(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    return;
  }
}
function FromKind3(schema, references) {
  if (HasPropertyKey(schema, "default")) {
    return FromDefault(schema.default);
  } else {
    throw new Error("User defined types must specify a default value");
  }
}
function Visit7(schema, references) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  switch (schema_[Kind]) {
    case "Any":
      return FromAny4(schema_, references_);
    case "Argument":
      return FromArgument3(schema_, references_);
    case "Array":
      return FromArray7(schema_, references_);
    case "AsyncIterator":
      return FromAsyncIterator4(schema_, references_);
    case "BigInt":
      return FromBigInt4(schema_, references_);
    case "Boolean":
      return FromBoolean4(schema_, references_);
    case "Constructor":
      return FromConstructor4(schema_, references_);
    case "Date":
      return FromDate5(schema_, references_);
    case "Function":
      return FromFunction4(schema_, references_);
    case "Import":
      return FromImport3(schema_, references_);
    case "Integer":
      return FromInteger4(schema_, references_);
    case "Intersect":
      return FromIntersect6(schema_, references_);
    case "Iterator":
      return FromIterator4(schema_, references_);
    case "Literal":
      return FromLiteral5(schema_, references_);
    case "Never":
      return FromNever4(schema_, references_);
    case "Not":
      return FromNot4(schema_, references_);
    case "Null":
      return FromNull4(schema_, references_);
    case "Number":
      return FromNumber4(schema_, references_);
    case "Object":
      return FromObject5(schema_, references_);
    case "Promise":
      return FromPromise4(schema_, references_);
    case "Record":
      return FromRecord4(schema_, references_);
    case "Ref":
      return FromRef4(schema_, references_);
    case "RegExp":
      return FromRegExp4(schema_, references_);
    case "String":
      return FromString4(schema_, references_);
    case "Symbol":
      return FromSymbol4(schema_, references_);
    case "TemplateLiteral":
      return FromTemplateLiteral5(schema_, references_);
    case "This":
      return FromThis3(schema_, references_);
    case "Tuple":
      return FromTuple6(schema_, references_);
    case "Undefined":
      return FromUndefined4(schema_, references_);
    case "Union":
      return FromUnion8(schema_, references_);
    case "Uint8Array":
      return FromUint8Array4(schema_, references_);
    case "Unknown":
      return FromUnknown4(schema_, references_);
    case "Void":
      return FromVoid4(schema_, references_);
    default:
      if (!exports_type.Has(schema_[Kind]))
        throw new ValueCreateError(schema_, "Unknown type");
      return FromKind3(schema_, references_);
  }
}
var recursiveMaxDepth = 512;
var recursiveDepth = 0;
function Create2(...args) {
  recursiveDepth = 0;
  return args.length === 2 ? Visit7(args[0], args[1]) : Visit7(args[0], []);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/cast/cast.mjs
class ValueCastError extends TypeBoxError {
  constructor(schema, message) {
    super(message);
    this.schema = schema;
  }
}
function ScoreUnion(schema, references, value) {
  if (schema[Kind] === "Object" && typeof value === "object" && !IsNull(value)) {
    const object = schema;
    const keys = Object.getOwnPropertyNames(value);
    const entries = Object.entries(object.properties);
    return entries.reduce((acc, [key, schema2]) => {
      const literal = schema2[Kind] === "Literal" && schema2.const === value[key] ? 100 : 0;
      const checks = Check(schema2, references, value[key]) ? 10 : 0;
      const exists = keys.includes(key) ? 1 : 0;
      return acc + (literal + checks + exists);
    }, 0);
  } else if (schema[Kind] === "Union") {
    const schemas = schema.anyOf.map((schema2) => Deref(schema2, references));
    const scores = schemas.map((schema2) => ScoreUnion(schema2, references, value));
    return Math.max(...scores);
  } else {
    return Check(schema, references, value) ? 1 : 0;
  }
}
function SelectUnion(union, references, value) {
  const schemas = union.anyOf.map((schema) => Deref(schema, references));
  let [select, best] = [schemas[0], 0];
  for (const schema of schemas) {
    const score = ScoreUnion(schema, references, value);
    if (score > best) {
      select = schema;
      best = score;
    }
  }
  return select;
}
function CastUnion(union, references, value) {
  if ("default" in union) {
    return typeof value === "function" ? union.default : Clone2(union.default);
  } else {
    const schema = SelectUnion(union, references, value);
    return Cast(schema, references, value);
  }
}
function DefaultClone(schema, references, value) {
  return Check(schema, references, value) ? Clone2(value) : Create2(schema, references);
}
function Default(schema, references, value) {
  return Check(schema, references, value) ? value : Create2(schema, references);
}
function FromArray8(schema, references, value) {
  if (Check(schema, references, value))
    return Clone2(value);
  const created = IsArray(value) ? Clone2(value) : Create2(schema, references);
  const minimum = IsNumber(schema.minItems) && created.length < schema.minItems ? [...created, ...Array.from({ length: schema.minItems - created.length }, () => null)] : created;
  const maximum = IsNumber(schema.maxItems) && minimum.length > schema.maxItems ? minimum.slice(0, schema.maxItems) : minimum;
  const casted = maximum.map((value2) => Visit8(schema.items, references, value2));
  if (schema.uniqueItems !== true)
    return casted;
  const unique = [...new Set(casted)];
  if (!Check(schema, references, unique))
    throw new ValueCastError(schema, "Array cast produced invalid data due to uniqueItems constraint");
  return unique;
}
function FromConstructor5(schema, references, value) {
  if (Check(schema, references, value))
    return Create2(schema, references);
  const required = new Set(schema.returns.required || []);
  const result = function() {};
  for (const [key, property] of Object.entries(schema.returns.properties)) {
    if (!required.has(key) && value.prototype[key] === undefined)
      continue;
    result.prototype[key] = Visit8(property, references, value.prototype[key]);
  }
  return result;
}
function FromImport4(schema, references, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit8(target, [...references, ...definitions], value);
}
function IntersectAssign(correct, value) {
  if (IsObject(correct) && !IsObject(value) || !IsObject(correct) && IsObject(value))
    return correct;
  if (!IsObject(correct) || !IsObject(value))
    return value;
  return globalThis.Object.getOwnPropertyNames(correct).reduce((result, key) => {
    const property = key in value ? IntersectAssign(correct[key], value[key]) : correct[key];
    return { ...result, [key]: property };
  }, {});
}
function FromIntersect7(schema, references, value) {
  if (Check(schema, references, value))
    return value;
  const correct = Create2(schema, references);
  const assigned = IntersectAssign(correct, value);
  return Check(schema, references, assigned) ? assigned : correct;
}
function FromNever5(schema, references, value) {
  throw new ValueCastError(schema, "Never types cannot be cast");
}
function FromObject6(schema, references, value) {
  if (Check(schema, references, value))
    return value;
  if (value === null || typeof value !== "object")
    return Create2(schema, references);
  const required = new Set(schema.required || []);
  const result = {};
  for (const [key, property] of Object.entries(schema.properties)) {
    if (!required.has(key) && value[key] === undefined)
      continue;
    result[key] = Visit8(property, references, value[key]);
  }
  if (typeof schema.additionalProperties === "object") {
    const propertyNames = Object.getOwnPropertyNames(schema.properties);
    for (const propertyName of Object.getOwnPropertyNames(value)) {
      if (propertyNames.includes(propertyName))
        continue;
      result[propertyName] = Visit8(schema.additionalProperties, references, value[propertyName]);
    }
  }
  return result;
}
function FromRecord5(schema, references, value) {
  if (Check(schema, references, value))
    return Clone2(value);
  if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Date)
    return Create2(schema, references);
  const subschemaPropertyName = Object.getOwnPropertyNames(schema.patternProperties)[0];
  const subschema = schema.patternProperties[subschemaPropertyName];
  const result = {};
  for (const [propKey, propValue] of Object.entries(value)) {
    result[propKey] = Visit8(subschema, references, propValue);
  }
  return result;
}
function FromRef5(schema, references, value) {
  return Visit8(Deref(schema, references), references, value);
}
function FromThis4(schema, references, value) {
  return Visit8(Deref(schema, references), references, value);
}
function FromTuple7(schema, references, value) {
  if (Check(schema, references, value))
    return Clone2(value);
  if (!IsArray(value))
    return Create2(schema, references);
  if (schema.items === undefined)
    return [];
  return schema.items.map((schema2, index) => Visit8(schema2, references, value[index]));
}
function FromUnion9(schema, references, value) {
  return Check(schema, references, value) ? Clone2(value) : CastUnion(schema, references, value);
}
function Visit8(schema, references, value) {
  const references_ = IsString(schema.$id) ? Pushref(schema, references) : references;
  const schema_ = schema;
  switch (schema[Kind]) {
    case "Array":
      return FromArray8(schema_, references_, value);
    case "Constructor":
      return FromConstructor5(schema_, references_, value);
    case "Import":
      return FromImport4(schema_, references_, value);
    case "Intersect":
      return FromIntersect7(schema_, references_, value);
    case "Never":
      return FromNever5(schema_, references_, value);
    case "Object":
      return FromObject6(schema_, references_, value);
    case "Record":
      return FromRecord5(schema_, references_, value);
    case "Ref":
      return FromRef5(schema_, references_, value);
    case "This":
      return FromThis4(schema_, references_, value);
    case "Tuple":
      return FromTuple7(schema_, references_, value);
    case "Union":
      return FromUnion9(schema_, references_, value);
    case "Date":
    case "Symbol":
    case "Uint8Array":
      return DefaultClone(schema, references, value);
    default:
      return Default(schema_, references_, value);
  }
}
function Cast(...args) {
  return args.length === 3 ? Visit8(args[0], args[1], args[2]) : Visit8(args[0], [], args[1]);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/clean/clean.mjs
function IsCheckable(schema) {
  return IsKind(schema) && schema[Kind] !== "Unsafe";
}
function FromArray9(schema, references, value) {
  if (!IsArray(value))
    return value;
  return value.map((value2) => Visit9(schema.items, references, value2));
}
function FromImport5(schema, references, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit9(target, [...references, ...definitions], value);
}
function FromIntersect8(schema, references, value) {
  const unevaluatedProperties = schema.unevaluatedProperties;
  const intersections = schema.allOf.map((schema2) => Visit9(schema2, references, Clone2(value)));
  const composite = intersections.reduce((acc, value2) => IsObject(value2) ? { ...acc, ...value2 } : value2, {});
  if (!IsObject(value) || !IsObject(composite) || !IsKind(unevaluatedProperties))
    return composite;
  const knownkeys = KeyOfPropertyKeys(schema);
  for (const key of Object.getOwnPropertyNames(value)) {
    if (knownkeys.includes(key))
      continue;
    if (Check(unevaluatedProperties, references, value[key])) {
      composite[key] = Visit9(unevaluatedProperties, references, value[key]);
    }
  }
  return composite;
}
function FromObject7(schema, references, value) {
  if (!IsObject(value) || IsArray(value))
    return value;
  const additionalProperties = schema.additionalProperties;
  for (const key of Object.getOwnPropertyNames(value)) {
    if (HasPropertyKey(schema.properties, key)) {
      value[key] = Visit9(schema.properties[key], references, value[key]);
      continue;
    }
    if (IsKind(additionalProperties) && Check(additionalProperties, references, value[key])) {
      value[key] = Visit9(additionalProperties, references, value[key]);
      continue;
    }
    delete value[key];
  }
  return value;
}
function FromRecord6(schema, references, value) {
  if (!IsObject(value))
    return value;
  const additionalProperties = schema.additionalProperties;
  const propertyKeys = Object.getOwnPropertyNames(value);
  const [propertyKey, propertySchema] = Object.entries(schema.patternProperties)[0];
  const propertyKeyTest = new RegExp(propertyKey);
  for (const key of propertyKeys) {
    if (propertyKeyTest.test(key)) {
      value[key] = Visit9(propertySchema, references, value[key]);
      continue;
    }
    if (IsKind(additionalProperties) && Check(additionalProperties, references, value[key])) {
      value[key] = Visit9(additionalProperties, references, value[key]);
      continue;
    }
    delete value[key];
  }
  return value;
}
function FromRef6(schema, references, value) {
  return Visit9(Deref(schema, references), references, value);
}
function FromThis5(schema, references, value) {
  return Visit9(Deref(schema, references), references, value);
}
function FromTuple8(schema, references, value) {
  if (!IsArray(value))
    return value;
  if (IsUndefined(schema.items))
    return [];
  const length = Math.min(value.length, schema.items.length);
  for (let i = 0;i < length; i++) {
    value[i] = Visit9(schema.items[i], references, value[i]);
  }
  return value.length > length ? value.slice(0, length) : value;
}
function FromUnion10(schema, references, value) {
  for (const inner of schema.anyOf) {
    if (IsCheckable(inner) && Check(inner, references, value)) {
      return Visit9(inner, references, value);
    }
  }
  return value;
}
function Visit9(schema, references, value) {
  const references_ = IsString(schema.$id) ? Pushref(schema, references) : references;
  const schema_ = schema;
  switch (schema_[Kind]) {
    case "Array":
      return FromArray9(schema_, references_, value);
    case "Import":
      return FromImport5(schema_, references_, value);
    case "Intersect":
      return FromIntersect8(schema_, references_, value);
    case "Object":
      return FromObject7(schema_, references_, value);
    case "Record":
      return FromRecord6(schema_, references_, value);
    case "Ref":
      return FromRef6(schema_, references_, value);
    case "This":
      return FromThis5(schema_, references_, value);
    case "Tuple":
      return FromTuple8(schema_, references_, value);
    case "Union":
      return FromUnion10(schema_, references_, value);
    default:
      return value;
  }
}
function Clean(...args) {
  return args.length === 3 ? Visit9(args[0], args[1], args[2]) : Visit9(args[0], [], args[1]);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/convert/convert.mjs
function IsStringNumeric(value) {
  return IsString(value) && !isNaN(value) && !isNaN(parseFloat(value));
}
function IsValueToString(value) {
  return IsBigInt(value) || IsBoolean(value) || IsNumber(value);
}
function IsValueTrue(value) {
  return value === true || IsNumber(value) && value === 1 || IsBigInt(value) && value === BigInt("1") || IsString(value) && (value.toLowerCase() === "true" || value === "1");
}
function IsValueFalse(value) {
  return value === false || IsNumber(value) && (value === 0 || Object.is(value, -0)) || IsBigInt(value) && value === BigInt("0") || IsString(value) && (value.toLowerCase() === "false" || value === "0" || value === "-0");
}
function IsTimeStringWithTimeZone(value) {
  return IsString(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value);
}
function IsTimeStringWithoutTimeZone(value) {
  return IsString(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value);
}
function IsDateTimeStringWithTimeZone(value) {
  return IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value);
}
function IsDateTimeStringWithoutTimeZone(value) {
  return IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value);
}
function IsDateString(value) {
  return IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value);
}
function TryConvertLiteralString(value, target) {
  const conversion = TryConvertString(value);
  return conversion === target ? conversion : value;
}
function TryConvertLiteralNumber(value, target) {
  const conversion = TryConvertNumber(value);
  return conversion === target ? conversion : value;
}
function TryConvertLiteralBoolean(value, target) {
  const conversion = TryConvertBoolean(value);
  return conversion === target ? conversion : value;
}
function TryConvertLiteral(schema, value) {
  return IsString(schema.const) ? TryConvertLiteralString(value, schema.const) : IsNumber(schema.const) ? TryConvertLiteralNumber(value, schema.const) : IsBoolean(schema.const) ? TryConvertLiteralBoolean(value, schema.const) : value;
}
function TryConvertBoolean(value) {
  return IsValueTrue(value) ? true : IsValueFalse(value) ? false : value;
}
function TryConvertBigInt(value) {
  const truncateInteger = (value2) => value2.split(".")[0];
  return IsStringNumeric(value) ? BigInt(truncateInteger(value)) : IsNumber(value) ? BigInt(Math.trunc(value)) : IsValueFalse(value) ? BigInt(0) : IsValueTrue(value) ? BigInt(1) : value;
}
function TryConvertString(value) {
  return IsSymbol(value) && value.description !== undefined ? value.description.toString() : IsValueToString(value) ? value.toString() : value;
}
function TryConvertNumber(value) {
  return IsStringNumeric(value) ? parseFloat(value) : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value;
}
function TryConvertInteger(value) {
  return IsStringNumeric(value) ? parseInt(value) : IsNumber(value) ? Math.trunc(value) : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value;
}
function TryConvertNull(value) {
  return IsString(value) && value.toLowerCase() === "null" ? null : value;
}
function TryConvertUndefined(value) {
  return IsString(value) && value === "undefined" ? undefined : value;
}
function TryConvertDate(value) {
  return IsDate(value) ? value : IsNumber(value) ? new Date(value) : IsValueTrue(value) ? new Date(1) : IsValueFalse(value) ? new Date(0) : IsStringNumeric(value) ? new Date(parseInt(value)) : IsTimeStringWithoutTimeZone(value) ? new Date(`1970-01-01T${value}.000Z`) : IsTimeStringWithTimeZone(value) ? new Date(`1970-01-01T${value}`) : IsDateTimeStringWithoutTimeZone(value) ? new Date(`${value}.000Z`) : IsDateTimeStringWithTimeZone(value) ? new Date(value) : IsDateString(value) ? new Date(`${value}T00:00:00.000Z`) : value;
}
function Default2(value) {
  return value;
}
function FromArray10(schema, references, value) {
  const elements = IsArray(value) ? value : [value];
  return elements.map((element) => Visit10(schema.items, references, element));
}
function FromBigInt5(schema, references, value) {
  return TryConvertBigInt(value);
}
function FromBoolean5(schema, references, value) {
  return TryConvertBoolean(value);
}
function FromDate6(schema, references, value) {
  return TryConvertDate(value);
}
function FromImport6(schema, references, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit10(target, [...references, ...definitions], value);
}
function FromInteger5(schema, references, value) {
  return TryConvertInteger(value);
}
function FromIntersect9(schema, references, value) {
  return schema.allOf.reduce((value2, schema2) => Visit10(schema2, references, value2), value);
}
function FromLiteral6(schema, references, value) {
  return TryConvertLiteral(schema, value);
}
function FromNull5(schema, references, value) {
  return TryConvertNull(value);
}
function FromNumber5(schema, references, value) {
  return TryConvertNumber(value);
}
function FromObject8(schema, references, value) {
  if (!IsObject(value) || IsArray(value))
    return value;
  for (const propertyKey of Object.getOwnPropertyNames(schema.properties)) {
    if (!HasPropertyKey(value, propertyKey))
      continue;
    value[propertyKey] = Visit10(schema.properties[propertyKey], references, value[propertyKey]);
  }
  return value;
}
function FromRecord7(schema, references, value) {
  const isConvertable = IsObject(value) && !IsArray(value);
  if (!isConvertable)
    return value;
  const propertyKey = Object.getOwnPropertyNames(schema.patternProperties)[0];
  const property = schema.patternProperties[propertyKey];
  for (const [propKey, propValue] of Object.entries(value)) {
    value[propKey] = Visit10(property, references, propValue);
  }
  return value;
}
function FromRef7(schema, references, value) {
  return Visit10(Deref(schema, references), references, value);
}
function FromString5(schema, references, value) {
  return TryConvertString(value);
}
function FromSymbol5(schema, references, value) {
  return IsString(value) || IsNumber(value) ? Symbol(value) : value;
}
function FromThis6(schema, references, value) {
  return Visit10(Deref(schema, references), references, value);
}
function FromTuple9(schema, references, value) {
  const isConvertable = IsArray(value) && !IsUndefined(schema.items);
  if (!isConvertable)
    return value;
  return value.map((value2, index) => {
    return index < schema.items.length ? Visit10(schema.items[index], references, value2) : value2;
  });
}
function FromUndefined5(schema, references, value) {
  return TryConvertUndefined(value);
}
function FromUnion11(schema, references, value) {
  for (const subschema of schema.anyOf) {
    if (Check(subschema, references, value)) {
      return value;
    }
  }
  for (const subschema of schema.anyOf) {
    const converted = Visit10(subschema, references, Clone2(value));
    if (!Check(subschema, references, converted))
      continue;
    return converted;
  }
  return value;
}
function Visit10(schema, references, value) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  switch (schema[Kind]) {
    case "Array":
      return FromArray10(schema_, references_, value);
    case "BigInt":
      return FromBigInt5(schema_, references_, value);
    case "Boolean":
      return FromBoolean5(schema_, references_, value);
    case "Date":
      return FromDate6(schema_, references_, value);
    case "Import":
      return FromImport6(schema_, references_, value);
    case "Integer":
      return FromInteger5(schema_, references_, value);
    case "Intersect":
      return FromIntersect9(schema_, references_, value);
    case "Literal":
      return FromLiteral6(schema_, references_, value);
    case "Null":
      return FromNull5(schema_, references_, value);
    case "Number":
      return FromNumber5(schema_, references_, value);
    case "Object":
      return FromObject8(schema_, references_, value);
    case "Record":
      return FromRecord7(schema_, references_, value);
    case "Ref":
      return FromRef7(schema_, references_, value);
    case "String":
      return FromString5(schema_, references_, value);
    case "Symbol":
      return FromSymbol5(schema_, references_, value);
    case "This":
      return FromThis6(schema_, references_, value);
    case "Tuple":
      return FromTuple9(schema_, references_, value);
    case "Undefined":
      return FromUndefined5(schema_, references_, value);
    case "Union":
      return FromUnion11(schema_, references_, value);
    default:
      return Default2(value);
  }
}
function Convert(...args) {
  return args.length === 3 ? Visit10(args[0], args[1], args[2]) : Visit10(args[0], [], args[1]);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/transform/decode.mjs
class TransformDecodeCheckError extends TypeBoxError {
  constructor(schema, value, error) {
    super(`Unable to decode value as it does not match the expected schema`);
    this.schema = schema;
    this.value = value;
    this.error = error;
  }
}

class TransformDecodeError extends TypeBoxError {
  constructor(schema, path, value, error) {
    super(error instanceof Error ? error.message : "Unknown error");
    this.schema = schema;
    this.path = path;
    this.value = value;
    this.error = error;
  }
}
function Default3(schema, path, value) {
  try {
    return IsTransform(schema) ? schema[TransformKind].Decode(value) : value;
  } catch (error) {
    throw new TransformDecodeError(schema, path, value, error);
  }
}
function FromArray11(schema, references, path, value) {
  return IsArray(value) ? Default3(schema, path, value.map((value2, index) => Visit11(schema.items, references, `${path}/${index}`, value2))) : Default3(schema, path, value);
}
function FromIntersect10(schema, references, path, value) {
  if (!IsObject(value) || IsValueType(value))
    return Default3(schema, path, value);
  const knownEntries = KeyOfPropertyEntries(schema);
  const knownKeys = knownEntries.map((entry) => entry[0]);
  const knownProperties = { ...value };
  for (const [knownKey, knownSchema] of knownEntries)
    if (knownKey in knownProperties) {
      knownProperties[knownKey] = Visit11(knownSchema, references, `${path}/${knownKey}`, knownProperties[knownKey]);
    }
  if (!IsTransform(schema.unevaluatedProperties)) {
    return Default3(schema, path, knownProperties);
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const unevaluatedProperties = schema.unevaluatedProperties;
  const unknownProperties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.includes(key)) {
      unknownProperties[key] = Default3(unevaluatedProperties, `${path}/${key}`, unknownProperties[key]);
    }
  return Default3(schema, path, unknownProperties);
}
function FromImport7(schema, references, path, value) {
  const additional = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  const result = Visit11(target, [...references, ...additional], path, value);
  return Default3(schema, path, result);
}
function FromNot5(schema, references, path, value) {
  return Default3(schema, path, Visit11(schema.not, references, path, value));
}
function FromObject9(schema, references, path, value) {
  if (!IsObject(value))
    return Default3(schema, path, value);
  const knownKeys = KeyOfPropertyKeys(schema);
  const knownProperties = { ...value };
  for (const key of knownKeys) {
    if (!HasPropertyKey(knownProperties, key))
      continue;
    if (IsUndefined(knownProperties[key]) && (!IsUndefined3(schema.properties[key]) || TypeSystemPolicy.IsExactOptionalProperty(knownProperties, key)))
      continue;
    knownProperties[key] = Visit11(schema.properties[key], references, `${path}/${key}`, knownProperties[key]);
  }
  if (!IsSchema(schema.additionalProperties)) {
    return Default3(schema, path, knownProperties);
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const additionalProperties = schema.additionalProperties;
  const unknownProperties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.includes(key)) {
      unknownProperties[key] = Default3(additionalProperties, `${path}/${key}`, unknownProperties[key]);
    }
  return Default3(schema, path, unknownProperties);
}
function FromRecord8(schema, references, path, value) {
  if (!IsObject(value))
    return Default3(schema, path, value);
  const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
  const knownKeys = new RegExp(pattern);
  const knownProperties = { ...value };
  for (const key of Object.getOwnPropertyNames(value))
    if (knownKeys.test(key)) {
      knownProperties[key] = Visit11(schema.patternProperties[pattern], references, `${path}/${key}`, knownProperties[key]);
    }
  if (!IsSchema(schema.additionalProperties)) {
    return Default3(schema, path, knownProperties);
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const additionalProperties = schema.additionalProperties;
  const unknownProperties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.test(key)) {
      unknownProperties[key] = Default3(additionalProperties, `${path}/${key}`, unknownProperties[key]);
    }
  return Default3(schema, path, unknownProperties);
}
function FromRef8(schema, references, path, value) {
  const target = Deref(schema, references);
  return Default3(schema, path, Visit11(target, references, path, value));
}
function FromThis7(schema, references, path, value) {
  const target = Deref(schema, references);
  return Default3(schema, path, Visit11(target, references, path, value));
}
function FromTuple10(schema, references, path, value) {
  return IsArray(value) && IsArray(schema.items) ? Default3(schema, path, schema.items.map((schema2, index) => Visit11(schema2, references, `${path}/${index}`, value[index]))) : Default3(schema, path, value);
}
function FromUnion12(schema, references, path, value) {
  for (const subschema of schema.anyOf) {
    if (!Check(subschema, references, value))
      continue;
    const decoded = Visit11(subschema, references, path, value);
    return Default3(schema, path, decoded);
  }
  return Default3(schema, path, value);
}
function Visit11(schema, references, path, value) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  switch (schema[Kind]) {
    case "Array":
      return FromArray11(schema_, references_, path, value);
    case "Import":
      return FromImport7(schema_, references_, path, value);
    case "Intersect":
      return FromIntersect10(schema_, references_, path, value);
    case "Not":
      return FromNot5(schema_, references_, path, value);
    case "Object":
      return FromObject9(schema_, references_, path, value);
    case "Record":
      return FromRecord8(schema_, references_, path, value);
    case "Ref":
      return FromRef8(schema_, references_, path, value);
    case "Symbol":
      return Default3(schema_, path, value);
    case "This":
      return FromThis7(schema_, references_, path, value);
    case "Tuple":
      return FromTuple10(schema_, references_, path, value);
    case "Union":
      return FromUnion12(schema_, references_, path, value);
    default:
      return Default3(schema_, path, value);
  }
}
function TransformDecode(schema, references, value) {
  return Visit11(schema, references, "", value);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/transform/encode.mjs
class TransformEncodeCheckError extends TypeBoxError {
  constructor(schema, value, error) {
    super(`The encoded value does not match the expected schema`);
    this.schema = schema;
    this.value = value;
    this.error = error;
  }
}

class TransformEncodeError extends TypeBoxError {
  constructor(schema, path, value, error) {
    super(`${error instanceof Error ? error.message : "Unknown error"}`);
    this.schema = schema;
    this.path = path;
    this.value = value;
    this.error = error;
  }
}
function Default4(schema, path, value) {
  try {
    return IsTransform(schema) ? schema[TransformKind].Encode(value) : value;
  } catch (error) {
    throw new TransformEncodeError(schema, path, value, error);
  }
}
function FromArray12(schema, references, path, value) {
  const defaulted = Default4(schema, path, value);
  return IsArray(defaulted) ? defaulted.map((value2, index) => Visit12(schema.items, references, `${path}/${index}`, value2)) : defaulted;
}
function FromImport8(schema, references, path, value) {
  const additional = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  const result = Default4(schema, path, value);
  return Visit12(target, [...references, ...additional], path, result);
}
function FromIntersect11(schema, references, path, value) {
  const defaulted = Default4(schema, path, value);
  if (!IsObject(value) || IsValueType(value))
    return defaulted;
  const knownEntries = KeyOfPropertyEntries(schema);
  const knownKeys = knownEntries.map((entry) => entry[0]);
  const knownProperties = { ...defaulted };
  for (const [knownKey, knownSchema] of knownEntries)
    if (knownKey in knownProperties) {
      knownProperties[knownKey] = Visit12(knownSchema, references, `${path}/${knownKey}`, knownProperties[knownKey]);
    }
  if (!IsTransform(schema.unevaluatedProperties)) {
    return knownProperties;
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const unevaluatedProperties = schema.unevaluatedProperties;
  const properties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.includes(key)) {
      properties[key] = Default4(unevaluatedProperties, `${path}/${key}`, properties[key]);
    }
  return properties;
}
function FromNot6(schema, references, path, value) {
  return Default4(schema.not, path, Default4(schema, path, value));
}
function FromObject10(schema, references, path, value) {
  const defaulted = Default4(schema, path, value);
  if (!IsObject(defaulted))
    return defaulted;
  const knownKeys = KeyOfPropertyKeys(schema);
  const knownProperties = { ...defaulted };
  for (const key of knownKeys) {
    if (!HasPropertyKey(knownProperties, key))
      continue;
    if (IsUndefined(knownProperties[key]) && (!IsUndefined3(schema.properties[key]) || TypeSystemPolicy.IsExactOptionalProperty(knownProperties, key)))
      continue;
    knownProperties[key] = Visit12(schema.properties[key], references, `${path}/${key}`, knownProperties[key]);
  }
  if (!IsSchema(schema.additionalProperties)) {
    return knownProperties;
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const additionalProperties = schema.additionalProperties;
  const properties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.includes(key)) {
      properties[key] = Default4(additionalProperties, `${path}/${key}`, properties[key]);
    }
  return properties;
}
function FromRecord9(schema, references, path, value) {
  const defaulted = Default4(schema, path, value);
  if (!IsObject(value))
    return defaulted;
  const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
  const knownKeys = new RegExp(pattern);
  const knownProperties = { ...defaulted };
  for (const key of Object.getOwnPropertyNames(value))
    if (knownKeys.test(key)) {
      knownProperties[key] = Visit12(schema.patternProperties[pattern], references, `${path}/${key}`, knownProperties[key]);
    }
  if (!IsSchema(schema.additionalProperties)) {
    return knownProperties;
  }
  const unknownKeys = Object.getOwnPropertyNames(knownProperties);
  const additionalProperties = schema.additionalProperties;
  const properties = { ...knownProperties };
  for (const key of unknownKeys)
    if (!knownKeys.test(key)) {
      properties[key] = Default4(additionalProperties, `${path}/${key}`, properties[key]);
    }
  return properties;
}
function FromRef9(schema, references, path, value) {
  const target = Deref(schema, references);
  const resolved = Visit12(target, references, path, value);
  return Default4(schema, path, resolved);
}
function FromThis8(schema, references, path, value) {
  const target = Deref(schema, references);
  const resolved = Visit12(target, references, path, value);
  return Default4(schema, path, resolved);
}
function FromTuple11(schema, references, path, value) {
  const value1 = Default4(schema, path, value);
  return IsArray(schema.items) ? schema.items.map((schema2, index) => Visit12(schema2, references, `${path}/${index}`, value1[index])) : [];
}
function FromUnion13(schema, references, path, value) {
  for (const subschema of schema.anyOf) {
    if (!Check(subschema, references, value))
      continue;
    const value1 = Visit12(subschema, references, path, value);
    return Default4(schema, path, value1);
  }
  for (const subschema of schema.anyOf) {
    const value1 = Visit12(subschema, references, path, value);
    if (!Check(schema, references, value1))
      continue;
    return Default4(schema, path, value1);
  }
  return Default4(schema, path, value);
}
function Visit12(schema, references, path, value) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  switch (schema[Kind]) {
    case "Array":
      return FromArray12(schema_, references_, path, value);
    case "Import":
      return FromImport8(schema_, references_, path, value);
    case "Intersect":
      return FromIntersect11(schema_, references_, path, value);
    case "Not":
      return FromNot6(schema_, references_, path, value);
    case "Object":
      return FromObject10(schema_, references_, path, value);
    case "Record":
      return FromRecord9(schema_, references_, path, value);
    case "Ref":
      return FromRef9(schema_, references_, path, value);
    case "This":
      return FromThis8(schema_, references_, path, value);
    case "Tuple":
      return FromTuple11(schema_, references_, path, value);
    case "Union":
      return FromUnion13(schema_, references_, path, value);
    default:
      return Default4(schema_, path, value);
  }
}
function TransformEncode(schema, references, value) {
  return Visit12(schema, references, "", value);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/transform/has.mjs
function FromArray13(schema, references) {
  return IsTransform(schema) || Visit13(schema.items, references);
}
function FromAsyncIterator5(schema, references) {
  return IsTransform(schema) || Visit13(schema.items, references);
}
function FromConstructor6(schema, references) {
  return IsTransform(schema) || Visit13(schema.returns, references) || schema.parameters.some((schema2) => Visit13(schema2, references));
}
function FromFunction5(schema, references) {
  return IsTransform(schema) || Visit13(schema.returns, references) || schema.parameters.some((schema2) => Visit13(schema2, references));
}
function FromIntersect12(schema, references) {
  return IsTransform(schema) || IsTransform(schema.unevaluatedProperties) || schema.allOf.some((schema2) => Visit13(schema2, references));
}
function FromImport9(schema, references) {
  const additional = globalThis.Object.getOwnPropertyNames(schema.$defs).reduce((result, key) => [...result, schema.$defs[key]], []);
  const target = schema.$defs[schema.$ref];
  return IsTransform(schema) || Visit13(target, [...additional, ...references]);
}
function FromIterator5(schema, references) {
  return IsTransform(schema) || Visit13(schema.items, references);
}
function FromNot7(schema, references) {
  return IsTransform(schema) || Visit13(schema.not, references);
}
function FromObject11(schema, references) {
  return IsTransform(schema) || Object.values(schema.properties).some((schema2) => Visit13(schema2, references)) || IsSchema(schema.additionalProperties) && Visit13(schema.additionalProperties, references);
}
function FromPromise5(schema, references) {
  return IsTransform(schema) || Visit13(schema.item, references);
}
function FromRecord10(schema, references) {
  const pattern = Object.getOwnPropertyNames(schema.patternProperties)[0];
  const property = schema.patternProperties[pattern];
  return IsTransform(schema) || Visit13(property, references) || IsSchema(schema.additionalProperties) && IsTransform(schema.additionalProperties);
}
function FromRef10(schema, references) {
  if (IsTransform(schema))
    return true;
  return Visit13(Deref(schema, references), references);
}
function FromThis9(schema, references) {
  if (IsTransform(schema))
    return true;
  return Visit13(Deref(schema, references), references);
}
function FromTuple12(schema, references) {
  return IsTransform(schema) || !IsUndefined(schema.items) && schema.items.some((schema2) => Visit13(schema2, references));
}
function FromUnion14(schema, references) {
  return IsTransform(schema) || schema.anyOf.some((schema2) => Visit13(schema2, references));
}
function Visit13(schema, references) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  if (schema.$id && visited.has(schema.$id))
    return false;
  if (schema.$id)
    visited.add(schema.$id);
  switch (schema[Kind]) {
    case "Array":
      return FromArray13(schema_, references_);
    case "AsyncIterator":
      return FromAsyncIterator5(schema_, references_);
    case "Constructor":
      return FromConstructor6(schema_, references_);
    case "Function":
      return FromFunction5(schema_, references_);
    case "Import":
      return FromImport9(schema_, references_);
    case "Intersect":
      return FromIntersect12(schema_, references_);
    case "Iterator":
      return FromIterator5(schema_, references_);
    case "Not":
      return FromNot7(schema_, references_);
    case "Object":
      return FromObject11(schema_, references_);
    case "Promise":
      return FromPromise5(schema_, references_);
    case "Record":
      return FromRecord10(schema_, references_);
    case "Ref":
      return FromRef10(schema_, references_);
    case "This":
      return FromThis9(schema_, references_);
    case "Tuple":
      return FromTuple12(schema_, references_);
    case "Union":
      return FromUnion14(schema_, references_);
    default:
      return IsTransform(schema);
  }
}
var visited = new Set;
function HasTransform(schema, references) {
  visited.clear();
  return Visit13(schema, references);
}

// ../../node_modules/@sinclair/typebox/build/esm/value/decode/decode.mjs
function Decode(...args) {
  const [schema, references, value] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], [], args[1]];
  if (!Check(schema, references, value))
    throw new TransformDecodeCheckError(schema, value, Errors(schema, references, value).First());
  return HasTransform(schema, references) ? TransformDecode(schema, references, value) : value;
}
// ../../node_modules/@sinclair/typebox/build/esm/value/default/default.mjs
function ValueOrDefault(schema, value) {
  const defaultValue = HasPropertyKey(schema, "default") ? schema.default : undefined;
  const clone = IsFunction(defaultValue) ? defaultValue() : Clone2(defaultValue);
  return IsUndefined(value) ? clone : IsObject(value) && IsObject(clone) ? Object.assign(clone, value) : value;
}
function HasDefaultProperty(schema) {
  return IsKind(schema) && "default" in schema;
}
function FromArray14(schema, references, value) {
  if (IsArray(value)) {
    for (let i = 0;i < value.length; i++) {
      value[i] = Visit14(schema.items, references, value[i]);
    }
    return value;
  }
  const defaulted = ValueOrDefault(schema, value);
  if (!IsArray(defaulted))
    return defaulted;
  for (let i = 0;i < defaulted.length; i++) {
    defaulted[i] = Visit14(schema.items, references, defaulted[i]);
  }
  return defaulted;
}
function FromDate7(schema, references, value) {
  return IsDate(value) ? value : ValueOrDefault(schema, value);
}
function FromImport10(schema, references, value) {
  const definitions = globalThis.Object.values(schema.$defs);
  const target = schema.$defs[schema.$ref];
  return Visit14(target, [...references, ...definitions], value);
}
function FromIntersect13(schema, references, value) {
  const defaulted = ValueOrDefault(schema, value);
  return schema.allOf.reduce((acc, schema2) => {
    const next = Visit14(schema2, references, defaulted);
    return IsObject(next) ? { ...acc, ...next } : next;
  }, {});
}
function FromObject12(schema, references, value) {
  const defaulted = ValueOrDefault(schema, value);
  if (!IsObject(defaulted))
    return defaulted;
  const knownPropertyKeys = Object.getOwnPropertyNames(schema.properties);
  for (const key of knownPropertyKeys) {
    const propertyValue = Visit14(schema.properties[key], references, defaulted[key]);
    if (IsUndefined(propertyValue))
      continue;
    defaulted[key] = Visit14(schema.properties[key], references, defaulted[key]);
  }
  if (!HasDefaultProperty(schema.additionalProperties))
    return defaulted;
  for (const key of Object.getOwnPropertyNames(defaulted)) {
    if (knownPropertyKeys.includes(key))
      continue;
    defaulted[key] = Visit14(schema.additionalProperties, references, defaulted[key]);
  }
  return defaulted;
}
function FromRecord11(schema, references, value) {
  const defaulted = ValueOrDefault(schema, value);
  if (!IsObject(defaulted))
    return defaulted;
  const additionalPropertiesSchema = schema.additionalProperties;
  const [propertyKeyPattern, propertySchema] = Object.entries(schema.patternProperties)[0];
  const knownPropertyKey = new RegExp(propertyKeyPattern);
  for (const key of Object.getOwnPropertyNames(defaulted)) {
    if (!(knownPropertyKey.test(key) && HasDefaultProperty(propertySchema)))
      continue;
    defaulted[key] = Visit14(propertySchema, references, defaulted[key]);
  }
  if (!HasDefaultProperty(additionalPropertiesSchema))
    return defaulted;
  for (const key of Object.getOwnPropertyNames(defaulted)) {
    if (knownPropertyKey.test(key))
      continue;
    defaulted[key] = Visit14(additionalPropertiesSchema, references, defaulted[key]);
  }
  return defaulted;
}
function FromRef11(schema, references, value) {
  return Visit14(Deref(schema, references), references, ValueOrDefault(schema, value));
}
function FromThis10(schema, references, value) {
  return Visit14(Deref(schema, references), references, value);
}
function FromTuple13(schema, references, value) {
  const defaulted = ValueOrDefault(schema, value);
  if (!IsArray(defaulted) || IsUndefined(schema.items))
    return defaulted;
  const [items, max] = [schema.items, Math.max(schema.items.length, defaulted.length)];
  for (let i = 0;i < max; i++) {
    if (i < items.length)
      defaulted[i] = Visit14(items[i], references, defaulted[i]);
  }
  return defaulted;
}
function FromUnion15(schema, references, value) {
  const defaulted = ValueOrDefault(schema, value);
  for (const inner of schema.anyOf) {
    const result = Visit14(inner, references, Clone2(defaulted));
    if (Check(inner, references, result)) {
      return result;
    }
  }
  return defaulted;
}
function Visit14(schema, references, value) {
  const references_ = Pushref(schema, references);
  const schema_ = schema;
  switch (schema_[Kind]) {
    case "Array":
      return FromArray14(schema_, references_, value);
    case "Date":
      return FromDate7(schema_, references_, value);
    case "Import":
      return FromImport10(schema_, references_, value);
    case "Intersect":
      return FromIntersect13(schema_, references_, value);
    case "Object":
      return FromObject12(schema_, references_, value);
    case "Record":
      return FromRecord11(schema_, references_, value);
    case "Ref":
      return FromRef11(schema_, references_, value);
    case "This":
      return FromThis10(schema_, references_, value);
    case "Tuple":
      return FromTuple13(schema_, references_, value);
    case "Union":
      return FromUnion15(schema_, references_, value);
    default:
      return ValueOrDefault(schema_, value);
  }
}
function Default5(...args) {
  return args.length === 3 ? Visit14(args[0], args[1], args[2]) : Visit14(args[0], [], args[1]);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/pointer/pointer.mjs
var exports_pointer = {};
__export(exports_pointer, {
  ValuePointerRootSetError: () => ValuePointerRootSetError,
  ValuePointerRootDeleteError: () => ValuePointerRootDeleteError,
  Set: () => Set4,
  Has: () => Has3,
  Get: () => Get3,
  Format: () => Format,
  Delete: () => Delete3
});
class ValuePointerRootSetError extends TypeBoxError {
  constructor(value, path, update) {
    super("Cannot set root value");
    this.value = value;
    this.path = path;
    this.update = update;
  }
}

class ValuePointerRootDeleteError extends TypeBoxError {
  constructor(value, path) {
    super("Cannot delete root value");
    this.value = value;
    this.path = path;
  }
}
function Escape2(component) {
  return component.indexOf("~") === -1 ? component : component.replace(/~1/g, "/").replace(/~0/g, "~");
}
function* Format(pointer) {
  if (pointer === "")
    return;
  let [start, end] = [0, 0];
  for (let i = 0;i < pointer.length; i++) {
    const char = pointer.charAt(i);
    if (char === "/") {
      if (i === 0) {
        start = i + 1;
      } else {
        end = i;
        yield Escape2(pointer.slice(start, end));
        start = i + 1;
      }
    } else {
      end = i;
    }
  }
  yield Escape2(pointer.slice(start));
}
function Set4(value, pointer, update) {
  if (pointer === "")
    throw new ValuePointerRootSetError(value, pointer, update);
  let [owner, next, key] = [null, value, ""];
  for (const component of Format(pointer)) {
    if (next[component] === undefined)
      next[component] = {};
    owner = next;
    next = next[component];
    key = component;
  }
  owner[key] = update;
}
function Delete3(value, pointer) {
  if (pointer === "")
    throw new ValuePointerRootDeleteError(value, pointer);
  let [owner, next, key] = [null, value, ""];
  for (const component of Format(pointer)) {
    if (next[component] === undefined || next[component] === null)
      return;
    owner = next;
    next = next[component];
    key = component;
  }
  if (Array.isArray(owner)) {
    const index = parseInt(key);
    owner.splice(index, 1);
  } else {
    delete owner[key];
  }
}
function Has3(value, pointer) {
  if (pointer === "")
    return true;
  let [owner, next, key] = [null, value, ""];
  for (const component of Format(pointer)) {
    if (next[component] === undefined)
      return false;
    owner = next;
    next = next[component];
    key = component;
  }
  return Object.getOwnPropertyNames(owner).includes(key);
}
function Get3(value, pointer) {
  if (pointer === "")
    return value;
  let current = value;
  for (const component of Format(pointer)) {
    if (current[component] === undefined)
      return;
    current = current[component];
  }
  return current;
}
// ../../node_modules/@sinclair/typebox/build/esm/value/equal/equal.mjs
function ObjectType3(left, right) {
  if (!IsObject(right))
    return false;
  const leftKeys = [...Object.keys(left), ...Object.getOwnPropertySymbols(left)];
  const rightKeys = [...Object.keys(right), ...Object.getOwnPropertySymbols(right)];
  if (leftKeys.length !== rightKeys.length)
    return false;
  return leftKeys.every((key) => Equal(left[key], right[key]));
}
function DateType3(left, right) {
  return IsDate(right) && left.getTime() === right.getTime();
}
function ArrayType3(left, right) {
  if (!IsArray(right) || left.length !== right.length)
    return false;
  return left.every((value, index) => Equal(value, right[index]));
}
function TypedArrayType(left, right) {
  if (!IsTypedArray(right) || left.length !== right.length || Object.getPrototypeOf(left).constructor.name !== Object.getPrototypeOf(right).constructor.name)
    return false;
  return left.every((value, index) => Equal(value, right[index]));
}
function ValueType(left, right) {
  return left === right;
}
function Equal(left, right) {
  if (IsDate(left))
    return DateType3(left, right);
  if (IsTypedArray(left))
    return TypedArrayType(left, right);
  if (IsArray(left))
    return ArrayType3(left, right);
  if (IsObject(left))
    return ObjectType3(left, right);
  if (IsValueType(left))
    return ValueType(left, right);
  throw new Error("ValueEquals: Unable to compare value");
}

// ../../node_modules/@sinclair/typebox/build/esm/value/delta/delta.mjs
var Insert = Object2({
  type: Literal("insert"),
  path: String2(),
  value: Unknown()
});
var Update = Object2({
  type: Literal("update"),
  path: String2(),
  value: Unknown()
});
var Delete4 = Object2({
  type: Literal("delete"),
  path: String2()
});
var Edit = Union([Insert, Update, Delete4]);

class ValueDiffError extends TypeBoxError {
  constructor(value, message) {
    super(message);
    this.value = value;
  }
}
function CreateUpdate(path, value) {
  return { type: "update", path, value };
}
function CreateInsert(path, value) {
  return { type: "insert", path, value };
}
function CreateDelete(path) {
  return { type: "delete", path };
}
function AssertDiffable(value) {
  if (globalThis.Object.getOwnPropertySymbols(value).length > 0)
    throw new ValueDiffError(value, "Cannot diff objects with symbols");
}
function* ObjectType4(path, current, next) {
  AssertDiffable(current);
  AssertDiffable(next);
  if (!IsStandardObject(next))
    return yield CreateUpdate(path, next);
  const currentKeys = globalThis.Object.getOwnPropertyNames(current);
  const nextKeys = globalThis.Object.getOwnPropertyNames(next);
  for (const key of nextKeys) {
    if (HasPropertyKey(current, key))
      continue;
    yield CreateInsert(`${path}/${key}`, next[key]);
  }
  for (const key of currentKeys) {
    if (!HasPropertyKey(next, key))
      continue;
    if (Equal(current, next))
      continue;
    yield* Visit15(`${path}/${key}`, current[key], next[key]);
  }
  for (const key of currentKeys) {
    if (HasPropertyKey(next, key))
      continue;
    yield CreateDelete(`${path}/${key}`);
  }
}
function* ArrayType4(path, current, next) {
  if (!IsArray(next))
    return yield CreateUpdate(path, next);
  for (let i = 0;i < Math.min(current.length, next.length); i++) {
    yield* Visit15(`${path}/${i}`, current[i], next[i]);
  }
  for (let i = 0;i < next.length; i++) {
    if (i < current.length)
      continue;
    yield CreateInsert(`${path}/${i}`, next[i]);
  }
  for (let i = current.length - 1;i >= 0; i--) {
    if (i < next.length)
      continue;
    yield CreateDelete(`${path}/${i}`);
  }
}
function* TypedArrayType2(path, current, next) {
  if (!IsTypedArray(next) || current.length !== next.length || globalThis.Object.getPrototypeOf(current).constructor.name !== globalThis.Object.getPrototypeOf(next).constructor.name)
    return yield CreateUpdate(path, next);
  for (let i = 0;i < Math.min(current.length, next.length); i++) {
    yield* Visit15(`${path}/${i}`, current[i], next[i]);
  }
}
function* ValueType2(path, current, next) {
  if (current === next)
    return;
  yield CreateUpdate(path, next);
}
function* Visit15(path, current, next) {
  if (IsStandardObject(current))
    return yield* ObjectType4(path, current, next);
  if (IsArray(current))
    return yield* ArrayType4(path, current, next);
  if (IsTypedArray(current))
    return yield* TypedArrayType2(path, current, next);
  if (IsValueType(current))
    return yield* ValueType2(path, current, next);
  throw new ValueDiffError(current, "Unable to diff value");
}
function Diff(current, next) {
  return [...Visit15("", current, next)];
}
function IsRootUpdate(edits) {
  return edits.length > 0 && edits[0].path === "" && edits[0].type === "update";
}
function IsIdentity(edits) {
  return edits.length === 0;
}
function Patch(current, edits) {
  if (IsRootUpdate(edits)) {
    return Clone2(edits[0].value);
  }
  if (IsIdentity(edits)) {
    return Clone2(current);
  }
  const clone = Clone2(current);
  for (const edit of edits) {
    switch (edit.type) {
      case "insert": {
        exports_pointer.Set(clone, edit.path, edit.value);
        break;
      }
      case "update": {
        exports_pointer.Set(clone, edit.path, edit.value);
        break;
      }
      case "delete": {
        exports_pointer.Delete(clone, edit.path);
        break;
      }
    }
  }
  return clone;
}
// ../../node_modules/@sinclair/typebox/build/esm/value/encode/encode.mjs
function Encode(...args) {
  const [schema, references, value] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], [], args[1]];
  const encoded = HasTransform(schema, references) ? TransformEncode(schema, references, value) : value;
  if (!Check(schema, references, encoded))
    throw new TransformEncodeCheckError(schema, encoded, Errors(schema, references, encoded).First());
  return encoded;
}
// ../../node_modules/@sinclair/typebox/build/esm/value/mutate/mutate.mjs
function IsStandardObject2(value) {
  return IsObject(value) && !IsArray(value);
}

class ValueMutateError extends TypeBoxError {
  constructor(message) {
    super(message);
  }
}
function ObjectType5(root, path, current, next) {
  if (!IsStandardObject2(current)) {
    exports_pointer.Set(root, path, Clone2(next));
  } else {
    const currentKeys = Object.getOwnPropertyNames(current);
    const nextKeys = Object.getOwnPropertyNames(next);
    for (const currentKey of currentKeys) {
      if (!nextKeys.includes(currentKey)) {
        delete current[currentKey];
      }
    }
    for (const nextKey of nextKeys) {
      if (!currentKeys.includes(nextKey)) {
        current[nextKey] = null;
      }
    }
    for (const nextKey of nextKeys) {
      Visit16(root, `${path}/${nextKey}`, current[nextKey], next[nextKey]);
    }
  }
}
function ArrayType5(root, path, current, next) {
  if (!IsArray(current)) {
    exports_pointer.Set(root, path, Clone2(next));
  } else {
    for (let index = 0;index < next.length; index++) {
      Visit16(root, `${path}/${index}`, current[index], next[index]);
    }
    current.splice(next.length);
  }
}
function TypedArrayType3(root, path, current, next) {
  if (IsTypedArray(current) && current.length === next.length) {
    for (let i = 0;i < current.length; i++) {
      current[i] = next[i];
    }
  } else {
    exports_pointer.Set(root, path, Clone2(next));
  }
}
function ValueType3(root, path, current, next) {
  if (current === next)
    return;
  exports_pointer.Set(root, path, next);
}
function Visit16(root, path, current, next) {
  if (IsArray(next))
    return ArrayType5(root, path, current, next);
  if (IsTypedArray(next))
    return TypedArrayType3(root, path, current, next);
  if (IsStandardObject2(next))
    return ObjectType5(root, path, current, next);
  if (IsValueType(next))
    return ValueType3(root, path, current, next);
}
function IsNonMutableValue(value) {
  return IsTypedArray(value) || IsValueType(value);
}
function IsMismatchedValue(current, next) {
  return IsStandardObject2(current) && IsArray(next) || IsArray(current) && IsStandardObject2(next);
}
function Mutate(current, next) {
  if (IsNonMutableValue(current) || IsNonMutableValue(next))
    throw new ValueMutateError("Only object and array types can be mutated at the root level");
  if (IsMismatchedValue(current, next))
    throw new ValueMutateError("Cannot assign due type mismatch of assignable values");
  Visit16(current, "", current, next);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/parse/parse.mjs
class ParseError extends TypeBoxError {
  constructor(message) {
    super(message);
  }
}
var ParseRegistry;
(function(ParseRegistry2) {
  const registry = new Map([
    ["Assert", (type, references, value) => {
      Assert(type, references, value);
      return value;
    }],
    ["Cast", (type, references, value) => Cast(type, references, value)],
    ["Clean", (type, references, value) => Clean(type, references, value)],
    ["Clone", (_type, _references, value) => Clone2(value)],
    ["Convert", (type, references, value) => Convert(type, references, value)],
    ["Decode", (type, references, value) => HasTransform(type, references) ? TransformDecode(type, references, value) : value],
    ["Default", (type, references, value) => Default5(type, references, value)],
    ["Encode", (type, references, value) => HasTransform(type, references) ? TransformEncode(type, references, value) : value]
  ]);
  function Delete5(key) {
    registry.delete(key);
  }
  ParseRegistry2.Delete = Delete5;
  function Set5(key, callback) {
    registry.set(key, callback);
  }
  ParseRegistry2.Set = Set5;
  function Get4(key) {
    return registry.get(key);
  }
  ParseRegistry2.Get = Get4;
})(ParseRegistry || (ParseRegistry = {}));
var ParseDefault = [
  "Clone",
  "Clean",
  "Default",
  "Convert",
  "Assert",
  "Decode"
];
function ParseValue(operations, type, references, value) {
  return operations.reduce((value2, operationKey) => {
    const operation = ParseRegistry.Get(operationKey);
    if (IsUndefined(operation))
      throw new ParseError(`Unable to find Parse operation '${operationKey}'`);
    return operation(type, references, value2);
  }, value);
}
function Parse(...args) {
  const [operations, schema, references, value] = args.length === 4 ? [args[0], args[1], args[2], args[3]] : args.length === 3 ? IsArray(args[0]) ? [args[0], args[1], [], args[2]] : [ParseDefault, args[0], args[1], args[2]] : args.length === 2 ? [ParseDefault, args[0], [], args[1]] : (() => {
    throw new ParseError("Invalid Arguments");
  })();
  return ParseValue(operations, schema, references, value);
}
// ../../node_modules/@sinclair/typebox/build/esm/value/value/value.mjs
var exports_value2 = {};
__export(exports_value2, {
  ValueErrorIterator: () => ValueErrorIterator,
  Patch: () => Patch,
  Parse: () => Parse,
  Mutate: () => Mutate,
  Hash: () => Hash,
  Errors: () => Errors,
  Equal: () => Equal,
  Encode: () => Encode,
  Edit: () => Edit,
  Diff: () => Diff,
  Default: () => Default5,
  Decode: () => Decode,
  Create: () => Create2,
  Convert: () => Convert,
  Clone: () => Clone2,
  Clean: () => Clean,
  Check: () => Check,
  Cast: () => Cast,
  Assert: () => Assert
});
// ../../node_modules/@sinclair/typebox/build/esm/type/clone/type.mjs
function CloneType(schema, options) {
  return options === undefined ? Clone(schema) : Clone({ ...options, ...schema });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/argument/argument.mjs
function Argument(index) {
  return CreateType({ [Kind]: "Argument", index });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/awaited/awaited.mjs
function FromComputed2(target, parameters) {
  return Computed("Awaited", [Computed(target, parameters)]);
}
function FromRef12($ref) {
  return Computed("Awaited", [Ref($ref)]);
}
function FromIntersect14(types) {
  return Intersect(FromRest4(types));
}
function FromUnion16(types) {
  return Union(FromRest4(types));
}
function FromPromise6(type) {
  return Awaited(type);
}
function FromRest4(types) {
  return types.map((type) => Awaited(type));
}
function Awaited(type, options) {
  return CreateType(IsComputed(type) ? FromComputed2(type.target, type.parameters) : IsIntersect(type) ? FromIntersect14(type.allOf) : IsUnion(type) ? FromUnion16(type.anyOf) : IsPromise2(type) ? FromPromise6(type.item) : IsRef(type) ? FromRef12(type.$ref) : type, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/composite/composite.mjs
function CompositeKeys(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...KeyOfPropertyKeys(L));
  return SetDistinct(Acc);
}
function FilterNever(T) {
  return T.filter((L) => !IsNever(L));
}
function CompositeProperty(T, K) {
  const Acc = [];
  for (const L of T)
    Acc.push(...IndexFromPropertyKeys(L, [K]));
  return FilterNever(Acc);
}
function CompositeProperties(T, K) {
  const Acc = {};
  for (const L of K) {
    Acc[L] = IntersectEvaluated(CompositeProperty(T, L));
  }
  return Acc;
}
function Composite(T, options) {
  const K = CompositeKeys(T);
  const P = CompositeProperties(T, K);
  const R = Object2(P, options);
  return R;
}

// ../../node_modules/@sinclair/typebox/build/esm/type/date/date.mjs
function Date2(options) {
  return CreateType({ [Kind]: "Date", type: "Date" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/null/null.mjs
function Null(options) {
  return CreateType({ [Kind]: "Null", type: "null" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/symbol/symbol.mjs
function Symbol2(options) {
  return CreateType({ [Kind]: "Symbol", type: "symbol" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/undefined/undefined.mjs
function Undefined(options) {
  return CreateType({ [Kind]: "Undefined", type: "undefined" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/uint8array/uint8array.mjs
function Uint8Array2(options) {
  return CreateType({ [Kind]: "Uint8Array", type: "Uint8Array" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/const/const.mjs
function FromArray15(T) {
  return T.map((L) => FromValue2(L, false));
}
function FromProperties8(value) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(value))
    Acc[K] = Readonly(FromValue2(value[K], false));
  return Acc;
}
function ConditionalReadonly(T, root) {
  return root === true ? T : Readonly(T);
}
function FromValue2(value, root) {
  return IsAsyncIterator2(value) ? ConditionalReadonly(Any(), root) : IsIterator2(value) ? ConditionalReadonly(Any(), root) : IsArray2(value) ? Readonly(Tuple(FromArray15(value))) : IsUint8Array2(value) ? Uint8Array2() : IsDate2(value) ? Date2() : IsObject2(value) ? ConditionalReadonly(Object2(FromProperties8(value)), root) : IsFunction2(value) ? ConditionalReadonly(Function2([], Unknown()), root) : IsUndefined2(value) ? Undefined() : IsNull2(value) ? Null() : IsSymbol2(value) ? Symbol2() : IsBigInt2(value) ? BigInt2() : IsNumber2(value) ? Literal(value) : IsBoolean2(value) ? Literal(value) : IsString2(value) ? Literal(value) : Object2({});
}
function Const(T, options) {
  return CreateType(FromValue2(T, true), options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/constructor-parameters/constructor-parameters.mjs
function ConstructorParameters(schema, options) {
  return IsConstructor(schema) ? Tuple(schema.parameters, options) : Never(options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/enum/enum.mjs
function Enum(item, options) {
  if (IsUndefined2(item))
    throw new Error("Enum undefined or empty");
  const values1 = globalThis.Object.getOwnPropertyNames(item).filter((key) => isNaN(key)).map((key) => item[key]);
  const values2 = [...new Set(values1)];
  const anyOf = values2.map((value) => Literal(value));
  return Union(anyOf, { ...options, [Hint]: "Enum" });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-template-literal.mjs
function ExcludeFromTemplateLiteral(L, R) {
  return Exclude(TemplateLiteralToUnion(L), R);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/exclude/exclude.mjs
function ExcludeRest(L, R) {
  const excluded = L.filter((inner) => ExtendsCheck(inner, R) === ExtendsResult.False);
  return excluded.length === 1 ? excluded[0] : Union(excluded);
}
function Exclude(L, R, options = {}) {
  if (IsTemplateLiteral(L))
    return CreateType(ExcludeFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExcludeFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExcludeRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? Never() : L, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-mapped-result.mjs
function FromProperties9(P, U) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Exclude(P[K2], U);
  return Acc;
}
function FromMappedResult7(R, T) {
  return FromProperties9(R.properties, T);
}
function ExcludeFromMappedResult(R, T) {
  const P = FromMappedResult7(R, T);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-template-literal.mjs
function ExtractFromTemplateLiteral(L, R) {
  return Extract(TemplateLiteralToUnion(L), R);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extract/extract.mjs
function ExtractRest(L, R) {
  const extracted = L.filter((inner) => ExtendsCheck(inner, R) !== ExtendsResult.False);
  return extracted.length === 1 ? extracted[0] : Union(extracted);
}
function Extract(L, R, options) {
  if (IsTemplateLiteral(L))
    return CreateType(ExtractFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExtractFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExtractRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? L : Never(), options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-mapped-result.mjs
function FromProperties10(P, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extract(P[K2], T);
  return Acc;
}
function FromMappedResult8(R, T) {
  return FromProperties10(R.properties, T);
}
function ExtractFromMappedResult(R, T) {
  const P = FromMappedResult8(R, T);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/instance-type/instance-type.mjs
function InstanceType(schema, options) {
  return IsConstructor(schema) ? CreateType(schema.returns, options) : Never(options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/readonly-optional/readonly-optional.mjs
function ReadonlyOptional(schema) {
  return Readonly(Optional(schema));
}

// ../../node_modules/@sinclair/typebox/build/esm/type/record/record.mjs
function RecordCreateFromPattern(pattern, T, options) {
  return CreateType({ [Kind]: "Record", type: "object", patternProperties: { [pattern]: T } }, options);
}
function RecordCreateFromKeys(K, T, options) {
  const result = {};
  for (const K2 of K)
    result[K2] = T;
  return Object2(result, { ...options, [Hint]: "Record" });
}
function FromTemplateLiteralKey(K, T, options) {
  return IsTemplateLiteralFinite(K) ? RecordCreateFromKeys(IndexPropertyKeys(K), T, options) : RecordCreateFromPattern(K.pattern, T, options);
}
function FromUnionKey(key, type, options) {
  return RecordCreateFromKeys(IndexPropertyKeys(Union(key)), type, options);
}
function FromLiteralKey(key, type, options) {
  return RecordCreateFromKeys([key.toString()], type, options);
}
function FromRegExpKey(key, type, options) {
  return RecordCreateFromPattern(key.source, type, options);
}
function FromStringKey(key, type, options) {
  const pattern = IsUndefined2(key.pattern) ? PatternStringExact : key.pattern;
  return RecordCreateFromPattern(pattern, type, options);
}
function FromAnyKey(_, type, options) {
  return RecordCreateFromPattern(PatternStringExact, type, options);
}
function FromNeverKey(_key, type, options) {
  return RecordCreateFromPattern(PatternNeverExact, type, options);
}
function FromBooleanKey(_key, type, options) {
  return Object2({ true: type, false: type }, options);
}
function FromIntegerKey(_key, type, options) {
  return RecordCreateFromPattern(PatternNumberExact, type, options);
}
function FromNumberKey(_, type, options) {
  return RecordCreateFromPattern(PatternNumberExact, type, options);
}
function Record(key, type, options = {}) {
  return IsUnion(key) ? FromUnionKey(key.anyOf, type, options) : IsTemplateLiteral(key) ? FromTemplateLiteralKey(key, type, options) : IsLiteral(key) ? FromLiteralKey(key.const, type, options) : IsBoolean3(key) ? FromBooleanKey(key, type, options) : IsInteger2(key) ? FromIntegerKey(key, type, options) : IsNumber3(key) ? FromNumberKey(key, type, options) : IsRegExp2(key) ? FromRegExpKey(key, type, options) : IsString3(key) ? FromStringKey(key, type, options) : IsAny(key) ? FromAnyKey(key, type, options) : IsNever(key) ? FromNeverKey(key, type, options) : Never(options);
}
function RecordPattern(record) {
  return globalThis.Object.getOwnPropertyNames(record.patternProperties)[0];
}
function RecordKey2(type) {
  const pattern = RecordPattern(type);
  return pattern === PatternStringExact ? String2() : pattern === PatternNumberExact ? Number2() : String2({ pattern });
}
function RecordValue2(type) {
  return type.patternProperties[RecordPattern(type)];
}

// ../../node_modules/@sinclair/typebox/build/esm/type/instantiate/instantiate.mjs
function FromConstructor7(args, type) {
  type.parameters = FromTypes(args, type.parameters);
  type.returns = FromType(args, type.returns);
  return type;
}
function FromFunction6(args, type) {
  type.parameters = FromTypes(args, type.parameters);
  type.returns = FromType(args, type.returns);
  return type;
}
function FromIntersect15(args, type) {
  type.allOf = FromTypes(args, type.allOf);
  return type;
}
function FromUnion17(args, type) {
  type.anyOf = FromTypes(args, type.anyOf);
  return type;
}
function FromTuple14(args, type) {
  if (IsUndefined2(type.items))
    return type;
  type.items = FromTypes(args, type.items);
  return type;
}
function FromArray16(args, type) {
  type.items = FromType(args, type.items);
  return type;
}
function FromAsyncIterator6(args, type) {
  type.items = FromType(args, type.items);
  return type;
}
function FromIterator6(args, type) {
  type.items = FromType(args, type.items);
  return type;
}
function FromPromise7(args, type) {
  type.item = FromType(args, type.item);
  return type;
}
function FromObject13(args, type) {
  const mappedProperties = FromProperties11(args, type.properties);
  return { ...type, ...Object2(mappedProperties) };
}
function FromRecord12(args, type) {
  const mappedKey = FromType(args, RecordKey2(type));
  const mappedValue = FromType(args, RecordValue2(type));
  const result = Record(mappedKey, mappedValue);
  return { ...type, ...result };
}
function FromArgument4(args, argument) {
  return argument.index in args ? args[argument.index] : Unknown();
}
function FromProperty2(args, type) {
  const isReadonly = IsReadonly(type);
  const isOptional = IsOptional(type);
  const mapped = FromType(args, type);
  return isReadonly && isOptional ? ReadonlyOptional(mapped) : isReadonly && !isOptional ? Readonly(mapped) : !isReadonly && isOptional ? Optional(mapped) : mapped;
}
function FromProperties11(args, properties) {
  return globalThis.Object.getOwnPropertyNames(properties).reduce((result, key) => {
    return { ...result, [key]: FromProperty2(args, properties[key]) };
  }, {});
}
function FromTypes(args, types) {
  return types.map((type) => FromType(args, type));
}
function FromType(args, type) {
  return IsConstructor(type) ? FromConstructor7(args, type) : IsFunction3(type) ? FromFunction6(args, type) : IsIntersect(type) ? FromIntersect15(args, type) : IsUnion(type) ? FromUnion17(args, type) : IsTuple(type) ? FromTuple14(args, type) : IsArray3(type) ? FromArray16(args, type) : IsAsyncIterator3(type) ? FromAsyncIterator6(args, type) : IsIterator3(type) ? FromIterator6(args, type) : IsPromise2(type) ? FromPromise7(args, type) : IsObject3(type) ? FromObject13(args, type) : IsRecord(type) ? FromRecord12(args, type) : IsArgument(type) ? FromArgument4(args, type) : type;
}
function Instantiate(type, args) {
  return FromType(args, CloneType(type));
}

// ../../node_modules/@sinclair/typebox/build/esm/type/integer/integer.mjs
function Integer(options) {
  return CreateType({ [Kind]: "Integer", type: "integer" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic-from-mapped-key.mjs
function MappedIntrinsicPropertyKey(K, M, options) {
  return {
    [K]: Intrinsic(Literal(K), M, Clone(options))
  };
}
function MappedIntrinsicPropertyKeys(K, M, options) {
  const result = K.reduce((Acc, L) => {
    return { ...Acc, ...MappedIntrinsicPropertyKey(L, M, options) };
  }, {});
  return result;
}
function MappedIntrinsicProperties(T, M, options) {
  return MappedIntrinsicPropertyKeys(T["keys"], M, options);
}
function IntrinsicFromMappedKey(T, M, options) {
  const P = MappedIntrinsicProperties(T, M, options);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic.mjs
function ApplyUncapitalize(value) {
  const [first, rest] = [value.slice(0, 1), value.slice(1)];
  return [first.toLowerCase(), rest].join("");
}
function ApplyCapitalize(value) {
  const [first, rest] = [value.slice(0, 1), value.slice(1)];
  return [first.toUpperCase(), rest].join("");
}
function ApplyUppercase(value) {
  return value.toUpperCase();
}
function ApplyLowercase(value) {
  return value.toLowerCase();
}
function FromTemplateLiteral6(schema, mode, options) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  const finite = IsTemplateLiteralExpressionFinite(expression);
  if (!finite)
    return { ...schema, pattern: FromLiteralValue(schema.pattern, mode) };
  const strings = [...TemplateLiteralExpressionGenerate(expression)];
  const literals = strings.map((value) => Literal(value));
  const mapped = FromRest5(literals, mode);
  const union = Union(mapped);
  return TemplateLiteral([union], options);
}
function FromLiteralValue(value, mode) {
  return typeof value === "string" ? mode === "Uncapitalize" ? ApplyUncapitalize(value) : mode === "Capitalize" ? ApplyCapitalize(value) : mode === "Uppercase" ? ApplyUppercase(value) : mode === "Lowercase" ? ApplyLowercase(value) : value : value.toString();
}
function FromRest5(T, M) {
  return T.map((L) => Intrinsic(L, M));
}
function Intrinsic(schema, mode, options = {}) {
  return IsMappedKey(schema) ? IntrinsicFromMappedKey(schema, mode, options) : IsTemplateLiteral(schema) ? FromTemplateLiteral6(schema, mode, options) : IsUnion(schema) ? Union(FromRest5(schema.anyOf, mode), options) : IsLiteral(schema) ? Literal(FromLiteralValue(schema.const, mode), options) : CreateType(schema, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/capitalize.mjs
function Capitalize(T, options = {}) {
  return Intrinsic(T, "Capitalize", options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/lowercase.mjs
function Lowercase(T, options = {}) {
  return Intrinsic(T, "Lowercase", options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/uncapitalize.mjs
function Uncapitalize(T, options = {}) {
  return Intrinsic(T, "Uncapitalize", options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/intrinsic/uppercase.mjs
function Uppercase(T, options = {}) {
  return Intrinsic(T, "Uppercase", options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-result.mjs
function FromProperties12(properties, propertyKeys, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = Omit(properties[K2], propertyKeys, Clone(options));
  return result;
}
function FromMappedResult9(mappedResult, propertyKeys, options) {
  return FromProperties12(mappedResult.properties, propertyKeys, options);
}
function OmitFromMappedResult(mappedResult, propertyKeys, options) {
  const properties = FromMappedResult9(mappedResult, propertyKeys, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/omit/omit.mjs
function FromIntersect16(types, propertyKeys) {
  return types.map((type) => OmitResolve(type, propertyKeys));
}
function FromUnion18(types, propertyKeys) {
  return types.map((type) => OmitResolve(type, propertyKeys));
}
function FromProperty3(properties, key) {
  const { [key]: _, ...R } = properties;
  return R;
}
function FromProperties13(properties, propertyKeys) {
  return propertyKeys.reduce((T, K2) => FromProperty3(T, K2), properties);
}
function FromObject14(type, propertyKeys, properties) {
  const options = Discard(type, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties13(properties, propertyKeys);
  return Object2(mappedProperties, options);
}
function UnionFromPropertyKeys(propertyKeys) {
  const result = propertyKeys.reduce((result2, key) => IsLiteralValue(key) ? [...result2, Literal(key)] : result2, []);
  return Union(result);
}
function OmitResolve(type, propertyKeys) {
  return IsIntersect(type) ? Intersect(FromIntersect16(type.allOf, propertyKeys)) : IsUnion(type) ? Union(FromUnion18(type.anyOf, propertyKeys)) : IsObject3(type) ? FromObject14(type, propertyKeys, type.properties) : Object2({});
}
function Omit(type, key, options) {
  const typeKey = IsArray2(key) ? UnionFromPropertyKeys(key) : key;
  const propertyKeys = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const isTypeRef = IsRef(type);
  const isKeyRef = IsRef(key);
  return IsMappedResult(type) ? OmitFromMappedResult(type, propertyKeys, options) : IsMappedKey(key) ? OmitFromMappedKey(type, key, options) : isTypeRef && isKeyRef ? Computed("Omit", [type, typeKey], options) : !isTypeRef && isKeyRef ? Computed("Omit", [type, typeKey], options) : isTypeRef && !isKeyRef ? Computed("Omit", [type, typeKey], options) : CreateType({ ...OmitResolve(type, propertyKeys), ...options });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-key.mjs
function FromPropertyKey2(type, key, options) {
  return { [key]: Omit(type, [key], Clone(options)) };
}
function FromPropertyKeys2(type, propertyKeys, options) {
  return propertyKeys.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey2(type, LK, options) };
  }, {});
}
function FromMappedKey3(type, mappedKey, options) {
  return FromPropertyKeys2(type, mappedKey.keys, options);
}
function OmitFromMappedKey(type, mappedKey, options) {
  const properties = FromMappedKey3(type, mappedKey, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-result.mjs
function FromProperties14(properties, propertyKeys, options) {
  const result = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(properties))
    result[K2] = Pick(properties[K2], propertyKeys, Clone(options));
  return result;
}
function FromMappedResult10(mappedResult, propertyKeys, options) {
  return FromProperties14(mappedResult.properties, propertyKeys, options);
}
function PickFromMappedResult(mappedResult, propertyKeys, options) {
  const properties = FromMappedResult10(mappedResult, propertyKeys, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/pick/pick.mjs
function FromIntersect17(types, propertyKeys) {
  return types.map((type) => PickResolve(type, propertyKeys));
}
function FromUnion19(types, propertyKeys) {
  return types.map((type) => PickResolve(type, propertyKeys));
}
function FromProperties15(properties, propertyKeys) {
  const result = {};
  for (const K2 of propertyKeys)
    if (K2 in properties)
      result[K2] = properties[K2];
  return result;
}
function FromObject15(Type, keys, properties) {
  const options = Discard(Type, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties15(properties, keys);
  return Object2(mappedProperties, options);
}
function UnionFromPropertyKeys2(propertyKeys) {
  const result = propertyKeys.reduce((result2, key) => IsLiteralValue(key) ? [...result2, Literal(key)] : result2, []);
  return Union(result);
}
function PickResolve(type, propertyKeys) {
  return IsIntersect(type) ? Intersect(FromIntersect17(type.allOf, propertyKeys)) : IsUnion(type) ? Union(FromUnion19(type.anyOf, propertyKeys)) : IsObject3(type) ? FromObject15(type, propertyKeys, type.properties) : Object2({});
}
function Pick(type, key, options) {
  const typeKey = IsArray2(key) ? UnionFromPropertyKeys2(key) : key;
  const propertyKeys = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const isTypeRef = IsRef(type);
  const isKeyRef = IsRef(key);
  return IsMappedResult(type) ? PickFromMappedResult(type, propertyKeys, options) : IsMappedKey(key) ? PickFromMappedKey(type, key, options) : isTypeRef && isKeyRef ? Computed("Pick", [type, typeKey], options) : !isTypeRef && isKeyRef ? Computed("Pick", [type, typeKey], options) : isTypeRef && !isKeyRef ? Computed("Pick", [type, typeKey], options) : CreateType({ ...PickResolve(type, propertyKeys), ...options });
}

// ../../node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-key.mjs
function FromPropertyKey3(type, key, options) {
  return {
    [key]: Pick(type, [key], Clone(options))
  };
}
function FromPropertyKeys3(type, propertyKeys, options) {
  return propertyKeys.reduce((result, leftKey) => {
    return { ...result, ...FromPropertyKey3(type, leftKey, options) };
  }, {});
}
function FromMappedKey4(type, mappedKey, options) {
  return FromPropertyKeys3(type, mappedKey.keys, options);
}
function PickFromMappedKey(type, mappedKey, options) {
  const properties = FromMappedKey4(type, mappedKey, options);
  return MappedResult(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/partial/partial.mjs
function FromComputed3(target, parameters) {
  return Computed("Partial", [Computed(target, parameters)]);
}
function FromRef13($ref) {
  return Computed("Partial", [Ref($ref)]);
}
function FromProperties16(properties) {
  const partialProperties = {};
  for (const K of globalThis.Object.getOwnPropertyNames(properties))
    partialProperties[K] = Optional(properties[K]);
  return partialProperties;
}
function FromObject16(type, properties) {
  const options = Discard(type, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties16(properties);
  return Object2(mappedProperties, options);
}
function FromRest6(types) {
  return types.map((type) => PartialResolve(type));
}
function PartialResolve(type) {
  return IsComputed(type) ? FromComputed3(type.target, type.parameters) : IsRef(type) ? FromRef13(type.$ref) : IsIntersect(type) ? Intersect(FromRest6(type.allOf)) : IsUnion(type) ? Union(FromRest6(type.anyOf)) : IsObject3(type) ? FromObject16(type, type.properties) : IsBigInt3(type) ? type : IsBoolean3(type) ? type : IsInteger2(type) ? type : IsLiteral(type) ? type : IsNull3(type) ? type : IsNumber3(type) ? type : IsString3(type) ? type : IsSymbol3(type) ? type : IsUndefined3(type) ? type : Object2({});
}
function Partial(type, options) {
  if (IsMappedResult(type)) {
    return PartialFromMappedResult(type, options);
  } else {
    return CreateType({ ...PartialResolve(type), ...options });
  }
}

// ../../node_modules/@sinclair/typebox/build/esm/type/partial/partial-from-mapped-result.mjs
function FromProperties17(K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Partial(K[K2], Clone(options));
  return Acc;
}
function FromMappedResult11(R, options) {
  return FromProperties17(R.properties, options);
}
function PartialFromMappedResult(R, options) {
  const P = FromMappedResult11(R, options);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/required/required.mjs
function FromComputed4(target, parameters) {
  return Computed("Required", [Computed(target, parameters)]);
}
function FromRef14($ref) {
  return Computed("Required", [Ref($ref)]);
}
function FromProperties18(properties) {
  const requiredProperties = {};
  for (const K of globalThis.Object.getOwnPropertyNames(properties))
    requiredProperties[K] = Discard(properties[K], [OptionalKind]);
  return requiredProperties;
}
function FromObject17(type, properties) {
  const options = Discard(type, [TransformKind, "$id", "required", "properties"]);
  const mappedProperties = FromProperties18(properties);
  return Object2(mappedProperties, options);
}
function FromRest7(types) {
  return types.map((type) => RequiredResolve(type));
}
function RequiredResolve(type) {
  return IsComputed(type) ? FromComputed4(type.target, type.parameters) : IsRef(type) ? FromRef14(type.$ref) : IsIntersect(type) ? Intersect(FromRest7(type.allOf)) : IsUnion(type) ? Union(FromRest7(type.anyOf)) : IsObject3(type) ? FromObject17(type, type.properties) : IsBigInt3(type) ? type : IsBoolean3(type) ? type : IsInteger2(type) ? type : IsLiteral(type) ? type : IsNull3(type) ? type : IsNumber3(type) ? type : IsString3(type) ? type : IsSymbol3(type) ? type : IsUndefined3(type) ? type : Object2({});
}
function Required(type, options) {
  if (IsMappedResult(type)) {
    return RequiredFromMappedResult(type, options);
  } else {
    return CreateType({ ...RequiredResolve(type), ...options });
  }
}

// ../../node_modules/@sinclair/typebox/build/esm/type/required/required-from-mapped-result.mjs
function FromProperties19(P, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Required(P[K2], options);
  return Acc;
}
function FromMappedResult12(R, options) {
  return FromProperties19(R.properties, options);
}
function RequiredFromMappedResult(R, options) {
  const P = FromMappedResult12(R, options);
  return MappedResult(P);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/module/compute.mjs
function DereferenceParameters(moduleProperties, types) {
  return types.map((type) => {
    return IsRef(type) ? Dereference(moduleProperties, type.$ref) : FromType2(moduleProperties, type);
  });
}
function Dereference(moduleProperties, ref) {
  return ref in moduleProperties ? IsRef(moduleProperties[ref]) ? Dereference(moduleProperties, moduleProperties[ref].$ref) : FromType2(moduleProperties, moduleProperties[ref]) : Never();
}
function FromAwaited(parameters) {
  return Awaited(parameters[0]);
}
function FromIndex(parameters) {
  return Index(parameters[0], parameters[1]);
}
function FromKeyOf(parameters) {
  return KeyOf(parameters[0]);
}
function FromPartial(parameters) {
  return Partial(parameters[0]);
}
function FromOmit(parameters) {
  return Omit(parameters[0], parameters[1]);
}
function FromPick(parameters) {
  return Pick(parameters[0], parameters[1]);
}
function FromRequired(parameters) {
  return Required(parameters[0]);
}
function FromComputed5(moduleProperties, target, parameters) {
  const dereferenced = DereferenceParameters(moduleProperties, parameters);
  return target === "Awaited" ? FromAwaited(dereferenced) : target === "Index" ? FromIndex(dereferenced) : target === "KeyOf" ? FromKeyOf(dereferenced) : target === "Partial" ? FromPartial(dereferenced) : target === "Omit" ? FromOmit(dereferenced) : target === "Pick" ? FromPick(dereferenced) : target === "Required" ? FromRequired(dereferenced) : Never();
}
function FromArray17(moduleProperties, type) {
  return Array2(FromType2(moduleProperties, type));
}
function FromAsyncIterator7(moduleProperties, type) {
  return AsyncIterator(FromType2(moduleProperties, type));
}
function FromConstructor8(moduleProperties, parameters, instanceType) {
  return Constructor(FromTypes2(moduleProperties, parameters), FromType2(moduleProperties, instanceType));
}
function FromFunction7(moduleProperties, parameters, returnType) {
  return Function2(FromTypes2(moduleProperties, parameters), FromType2(moduleProperties, returnType));
}
function FromIntersect18(moduleProperties, types) {
  return Intersect(FromTypes2(moduleProperties, types));
}
function FromIterator7(moduleProperties, type) {
  return Iterator(FromType2(moduleProperties, type));
}
function FromObject18(moduleProperties, properties) {
  return Object2(globalThis.Object.keys(properties).reduce((result, key) => {
    return { ...result, [key]: FromType2(moduleProperties, properties[key]) };
  }, {}));
}
function FromRecord13(moduleProperties, type) {
  const [value, pattern] = [FromType2(moduleProperties, RecordValue2(type)), RecordPattern(type)];
  const result = CloneType(type);
  result.patternProperties[pattern] = value;
  return result;
}
function FromTransform(moduleProperties, transform2) {
  return IsRef(transform2) ? { ...Dereference(moduleProperties, transform2.$ref), [TransformKind]: transform2[TransformKind] } : transform2;
}
function FromTuple15(moduleProperties, types) {
  return Tuple(FromTypes2(moduleProperties, types));
}
function FromUnion20(moduleProperties, types) {
  return Union(FromTypes2(moduleProperties, types));
}
function FromTypes2(moduleProperties, types) {
  return types.map((type) => FromType2(moduleProperties, type));
}
function FromType2(moduleProperties, type) {
  return IsOptional(type) ? CreateType(FromType2(moduleProperties, Discard(type, [OptionalKind])), type) : IsReadonly(type) ? CreateType(FromType2(moduleProperties, Discard(type, [ReadonlyKind])), type) : IsTransform(type) ? CreateType(FromTransform(moduleProperties, type), type) : IsArray3(type) ? CreateType(FromArray17(moduleProperties, type.items), type) : IsAsyncIterator3(type) ? CreateType(FromAsyncIterator7(moduleProperties, type.items), type) : IsComputed(type) ? CreateType(FromComputed5(moduleProperties, type.target, type.parameters)) : IsConstructor(type) ? CreateType(FromConstructor8(moduleProperties, type.parameters, type.returns), type) : IsFunction3(type) ? CreateType(FromFunction7(moduleProperties, type.parameters, type.returns), type) : IsIntersect(type) ? CreateType(FromIntersect18(moduleProperties, type.allOf), type) : IsIterator3(type) ? CreateType(FromIterator7(moduleProperties, type.items), type) : IsObject3(type) ? CreateType(FromObject18(moduleProperties, type.properties), type) : IsRecord(type) ? CreateType(FromRecord13(moduleProperties, type)) : IsTuple(type) ? CreateType(FromTuple15(moduleProperties, type.items || []), type) : IsUnion(type) ? CreateType(FromUnion20(moduleProperties, type.anyOf), type) : type;
}
function ComputeType(moduleProperties, key) {
  return key in moduleProperties ? FromType2(moduleProperties, moduleProperties[key]) : Never();
}
function ComputeModuleProperties(moduleProperties) {
  return globalThis.Object.getOwnPropertyNames(moduleProperties).reduce((result, key) => {
    return { ...result, [key]: ComputeType(moduleProperties, key) };
  }, {});
}

// ../../node_modules/@sinclair/typebox/build/esm/type/module/module.mjs
class TModule {
  constructor($defs) {
    const computed = ComputeModuleProperties($defs);
    const identified = this.WithIdentifiers(computed);
    this.$defs = identified;
  }
  Import(key, options) {
    const $defs = { ...this.$defs, [key]: CreateType(this.$defs[key], options) };
    return CreateType({ [Kind]: "Import", $defs, $ref: key });
  }
  WithIdentifiers($defs) {
    return globalThis.Object.getOwnPropertyNames($defs).reduce((result, key) => {
      return { ...result, [key]: { ...$defs[key], $id: key } };
    }, {});
  }
}
function Module(properties) {
  return new TModule(properties);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/not/not.mjs
function Not2(type, options) {
  return CreateType({ [Kind]: "Not", not: type }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/parameters/parameters.mjs
function Parameters(schema, options) {
  return IsFunction3(schema) ? Tuple(schema.parameters, options) : Never();
}

// ../../node_modules/@sinclair/typebox/build/esm/type/recursive/recursive.mjs
var Ordinal = 0;
function Recursive(callback, options = {}) {
  if (IsUndefined2(options.$id))
    options.$id = `T${Ordinal++}`;
  const thisType = CloneType(callback({ [Kind]: "This", $ref: `${options.$id}` }));
  thisType.$id = options.$id;
  return CreateType({ [Hint]: "Recursive", ...thisType }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/regexp/regexp.mjs
function RegExp2(unresolved, options) {
  const expr = IsString2(unresolved) ? new globalThis.RegExp(unresolved) : unresolved;
  return CreateType({ [Kind]: "RegExp", type: "RegExp", source: expr.source, flags: expr.flags }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/rest/rest.mjs
function RestResolve(T) {
  return IsIntersect(T) ? T.allOf : IsUnion(T) ? T.anyOf : IsTuple(T) ? T.items ?? [] : [];
}
function Rest(T) {
  return RestResolve(T);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/return-type/return-type.mjs
function ReturnType(schema, options) {
  return IsFunction3(schema) ? CreateType(schema.returns, options) : Never(options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/transform/transform.mjs
class TransformDecodeBuilder {
  constructor(schema) {
    this.schema = schema;
  }
  Decode(decode2) {
    return new TransformEncodeBuilder(this.schema, decode2);
  }
}

class TransformEncodeBuilder {
  constructor(schema, decode2) {
    this.schema = schema;
    this.decode = decode2;
  }
  EncodeTransform(encode2, schema) {
    const Encode2 = (value) => schema[TransformKind].Encode(encode2(value));
    const Decode2 = (value) => this.decode(schema[TransformKind].Decode(value));
    const Codec = { Encode: Encode2, Decode: Decode2 };
    return { ...schema, [TransformKind]: Codec };
  }
  EncodeSchema(encode2, schema) {
    const Codec = { Decode: this.decode, Encode: encode2 };
    return { ...schema, [TransformKind]: Codec };
  }
  Encode(encode2) {
    return IsTransform(this.schema) ? this.EncodeTransform(encode2, this.schema) : this.EncodeSchema(encode2, this.schema);
  }
}
function Transform(schema) {
  return new TransformDecodeBuilder(schema);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/void/void.mjs
function Void(options) {
  return CreateType({ [Kind]: "Void", type: "void" }, options);
}

// ../../node_modules/@sinclair/typebox/build/esm/type/type/type.mjs
var exports_type3 = {};
__export(exports_type3, {
  Void: () => Void,
  Uppercase: () => Uppercase,
  Unsafe: () => Unsafe,
  Unknown: () => Unknown,
  Union: () => Union,
  Undefined: () => Undefined,
  Uncapitalize: () => Uncapitalize,
  Uint8Array: () => Uint8Array2,
  Tuple: () => Tuple,
  Transform: () => Transform,
  TemplateLiteral: () => TemplateLiteral,
  Symbol: () => Symbol2,
  String: () => String2,
  ReturnType: () => ReturnType,
  Rest: () => Rest,
  Required: () => Required,
  RegExp: () => RegExp2,
  Ref: () => Ref,
  Recursive: () => Recursive,
  Record: () => Record,
  ReadonlyOptional: () => ReadonlyOptional,
  Readonly: () => Readonly,
  Promise: () => Promise2,
  Pick: () => Pick,
  Partial: () => Partial,
  Parameters: () => Parameters,
  Optional: () => Optional,
  Omit: () => Omit,
  Object: () => Object2,
  Number: () => Number2,
  Null: () => Null,
  Not: () => Not2,
  Never: () => Never,
  Module: () => Module,
  Mapped: () => Mapped,
  Lowercase: () => Lowercase,
  Literal: () => Literal,
  KeyOf: () => KeyOf,
  Iterator: () => Iterator,
  Intersect: () => Intersect,
  Integer: () => Integer,
  Instantiate: () => Instantiate,
  InstanceType: () => InstanceType,
  Index: () => Index,
  Function: () => Function2,
  Extract: () => Extract,
  Extends: () => Extends,
  Exclude: () => Exclude,
  Enum: () => Enum,
  Date: () => Date2,
  ConstructorParameters: () => ConstructorParameters,
  Constructor: () => Constructor,
  Const: () => Const,
  Composite: () => Composite,
  Capitalize: () => Capitalize,
  Boolean: () => Boolean2,
  BigInt: () => BigInt2,
  Awaited: () => Awaited,
  AsyncIterator: () => AsyncIterator,
  Array: () => Array2,
  Argument: () => Argument,
  Any: () => Any
});

// ../../node_modules/@sinclair/typebox/build/esm/type/type/index.mjs
var Type = exports_type3;

// src/protocol.ts
var WorkerOperationSchema = Type.Union([
  Type.Literal("profiles.list"),
  Type.Literal("request.execute"),
  Type.Literal("download.execute"),
  Type.Literal("session.create"),
  Type.Literal("session.list"),
  Type.Literal("session.close"),
  Type.Literal("websocket.connect"),
  Type.Literal("websocket.send"),
  Type.Literal("websocket.receive"),
  Type.Literal("websocket.close"),
  Type.Literal("diagnostic.fingerprint"),
  Type.Literal("system.shutdown")
]);
var WorkerRequestSchema = Type.Object({
  id: Type.String(),
  operation: WorkerOperationSchema,
  params: Type.Record(Type.String(), Type.Unknown())
}, { additionalProperties: false });
var WorkerErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  retryable: Type.Boolean(),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
}, { additionalProperties: false });
var WorkerSuccessSchema = Type.Object({
  id: Type.String(),
  ok: Type.Literal(true),
  result: Type.Unknown()
}, { additionalProperties: false });
var WorkerFailureSchema = Type.Object({
  id: Type.String(),
  ok: Type.Literal(false),
  error: WorkerErrorSchema
}, { additionalProperties: false });
var WorkerResponseSchema = Type.Union([
  WorkerSuccessSchema,
  WorkerFailureSchema
]);

// src/worker-client.ts
var DEFAULT_DIAGNOSTIC_BYTES = 16 * 1024;
var MAX_PROTOCOL_LINE_BYTES = 10 * 1024 * 1024;
var DEFAULT_SHUTDOWN_TIMEOUT_MS = 2000;
var STABLE_WORKER_ERROR_CODES = new Set([
  "destination_exists",
  "duplicate_request_id",
  "file_error",
  "internal_error",
  "invalid_destination",
  "invalid_params",
  "invalid_profile",
  "invalid_request",
  "invalid_upload",
  "invalid_url",
  "malformed_json",
  "network_error",
  "request_cancelled",
  "timeout",
  "unknown_operation",
  "unknown_session",
  "unknown_websocket",
  "worker_error"
]);

class WorkerCallError extends Error {
  code;
  retryable;
  constructor(code, retryable) {
    super(`Worker operation failed (${safeCode(code)})`);
    this.name = "WorkerCallError";
    this.code = safeCode(code);
    this.retryable = retryable;
  }
}

class WorkerClient {
  command;
  args;
  cwd;
  env;
  maxDiagnosticBytes;
  shutdownTimeoutMs;
  child;
  startPromise;
  stopPromise;
  pending = new Map;
  stdoutBuffer = "";
  diagnosticTail = Buffer.alloc(0);
  crashCount = 0;
  failedPermanently = false;
  stopping = false;
  constructor(options = {}) {
    const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    this.command = options.command ?? resolvePythonCommand(packageRoot);
    this.args = options.args ? [...options.args] : ["-m", "decent_curl_impersonate"];
    this.cwd = options.cwd ?? packageRoot;
    this.env = options.env ?? process.env;
    this.maxDiagnosticBytes = options.maxDiagnosticBytes ?? DEFAULT_DIAGNOSTIC_BYTES;
    this.shutdownTimeoutMs = options.shutdownTimeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS;
  }
  async start() {
    if (this.child)
      return;
    if (this.stopping)
      throw new Error("Worker is shutting down");
    if (this.failedPermanently)
      throw new Error("Worker exited repeatedly and will not restart");
    if (this.startPromise)
      return this.startPromise;
    this.startPromise = new Promise((resolveStart, rejectStart) => {
      const child = spawn(this.command, this.args, {
        cwd: this.cwd,
        env: this.env,
        stdio: ["pipe", "pipe", "pipe"]
      });
      this.child = child;
      this.stdoutBuffer = "";
      this.diagnosticTail = Buffer.alloc(0);
      let spawned = false;
      child.once("spawn", () => {
        spawned = true;
        resolveStart();
      });
      child.once("error", () => {
        const error = new Error("Worker process failed to start");
        if (!spawned)
          rejectStart(error);
        this.handleUnexpectedExit(child, error);
      });
      child.once("exit", (code, signal) => {
        const suffix = signal ? ` (${signal})` : code === null ? "" : ` (code ${code})`;
        this.handleUnexpectedExit(child, new Error(`Worker process exited${suffix}`));
      });
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => this.handleStdout(child, chunk));
      child.stderr.on("data", (chunk) => this.captureDiagnostic(chunk));
    }).finally(() => {
      this.startPromise = undefined;
    });
    return this.startPromise;
  }
  async call(operation, params, signal) {
    if (signal?.aborted)
      throw cancellationError();
    await this.start();
    if (signal?.aborted)
      throw cancellationError();
    const child = this.child;
    if (!child)
      throw new Error("Worker process exited before the operation started");
    return this.send(child, operation, params, signal);
  }
  async stop() {
    if (this.stopPromise)
      return this.stopPromise;
    this.stopPromise = this.stopInternal().finally(() => {
      this.stopPromise = undefined;
    });
    return this.stopPromise;
  }
  async stopInternal() {
    const child = this.child;
    if (!child) {
      this.resetAfterStop();
      return;
    }
    this.stopping = true;
    try {
      const shutdown = this.send(child, "system.shutdown", {}, undefined);
      await withTimeout(shutdown, this.shutdownTimeoutMs);
      await this.waitForExit(child, this.shutdownTimeoutMs);
    } catch {
      if (child.exitCode === null && child.signalCode === null)
        child.kill();
      await this.waitForExit(child, this.shutdownTimeoutMs).catch(() => {
        return;
      });
    } finally {
      if (this.child === child)
        this.child = undefined;
      this.rejectAll(new Error("Worker stopped"));
      this.resetAfterStop();
    }
  }
  resetAfterStop() {
    this.stopping = false;
    this.crashCount = 0;
    this.failedPermanently = false;
    this.stdoutBuffer = "";
    this.diagnosticTail = Buffer.alloc(0);
  }
  send(child, operation, params, signal) {
    const id = randomUUID();
    return new Promise((resolveCall, rejectCall) => {
      const pending = { resolve: resolveCall, reject: rejectCall };
      if (signal) {
        const onAbort = () => {
          const active = this.pending.get(id);
          if (!active)
            return;
          this.pending.delete(id);
          active.removeAbortListener?.();
          rejectCall(cancellationError());
        };
        signal.addEventListener("abort", onAbort, { once: true });
        pending.removeAbortListener = () => signal.removeEventListener("abort", onAbort);
      }
      this.pending.set(id, pending);
      const payload = JSON.stringify({ id, operation, params });
      child.stdin.write(`${payload}
`, (error) => {
        if (!error)
          return;
        const active = this.pending.get(id);
        if (!active)
          return;
        this.pending.delete(id);
        active.removeAbortListener?.();
        active.reject(new Error("Unable to send operation to worker"));
      });
    });
  }
  handleStdout(child, chunk) {
    if (this.child !== child)
      return;
    this.stdoutBuffer += chunk;
    if (Buffer.byteLength(this.stdoutBuffer) > MAX_PROTOCOL_LINE_BYTES && !this.stdoutBuffer.includes(`
`)) {
      this.protocolFailure(child);
      return;
    }
    let newline = this.stdoutBuffer.indexOf(`
`);
    while (newline !== -1) {
      const line = this.stdoutBuffer.slice(0, newline).replace(/\r$/, "");
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (line.length > 0 && !this.handleLine(line)) {
        this.protocolFailure(child);
        return;
      }
      newline = this.stdoutBuffer.indexOf(`
`);
    }
  }
  handleLine(line) {
    let response;
    try {
      const value = JSON.parse(line);
      if (!exports_value2.Check(WorkerResponseSchema, value))
        return false;
      response = value;
    } catch {
      return false;
    }
    const pending = this.pending.get(response.id);
    if (!pending)
      return true;
    this.pending.delete(response.id);
    pending.removeAbortListener?.();
    if (response.ok)
      pending.resolve(response.result);
    else
      pending.reject(new WorkerCallError(response.error.code, response.error.retryable));
    return true;
  }
  protocolFailure(child) {
    this.handleUnexpectedExit(child, new Error("Worker emitted malformed output"));
    if (child.exitCode === null && child.signalCode === null)
      child.kill();
  }
  handleUnexpectedExit(child, error) {
    if (this.child !== child)
      return;
    this.child = undefined;
    this.stdoutBuffer = "";
    this.rejectAll(error);
    if (!this.stopping) {
      this.crashCount += 1;
      if (this.crashCount >= 2)
        this.failedPermanently = true;
    }
  }
  rejectAll(error) {
    const calls = [...this.pending.values()];
    this.pending.clear();
    for (const pending of calls) {
      pending.removeAbortListener?.();
      pending.reject(error);
    }
  }
  captureDiagnostic(chunk) {
    if (this.maxDiagnosticBytes <= 0)
      return;
    this.diagnosticTail = Buffer.concat([this.diagnosticTail, chunk]);
    if (this.diagnosticTail.byteLength > this.maxDiagnosticBytes) {
      this.diagnosticTail = this.diagnosticTail.subarray(this.diagnosticTail.byteLength - this.maxDiagnosticBytes);
    }
  }
  async waitForExit(child, timeoutMs) {
    if (child.exitCode !== null || child.signalCode !== null || this.child !== child)
      return;
    await withTimeout(new Promise((resolveExit) => child.once("exit", () => resolveExit())), timeoutMs);
  }
}
function resolvePythonCommand(packageRoot) {
  const configured = process.env.DECENT_CURL_PYTHON;
  if (configured)
    return configured;
  const candidate = process.platform === "win32" ? resolve(packageRoot, ".venv", "Scripts", "python.exe") : resolve(packageRoot, ".venv", "bin", "python");
  return candidate;
}
function cancellationError() {
  return new DOMException("Worker call cancelled", "AbortError");
}
function safeCode(code) {
  return STABLE_WORKER_ERROR_CODES.has(code) ? code : "worker_error";
}
async function withTimeout(promise, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Worker operation timed out")), timeoutMs);
      })
    ]);
  } finally {
    if (timer)
      clearTimeout(timer);
  }
}

// src/tools.ts
import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead
} from "@earendil-works/pi-coding-agent";

// ../../node_modules/typebox/build/system/memory/memory.mjs
var exports_memory = {};
__export(exports_memory, {
  Update: () => Update2,
  Metrics: () => Metrics,
  Discard: () => Discard2,
  Create: () => Create3,
  Clone: () => Clone3,
  Assign: () => Assign
});

// ../../node_modules/typebox/build/system/memory/metrics.mjs
var Metrics = {
  assign: 0,
  create: 0,
  clone: 0,
  discard: 0,
  update: 0
};

// ../../node_modules/typebox/build/system/memory/assign.mjs
function Assign(left, right) {
  Metrics.assign += 1;
  return { ...left, ...right };
}
// ../../node_modules/typebox/build/guard/guard.mjs
var exports_guard = {};
__export(exports_guard, {
  Values: () => Values,
  TakeLeft: () => TakeLeft,
  Symbols: () => Symbols,
  Keys: () => Keys,
  IsValueLike: () => IsValueLike,
  IsUnsafePropertyKey: () => IsUnsafePropertyKey,
  IsUndefined: () => IsUndefined5,
  IsSymbol: () => IsSymbol5,
  IsString: () => IsString5,
  IsObjectNotArray: () => IsObjectNotArray,
  IsObject: () => IsObject5,
  IsNumber: () => IsNumber5,
  IsNull: () => IsNull5,
  IsMultipleOf: () => IsMultipleOf,
  IsMinLength: () => IsMinLength2,
  IsMaxLength: () => IsMaxLength2,
  IsLessThan: () => IsLessThan,
  IsLessEqualThan: () => IsLessEqualThan,
  IsIterator: () => IsIterator5,
  IsInteger: () => IsInteger4,
  IsGreaterThan: () => IsGreaterThan,
  IsGreaterEqualThan: () => IsGreaterEqualThan,
  IsFunction: () => IsFunction5,
  IsEqual: () => IsEqual,
  IsDeepEqual: () => IsDeepEqual,
  IsConstructor: () => IsConstructor3,
  IsClassInstance: () => IsClassInstance,
  IsBoolean: () => IsBoolean5,
  IsBigInt: () => IsBigInt5,
  IsAsyncIterator: () => IsAsyncIterator5,
  IsArray: () => IsArray5,
  HasPropertyKey: () => HasPropertyKey3,
  GraphemeCount: () => GraphemeCount2,
  EveryAll: () => EveryAll,
  Every: () => Every,
  EntriesRegExp: () => EntriesRegExp,
  Entries: () => Entries3
});

// ../../node_modules/typebox/build/guard/string.mjs
function IsBetween(value, min, max) {
  return value >= min && value <= max;
}
function IsRegionalIndicator(value) {
  return IsBetween(value, 127462, 127487);
}
function IsVariationSelector(value) {
  return IsBetween(value, 65024, 65039);
}
function IsCombiningMark(value) {
  return IsBetween(value, 768, 879) || IsBetween(value, 6832, 6911) || IsBetween(value, 7616, 7679) || IsBetween(value, 65056, 65071);
}
function CodePointLength(value) {
  return value > 65535 ? 2 : 1;
}
function ConsumeModifiers(value, index) {
  while (index < value.length) {
    const point = value.codePointAt(index);
    if (IsCombiningMark(point) || IsVariationSelector(point)) {
      index += CodePointLength(point);
    } else {
      break;
    }
  }
  return index;
}
function NextGraphemeClusterIndex(value, clusterStart) {
  const startCP = value.codePointAt(clusterStart);
  let clusterEnd = clusterStart + CodePointLength(startCP);
  clusterEnd = ConsumeModifiers(value, clusterEnd);
  while (clusterEnd < value.length - 1 && value[clusterEnd] === "‍") {
    const nextCP = value.codePointAt(clusterEnd + 1);
    clusterEnd += 1 + CodePointLength(nextCP);
    clusterEnd = ConsumeModifiers(value, clusterEnd);
  }
  if (IsRegionalIndicator(startCP) && clusterEnd < value.length && IsRegionalIndicator(value.codePointAt(clusterEnd))) {
    clusterEnd += CodePointLength(value.codePointAt(clusterEnd));
  }
  return clusterEnd;
}
function IsGraphemeCodePoint(value) {
  return IsBetween(value, 55296, 56319) || IsBetween(value, 768, 879) || value === 8205;
}
function GraphemeCount(value) {
  let count = 0;
  let index = 0;
  while (index < value.length) {
    index = NextGraphemeClusterIndex(value, index);
    count++;
  }
  return count;
}
function IsMinLength(value, minLength) {
  if (minLength === 0)
    return true;
  let count = 0;
  let index = 0;
  while (index < value.length) {
    index = NextGraphemeClusterIndex(value, index);
    count++;
    if (count >= minLength)
      return true;
  }
  return false;
}
function IsMaxLength(value, maxLength) {
  let count = 0;
  let index = 0;
  while (index < value.length) {
    index = NextGraphemeClusterIndex(value, index);
    count++;
    if (count > maxLength)
      return false;
  }
  return true;
}
function IsMinLengthFast(value, minLength) {
  if (minLength === 0)
    return true;
  let index = 0;
  while (index < value.length) {
    if (IsGraphemeCodePoint(value.charCodeAt(index))) {
      return IsMinLength(value, minLength);
    }
    index++;
    if (index >= minLength)
      return true;
  }
  return false;
}
function IsMaxLengthFast(value, maxLength) {
  let index = 0;
  while (index < value.length) {
    if (IsGraphemeCodePoint(value.charCodeAt(index))) {
      return IsMaxLength(value, maxLength);
    }
    index++;
    if (index > maxLength)
      return false;
  }
  return true;
}

// ../../node_modules/typebox/build/guard/guard.mjs
function IsArray5(value) {
  return Array.isArray(value);
}
function IsAsyncIterator5(value) {
  return IsObject5(value) && Symbol.asyncIterator in value;
}
function IsBigInt5(value) {
  return IsEqual(typeof value, "bigint");
}
function IsBoolean5(value) {
  return IsEqual(typeof value, "boolean");
}
function IsConstructor3(value) {
  if (IsUndefined5(value) || !IsFunction5(value))
    return false;
  const result = Function.prototype.toString.call(value);
  if (/^class\s/.test(result))
    return true;
  if (/\[native code\]/.test(result))
    return true;
  return false;
}
function IsFunction5(value) {
  return IsEqual(typeof value, "function");
}
function IsInteger4(value) {
  return Number.isInteger(value);
}
function IsIterator5(value) {
  return IsObject5(value) && Symbol.iterator in value;
}
function IsNull5(value) {
  return IsEqual(value, null);
}
function IsNumber5(value) {
  return Number.isFinite(value);
}
function IsObjectNotArray(value) {
  return IsObject5(value) && !IsArray5(value);
}
function IsObject5(value) {
  return IsEqual(typeof value, "object") && !IsNull5(value);
}
function IsString5(value) {
  return IsEqual(typeof value, "string");
}
function IsSymbol5(value) {
  return IsEqual(typeof value, "symbol");
}
function IsUndefined5(value) {
  return IsEqual(value, undefined);
}
function IsEqual(left, right) {
  return left === right;
}
function IsGreaterThan(left, right) {
  return left > right;
}
function IsLessThan(left, right) {
  return left < right;
}
function IsLessEqualThan(left, right) {
  return left <= right;
}
function IsGreaterEqualThan(left, right) {
  return left >= right;
}
function IsMultipleOf(dividend, divisor) {
  if (IsBigInt5(dividend) || IsBigInt5(divisor)) {
    return BigInt(dividend) % BigInt(divisor) === 0n;
  }
  const tolerance = 0.0000000001;
  if (!IsNumber5(dividend))
    return true;
  if (IsInteger4(dividend) && 1 / divisor % 1 === 0)
    return true;
  const mod = dividend % divisor;
  return Math.min(Math.abs(mod), Math.abs(mod - divisor)) < tolerance;
}
function IsClassInstance(value) {
  if (!IsObject5(value))
    return false;
  const proto = globalThis.Object.getPrototypeOf(value);
  if (IsNull5(proto))
    return false;
  return IsEqual(typeof proto.constructor, "function") && !(IsEqual(proto.constructor, globalThis.Object) || IsEqual(proto.constructor.name, "Object"));
}
function IsValueLike(value) {
  return IsBigInt5(value) || IsBoolean5(value) || IsNull5(value) || IsNumber5(value) || IsString5(value) || IsUndefined5(value);
}
function GraphemeCount2(value) {
  return GraphemeCount(value);
}
function IsMaxLength2(value, length) {
  return IsMaxLengthFast(value, length);
}
function IsMinLength2(value, length) {
  return IsMinLengthFast(value, length);
}
function Every(value, offset, callback) {
  for (let index = offset;index < value.length; index++) {
    if (!callback(value[index], index))
      return false;
  }
  return true;
}
function EveryAll(value, offset, callback) {
  let result = true;
  for (let index = offset;index < value.length; index++) {
    if (!callback(value[index], index))
      result = false;
  }
  return result;
}
function TakeLeft(array, true_, false_) {
  return IsEqual(array.length, 0) ? false_() : true_(array[0], array.slice(1));
}
function IsUnsafePropertyKey(key) {
  return IsEqual(key, "__proto__") || IsEqual(key, "constructor") || IsEqual(key, "prototype");
}
function HasPropertyKey3(value, key) {
  return IsUnsafePropertyKey(key) ? Object.prototype.hasOwnProperty.call(value, key) : (key in value);
}
function EntriesRegExp(value) {
  return Keys(value).map((key) => [new RegExp(`^${key}$`), value[key]]);
}
function Entries3(value) {
  return Object.entries(value);
}
function Keys(value) {
  return Object.getOwnPropertyNames(value);
}
function Symbols(value) {
  return Object.getOwnPropertySymbols(value);
}
function Values(value) {
  return Object.values(value);
}
function DeepEqualObject(left, right) {
  if (!IsObject5(right))
    return false;
  const keys = Keys(left);
  return IsEqual(keys.length, Keys(right).length) && keys.every((key) => IsDeepEqual(left[key], right[key]));
}
function DeepEqualArray(left, right) {
  return IsArray5(right) && IsEqual(left.length, right.length) && left.every((_, index) => IsDeepEqual(left[index], right[index]));
}
function IsDeepEqual(left, right) {
  return IsArray5(left) ? DeepEqualArray(left, right) : IsObject5(left) ? DeepEqualObject(left, right) : IsEqual(left, right);
}
// ../../node_modules/typebox/build/system/memory/clone.mjs
function IsGuard(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~guard");
}
function FromGuard(value) {
  return value;
}
function FromArray18(value) {
  return value.map((value2) => FromValue3(value2));
}
function FromObject19(value) {
  const result = {};
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Object.keys(descriptors)) {
    const descriptor = descriptors[key];
    if (exports_guard.HasPropertyKey(descriptor, "value")) {
      Object.defineProperty(result, key, { ...descriptor, value: FromValue3(descriptor.value) });
    }
  }
  return result;
}
function FromRegExp5(value) {
  return new RegExp(value.source, value.flags);
}
function FromUnknown5(value) {
  return value;
}
function FromValue3(value) {
  return value instanceof RegExp ? FromRegExp5(value) : IsGuard(value) ? FromGuard(value) : exports_guard.IsArray(value) ? FromArray18(value) : exports_guard.IsObject(value) ? FromObject19(value) : FromUnknown5(value);
}
function Clone3(value) {
  Metrics.clone += 1;
  return FromValue3(value);
}
// ../../node_modules/typebox/build/system/settings/settings.mjs
var exports_settings = {};
__export(exports_settings, {
  Set: () => Set5,
  Reset: () => Reset,
  Get: () => Get4
});
var settings = {
  immutableTypes: false,
  maxErrors: 8,
  useAcceleration: true,
  exactOptionalPropertyTypes: false,
  enumerableKind: false,
  correctiveParse: false
};
function Reset() {
  settings.immutableTypes = false;
  settings.maxErrors = 8;
  settings.useAcceleration = true;
  settings.exactOptionalPropertyTypes = false;
  settings.enumerableKind = false;
  settings.correctiveParse = false;
}
function Set5(options) {
  for (const key of exports_guard.Keys(options)) {
    const value = options[key];
    if (value !== undefined) {
      Object.defineProperty(settings, key, { value });
    }
  }
}
function Get4() {
  return settings;
}
// ../../node_modules/typebox/build/system/memory/create.mjs
function MergeHidden(left, right) {
  for (const key of Object.keys(right)) {
    Object.defineProperty(left, key, {
      configurable: true,
      writable: true,
      enumerable: false,
      value: right[key]
    });
  }
  return left;
}
function Merge(left, right) {
  return { ...left, ...right };
}
function Create3(hidden, enumerable, options = {}) {
  Metrics.create += 1;
  const settings2 = exports_settings.Get();
  const withOptions = Merge(enumerable, options);
  const withHidden = settings2.enumerableKind ? Merge(withOptions, hidden) : MergeHidden(withOptions, hidden);
  return settings2.immutableTypes ? Object.freeze(withHidden) : withHidden;
}
// ../../node_modules/typebox/build/system/memory/discard.mjs
function Discard2(value, propertyKeys) {
  Metrics.discard += 1;
  const result = {};
  const descriptors = Object.getOwnPropertyDescriptors(Clone3(value));
  const keysToDiscard = new Set(propertyKeys);
  for (const key of Object.keys(descriptors)) {
    if (keysToDiscard.has(key))
      continue;
    Object.defineProperty(result, key, descriptors[key]);
  }
  return result;
}
// ../../node_modules/typebox/build/system/memory/update.mjs
function Update2(current, hidden, enumerable) {
  Metrics.update += 1;
  const settings2 = exports_settings.Get();
  const result = Clone3(current);
  for (const key of Object.keys(hidden)) {
    Object.defineProperty(result, key, {
      configurable: true,
      writable: true,
      enumerable: settings2.enumerableKind,
      value: hidden[key]
    });
  }
  for (const key of Object.keys(enumerable)) {
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: enumerable[key]
    });
  }
  return result;
}
// ../../node_modules/typebox/build/type/types/schema.mjs
function IsKind3(value, kind) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.IsEqual(value["~kind"], kind);
}
function IsSchema3(value) {
  return exports_guard.IsObject(value);
}

// ../../node_modules/typebox/build/type/action/_optional.mjs
function OptionalAddAction(type) {
  return exports_memory.Create({ ["~kind"]: "OptionalAddAction" }, { type }, {});
}
function IsOptionalAddAction(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "type") && exports_guard.IsEqual(value["~kind"], "OptionalAddAction") && IsSchema3(value.type);
}
function OptionalRemoveAction(type) {
  return exports_memory.Create({ ["~kind"]: "OptionalRemoveAction" }, { type }, {});
}
function IsOptionalRemoveAction(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "type") && exports_guard.IsEqual(value["~kind"], "OptionalRemoveAction") && IsSchema3(value.type);
}
// ../../node_modules/typebox/build/type/action/_readonly.mjs
function ReadonlyAddAction(type) {
  return exports_memory.Create({ ["~kind"]: "ReadonlyAddAction" }, { type }, {});
}
function IsReadonlyAddAction(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "type") && exports_guard.IsEqual(value["~kind"], "ReadonlyAddAction") && IsSchema3(value.type);
}
function ReadonlyRemoveAction(type) {
  return exports_memory.Create({ ["~kind"]: "ReadonlyRemoveAction" }, { type }, {});
}
function IsReadonlyRemoveAction(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "type") && exports_guard.IsEqual(value["~kind"], "ReadonlyRemoveAction") && IsSchema3(value.type);
}
// ../../node_modules/typebox/build/type/types/deferred.mjs
function Deferred(action, parameters, options) {
  return exports_memory.Create({ "~kind": "Deferred" }, { action, parameters, options }, {});
}
function IsDeferred(value) {
  return IsKind3(value, "Deferred");
}

// ../../node_modules/typebox/build/type/types/promise.mjs
function _Promise_(item, options) {
  return exports_memory.Create({ ["~kind"]: "Promise" }, { type: "promise", item }, options);
}
function IsPromise4(value) {
  return IsKind3(value, "Promise");
}
function PromiseOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "item"]);
}

// ../../node_modules/typebox/build/type/types/_immutable.mjs
function ImmutableAdd(type) {
  return exports_memory.Update(type, { "~immutable": true }, {});
}
function Immutable2(type) {
  return ImmutableAdd(type);
}
function IsImmutable(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "~immutable");
}

// ../../node_modules/typebox/build/type/types/_optional.mjs
function OptionalRemove(type) {
  const result = exports_memory.Discard(type, ["~optional"]);
  return result;
}
function OptionalAdd(type) {
  return exports_memory.Update(type, { "~optional": true }, {});
}
function Optional2(type) {
  return OptionalAdd(type);
}
function IsOptional3(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "~optional");
}

// ../../node_modules/typebox/build/type/types/_readonly.mjs
function ReadonlyRemove(type) {
  return exports_memory.Discard(type, ["~readonly"]);
}
function ReadonlyAdd(type) {
  return exports_memory.Update(type, { "~readonly": true }, {});
}
function Readonly2(type) {
  return ReadonlyAdd(type);
}
function IsReadonly3(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "~readonly");
}

// ../../node_modules/typebox/build/type/types/base.mjs
function BaseProperty(value) {
  return {
    enumerable: exports_settings.Get().enumerableKind,
    writable: false,
    configurable: false,
    value
  };
}

class Base {
  constructor() {
    globalThis.Object.defineProperty(this, "~kind", BaseProperty("Base"));
    globalThis.Object.defineProperty(this, "~guard", BaseProperty({
      check: (value) => this.Check(value),
      errors: (value) => this.Errors(value)
    }));
  }
  Check(_value) {
    return true;
  }
  Errors(_value) {
    return [];
  }
  Convert(value) {
    return value;
  }
  Clean(value) {
    return value;
  }
  Default(value) {
    return value;
  }
  Create() {
    throw new Error("Create not implemented");
  }
  Clone() {
    throw Error("Clone not implemented");
  }
}
function IsBase(value) {
  return IsKind3(value, "Base");
}

// ../../node_modules/typebox/build/type/types/array.mjs
function _Array_(items, options) {
  return exports_memory.Create({ "~kind": "Array" }, { type: "array", items }, options);
}
function IsArray6(value) {
  return IsKind3(value, "Array");
}
function ArrayOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "items"]);
}

// ../../node_modules/typebox/build/type/types/async_iterator.mjs
function AsyncIterator2(iteratorItems, options) {
  return exports_memory.Create({ "~kind": "AsyncIterator" }, { type: "asyncIterator", iteratorItems }, options);
}
function IsAsyncIterator6(value) {
  return IsKind3(value, "AsyncIterator");
}
function AsyncIteratorOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "iteratorItems"]);
}

// ../../node_modules/typebox/build/type/types/constructor.mjs
function Constructor2(parameters, instanceType, options = {}) {
  return exports_memory.Create({ "~kind": "Constructor" }, { type: "constructor", parameters, instanceType }, options);
}
function IsConstructor4(value) {
  return IsKind3(value, "Constructor");
}
function ConstructorOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "parameters", "instanceType"]);
}

// ../../node_modules/typebox/build/type/types/function.mjs
function _Function_(parameters, returnType, options = {}) {
  return exports_memory.Create({ ["~kind"]: "Function" }, { type: "function", parameters, returnType }, options);
}
function IsFunction6(value) {
  return IsKind3(value, "Function");
}
function FunctionOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "parameters", "returnType"]);
}

// ../../node_modules/typebox/build/type/types/ref.mjs
function Ref2(ref, options) {
  return exports_memory.Create({ ["~kind"]: "Ref" }, { $ref: ref }, options);
}
function IsRef3(value) {
  return IsKind3(value, "Ref");
}

// ../../node_modules/typebox/build/type/types/generic.mjs
function Generic(parameters, expression) {
  return exports_memory.Create({ "~kind": "Generic" }, { type: "generic", parameters, expression });
}
function IsGeneric(value) {
  return IsKind3(value, "Generic");
}

// ../../node_modules/typebox/build/type/types/any.mjs
function Any2(options) {
  return exports_memory.Create({ ["~kind"]: "Any" }, {}, options);
}
function IsAny3(value) {
  return IsKind3(value, "Any");
}

// ../../node_modules/typebox/build/type/types/never.mjs
var NeverPattern = "(?!)";
function Never2(options) {
  return exports_memory.Create({ "~kind": "Never" }, { not: {} }, options);
}
function IsNever3(value) {
  return IsKind3(value, "Never");
}

// ../../node_modules/typebox/build/type/types/properties.mjs
function RequiredArray2(properties) {
  return exports_guard.Keys(properties).filter((key) => !IsOptional3(properties[key]));
}
function PropertyKeys(properties) {
  return exports_guard.Keys(properties);
}
function PropertyValues(properties) {
  return exports_guard.Values(properties);
}

// ../../node_modules/typebox/build/type/types/object.mjs
function _Object_2(properties, options = {}) {
  const requiredKeys = RequiredArray2(properties);
  const required = requiredKeys.length > 0 ? { required: requiredKeys } : {};
  return exports_memory.Create({ "~kind": "Object" }, { type: "object", ...required, properties }, options);
}
function IsObject6(value) {
  return IsKind3(value, "Object");
}
function ObjectOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "properties", "required"]);
}

// ../../node_modules/typebox/build/type/types/union.mjs
function Union3(anyOf, options = {}) {
  return exports_memory.Create({ "~kind": "Union" }, { anyOf }, options);
}
function IsUnion3(value) {
  return IsKind3(value, "Union");
}
function UnionOptions(type) {
  return exports_memory.Discard(type, ["~kind", "anyOf"]);
}

// ../../node_modules/typebox/build/type/types/unknown.mjs
function Unknown2(options) {
  return exports_memory.Create({ ["~kind"]: "Unknown" }, {}, options);
}
function IsUnknown3(value) {
  return IsKind3(value, "Unknown");
}

// ../../node_modules/typebox/build/type/types/cyclic.mjs
function Cyclic($defs, $ref, options) {
  const defs = exports_guard.Keys($defs).reduce((result, key) => {
    return { ...result, [key]: exports_memory.Update($defs[key], {}, { $id: key }) };
  }, {});
  return exports_memory.Create({ ["~kind"]: "Cyclic" }, { $defs: defs, $ref }, options);
}
function IsCyclic(value) {
  return IsKind3(value, "Cyclic");
}

// ../../node_modules/typebox/build/type/types/unsafe.mjs
function Unsafe2(schema) {
  return exports_memory.Update(schema, { ["~unsafe"]: null }, {});
}
function IsUnsafe3(value) {
  return exports_guard.IsObjectNotArray(value) && exports_guard.HasPropertyKey(value, "~unsafe") && exports_guard.IsNull(value["~unsafe"]);
}

// ../../node_modules/typebox/build/system/arguments/arguments.mjs
var exports_arguments = {};
__export(exports_arguments, {
  Match: () => Match
});
function Match(args, match) {
  return match[args.length]?.(...args) ?? (() => {
    throw Error("Invalid Arguments");
  })();
}
// ../../node_modules/typebox/build/type/types/infer.mjs
function Infer(...args) {
  const [name, extends_] = exports_arguments.Match(args, {
    2: (name2, extends_2) => [name2, extends_2, extends_2],
    1: (name2) => [name2, Unknown2(), Unknown2()]
  });
  return exports_memory.Create({ ["~kind"]: "Infer" }, { type: "infer", name, extends: extends_ }, {});
}
function IsInfer(value) {
  return IsKind3(value, "Infer");
}

// ../../node_modules/typebox/build/type/engine/enum/typescript_enum_to_enum_values.mjs
function IsTypeScriptEnumLike(value) {
  return exports_guard.IsObjectNotArray(value);
}
function TypeScriptEnumToEnumValues(type) {
  const keys = exports_guard.Keys(type).filter((key) => isNaN(key));
  return keys.reduce((result, key) => [...result, type[key]], []);
}

// ../../node_modules/typebox/build/type/types/enum.mjs
function Enum2(value, options) {
  const values = IsTypeScriptEnumLike(value) ? TypeScriptEnumToEnumValues(value) : value;
  return exports_memory.Create({ "~kind": "Enum" }, { enum: values }, options);
}
function IsEnum(value) {
  return IsKind3(value, "Enum");
}

// ../../node_modules/typebox/build/type/types/intersect.mjs
function Intersect3(types, options = {}) {
  return exports_memory.Create({ "~kind": "Intersect" }, { allOf: types }, options);
}
function IsIntersect3(value) {
  return IsKind3(value, "Intersect");
}
function IntersectOptions(type) {
  return exports_memory.Discard(type, ["~kind", "allOf"]);
}
// ../../node_modules/typebox/build/system/unreachable/unreachable.mjs
function Unreachable() {
  throw new Error("Unreachable");
}
// ../../node_modules/typebox/build/system/hashing/hash.mjs
var ByteMarker2;
(function(ByteMarker3) {
  ByteMarker3[ByteMarker3["Array"] = 0] = "Array";
  ByteMarker3[ByteMarker3["BigInt"] = 1] = "BigInt";
  ByteMarker3[ByteMarker3["Boolean"] = 2] = "Boolean";
  ByteMarker3[ByteMarker3["Date"] = 3] = "Date";
  ByteMarker3[ByteMarker3["Constructor"] = 4] = "Constructor";
  ByteMarker3[ByteMarker3["Function"] = 5] = "Function";
  ByteMarker3[ByteMarker3["Null"] = 6] = "Null";
  ByteMarker3[ByteMarker3["Number"] = 7] = "Number";
  ByteMarker3[ByteMarker3["Object"] = 8] = "Object";
  ByteMarker3[ByteMarker3["RegExp"] = 9] = "RegExp";
  ByteMarker3[ByteMarker3["String"] = 10] = "String";
  ByteMarker3[ByteMarker3["Symbol"] = 11] = "Symbol";
  ByteMarker3[ByteMarker3["TypeArray"] = 12] = "TypeArray";
  ByteMarker3[ByteMarker3["Undefined"] = 13] = "Undefined";
})(ByteMarker2 || (ByteMarker2 = {}));
var Accumulator2 = BigInt("14695981039346656037");
var [Prime2, Size2] = [BigInt("1099511628211"), BigInt("18446744073709551616")];
var Bytes2 = Array.from({ length: 256 }).map((_, i) => BigInt(i));
var F642 = new Float64Array(1);
var F64In2 = new DataView(F642.buffer);
var F64Out2 = new Uint8Array(F642.buffer);
var encoder = new TextEncoder;
// ../../node_modules/typebox/build/type/types/_codec.mjs
class EncodeBuilder {
  constructor(type, decode2) {
    this.type = type;
    this.decode = decode2;
  }
  Encode(callback) {
    const type = this.type;
    const decode2 = IsCodec(type) ? (value) => this.decode(type["~codec"].decode(value)) : this.decode;
    const encode2 = IsCodec(type) ? (value) => type["~codec"].encode(callback(value)) : callback;
    const codec = { decode: decode2, encode: encode2 };
    return exports_memory.Update(this.type, { "~codec": codec }, {});
  }
}

class DecodeBuilder {
  constructor(type) {
    this.type = type;
  }
  Decode(callback) {
    return new EncodeBuilder(this.type, callback);
  }
}
function Codec(type) {
  return new DecodeBuilder(type);
}
function Decode2(type, callback) {
  return Codec(type).Decode(callback).Encode(() => {
    throw Error("Encode not implemented");
  });
}
function Encode2(type, callback) {
  return Codec(type).Decode(() => {
    throw Error("Decode not implemented");
  }).Encode(callback);
}
function IsCodec(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "~codec") && exports_guard.IsObject(value["~codec"]) && exports_guard.HasPropertyKey(value["~codec"], "encode") && exports_guard.HasPropertyKey(value["~codec"], "decode");
}
// ../../node_modules/typebox/build/type/types/_refine.mjs
function RefineAdd(type, refinement) {
  const refinements = IsRefine(type) ? [...type["~refine"], refinement] : [refinement];
  return exports_memory.Update(type, { "~refine": refinements }, {});
}
function Refine(...args) {
  const [type, check2, error_or_message] = exports_arguments.Match(args, {
    3: (type2, check3, error2) => [type2, check3, error2],
    2: (type2, check3) => [type2, check3, () => "Refine Error"]
  });
  const error = exports_guard.IsString(error_or_message) ? () => error_or_message : error_or_message;
  return RefineAdd(type, { check: check2, error });
}
function IsRefinement(value) {
  return exports_guard.IsObjectNotArray(value) && exports_guard.HasPropertyKey(value, "check") && exports_guard.HasPropertyKey(value, "error") && exports_guard.IsFunction(value.check) && exports_guard.IsFunction(value.error);
}
function IsRefine(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "~refine") && exports_guard.IsArray(value["~refine"]) && exports_guard.Every(value["~refine"], 0, (value2) => IsRefinement(value2));
}
// ../../node_modules/typebox/build/type/types/bigint.mjs
var BigIntPattern = "-?(?:0|[1-9][0-9]*)n";
function BigInt3(options) {
  return exports_memory.Create({ "~kind": "BigInt" }, { type: "bigint" }, options);
}
function IsBigInt6(value) {
  return IsKind3(value, "BigInt");
}
// ../../node_modules/typebox/build/type/types/boolean.mjs
function Boolean3(options) {
  return exports_memory.Create({ "~kind": "Boolean" }, { type: "boolean" }, options);
}
function IsBoolean6(value) {
  return IsKind3(value, "Boolean");
}
// ../../node_modules/typebox/build/type/types/identifier.mjs
function Identifier(name) {
  return exports_memory.Create({ "~kind": "Identifier" }, { name });
}
function IsIdentifier(value) {
  return IsKind3(value, "Identifier");
}
// ../../node_modules/typebox/build/type/types/integer.mjs
var IntegerPattern = "-?(?:0|[1-9][0-9]*)";
function Integer2(options) {
  return exports_memory.Create({ "~kind": "Integer" }, { type: "integer" }, options);
}
function IsInteger5(value) {
  return IsKind3(value, "Integer");
}
// ../../node_modules/typebox/build/type/types/iterator.mjs
function Iterator2(iteratorItems, options) {
  return exports_memory.Create({ "~kind": "Iterator" }, { type: "iterator", iteratorItems }, options);
}
function IsIterator6(value) {
  return IsKind3(value, "Iterator");
}
function IteratorOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "iteratorItems"]);
}
// ../../node_modules/typebox/build/type/types/literal.mjs
class InvalidLiteralValue extends Error {
  constructor(value) {
    super(`Invalid Literal value`);
    Object.defineProperty(this, "cause", {
      value: { value },
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
}
function LiteralTypeName(value) {
  return exports_guard.IsBigInt(value) ? "bigint" : exports_guard.IsBoolean(value) ? "boolean" : exports_guard.IsNumber(value) ? "number" : exports_guard.IsString(value) ? "string" : (() => {
    throw new InvalidLiteralValue(value);
  })();
}
function Literal2(value, options) {
  return exports_memory.Create({ "~kind": "Literal" }, { type: LiteralTypeName(value), const: value }, options);
}
function IsLiteralValue3(value) {
  return exports_guard.IsBigInt(value) || exports_guard.IsBoolean(value) || exports_guard.IsNumber(value) || exports_guard.IsString(value);
}
function IsLiteralNumber2(value) {
  return IsLiteral3(value) && exports_guard.IsNumber(value.const);
}
function IsLiteralString2(value) {
  return IsLiteral3(value) && exports_guard.IsString(value.const);
}
function IsLiteral3(value) {
  return IsKind3(value, "Literal");
}
// ../../node_modules/typebox/build/type/types/null.mjs
function Null2(options) {
  return exports_memory.Create({ "~kind": "Null" }, { type: "null" }, options);
}
function IsNull6(value) {
  return IsKind3(value, "Null");
}
// ../../node_modules/typebox/build/type/types/number.mjs
var NumberPattern = "-?(?:0|[1-9][0-9]*)(?:.[0-9]+)?";
function Number3(options) {
  return exports_memory.Create({ "~kind": "Number" }, { type: "number" }, options);
}
function IsNumber6(value) {
  return IsKind3(value, "Number");
}
// ../../node_modules/typebox/build/type/types/symbol.mjs
function Symbol3(options) {
  return exports_memory.Create({ "~kind": "Symbol" }, { type: "symbol" }, options);
}
function IsSymbol6(value) {
  return IsKind3(value, "Symbol");
}
// ../../node_modules/typebox/build/type/types/parameter.mjs
function Parameter(...args) {
  const [name, extends_, equals] = exports_arguments.Match(args, {
    3: (name2, extends_2, equals2) => [name2, extends_2, equals2],
    2: (name2, extends_2) => [name2, extends_2, extends_2],
    1: (name2) => [name2, Unknown2(), Unknown2()]
  });
  return exports_memory.Create({ "~kind": "Parameter" }, { name, extends: extends_, equals }, {});
}
function IsParameter(value) {
  return IsKind3(value, "Parameter");
}
// ../../node_modules/typebox/build/type/types/string.mjs
var StringPattern = ".*";
function String3(options) {
  return exports_memory.Create({ "~kind": "String" }, { type: "string" }, options);
}
function IsString6(value) {
  return IsKind3(value, "String");
}

// ../../node_modules/typebox/build/type/engine/patterns/pattern.mjs
function ParsePatternIntoTypes(pattern) {
  const parsed = Pattern(pattern);
  const result = exports_guard.IsEqual(parsed.length, 2) ? parsed[0] : [];
  return result;
}

// ../../node_modules/typebox/build/type/engine/template_literal/is_finite.mjs
function FromLiteral7(_value) {
  return true;
}
function FromTypesReduce(types) {
  return exports_guard.TakeLeft(types, (left, right) => FromType3(left) ? FromTypesReduce(right) : false, () => true);
}
function FromTypes3(types) {
  const result = exports_guard.IsEqual(types.length, 0) ? false : FromTypesReduce(types);
  return result;
}
function FromType3(type) {
  return IsUnion3(type) ? FromTypes3(type.anyOf) : IsLiteral3(type) ? FromLiteral7(type.const) : false;
}
function IsTemplateLiteralFinite2(types) {
  const result = FromTypes3(types);
  return result;
}

// ../../node_modules/typebox/build/type/engine/template_literal/create.mjs
function TemplateLiteralCreate(pattern) {
  return exports_memory.Create({ ["~kind"]: "TemplateLiteral" }, { type: "string", pattern }, {});
}

// ../../node_modules/typebox/build/type/engine/template_literal/decode.mjs
function FromLiteralPush(variants, value, result = []) {
  return exports_guard.TakeLeft(variants, (left, right) => FromLiteralPush(right, value, [...result, `${left}${value}`]), () => result);
}
function FromLiteral8(variants, value) {
  return exports_guard.IsEqual(variants.length, 0) ? [`${value}`] : FromLiteralPush(variants, value);
}
function FromUnion21(variants, types, result = []) {
  return exports_guard.TakeLeft(types, (left, right) => FromUnion21(variants, right, [...result, ...FromType4(variants, left)]), () => result);
}
function FromType4(variants, type) {
  const result = IsUnion3(type) ? FromUnion21(variants, type.anyOf) : IsLiteral3(type) ? FromLiteral8(variants, type.const) : Unreachable();
  return result;
}
function DecodeFromSpan(variants, types) {
  return exports_guard.TakeLeft(types, (left, right) => DecodeFromSpan(FromType4(variants, left), right), () => variants);
}
function VariantsToLiterals(variants) {
  return variants.map((variant) => Literal2(variant));
}
function DecodeTypesAsUnion(types) {
  const variants = DecodeFromSpan([], types);
  const literals = VariantsToLiterals(variants);
  const result = Union3(literals);
  return result;
}
function DecodeTypes(types) {
  return exports_guard.IsEqual(types.length, 0) ? Unreachable() : exports_guard.IsEqual(types.length, 1) && IsLiteral3(types[0]) ? types[0] : DecodeTypesAsUnion(types);
}
function TemplateLiteralDecodeUnsafe(pattern) {
  const types = ParsePatternIntoTypes(pattern);
  const result = exports_guard.IsEqual(types.length, 0) ? String3() : IsTemplateLiteralFinite2(types) ? DecodeTypes(types) : TemplateLiteralCreate(pattern);
  return result;
}
function TemplateLiteralDecode(pattern) {
  const decoded = TemplateLiteralDecodeUnsafe(pattern);
  const result = IsTemplateLiteral3(decoded) ? String3() : decoded;
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/record_create.mjs
function CreateRecord(key, value) {
  const type = "object";
  const patternProperties = { [key]: value };
  return exports_memory.Create({ ["~kind"]: "Record" }, { type, patternProperties });
}

// ../../node_modules/typebox/build/type/engine/record/from_key_any.mjs
function FromAnyKey2(value) {
  return CreateRecord(StringKey, value);
}

// ../../node_modules/typebox/build/type/engine/record/from_key_boolean.mjs
function FromBooleanKey2(value) {
  return _Object_2({ true: value, false: value });
}

// ../../node_modules/typebox/build/type/engine/enum/enum_to_union.mjs
function FromEnumValue(value) {
  return exports_guard.IsString(value) || exports_guard.IsNumber(value) ? Literal2(value) : exports_guard.IsNull(value) ? Null2() : Never2();
}
function EnumValuesToVariants(values) {
  const result = values.map((value) => FromEnumValue(value));
  return result;
}
function EnumValuesToUnion(values) {
  const variants = EnumValuesToVariants(values);
  const result = Union3(variants);
  return result;
}
function EnumToUnion(type) {
  const result = EnumValuesToUnion(type.enum);
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/from_key_enum.mjs
function FromEnumKey(values, value) {
  const unionKey = EnumValuesToUnion(values);
  const result = FromKey(unionKey, value);
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/from_key_integer.mjs
function FromIntegerKey2(_key, value) {
  const result = CreateRecord(IntegerKey, value);
  return result;
}

// ../../node_modules/typebox/build/type/types/tuple.mjs
function Tuple2(types, options = {}) {
  const [items, minItems, additionalItems] = [types, types.length, false];
  return exports_memory.Create({ ["~kind"]: "Tuple" }, { type: "array", additionalItems, items, minItems }, options);
}
function IsTuple3(value) {
  return IsKind3(value, "Tuple");
}
function TupleOptions(type) {
  return exports_memory.Discard(type, ["~kind", "type", "items", "minItems", "additionalItems"]);
}

// ../../node_modules/typebox/build/type/engine/tuple/to_object.mjs
function TupleElementsToProperties(types) {
  const result = types.reduceRight((result2, right, index) => {
    return { [index]: right, ...result2 };
  }, {});
  return result;
}
function TupleToObject(type) {
  const properties = TupleElementsToProperties(type.items);
  const result = _Object_2(properties);
  return result;
}

// ../../node_modules/typebox/build/type/engine/evaluate/composite.mjs
function IsReadonlyProperty(left, right) {
  return IsReadonly3(left) ? IsReadonly3(right) ? true : false : false;
}
function IsOptionalProperty(left, right) {
  return IsOptional3(left) ? IsOptional3(right) ? true : false : false;
}
function CompositeProperty2(left, right) {
  const isReadonly = IsReadonlyProperty(left, right);
  const isOptional = IsOptionalProperty(left, right);
  const evaluated = EvaluateIntersect([left, right]);
  const property = ReadonlyRemove(OptionalRemove(evaluated));
  return isReadonly && isOptional ? ReadonlyAdd(OptionalAdd(property)) : isReadonly && !isOptional ? ReadonlyAdd(property) : !isReadonly && isOptional ? OptionalAdd(property) : property;
}
function CompositePropertyKey(left, right, key) {
  return key in left ? key in right ? CompositeProperty2(left[key], right[key]) : left[key] : (key in right) ? right[key] : Never2();
}
function CompositeProperties2(left, right) {
  const keys = new Set([...exports_guard.Keys(right), ...exports_guard.Keys(left)]);
  return [...keys].reduce((result, key) => {
    return { ...result, [key]: CompositePropertyKey(left, right, key) };
  }, {});
}
function GetProperties(type) {
  const result = IsObject6(type) ? type.properties : IsTuple3(type) ? TupleElementsToProperties(type.items) : Unreachable();
  return result;
}
function Composite2(left, right) {
  const leftProperties = GetProperties(left);
  const rightProperties = GetProperties(right);
  const properties = CompositeProperties2(leftProperties, rightProperties);
  return _Object_2(properties);
}

// ../../node_modules/typebox/build/type/engine/evaluate/narrow.mjs
function Narrow(left, right) {
  const result = Compare(left, right);
  return exports_guard.IsEqual(result, ResultLeftInside) ? left : exports_guard.IsEqual(result, ResultRightInside) ? right : exports_guard.IsEqual(result, ResultEqual) ? right : Never2();
}

// ../../node_modules/typebox/build/type/engine/evaluate/distribute.mjs
function IsObjectLike(type) {
  return IsObject6(type) || IsTuple3(type);
}
function IsUnionOperand(left, right) {
  const isUnionLeft = IsUnion3(left);
  const isUnionRight = IsUnion3(right);
  const result = isUnionLeft || isUnionRight;
  return result;
}
function DistributeOperation(left, right) {
  const evaluatedLeft = EvaluateType(left);
  const evaluatedRight = EvaluateType(right);
  const isUnionOperand = IsUnionOperand(evaluatedLeft, evaluatedRight);
  const isObjectLeft = IsObjectLike(evaluatedLeft);
  const IsObjectRight = IsObjectLike(evaluatedRight);
  const result = isUnionOperand ? EvaluateIntersect([evaluatedLeft, evaluatedRight]) : isObjectLeft && IsObjectRight ? Composite2(evaluatedLeft, evaluatedRight) : isObjectLeft && !IsObjectRight ? evaluatedLeft : !isObjectLeft && IsObjectRight ? evaluatedRight : Narrow(evaluatedLeft, evaluatedRight);
  return result;
}
function DistributeType(type, types, result = []) {
  return exports_guard.TakeLeft(types, (left, right) => DistributeType(type, right, [...result, DistributeOperation(type, left)]), () => exports_guard.IsEqual(result.length, 0) ? [type] : result);
}
function DistributeUnion(types, distribution, result = []) {
  return exports_guard.TakeLeft(types, (left, right) => DistributeUnion(right, distribution, [...result, ...Distribute([left], distribution)]), () => result);
}
function Distribute(types, result = []) {
  return exports_guard.TakeLeft(types, (left, right) => IsUnion3(left) ? Distribute(right, DistributeUnion(left.anyOf, result)) : Distribute(right, DistributeType(left, result)), () => result);
}

// ../../node_modules/typebox/build/type/engine/evaluate/evaluate.mjs
function EvaluateIntersect(types) {
  const distribution = Distribute(types);
  const result = Broaden(distribution);
  return result;
}
function EvaluateUnion(types) {
  const result = Broaden(types);
  return result;
}
function EvaluateType(type) {
  return IsIntersect3(type) ? EvaluateIntersect(type.allOf) : IsUnion3(type) ? EvaluateUnion(type.anyOf) : type;
}
function EvaluateUnionFast(types) {
  const result = exports_guard.IsEqual(types.length, 1) ? types[0] : exports_guard.IsEqual(types.length, 0) ? Never2() : Union3(types);
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/from_key_intersect.mjs
function FromIntersectKey(types, value) {
  const evaluatedKey = EvaluateIntersect(types);
  const result = FromKey(evaluatedKey, value);
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/from_key_literal.mjs
function FromLiteralKey2(key, value) {
  return exports_guard.IsString(key) || exports_guard.IsNumber(key) ? _Object_2({ [key]: value }) : exports_guard.IsEqual(key, false) ? _Object_2({ false: value }) : exports_guard.IsEqual(key, true) ? _Object_2({ true: value }) : _Object_2({});
}

// ../../node_modules/typebox/build/type/engine/record/from_key_number.mjs
function FromNumberKey2(_key, value) {
  const result = CreateRecord(NumberKey, value);
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/from_key_string.mjs
function FromStringKey2(key, value) {
  return exports_guard.HasPropertyKey(key, "pattern") && (exports_guard.IsString(key.pattern) || key.pattern instanceof RegExp) ? CreateRecord(key.pattern.toString(), value) : CreateRecord(StringKey, value);
}

// ../../node_modules/typebox/build/type/engine/record/from_key_template_literal.mjs
function FromTemplateKey(pattern, value) {
  const types = ParsePatternIntoTypes(pattern);
  const finite = IsTemplateLiteralFinite2(types);
  const result = finite ? FromKey(TemplateLiteralDecode(pattern), value) : CreateRecord(pattern, value);
  return result;
}

// ../../node_modules/typebox/build/type/engine/evaluate/flatten.mjs
function FlattenType(type) {
  const result = IsUnion3(type) ? Flatten(type.anyOf) : [type];
  return result;
}
function Flatten(types) {
  return types.reduce((result, type) => {
    return [...result, ...FlattenType(type)];
  }, []);
}

// ../../node_modules/typebox/build/type/engine/record/from_key_union.mjs
function StringOrNumberCheck(types) {
  return types.some((type) => IsString6(type) || IsNumber6(type) || IsInteger5(type));
}
function TryBuildRecord(types, value) {
  return exports_guard.IsEqual(StringOrNumberCheck(types), true) ? CreateRecord(StringKey, value) : undefined;
}
function CreateProperties(types, value) {
  return types.reduce((result, left) => {
    return IsLiteral3(left) && (exports_guard.IsString(left.const) || exports_guard.IsNumber(left.const)) ? { ...result, [left.const]: value } : result;
  }, {});
}
function CreateObject(types, value) {
  const properties = CreateProperties(types, value);
  const result = _Object_2(properties);
  return result;
}
function FromUnionKey2(types, value) {
  const flattened = Flatten(types);
  const record = TryBuildRecord(flattened, value);
  return IsSchema3(record) ? record : CreateObject(flattened, value);
}

// ../../node_modules/typebox/build/type/engine/record/from_key.mjs
function FromKey(key, value) {
  const result = IsAny3(key) ? FromAnyKey2(value) : IsBoolean6(key) ? FromBooleanKey2(value) : IsEnum(key) ? FromEnumKey(key.enum, value) : IsInteger5(key) ? FromIntegerKey2(key, value) : IsIntersect3(key) ? FromIntersectKey(key.allOf, value) : IsLiteral3(key) ? FromLiteralKey2(key.const, value) : IsNumber6(key) ? FromNumberKey2(key, value) : IsUnion3(key) ? FromUnionKey2(key.anyOf, value) : IsString6(key) ? FromStringKey2(key, value) : IsTemplateLiteral3(key) ? FromTemplateKey(key.pattern, value) : _Object_2({});
  return result;
}

// ../../node_modules/typebox/build/type/engine/record/instantiate.mjs
function RecordAction(key, value, options) {
  const result = CanInstantiate([key]) ? exports_memory.Update(FromKey(key, value), {}, options) : RecordDeferred(key, value, options);
  return result;
}
function RecordInstantiate(context, state, key, value, options) {
  const instantiatedKey = InstantiateType(context, state, key);
  const instantiatedValue = InstantiateType(context, state, value);
  return RecordAction(instantiatedKey, instantiatedValue, options);
}

// ../../node_modules/typebox/build/type/types/record.mjs
var IntegerKey = `^${IntegerPattern}$`;
var NumberKey = `^${NumberPattern}$`;
var StringKey = `^${StringPattern}$`;
function RecordDeferred(key, value, options = {}) {
  return Deferred("Record", [key, value], options);
}
function Record2(key, value, options = {}) {
  return RecordAction(key, value, options);
}
function RecordFromPattern(key, value) {
  return CreateRecord(key, value);
}
function RecordPattern2(type) {
  return exports_guard.Keys(type.patternProperties)[0];
}
function RecordKey3(type) {
  const pattern = RecordPattern2(type);
  const result = exports_guard.IsEqual(pattern, StringKey) ? String3() : exports_guard.IsEqual(pattern, IntegerKey) ? Integer2() : exports_guard.IsEqual(pattern, NumberKey) ? Number3() : TemplateLiteralDecodeUnsafe(pattern);
  return result;
}
function RecordValue3(type) {
  return type.patternProperties[RecordPattern2(type)];
}
function IsRecord3(value) {
  return IsKind3(value, "Record");
}
// ../../node_modules/typebox/build/type/types/rest.mjs
function Rest2(type) {
  return exports_memory.Create({ "~kind": "Rest" }, { type: "rest", items: type }, {});
}
function IsRest(value) {
  return IsKind3(value, "Rest");
}
// ../../node_modules/typebox/build/type/types/this.mjs
function This(options) {
  return exports_memory.Create({ ["~kind"]: "This" }, { $ref: "#" }, options);
}
function IsThis3(value) {
  return IsKind3(value, "This");
}
// ../../node_modules/typebox/build/type/types/undefined.mjs
function Undefined2(options) {
  return exports_memory.Create({ "~kind": "Undefined" }, { type: "undefined" }, options);
}
function IsUndefined6(value) {
  return IsKind3(value, "Undefined");
}
// ../../node_modules/typebox/build/type/types/void.mjs
function Void2(options) {
  return exports_memory.Create({ "~kind": "Void" }, { type: "void" }, options);
}
function IsVoid3(value) {
  return IsKind3(value, "Void");
}
// ../../node_modules/typebox/build/type/script/mapping.mjs
function IntrinsicOrCall(ref2, parameters) {
  return exports_guard.IsEqual(ref2, "Array") ? _Array_(parameters[0]) : exports_guard.IsEqual(ref2, "AsyncIterator") ? AsyncIterator2(parameters[0]) : exports_guard.IsEqual(ref2, "Iterator") ? Iterator2(parameters[0]) : exports_guard.IsEqual(ref2, "Promise") ? _Promise_(parameters[0]) : exports_guard.IsEqual(ref2, "Awaited") ? AwaitedDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Capitalize") ? CapitalizeDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "ConstructorParameters") ? ConstructorParametersDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Evaluate") ? EvaluateDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Exclude") ? ExcludeDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Extract") ? ExtractDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Index") ? IndexDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "InstanceType") ? InstanceTypeDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Lowercase") ? LowercaseDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "NonNullable") ? NonNullableDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Omit") ? OmitDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Options") ? OptionsDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Parameters") ? ParametersDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Partial") ? PartialDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Pick") ? PickDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Readonly") ? ReadonlyObjectDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "KeyOf") ? KeyOfDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Record") ? RecordDeferred(parameters[0], parameters[1]) : exports_guard.IsEqual(ref2, "Required") ? RequiredDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "ReturnType") ? ReturnTypeDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Uncapitalize") ? UncapitalizeDeferred(parameters[0]) : exports_guard.IsEqual(ref2, "Uppercase") ? UppercaseDeferred(parameters[0]) : CallConstruct(Ref2(ref2), parameters);
}
function Unreachable2() {
  throw Error("Unreachable");
}
var DelimitedDecode = (input, result = []) => {
  return input.reduce((result2, left) => {
    return exports_guard.IsArray(left) && exports_guard.IsEqual(left.length, 2) ? [...result2, left[0]] : [...result2, left];
  }, []);
};
var Delimited = (input) => {
  const [left, right] = input;
  return DelimitedDecode([...left, ...right]);
};
function GenericParameterExtendsEqualsMapping(input) {
  return Parameter(input[0], input[2], input[4]);
}
function GenericParameterExtendsMapping(input) {
  return Parameter(input[0], input[2], input[2]);
}
function GenericParameterEqualsMapping(input) {
  return Parameter(input[0], Unknown2(), input[2]);
}
function GenericParameterIdentifierMapping(input) {
  return Parameter(input, Unknown2(), Unknown2());
}
function GenericParameterMapping(input) {
  return input;
}
function GenericParameterListMapping(input) {
  return Delimited(input);
}
function GenericParametersMapping(input) {
  return input[1];
}
function GenericCallArgumentListMapping(input) {
  return Delimited(input);
}
function GenericCallArgumentsMapping(input) {
  return input[1];
}
function GenericCallMapping(input) {
  return IntrinsicOrCall(input[0], input[1]);
}
function OptionalSemiColonMapping(input) {
  return null;
}
function KeywordStringMapping(input) {
  return String3();
}
function KeywordNumberMapping(input) {
  return Number3();
}
function KeywordBooleanMapping(input) {
  return Boolean3();
}
function KeywordUndefinedMapping(input) {
  return Undefined2();
}
function KeywordNullMapping(input) {
  return Null2();
}
function KeywordIntegerMapping(input) {
  return Integer2();
}
function KeywordBigIntMapping(input) {
  return BigInt3();
}
function KeywordUnknownMapping(input) {
  return Unknown2();
}
function KeywordAnyMapping(input) {
  return Any2();
}
function KeywordObjectMapping(input) {
  return _Object_2({});
}
function KeywordNeverMapping(input) {
  return Never2();
}
function KeywordSymbolMapping(input) {
  return Symbol3();
}
function KeywordVoidMapping(input) {
  return Void2();
}
function KeywordThisMapping(input) {
  return This();
}
function KeywordMapping(input) {
  return input;
}
function TemplateInterpolateMapping(input) {
  return input[1];
}
function TemplateSpanMapping(input) {
  return Literal2(input);
}
function TemplateBodyMapping(input) {
  return exports_guard.IsEqual(input.length, 3) ? [input[0], input[1], ...input[2]] : [input[0]];
}
function TemplateLiteralTypesMapping(input) {
  return input[1];
}
function TemplateLiteralMapping(input) {
  return TemplateLiteralDeferred(input);
}
function LiteralBigIntMapping(input) {
  return Literal2(BigInt(input));
}
function LiteralBooleanMapping(input) {
  return Literal2(exports_guard.IsEqual(input, "true"));
}
function LiteralNumberMapping(input) {
  return Literal2(parseFloat(input));
}
function LiteralStringMapping(input) {
  return Literal2(input);
}
function LiteralMapping(input) {
  return input;
}
function KeyOfMapping(input) {
  return input.length > 0;
}
function IndexArrayMapping(input) {
  return input.reduce((result, current) => {
    return exports_guard.IsEqual(current.length, 3) ? [...result, [current[1]]] : [...result, []];
  }, []);
}
function ExtendsMapping(input) {
  return exports_guard.IsEqual(input.length, 6) ? [input[1], input[3], input[5]] : [];
}
function BaseMapping(input) {
  return exports_guard.IsArray(input) && exports_guard.IsEqual(input.length, 3) ? input[1] : input;
}
var FactorIndexArray = (Type2, indexArray) => {
  return indexArray.reduce((result, left) => {
    const _left = left;
    return exports_guard.IsEqual(_left.length, 1) ? IndexDeferred(result, _left[0]) : exports_guard.IsEqual(_left.length, 0) ? _Array_(result) : Unreachable2();
  }, Type2);
};
var FactorExtends = (type, extend) => {
  return exports_guard.IsEqual(extend.length, 3) ? ConditionalDeferred(type, extend[0], extend[1], extend[2]) : type;
};
function FactorMapping(input) {
  const [keyOf, type, indexArray, extend] = input;
  return keyOf ? FactorExtends(KeyOfDeferred(FactorIndexArray(type, indexArray)), extend) : FactorExtends(FactorIndexArray(type, indexArray), extend);
}
function ExprBinaryMapping(left, rest2) {
  return exports_guard.IsEqual(rest2.length, 3) ? (() => {
    const [operator, right, next] = rest2;
    const Schema = ExprBinaryMapping(right, next);
    if (exports_guard.IsEqual(operator, "&")) {
      return IsIntersect3(Schema) ? Intersect3([left, ...Schema.allOf]) : Intersect3([left, Schema]);
    }
    if (exports_guard.IsEqual(operator, "|")) {
      return IsUnion3(Schema) ? Union3([left, ...Schema.anyOf]) : Union3([left, Schema]);
    }
    Unreachable2();
  })() : left;
}
function ExprTermTailMapping(input) {
  return input;
}
function ExprTermMapping(input) {
  const [left, rest2] = input;
  return ExprBinaryMapping(left, rest2);
}
function ExprTailMapping(input) {
  return input;
}
function ExprMapping(input) {
  const [left, rest2] = input;
  return ExprBinaryMapping(left, rest2);
}
function ExprReadonlyMapping(input) {
  return ImmutableAdd(input[1]);
}
function ExprPipeMapping(input) {
  return input[1];
}
function GenericTypeMapping(input) {
  return Generic(input[0], input[2]);
}
function InferTypeMapping(input) {
  return exports_guard.IsEqual(input.length, 4) ? Infer(input[1], input[3]) : exports_guard.IsEqual(input.length, 2) ? Infer(input[1], Unknown2()) : Unreachable2();
}
function TypeMapping(input) {
  return input;
}
function PropertyKeyNumberMapping(input) {
  return `${input}`;
}
function PropertyKeyIdentMapping(input) {
  return input;
}
function PropertyKeyQuotedMapping(input) {
  return input;
}
function PropertyKeyIndexMapping(input) {
  return IsInteger5(input[3]) ? IntegerKey : IsNumber6(input[3]) ? NumberKey : IsSymbol6(input[3]) ? StringKey : IsString6(input[3]) ? StringKey : Unreachable2();
}
function PropertyKeyMapping(input) {
  return input;
}
function ReadonlyMapping(input) {
  return input.length > 0;
}
function OptionalMapping(input) {
  return input.length > 0;
}
function PropertyMapping(input) {
  const [isReadonly, key, isOptional, _colon, type] = input;
  return {
    [key]: isReadonly && isOptional ? ReadonlyAdd(OptionalAdd(type)) : isReadonly && !isOptional ? ReadonlyAdd(type) : !isReadonly && isOptional ? OptionalAdd(type) : type
  };
}
function PropertyDelimiterMapping(input) {
  return input;
}
function PropertyListMapping(input) {
  return Delimited(input);
}
function PropertiesReduce(propertyList) {
  return propertyList.reduce((result, left) => {
    const isPatternProperties = exports_guard.HasPropertyKey(left, IntegerKey) || exports_guard.HasPropertyKey(left, NumberKey) || exports_guard.HasPropertyKey(left, StringKey);
    return isPatternProperties ? [result[0], exports_memory.Assign(result[1], left)] : [exports_memory.Assign(result[0], left), result[1]];
  }, [{}, {}]);
}
function PropertiesMapping(input) {
  return PropertiesReduce(input[1]);
}
function _Object_Mapping(input) {
  const [properties2, patternProperties] = input;
  const options = exports_guard.IsEqual(exports_guard.Keys(patternProperties).length, 0) ? {} : { patternProperties };
  return _Object_2(properties2, options);
}
function ElementNamedMapping(input) {
  return exports_guard.IsEqual(input.length, 5) ? ReadonlyAdd(OptionalAdd(input[4])) : exports_guard.IsEqual(input.length, 3) ? input[2] : exports_guard.IsEqual(input.length, 4) ? exports_guard.IsEqual(input[2], "readonly") ? ReadonlyAdd(input[3]) : OptionalAdd(input[3]) : Unreachable2();
}
function ElementReadonlyOptionalMapping(input) {
  return ReadonlyAdd(OptionalAdd(input[1]));
}
function ElementReadonlyMapping(input) {
  return ReadonlyAdd(input[1]);
}
function ElementOptionalMapping(input) {
  return OptionalAdd(input[0]);
}
function ElementBaseMapping(input) {
  return input;
}
function ElementMapping(input) {
  return exports_guard.IsEqual(input.length, 2) ? Rest2(input[1]) : exports_guard.IsEqual(input.length, 1) ? input[0] : Unreachable2();
}
function ElementListMapping(input) {
  return Delimited(input);
}
function TupleMapping(input) {
  return Tuple2(input[1]);
}
function ParameterReadonlyOptionalMapping(input) {
  return ReadonlyAdd(OptionalAdd(input[4]));
}
function ParameterReadonlyMapping(input) {
  return ReadonlyAdd(input[3]);
}
function ParameterOptionalMapping(input) {
  return OptionalAdd(input[3]);
}
function ParameterTypeMapping(input) {
  return input[2];
}
function ParameterBaseMapping(input) {
  return input;
}
function ParameterMapping(input) {
  return exports_guard.IsEqual(input.length, 2) ? Rest2(input[1]) : exports_guard.IsEqual(input.length, 1) ? input[0] : Unreachable2();
}
function ParameterListMapping(input) {
  return Delimited(input);
}
function _Function_Mapping(input) {
  return _Function_(input[1], input[4]);
}
function ConstructorMapping(input) {
  return Constructor2(input[2], input[5]);
}
function ApplyReadonly(state, type) {
  return exports_guard.IsEqual(state, "remove") ? ReadonlyRemoveAction(type) : exports_guard.IsEqual(state, "add") ? ReadonlyAddAction(type) : type;
}
function MappedReadonlyMapping(input) {
  return exports_guard.IsEqual(input.length, 2) && exports_guard.IsEqual(input[0], "-") ? "remove" : exports_guard.IsEqual(input.length, 2) && exports_guard.IsEqual(input[0], "+") ? "add" : exports_guard.IsEqual(input.length, 1) ? "add" : "none";
}
function ApplyOptional(state, type) {
  return exports_guard.IsEqual(state, "remove") ? OptionalRemoveAction(type) : exports_guard.IsEqual(state, "add") ? OptionalAddAction(type) : type;
}
function MappedOptionalMapping(input) {
  return exports_guard.IsEqual(input.length, 2) && exports_guard.IsEqual(input[0], "-") ? "remove" : exports_guard.IsEqual(input.length, 2) && exports_guard.IsEqual(input[0], "+") ? "add" : exports_guard.IsEqual(input.length, 1) ? "add" : "none";
}
function MappedAsMapping(input) {
  return exports_guard.IsEqual(input.length, 2) ? [input[1]] : [];
}
function MappedMapping(input) {
  return exports_guard.IsArray(input[6]) && exports_guard.IsEqual(input[6].length, 1) ? MappedDeferred(Identifier(input[3]), input[5], input[6][0], ApplyReadonly(input[1], ApplyOptional(input[8], input[10]))) : MappedDeferred(Identifier(input[3]), input[5], Ref2(input[3]), ApplyReadonly(input[1], ApplyOptional(input[8], input[10])));
}
function ReferenceMapping(input) {
  return Ref2(input);
}
function OptionsMapping(input) {
  return OptionsDeferred(input[2], input[4]);
}
function JsonNumberMapping(input) {
  return parseFloat(input);
}
function JsonBooleanMapping(input) {
  return exports_guard.IsEqual(input, "true");
}
function JsonStringMapping(input) {
  return input;
}
function JsonNullMapping(input) {
  return null;
}
function JsonPropertyMapping(input) {
  return { [input[0]]: input[2] };
}
function JsonPropertyListMapping(input) {
  return Delimited(input);
}
function JsonObjectMappingReduce(propertyList) {
  return propertyList.reduce((result, left) => {
    return exports_memory.Assign(result, left);
  }, {});
}
function JsonObjectMapping(input) {
  return JsonObjectMappingReduce(input[1]);
}
function JsonElementListMapping(input) {
  return Delimited(input);
}
function JsonArrayMapping(input) {
  return input[1];
}
function JsonMapping(input) {
  return input;
}
function PatternBigIntMapping(input) {
  return BigInt3();
}
function PatternStringMapping(input) {
  return String3();
}
function PatternNumberMapping(input) {
  return Number3();
}
function PatternIntegerMapping(input) {
  return Integer2();
}
function PatternNeverMapping(input) {
  return Never2();
}
function PatternTextMapping(input) {
  return Literal2(input);
}
function PatternBaseMapping(input) {
  return input;
}
function PatternGroupMapping(input) {
  return Union3(input[1]);
}
function PatternUnionMapping(input) {
  return input.length === 3 ? [...input[0], ...input[2]] : input.length === 1 ? [...input[0]] : [];
}
function PatternTermMapping(input) {
  return [input[0], ...input[1]];
}
function PatternBodyMapping(input) {
  return input;
}
function PatternMapping(input) {
  return input[1];
}
function InterfaceDeclarationHeritageListMapping(input) {
  return Delimited(input);
}
function InterfaceDeclarationHeritageMapping(input) {
  return exports_guard.IsEqual(input.length, 2) ? input[1] : [];
}
function InterfaceDeclarationGenericMapping(input) {
  const parameters = input[2];
  const heritage = input[3];
  const [properties2, patternProperties] = input[4];
  const options = exports_guard.IsEqual(exports_guard.Keys(patternProperties).length, 0) ? {} : { patternProperties };
  return { [input[1]]: Generic(parameters, InterfaceDeferred(heritage, properties2, options)) };
}
function InterfaceDeclarationMapping(input) {
  const heritage = input[2];
  const [properties2, patternProperties] = input[3];
  const options = exports_guard.IsEqual(exports_guard.Keys(patternProperties).length, 0) ? {} : { patternProperties };
  return { [input[1]]: InterfaceDeferred(heritage, properties2, options) };
}
function TypeAliasDeclarationGenericMapping(input) {
  return { [input[1]]: Generic(input[2], input[4]) };
}
function TypeAliasDeclarationMapping(input) {
  return { [input[1]]: input[3] };
}
function ExportKeywordMapping(input) {
  return null;
}
function ModuleDeclarationDelimiterMapping(input) {
  return input;
}
function ModuleDeclarationListMapping(input) {
  return PropertiesReduce(Delimited(input));
}
function ModuleDeclarationMapping(input) {
  return input[1];
}
function ModuleMapping(input) {
  const moduleDeclaration = input[0];
  const moduleDeclarationList = input[1];
  return ModuleDeferred(exports_memory.Assign(moduleDeclaration, moduleDeclarationList[0]));
}
function ScriptMapping(input) {
  return input;
}
// ../../node_modules/typebox/build/type/script/token/internal/match.mjs
function IsMatch(value) {
  return IsEqual(value.length, 2);
}
function Match2(input, ok, fail) {
  return IsMatch(input) ? ok(input[0], input[1]) : fail();
}

// ../../node_modules/typebox/build/type/script/token/internal/take.mjs
function TakeVariant(variant, input) {
  return IsEqual(input.indexOf(variant), 0) ? [variant, input.slice(variant.length)] : [];
}
function Take(variants, input) {
  for (let i = 0;i < variants.length; i++) {
    const result = TakeVariant(variants[i], input);
    if (IsMatch(result))
      return result;
  }
  return [];
}

// ../../node_modules/typebox/build/type/script/token/internal/char.mjs
function Range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => String.fromCharCode(start + i));
}
var Alpha = [
  ...Range(97, 122),
  ...Range(65, 90)
];
var Zero = "0";
var NonZero = Range(49, 57);
var Digit = [Zero, ...NonZero];
var WhiteSpace = " ";
var NewLine = `
`;
var UnderScore = "_";
var Dot = ".";
var DollarSign = "$";
var Hyphen = "-";

// ../../node_modules/typebox/build/type/script/token/internal/trim.mjs
var LineComment = "//";
var OpenComment = "/*";
var CloseComment = "*/";
function DiscardMultilineComment(input) {
  const index = input.indexOf(CloseComment);
  const result = IsEqual(index, -1) ? "" : input.slice(index + 2);
  return result;
}
function DiscardLineComment(input) {
  const index = input.indexOf(NewLine);
  const result = IsEqual(index, -1) ? "" : input.slice(index);
  return result;
}
function TrimStartUntilNewline(input) {
  return input.replace(/^[ \t\r\f\v]+/, "");
}
function TrimWhitespace(input) {
  const trimmed = TrimStartUntilNewline(input);
  return trimmed.startsWith(OpenComment) ? TrimWhitespace(DiscardMultilineComment(trimmed.slice(2))) : trimmed.startsWith(LineComment) ? TrimWhitespace(DiscardLineComment(trimmed.slice(2))) : trimmed;
}
function Trim(input) {
  const trimmed = input.trimStart();
  return trimmed.startsWith(OpenComment) ? Trim(DiscardMultilineComment(trimmed.slice(2))) : trimmed.startsWith(LineComment) ? Trim(DiscardLineComment(trimmed.slice(2))) : trimmed;
}

// ../../node_modules/typebox/build/type/script/token/internal/optional.mjs
function Optional3(value, input) {
  return Match2(Take([value], input), (Optional4, Rest3) => [Optional4, Rest3], () => ["", input]);
}

// ../../node_modules/typebox/build/type/script/token/internal/many.mjs
function IsDiscard(discard2, input) {
  return discard2.includes(input);
}
function Many(allowed, discard2, input, result = "") {
  return Match2(Take(allowed, input), (Char, Rest3) => IsDiscard(discard2, Char) ? Many(allowed, discard2, Rest3, result) : Many(allowed, discard2, Rest3, `${result}${Char}`), () => [result, input]);
}

// ../../node_modules/typebox/build/type/script/token/unsigned_integer.mjs
function TakeNonZero(input) {
  return Take(NonZero, input);
}
var AllowedDigits = [...Digit, UnderScore];
function TakeDigits(input) {
  return Many(AllowedDigits, [UnderScore], input);
}
function TakeUnsignedInteger(input) {
  return Match2(Take([Zero], input), (Zero2, ZeroRest) => [Zero2, ZeroRest], () => Match2(TakeNonZero(input), (NonZero2, NonZeroRest) => Match2(TakeDigits(NonZeroRest), (Digits, DigitsRest) => [`${NonZero2}${Digits}`, DigitsRest], () => []), () => []));
}
function UnsignedInteger(input) {
  return TakeUnsignedInteger(Trim(input));
}

// ../../node_modules/typebox/build/type/script/token/integer.mjs
function TakeSign(input) {
  return Optional3(Hyphen, input);
}
function TakeSignedInteger(input) {
  return Match2(TakeSign(input), (Sign, SignRest) => Match2(UnsignedInteger(SignRest), (UnsignedInteger2, UnsignedIntegerRest) => [`${Sign}${UnsignedInteger2}`, UnsignedIntegerRest], () => []), () => []);
}
function Integer3(input) {
  return TakeSignedInteger(Trim(input));
}

// ../../node_modules/typebox/build/type/script/token/bigint.mjs
function TakeBigInt(input) {
  return Match2(Integer3(input), (Integer4, IntegerRest) => Match2(Take(["n"], IntegerRest), (_N, NRest) => [`${Integer4}`, NRest], () => []), () => []);
}
function BigInt4(input) {
  return TakeBigInt(input);
}
// ../../node_modules/typebox/build/type/script/token/const.mjs
function TakeConst(const_, input) {
  return Take([const_], input);
}
function Const2(const_, input) {
  return IsEqual(const_, "") ? ["", input] : const_.startsWith(NewLine) ? TakeConst(const_, TrimWhitespace(input)) : const_.startsWith(WhiteSpace) ? TakeConst(const_, input) : TakeConst(const_, Trim(input));
}
// ../../node_modules/typebox/build/type/script/token/ident.mjs
var Initial = [...Alpha, UnderScore, DollarSign];
function TakeInitial(input) {
  return Take(Initial, input);
}
var Remaining = [...Initial, ...Digit];
function TakeRemaining(input, result = "") {
  return Match2(Take(Remaining, input), (Remaining2, RemainingRest) => TakeRemaining(RemainingRest, `${result}${Remaining2}`), () => [result, input]);
}
function TakeIdent(input) {
  return Match2(TakeInitial(input), (Initial2, InitialRest) => Match2(TakeRemaining(InitialRest), (Remaining2, RemainingRest) => [`${Initial2}${Remaining2}`, RemainingRest], () => []), () => []);
}
function Ident(input) {
  return TakeIdent(Trim(input));
}
// ../../node_modules/typebox/build/type/script/token/unsigned_number.mjs
var AllowedDigits2 = [...Digit, UnderScore];
function IsLeadingDot(input) {
  return IsMatch(Take([Dot], input));
}
function TakeFractional(input) {
  return Match2(Many(AllowedDigits2, [UnderScore], input), (Digits, DigitsRest) => IsEqual(Digits, "") ? [] : [Digits, DigitsRest], () => []);
}
function LeadingDot(input) {
  return Match2(Take([Dot], input), (Dot2, DotRest) => Match2(TakeFractional(DotRest), (Fractional, FractionalRest) => [`0${Dot2}${Fractional}`, FractionalRest], () => []), () => []);
}
function LeadingInteger(input) {
  return Match2(UnsignedInteger(input), (Integer4, IntegerRest) => Match2(Take([Dot], IntegerRest), (Dot2, DotRest) => Match2(TakeFractional(DotRest), (Fractional, FractionalRest) => [`${Integer4}${Dot2}${Fractional}`, FractionalRest], () => [`${Integer4}`, DotRest]), () => [`${Integer4}`, IntegerRest]), () => []);
}
function TakeUnsignedNumber(input) {
  return IsLeadingDot(input) ? LeadingDot(input) : LeadingInteger(input);
}
function UnsignedNumber(input) {
  return TakeUnsignedNumber(Trim(input));
}

// ../../node_modules/typebox/build/type/script/token/number.mjs
function TakeSign2(input) {
  return Optional3(Hyphen, input);
}
function TakeSignedNumber(input) {
  return Match2(TakeSign2(input), (Sign, SignRest) => Match2(UnsignedNumber(SignRest), (UnsignedInteger2, UnsignedIntegerRest) => [`${Sign}${UnsignedInteger2}`, UnsignedIntegerRest], () => []), () => []);
}
function Number4(input) {
  return TakeSignedNumber(Trim(input));
}
// ../../node_modules/typebox/build/type/script/token/until.mjs
function TakeOne(input) {
  const result = IsEqual(input, "") ? [] : [input.slice(0, 1), input.slice(1)];
  return result;
}
function IsInputMatchSentinal(end, input) {
  return TakeLeft(end, (left, right) => input.startsWith(left) ? true : IsInputMatchSentinal(right, input), () => false);
}
function Until(end, input, result = "") {
  return Match2(TakeOne(input), (One, Rest3) => IsInputMatchSentinal(end, input) ? [result, input] : Until(end, Rest3, `${result}${One}`), () => []);
}

// ../../node_modules/typebox/build/type/script/token/span.mjs
function MultiLine(start, end, input) {
  return Match2(Take([start], input), (_, Rest3) => Match2(Until([end], Rest3), (Until2, UntilRest) => Match2(Take([end], UntilRest), (_2, Rest4) => [`${Until2}`, Rest4], () => []), () => []), () => []);
}
function SingleLine(start, end, input) {
  return Match2(Take([start], input), (_, Rest3) => Match2(Until([NewLine, end], Rest3), (Until2, UntilRest) => Match2(Take([end], UntilRest), (_2, EndRest) => [`${Until2}`, EndRest], () => []), () => []), () => []);
}
function Span(start, end, multiLine, input) {
  return multiLine ? MultiLine(start, end, Trim(input)) : SingleLine(start, end, Trim(input));
}
// ../../node_modules/typebox/build/type/script/token/string.mjs
function TakeInitial2(quotes, input) {
  return Take(quotes, input);
}
function TakeSpan(quote, input) {
  return Span(quote, quote, false, input);
}
function TakeString(quotes, input) {
  return Match2(TakeInitial2(quotes, input), (Initial2, InitialRest) => TakeSpan(Initial2, `${Initial2}${InitialRest}`), () => []);
}
function String4(quotes, input) {
  return TakeString(quotes, Trim(input));
}
// ../../node_modules/typebox/build/type/script/token/until_1.mjs
function Until_1(end, input) {
  return Match2(Until(end, input), (Until2, UntilRest) => IsEqual(Until2, "") ? [] : [Until2, UntilRest], () => []);
}
// ../../node_modules/typebox/build/type/script/parser.mjs
var If = (result, left, right = () => []) => result.length === 2 ? left(result) : right();
var GenericParameterExtendsEquals = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2("extends", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => If(Const2("=", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [GenericParameterExtendsEqualsMapping(_0), input2]);
var GenericParameterExtends = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2("extends", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [GenericParameterExtendsMapping(_0), input2]);
var GenericParameterEquals = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2("=", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [GenericParameterEqualsMapping(_0), input2]);
var GenericParameterIdentifier = (input) => If(Ident(input), ([_0, input2]) => [GenericParameterIdentifierMapping(_0), input2]);
var GenericParameter = (input) => If(If(GenericParameterExtendsEquals(input), ([_0, input2]) => [_0, input2], () => If(GenericParameterExtends(input), ([_0, input2]) => [_0, input2], () => If(GenericParameterEquals(input), ([_0, input2]) => [_0, input2], () => If(GenericParameterIdentifier(input), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [GenericParameterMapping(_0), input2]);
var GenericParameterList_0 = (input, result = []) => If(If(GenericParameter(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => GenericParameterList_0(input2, [...result, _0]), () => [result, input]);
var GenericParameterList = (input) => If(If(GenericParameterList_0(input), ([_0, input2]) => If(If(If(GenericParameter(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [GenericParameterListMapping(_0), input2]);
var GenericParameters = (input) => If(If(Const2("<", input), ([_0, input2]) => If(GenericParameterList(input2), ([_1, input3]) => If(Const2(">", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [GenericParametersMapping(_0), input2]);
var GenericCallArgumentList_0 = (input, result = []) => If(If(Type2(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => GenericCallArgumentList_0(input2, [...result, _0]), () => [result, input]);
var GenericCallArgumentList = (input) => If(If(GenericCallArgumentList_0(input), ([_0, input2]) => If(If(If(Type2(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [GenericCallArgumentListMapping(_0), input2]);
var GenericCallArguments = (input) => If(If(Const2("<", input), ([_0, input2]) => If(GenericCallArgumentList(input2), ([_1, input3]) => If(Const2(">", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [GenericCallArgumentsMapping(_0), input2]);
var GenericCall = (input) => If(If(Ident(input), ([_0, input2]) => If(GenericCallArguments(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [GenericCallMapping(_0), input2]);
var OptionalSemiColon = (input) => If(If(If(Const2(";", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [OptionalSemiColonMapping(_0), input2]);
var KeywordString = (input) => If(Const2("string", input), ([_0, input2]) => [KeywordStringMapping(_0), input2]);
var KeywordNumber = (input) => If(Const2("number", input), ([_0, input2]) => [KeywordNumberMapping(_0), input2]);
var KeywordBoolean = (input) => If(Const2("boolean", input), ([_0, input2]) => [KeywordBooleanMapping(_0), input2]);
var KeywordUndefined = (input) => If(Const2("undefined", input), ([_0, input2]) => [KeywordUndefinedMapping(_0), input2]);
var KeywordNull = (input) => If(Const2("null", input), ([_0, input2]) => [KeywordNullMapping(_0), input2]);
var KeywordInteger = (input) => If(Const2("integer", input), ([_0, input2]) => [KeywordIntegerMapping(_0), input2]);
var KeywordBigInt = (input) => If(Const2("bigint", input), ([_0, input2]) => [KeywordBigIntMapping(_0), input2]);
var KeywordUnknown = (input) => If(Const2("unknown", input), ([_0, input2]) => [KeywordUnknownMapping(_0), input2]);
var KeywordAny = (input) => If(Const2("any", input), ([_0, input2]) => [KeywordAnyMapping(_0), input2]);
var KeywordObject = (input) => If(Const2("object", input), ([_0, input2]) => [KeywordObjectMapping(_0), input2]);
var KeywordNever = (input) => If(Const2("never", input), ([_0, input2]) => [KeywordNeverMapping(_0), input2]);
var KeywordSymbol = (input) => If(Const2("symbol", input), ([_0, input2]) => [KeywordSymbolMapping(_0), input2]);
var KeywordVoid = (input) => If(Const2("void", input), ([_0, input2]) => [KeywordVoidMapping(_0), input2]);
var KeywordThis = (input) => If(Const2("this", input), ([_0, input2]) => [KeywordThisMapping(_0), input2]);
var Keyword = (input) => If(If(KeywordString(input), ([_0, input2]) => [_0, input2], () => If(KeywordNumber(input), ([_0, input2]) => [_0, input2], () => If(KeywordBoolean(input), ([_0, input2]) => [_0, input2], () => If(KeywordUndefined(input), ([_0, input2]) => [_0, input2], () => If(KeywordNull(input), ([_0, input2]) => [_0, input2], () => If(KeywordInteger(input), ([_0, input2]) => [_0, input2], () => If(KeywordBigInt(input), ([_0, input2]) => [_0, input2], () => If(KeywordUnknown(input), ([_0, input2]) => [_0, input2], () => If(KeywordAny(input), ([_0, input2]) => [_0, input2], () => If(KeywordObject(input), ([_0, input2]) => [_0, input2], () => If(KeywordNever(input), ([_0, input2]) => [_0, input2], () => If(KeywordSymbol(input), ([_0, input2]) => [_0, input2], () => If(KeywordVoid(input), ([_0, input2]) => [_0, input2], () => If(KeywordThis(input), ([_0, input2]) => [_0, input2], () => [])))))))))))))), ([_0, input2]) => [KeywordMapping(_0), input2]);
var TemplateInterpolate = (input) => If(If(Const2("${", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => If(Const2("}", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [TemplateInterpolateMapping(_0), input2]);
var TemplateSpan = (input) => If(Until(["${", "`"], input), ([_0, input2]) => [TemplateSpanMapping(_0), input2]);
var TemplateBody = (input) => If(If(If(TemplateSpan(input), ([_0, input2]) => If(TemplateInterpolate(input2), ([_1, input3]) => If(TemplateBody(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If(If(TemplateSpan(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If(If(TemplateSpan(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => []))), ([_0, input2]) => [TemplateBodyMapping(_0), input2]);
var TemplateLiteralTypes = (input) => If(If(Const2("`", input), ([_0, input2]) => If(TemplateBody(input2), ([_1, input3]) => If(Const2("`", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [TemplateLiteralTypesMapping(_0), input2]);
var TemplateLiteral2 = (input) => If(TemplateLiteralTypes(input), ([_0, input2]) => [TemplateLiteralMapping(_0), input2]);
var LiteralBigInt = (input) => If(BigInt4(input), ([_0, input2]) => [LiteralBigIntMapping(_0), input2]);
var LiteralBoolean = (input) => If(If(Const2("true", input), ([_0, input2]) => [_0, input2], () => If(Const2("false", input), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [LiteralBooleanMapping(_0), input2]);
var LiteralNumber = (input) => If(Number4(input), ([_0, input2]) => [LiteralNumberMapping(_0), input2]);
var LiteralString = (input) => If(String4(["'", '"'], input), ([_0, input2]) => [LiteralStringMapping(_0), input2]);
var Literal3 = (input) => If(If(LiteralBigInt(input), ([_0, input2]) => [_0, input2], () => If(LiteralBoolean(input), ([_0, input2]) => [_0, input2], () => If(LiteralNumber(input), ([_0, input2]) => [_0, input2], () => If(LiteralString(input), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [LiteralMapping(_0), input2]);
var KeyOf2 = (input) => If(If(If(Const2("keyof", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [KeyOfMapping(_0), input2]);
var IndexArray_0 = (input, result = []) => If(If(If(Const2("[", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => If(Const2("]", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If(If(Const2("[", input), ([_0, input2]) => If(Const2("]", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => IndexArray_0(input2, [...result, _0]), () => [result, input]);
var IndexArray = (input) => If(IndexArray_0(input), ([_0, input2]) => [IndexArrayMapping(_0), input2]);
var Extends2 = (input) => If(If(If(Const2("extends", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => If(Const2("?", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => If(Const2(":", input5), ([_4, input6]) => If(Type2(input6), ([_5, input7]) => [[_0, _1, _2, _3, _4, _5], input7])))))), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ExtendsMapping(_0), input2]);
var Base2 = (input) => If(If(If(Const2("(", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => If(Const2(")", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If(Keyword(input), ([_0, input2]) => [_0, input2], () => If(_Object_3(input), ([_0, input2]) => [_0, input2], () => If(Tuple3(input), ([_0, input2]) => [_0, input2], () => If(TemplateLiteral2(input), ([_0, input2]) => [_0, input2], () => If(Literal3(input), ([_0, input2]) => [_0, input2], () => If(Constructor3(input), ([_0, input2]) => [_0, input2], () => If(_Function_2(input), ([_0, input2]) => [_0, input2], () => If(Mapped2(input), ([_0, input2]) => [_0, input2], () => If(Options(input), ([_0, input2]) => [_0, input2], () => If(GenericCall(input), ([_0, input2]) => [_0, input2], () => If(Reference(input), ([_0, input2]) => [_0, input2], () => [])))))))))))), ([_0, input2]) => [BaseMapping(_0), input2]);
var Factor = (input) => If(If(KeyOf2(input), ([_0, input2]) => If(Base2(input2), ([_1, input3]) => If(IndexArray(input3), ([_2, input4]) => If(Extends2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [FactorMapping(_0), input2]);
var ExprTermTail = (input) => If(If(If(Const2("&", input), ([_0, input2]) => If(Factor(input2), ([_1, input3]) => If(ExprTermTail(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ExprTermTailMapping(_0), input2]);
var ExprTerm = (input) => If(If(Factor(input), ([_0, input2]) => If(ExprTermTail(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ExprTermMapping(_0), input2]);
var ExprTail = (input) => If(If(If(Const2("|", input), ([_0, input2]) => If(ExprTerm(input2), ([_1, input3]) => If(ExprTail(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ExprTailMapping(_0), input2]);
var Expr = (input) => If(If(ExprTerm(input), ([_0, input2]) => If(ExprTail(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ExprMapping(_0), input2]);
var ExprReadonly = (input) => If(If(Const2("readonly", input), ([_0, input2]) => If(Expr(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ExprReadonlyMapping(_0), input2]);
var ExprPipe = (input) => If(If(Const2("|", input), ([_0, input2]) => If(Expr(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ExprPipeMapping(_0), input2]);
var GenericType = (input) => If(If(GenericParameters(input), ([_0, input2]) => If(Const2("=", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [GenericTypeMapping(_0), input2]);
var InferType = (input) => If(If(If(Const2("infer", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(Const2("extends", input3), ([_2, input4]) => If(Expr(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [_0, input2], () => If(If(Const2("infer", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [InferTypeMapping(_0), input2]);
var Type2 = (input) => If(If(InferType(input), ([_0, input2]) => [_0, input2], () => If(ExprPipe(input), ([_0, input2]) => [_0, input2], () => If(ExprReadonly(input), ([_0, input2]) => [_0, input2], () => If(Expr(input), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [TypeMapping(_0), input2]);
var PropertyKeyNumber = (input) => If(Number4(input), ([_0, input2]) => [PropertyKeyNumberMapping(_0), input2]);
var PropertyKeyIdent = (input) => If(Ident(input), ([_0, input2]) => [PropertyKeyIdentMapping(_0), input2]);
var PropertyKeyQuoted = (input) => If(String4(["'", '"'], input), ([_0, input2]) => [PropertyKeyQuotedMapping(_0), input2]);
var PropertyKeyIndex = (input) => If(If(Const2("[", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(Const2(":", input3), ([_2, input4]) => If(If(KeywordInteger(input4), ([_02, input5]) => [_02, input5], () => If(KeywordNumber(input4), ([_02, input5]) => [_02, input5], () => If(KeywordString(input4), ([_02, input5]) => [_02, input5], () => If(KeywordSymbol(input4), ([_02, input5]) => [_02, input5], () => [])))), ([_3, input5]) => If(Const2("]", input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [PropertyKeyIndexMapping(_0), input2]);
var PropertyKey = (input) => If(If(PropertyKeyNumber(input), ([_0, input2]) => [_0, input2], () => If(PropertyKeyIdent(input), ([_0, input2]) => [_0, input2], () => If(PropertyKeyQuoted(input), ([_0, input2]) => [_0, input2], () => If(PropertyKeyIndex(input), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [PropertyKeyMapping(_0), input2]);
var Readonly3 = (input) => If(If(If(Const2("readonly", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ReadonlyMapping(_0), input2]);
var Optional4 = (input) => If(If(If(Const2("?", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [OptionalMapping(_0), input2]);
var Property2 = (input) => If(If(Readonly3(input), ([_0, input2]) => If(PropertyKey(input2), ([_1, input3]) => If(Optional4(input3), ([_2, input4]) => If(Const2(":", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [PropertyMapping(_0), input2]);
var PropertyDelimiter = (input) => If(If(If(Const2(",", input), ([_0, input2]) => If(Const2(`
`, input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2(";", input), ([_0, input2]) => If(Const2(`
`, input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2(",", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If(If(Const2(";", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If(If(Const2(`
`, input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => []))))), ([_0, input2]) => [PropertyDelimiterMapping(_0), input2]);
var PropertyList_0 = (input, result = []) => If(If(Property2(input), ([_0, input2]) => If(PropertyDelimiter(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => PropertyList_0(input2, [...result, _0]), () => [result, input]);
var PropertyList = (input) => If(If(PropertyList_0(input), ([_0, input2]) => If(If(If(Property2(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [PropertyListMapping(_0), input2]);
var Properties = (input) => If(If(Const2("{", input), ([_0, input2]) => If(PropertyList(input2), ([_1, input3]) => If(Const2("}", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [PropertiesMapping(_0), input2]);
var _Object_3 = (input) => If(Properties(input), ([_0, input2]) => [_Object_Mapping(_0), input2]);
var ElementNamed = (input) => If(If(If(Ident(input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => If(Const2(":", input3), ([_2, input4]) => If(Const2("readonly", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [_0, input2], () => If(If(Ident(input), ([_0, input2]) => If(Const2(":", input2), ([_1, input3]) => If(Const2("readonly", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [_0, input2], () => If(If(Ident(input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => If(Const2(":", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [_0, input2], () => If(If(Ident(input), ([_0, input2]) => If(Const2(":", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [ElementNamedMapping(_0), input2]);
var ElementReadonlyOptional = (input) => If(If(Const2("readonly", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => If(Const2("?", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [ElementReadonlyOptionalMapping(_0), input2]);
var ElementReadonly = (input) => If(If(Const2("readonly", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ElementReadonlyMapping(_0), input2]);
var ElementOptional = (input) => If(If(Type2(input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ElementOptionalMapping(_0), input2]);
var ElementBase = (input) => If(If(ElementNamed(input), ([_0, input2]) => [_0, input2], () => If(ElementReadonlyOptional(input), ([_0, input2]) => [_0, input2], () => If(ElementReadonly(input), ([_0, input2]) => [_0, input2], () => If(ElementOptional(input), ([_0, input2]) => [_0, input2], () => If(Type2(input), ([_0, input2]) => [_0, input2], () => []))))), ([_0, input2]) => [ElementBaseMapping(_0), input2]);
var Element = (input) => If(If(If(Const2("...", input), ([_0, input2]) => If(ElementBase(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(ElementBase(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ElementMapping(_0), input2]);
var ElementList_0 = (input, result = []) => If(If(Element(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => ElementList_0(input2, [...result, _0]), () => [result, input]);
var ElementList = (input) => If(If(ElementList_0(input), ([_0, input2]) => If(If(If(Element(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ElementListMapping(_0), input2]);
var Tuple3 = (input) => If(If(Const2("[", input), ([_0, input2]) => If(ElementList(input2), ([_1, input3]) => If(Const2("]", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [TupleMapping(_0), input2]);
var ParameterReadonlyOptional = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => If(Const2(":", input3), ([_2, input4]) => If(Const2("readonly", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [ParameterReadonlyOptionalMapping(_0), input2]);
var ParameterReadonly = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2(":", input2), ([_1, input3]) => If(Const2("readonly", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [ParameterReadonlyMapping(_0), input2]);
var ParameterOptional = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => If(Const2(":", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [ParameterOptionalMapping(_0), input2]);
var ParameterType = (input) => If(If(Ident(input), ([_0, input2]) => If(Const2(":", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [ParameterTypeMapping(_0), input2]);
var ParameterBase = (input) => If(If(ParameterReadonlyOptional(input), ([_0, input2]) => [_0, input2], () => If(ParameterReadonly(input), ([_0, input2]) => [_0, input2], () => If(ParameterOptional(input), ([_0, input2]) => [_0, input2], () => If(ParameterType(input), ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [ParameterBaseMapping(_0), input2]);
var Parameter2 = (input) => If(If(If(Const2("...", input), ([_0, input2]) => If(ParameterBase(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(ParameterBase(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ParameterMapping(_0), input2]);
var ParameterList_0 = (input, result = []) => If(If(Parameter2(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => ParameterList_0(input2, [...result, _0]), () => [result, input]);
var ParameterList = (input) => If(If(ParameterList_0(input), ([_0, input2]) => If(If(If(Parameter2(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ParameterListMapping(_0), input2]);
var _Function_2 = (input) => If(If(Const2("(", input), ([_0, input2]) => If(ParameterList(input2), ([_1, input3]) => If(Const2(")", input3), ([_2, input4]) => If(Const2("=>", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [_Function_Mapping(_0), input2]);
var Constructor3 = (input) => If(If(Const2("new", input), ([_0, input2]) => If(Const2("(", input2), ([_1, input3]) => If(ParameterList(input3), ([_2, input4]) => If(Const2(")", input4), ([_3, input5]) => If(Const2("=>", input5), ([_4, input6]) => If(Type2(input6), ([_5, input7]) => [[_0, _1, _2, _3, _4, _5], input7])))))), ([_0, input2]) => [ConstructorMapping(_0), input2]);
var MappedReadonly = (input) => If(If(If(Const2("+", input), ([_0, input2]) => If(Const2("readonly", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2("-", input), ([_0, input2]) => If(Const2("readonly", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2("readonly", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [MappedReadonlyMapping(_0), input2]);
var MappedOptional = (input) => If(If(If(Const2("+", input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2("-", input), ([_0, input2]) => If(Const2("?", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2("?", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])))), ([_0, input2]) => [MappedOptionalMapping(_0), input2]);
var MappedAs = (input) => If(If(If(Const2("as", input), ([_0, input2]) => If(Type2(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [MappedAsMapping(_0), input2]);
var Mapped2 = (input) => If(If(Const2("{", input), ([_0, input2]) => If(MappedReadonly(input2), ([_1, input3]) => If(Const2("[", input3), ([_2, input4]) => If(Ident(input4), ([_3, input5]) => If(Const2("in", input5), ([_4, input6]) => If(Type2(input6), ([_5, input7]) => If(MappedAs(input7), ([_6, input8]) => If(Const2("]", input8), ([_7, input9]) => If(MappedOptional(input9), ([_8, input10]) => If(Const2(":", input10), ([_9, input11]) => If(Type2(input11), ([_10, input12]) => If(OptionalSemiColon(input12), ([_11, input13]) => If(Const2("}", input13), ([_12, input14]) => [[_0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12], input14]))))))))))))), ([_0, input2]) => [MappedMapping(_0), input2]);
var Reference = (input) => If(Ident(input), ([_0, input2]) => [ReferenceMapping(_0), input2]);
var Options = (input) => If(If(Const2("Options", input), ([_0, input2]) => If(Const2("<", input2), ([_1, input3]) => If(Type2(input3), ([_2, input4]) => If(Const2(",", input4), ([_3, input5]) => If(JsonObject(input5), ([_4, input6]) => If(Const2(">", input6), ([_5, input7]) => [[_0, _1, _2, _3, _4, _5], input7])))))), ([_0, input2]) => [OptionsMapping(_0), input2]);
var JsonNumber = (input) => If(Number4(input), ([_0, input2]) => [JsonNumberMapping(_0), input2]);
var JsonBoolean = (input) => If(If(Const2("true", input), ([_0, input2]) => [_0, input2], () => If(Const2("false", input), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [JsonBooleanMapping(_0), input2]);
var JsonString = (input) => If(String4(['"', "'"], input), ([_0, input2]) => [JsonStringMapping(_0), input2]);
var JsonNull = (input) => If(Const2("null", input), ([_0, input2]) => [JsonNullMapping(_0), input2]);
var JsonProperty = (input) => If(If(PropertyKey(input), ([_0, input2]) => If(Const2(":", input2), ([_1, input3]) => If(Json(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [JsonPropertyMapping(_0), input2]);
var JsonPropertyList_0 = (input, result = []) => If(If(JsonProperty(input), ([_0, input2]) => If(PropertyDelimiter(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => JsonPropertyList_0(input2, [...result, _0]), () => [result, input]);
var JsonPropertyList = (input) => If(If(JsonPropertyList_0(input), ([_0, input2]) => If(If(If(JsonProperty(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [JsonPropertyListMapping(_0), input2]);
var JsonObject = (input) => If(If(Const2("{", input), ([_0, input2]) => If(JsonPropertyList(input2), ([_1, input3]) => If(Const2("}", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [JsonObjectMapping(_0), input2]);
var JsonElementList_0 = (input, result = []) => If(If(Json(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => JsonElementList_0(input2, [...result, _0]), () => [result, input]);
var JsonElementList = (input) => If(If(JsonElementList_0(input), ([_0, input2]) => If(If(If(Json(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [JsonElementListMapping(_0), input2]);
var JsonArray = (input) => If(If(Const2("[", input), ([_0, input2]) => If(JsonElementList(input2), ([_1, input3]) => If(Const2("]", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [JsonArrayMapping(_0), input2]);
var Json = (input) => If(If(JsonNumber(input), ([_0, input2]) => [_0, input2], () => If(JsonBoolean(input), ([_0, input2]) => [_0, input2], () => If(JsonString(input), ([_0, input2]) => [_0, input2], () => If(JsonNull(input), ([_0, input2]) => [_0, input2], () => If(JsonObject(input), ([_0, input2]) => [_0, input2], () => If(JsonArray(input), ([_0, input2]) => [_0, input2], () => [])))))), ([_0, input2]) => [JsonMapping(_0), input2]);
var PatternBigInt = (input) => If(Const2("-?(?:0|[1-9][0-9]*)n", input), ([_0, input2]) => [PatternBigIntMapping(_0), input2]);
var PatternString2 = (input) => If(Const2(".*", input), ([_0, input2]) => [PatternStringMapping(_0), input2]);
var PatternNumber2 = (input) => If(Const2("-?(?:0|[1-9][0-9]*)(?:.[0-9]+)?", input), ([_0, input2]) => [PatternNumberMapping(_0), input2]);
var PatternInteger = (input) => If(Const2("-?(?:0|[1-9][0-9]*)", input), ([_0, input2]) => [PatternIntegerMapping(_0), input2]);
var PatternNever2 = (input) => If(Const2("(?!)", input), ([_0, input2]) => [PatternNeverMapping(_0), input2]);
var PatternText = (input) => If(Until_1(["-?(?:0|[1-9][0-9]*)n", ".*", "-?(?:0|[1-9][0-9]*)(?:.[0-9]+)?", "-?(?:0|[1-9][0-9]*)", "(?!)", "(", ")", "$", "|"], input), ([_0, input2]) => [PatternTextMapping(_0), input2]);
var PatternBase = (input) => If(If(PatternBigInt(input), ([_0, input2]) => [_0, input2], () => If(PatternString2(input), ([_0, input2]) => [_0, input2], () => If(PatternNumber2(input), ([_0, input2]) => [_0, input2], () => If(PatternInteger(input), ([_0, input2]) => [_0, input2], () => If(PatternNever2(input), ([_0, input2]) => [_0, input2], () => If(PatternGroup(input), ([_0, input2]) => [_0, input2], () => If(PatternText(input), ([_0, input2]) => [_0, input2], () => []))))))), ([_0, input2]) => [PatternBaseMapping(_0), input2]);
var PatternGroup = (input) => If(If(Const2("(", input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => If(Const2(")", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [PatternGroupMapping(_0), input2]);
var PatternUnion = (input) => If(If(If(PatternTerm(input), ([_0, input2]) => If(Const2("|", input2), ([_1, input3]) => If(PatternUnion(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [_0, input2], () => If(If(PatternTerm(input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => []))), ([_0, input2]) => [PatternUnionMapping(_0), input2]);
var PatternTerm = (input) => If(If(PatternBase(input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [PatternTermMapping(_0), input2]);
var PatternBody = (input) => If(If(PatternUnion(input), ([_0, input2]) => [_0, input2], () => If(PatternTerm(input), ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [PatternBodyMapping(_0), input2]);
var Pattern = (input) => If(If(Const2("^", input), ([_0, input2]) => If(PatternBody(input2), ([_1, input3]) => If(Const2("$", input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [PatternMapping(_0), input2]);
var InterfaceDeclarationHeritageList_0 = (input, result = []) => If(If(Type2(input), ([_0, input2]) => If(Const2(",", input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => InterfaceDeclarationHeritageList_0(input2, [...result, _0]), () => [result, input]);
var InterfaceDeclarationHeritageList = (input) => If(If(InterfaceDeclarationHeritageList_0(input), ([_0, input2]) => If(If(If(Type2(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [InterfaceDeclarationHeritageListMapping(_0), input2]);
var InterfaceDeclarationHeritage = (input) => If(If(If(Const2("extends", input), ([_0, input2]) => If(InterfaceDeclarationHeritageList(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [InterfaceDeclarationHeritageMapping(_0), input2]);
var InterfaceDeclarationGeneric = (input) => If(If(Const2("interface", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(GenericParameters(input3), ([_2, input4]) => If(InterfaceDeclarationHeritage(input4), ([_3, input5]) => If(Properties(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [InterfaceDeclarationGenericMapping(_0), input2]);
var InterfaceDeclaration = (input) => If(If(Const2("interface", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(InterfaceDeclarationHeritage(input3), ([_2, input4]) => If(Properties(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [InterfaceDeclarationMapping(_0), input2]);
var TypeAliasDeclarationGeneric = (input) => If(If(Const2("type", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(GenericParameters(input3), ([_2, input4]) => If(Const2("=", input4), ([_3, input5]) => If(Type2(input5), ([_4, input6]) => [[_0, _1, _2, _3, _4], input6]))))), ([_0, input2]) => [TypeAliasDeclarationGenericMapping(_0), input2]);
var TypeAliasDeclaration = (input) => If(If(Const2("type", input), ([_0, input2]) => If(Ident(input2), ([_1, input3]) => If(Const2("=", input3), ([_2, input4]) => If(Type2(input4), ([_3, input5]) => [[_0, _1, _2, _3], input5])))), ([_0, input2]) => [TypeAliasDeclarationMapping(_0), input2]);
var ExportKeyword = (input) => If(If(If(Const2("export", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If([[], input], ([_0, input2]) => [_0, input2], () => [])), ([_0, input2]) => [ExportKeywordMapping(_0), input2]);
var ModuleDeclarationDelimiter = (input) => If(If(If(Const2(";", input), ([_0, input2]) => If(Const2(`
`, input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [_0, input2], () => If(If(Const2(";", input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => If(If(Const2(`
`, input), ([_0, input2]) => [[_0], input2]), ([_0, input2]) => [_0, input2], () => []))), ([_0, input2]) => [ModuleDeclarationDelimiterMapping(_0), input2]);
var ModuleDeclarationList_0 = (input, result = []) => If(If(ModuleDeclaration(input), ([_0, input2]) => If(ModuleDeclarationDelimiter(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => ModuleDeclarationList_0(input2, [...result, _0]), () => [result, input]);
var ModuleDeclarationList = (input) => If(If(ModuleDeclarationList_0(input), ([_0, input2]) => If(If(If(ModuleDeclaration(input2), ([_02, input3]) => [[_02], input3]), ([_02, input3]) => [_02, input3], () => If([[], input2], ([_02, input3]) => [_02, input3], () => [])), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ModuleDeclarationListMapping(_0), input2]);
var ModuleDeclaration = (input) => If(If(ExportKeyword(input), ([_0, input2]) => If(If(InterfaceDeclarationGeneric(input2), ([_02, input3]) => [_02, input3], () => If(InterfaceDeclaration(input2), ([_02, input3]) => [_02, input3], () => If(TypeAliasDeclarationGeneric(input2), ([_02, input3]) => [_02, input3], () => If(TypeAliasDeclaration(input2), ([_02, input3]) => [_02, input3], () => [])))), ([_1, input3]) => If(OptionalSemiColon(input3), ([_2, input4]) => [[_0, _1, _2], input4]))), ([_0, input2]) => [ModuleDeclarationMapping(_0), input2]);
var Module2 = (input) => If(If(ModuleDeclaration(input), ([_0, input2]) => If(ModuleDeclarationList(input2), ([_1, input3]) => [[_0, _1], input3])), ([_0, input2]) => [ModuleMapping(_0), input2]);
var Script = (input) => If(If(Module2(input), ([_0, input2]) => [_0, input2], () => If(GenericType(input), ([_0, input2]) => [_0, input2], () => If(Type2(input), ([_0, input2]) => [_0, input2], () => []))), ([_0, input2]) => [ScriptMapping(_0), input2]);

// ../../node_modules/typebox/build/type/engine/patterns/template.mjs
function ParseTemplateIntoTypes(template) {
  const parsed = TemplateLiteralTypes(`\`${template}\``);
  const result = exports_guard.IsEqual(parsed.length, 2) ? parsed[0] : Unreachable();
  return result;
}

// ../../node_modules/typebox/build/type/engine/template_literal/encode.mjs
function JoinString(input) {
  return input.join("|");
}
function UnwrapTemplateLiteralPattern(pattern) {
  return pattern.slice(1, pattern.length - 1);
}
function EncodeLiteral(value, right, pattern) {
  return EncodeTypes(right, `${pattern}${value}`);
}
function EncodeBigInt(right, pattern) {
  return EncodeTypes(right, `${pattern}${BigIntPattern}`);
}
function EncodeInteger(right, pattern) {
  return EncodeTypes(right, `${pattern}${IntegerPattern}`);
}
function EncodeNumber(right, pattern) {
  return EncodeTypes(right, `${pattern}${NumberPattern}`);
}
function EncodeBoolean(right, pattern) {
  return EncodeType(Union3([Literal2("false"), Literal2("true")]), right, pattern);
}
function EncodeString(right, pattern) {
  return EncodeTypes(right, `${pattern}${StringPattern}`);
}
function EncodeTemplateLiteral(templatePattern, right, pattern) {
  return EncodeTypes(right, `${pattern}${UnwrapTemplateLiteralPattern(templatePattern)}`);
}
function EncodeTemplateLiteralDeferred(types, right, pattern) {
  const templateLiteral = TemplateLiteralAction(types, {});
  const result = EncodeType(templateLiteral, right, pattern);
  return result;
}
function EncodeEnum(types, right, pattern) {
  const variants = EnumValuesToVariants(types);
  return EncodeUnion(variants, right, pattern);
}
function EncodeUnion(types, right, pattern, result = []) {
  return exports_guard.TakeLeft(types, (head, tail) => EncodeUnion(tail, right, pattern, [...result, EncodeType(head, [], "")]), () => EncodeTypes(right, `${pattern}(${JoinString(result)})`));
}
function EncodeType(type, right, pattern) {
  return IsEnum(type) ? EncodeEnum(type.enum, right, pattern) : IsInteger5(type) ? EncodeInteger(right, pattern) : IsLiteral3(type) ? EncodeLiteral(type.const, right, pattern) : IsBigInt6(type) ? EncodeBigInt(right, pattern) : IsBoolean6(type) ? EncodeBoolean(right, pattern) : IsNumber6(type) ? EncodeNumber(right, pattern) : IsString6(type) ? EncodeString(right, pattern) : IsTemplateLiteral3(type) ? EncodeTemplateLiteral(type.pattern, right, pattern) : IsTemplateLiteralDeferred(type) ? EncodeTemplateLiteralDeferred(type.parameters[0], right, pattern) : IsUnion3(type) ? EncodeUnion(type.anyOf, right, pattern) : NeverPattern;
}
function EncodeTypes(types, pattern) {
  return exports_guard.TakeLeft(types, (left, right) => EncodeType(left, right, pattern), () => pattern);
}
function EncodePattern(types) {
  const encoded = EncodeTypes(types, "");
  const result = `^${encoded}$`;
  return result;
}
function TemplateLiteralEncode(types) {
  const pattern = EncodePattern(types);
  const result = TemplateLiteralCreate(pattern);
  return result;
}

// ../../node_modules/typebox/build/type/engine/template_literal/instantiate.mjs
function TemplateLiteralAction(types, options) {
  const result = CanInstantiate(types) ? exports_memory.Update(TemplateLiteralEncode(types), {}, options) : TemplateLiteralDeferred(types, options);
  return result;
}
function TemplateLiteralInstantiate(context, state, types, options) {
  const instantiatedTypes = InstantiateTypes(context, state, types);
  return TemplateLiteralAction(instantiatedTypes, options);
}

// ../../node_modules/typebox/build/type/types/template_literal.mjs
function TemplateLiteralDeferred(types, options = {}) {
  return Deferred("TemplateLiteral", [types], options);
}
function IsTemplateLiteralDeferred(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "action") && exports_guard.IsEqual(value.action, "TemplateLiteral");
}
function TemplateLiteralFromTypes(types) {
  return TemplateLiteralAction(types, {});
}
function TemplateLiteralFromString(template) {
  const types = ParseTemplateIntoTypes(template);
  return TemplateLiteralFromTypes(types);
}
function TemplateLiteral3(input, options = {}) {
  const type = exports_guard.IsString(input) ? TemplateLiteralFromString(input) : TemplateLiteralFromTypes(input);
  return exports_memory.Update(type, {}, options);
}
function IsTemplateLiteral3(value) {
  return IsKind3(value, "TemplateLiteral");
}

// ../../node_modules/typebox/build/type/extends/result.mjs
var exports_result = {};
__export(exports_result, {
  Match: () => Match3,
  IsExtendsUnion: () => IsExtendsUnion,
  IsExtendsTrueLike: () => IsExtendsTrueLike,
  IsExtendsTrue: () => IsExtendsTrue,
  IsExtendsFalse: () => IsExtendsFalse,
  ExtendsUnion: () => ExtendsUnion,
  ExtendsTrue: () => ExtendsTrue,
  ExtendsFalse: () => ExtendsFalse
});
function ExtendsUnion(inferred) {
  return exports_memory.Create({ ["~kind"]: "ExtendsUnion" }, { inferred });
}
function IsExtendsUnion(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "inferred") && exports_guard.IsEqual(value["~kind"], "ExtendsUnion") && exports_guard.IsObject(value.inferred);
}
function ExtendsTrue(inferred) {
  return exports_memory.Create({ ["~kind"]: "ExtendsTrue" }, { inferred });
}
function IsExtendsTrue(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "inferred") && exports_guard.IsEqual(value["~kind"], "ExtendsTrue") && exports_guard.IsObject(value.inferred);
}
function ExtendsFalse() {
  return exports_memory.Create({ ["~kind"]: "ExtendsFalse" }, {});
}
function IsExtendsFalse(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.IsEqual(value["~kind"], "ExtendsFalse");
}
function IsExtendsTrueLike(value) {
  return IsExtendsUnion(value) || IsExtendsTrue(value);
}
function Match3(result, true_, false_) {
  return IsExtendsTrueLike(result) ? true_(result.inferred) : false_();
}
// ../../node_modules/typebox/build/type/extends/extends_right.mjs
function ExtendsRightInfer(inferred, name, left, right) {
  return Match3(ExtendsLeft(inferred, left, right), (checkInferred) => ExtendsTrue(exports_memory.Assign(exports_memory.Assign(inferred, checkInferred), { [name]: left })), () => ExtendsFalse());
}
function ExtendsRightAny(inferred, _left) {
  return ExtendsTrue(inferred);
}
function ExtendsRightEnum(inferred, left, right) {
  const union2 = EnumValuesToUnion(right);
  return ExtendsLeft(inferred, left, union2);
}
function ExtendsRightIntersect(inferred, left, right) {
  return exports_guard.TakeLeft(right, (head, tail) => Match3(ExtendsLeft(inferred, left, head), (inferred2) => ExtendsRightIntersect(inferred2, left, tail), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsRightTemplateLiteral(inferred, left, right) {
  const decoded = TemplateLiteralDecode(right);
  return ExtendsLeft(inferred, left, decoded);
}
function ExtendsRightUnion(inferred, left, right) {
  return exports_guard.TakeLeft(right, (head, tail) => Match3(ExtendsLeft(inferred, left, head), (inferred2) => ExtendsTrue(inferred2), () => ExtendsRightUnion(inferred, left, tail)), () => ExtendsFalse());
}
function ExtendsRight(inferred, left, right) {
  return IsAny3(right) ? ExtendsRightAny(inferred, left) : IsEnum(right) ? ExtendsRightEnum(inferred, left, right.enum) : IsInfer(right) ? ExtendsRightInfer(inferred, right.name, left, right.extends) : IsIntersect3(right) ? ExtendsRightIntersect(inferred, left, right.allOf) : IsTemplateLiteral3(right) ? ExtendsRightTemplateLiteral(inferred, left, right.pattern) : IsUnion3(right) ? ExtendsRightUnion(inferred, left, right.anyOf) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/extends/any.mjs
function ExtendsAny(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsUnion(inferred);
}

// ../../node_modules/typebox/build/type/extends/array.mjs
function ExtendsImmutable(left, right) {
  const isImmutableLeft = IsImmutable(left);
  const isImmutableRight = IsImmutable(right);
  return isImmutableLeft && isImmutableRight ? true : !isImmutableLeft && isImmutableRight ? true : isImmutableLeft && !isImmutableRight ? false : true;
}
function ExtendsArray(inferred, arrayLeft, left, right) {
  return IsArray6(right) ? ExtendsImmutable(arrayLeft, right) ? ExtendsLeft(inferred, left, right.items) : ExtendsFalse() : ExtendsRight(inferred, arrayLeft, right);
}

// ../../node_modules/typebox/build/type/extends/async_iterator.mjs
function ExtendsAsyncIterator(inferred, left, right) {
  return IsAsyncIterator6(right) ? ExtendsLeft(inferred, left, right.iteratorItems) : ExtendsRight(inferred, AsyncIterator2(left), right);
}

// ../../node_modules/typebox/build/type/extends/bigint.mjs
function ExtendsBigInt(inferred, left, right) {
  return IsBigInt6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/boolean.mjs
function ExtendsBoolean(inferred, left, right) {
  return IsBoolean6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/parameters.mjs
function ParameterCompare(inferred, left, leftRest, right, rightRest) {
  const checkLeft = IsInfer(right) ? left : right;
  const checkRight = IsInfer(right) ? right : left;
  const isLeftOptional = IsOptional3(left);
  const isRightOptional = IsOptional3(right);
  return !isLeftOptional && isRightOptional ? ExtendsFalse() : Match3(ExtendsLeft(inferred, checkLeft, checkRight), (inferred2) => ExtendsParameters(inferred2, leftRest, rightRest), () => ExtendsFalse());
}
function ParameterRight(inferred, left, leftRest, rightRest) {
  return exports_guard.TakeLeft(rightRest, (head, tail) => ParameterCompare(inferred, left, leftRest, head, tail), () => IsOptional3(left) ? ExtendsTrue(inferred) : ExtendsFalse());
}
function ParametersLeft(inferred, left, rightRest) {
  return exports_guard.TakeLeft(left, (head, tail) => ParameterRight(inferred, head, tail, rightRest), () => ExtendsTrue(inferred));
}
function ExtendsParameters(inferred, left, right) {
  return ParametersLeft(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/return_type.mjs
function ExtendsReturnType(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : ExtendsLeft(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/constructor.mjs
function ExtendsConstructor(inferred, parameters, returnType, right) {
  return IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : IsConstructor4(right) ? Match3(ExtendsParameters(inferred, parameters, right["parameters"]), (inferred2) => ExtendsReturnType(inferred2, returnType, right["instanceType"]), () => ExtendsFalse()) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/extends/enum.mjs
function ExtendsEnum(inferred, left, right) {
  return ExtendsLeft(inferred, EnumToUnion(left), right);
}

// ../../node_modules/typebox/build/type/extends/function.mjs
function ExtendsFunction(inferred, parameters, returnType, right) {
  return IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : IsFunction6(right) ? Match3(ExtendsParameters(inferred, parameters, right["parameters"]), (inferred2) => ExtendsReturnType(inferred2, returnType, right["returnType"]), () => ExtendsFalse()) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/extends/integer.mjs
function ExtendsInteger(inferred, left, right) {
  return IsInteger5(right) ? ExtendsTrue(inferred) : IsNumber6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/intersect.mjs
function ExtendsIntersect(inferred, left, right) {
  const evaluated = EvaluateIntersect(left);
  return ExtendsLeft(inferred, evaluated, right);
}

// ../../node_modules/typebox/build/type/extends/iterator.mjs
function ExtendsIterator(inferred, left, right) {
  return IsIterator6(right) ? ExtendsLeft(inferred, left, right.iteratorItems) : ExtendsRight(inferred, Iterator2(left), right);
}

// ../../node_modules/typebox/build/type/extends/literal.mjs
function ExtendsLiteralValue(inferred, left, right) {
  return left === right ? ExtendsTrue(inferred) : ExtendsFalse();
}
function ExtendsLiteralBigInt(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsBigInt6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralBoolean(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsBoolean6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralNumber(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsNumber6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteralString(inferred, left, right) {
  return IsLiteral3(right) ? ExtendsLiteralValue(inferred, left, right.const) : IsString6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, Literal2(left), right);
}
function ExtendsLiteral(inferred, left, right) {
  return exports_guard.IsBigInt(left.const) ? ExtendsLiteralBigInt(inferred, left.const, right) : exports_guard.IsBoolean(left.const) ? ExtendsLiteralBoolean(inferred, left.const, right) : exports_guard.IsNumber(left.const) ? ExtendsLiteralNumber(inferred, left.const, right) : exports_guard.IsString(left.const) ? ExtendsLiteralString(inferred, left.const, right) : Unreachable();
}

// ../../node_modules/typebox/build/type/extends/never.mjs
function ExtendsNever(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : ExtendsTrue(inferred);
}

// ../../node_modules/typebox/build/type/extends/null.mjs
function ExtendsNull(inferred, left, right) {
  return IsNull6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/number.mjs
function ExtendsNumber(inferred, left, right) {
  return IsNumber6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/object.mjs
function ExtendsPropertyOptional(inferred, left, right) {
  return IsOptional3(left) ? IsOptional3(right) ? ExtendsTrue(inferred) : ExtendsFalse() : ExtendsTrue(inferred);
}
function ExtendsProperty(inferred, left, right) {
  return IsInfer(right) && IsNever3(right.extends) ? ExtendsFalse() : Match3(ExtendsLeft(inferred, left, right), (inferred2) => ExtendsPropertyOptional(inferred2, left, right), () => ExtendsFalse());
}
function ExtractInferredProperties(keys, properties2) {
  return keys.reduce((result, key) => {
    return key in properties2 ? IsExtendsTrueLike(properties2[key]) ? { ...result, ...properties2[key].inferred } : Unreachable() : Unreachable();
  }, {});
}
function ExtendsPropertiesComparer(inferred, left, right) {
  const properties2 = {};
  for (const rightKey of exports_guard.Keys(right)) {
    properties2[rightKey] = rightKey in left ? ExtendsProperty({}, left[rightKey], right[rightKey]) : IsOptional3(right[rightKey]) ? IsInfer(right[rightKey]) ? ExtendsTrue(exports_memory.Assign(inferred, { [right[rightKey].name]: right[rightKey].extends })) : ExtendsTrue(inferred) : ExtendsFalse();
  }
  const checked = exports_guard.Values(properties2).every((result) => IsExtendsTrueLike(result));
  const extracted = checked ? ExtractInferredProperties(exports_guard.Keys(properties2), properties2) : {};
  return checked ? ExtendsTrue(extracted) : ExtendsFalse();
}
function ExtendsProperties(inferred, left, right) {
  const compared = ExtendsPropertiesComparer(inferred, left, right);
  return IsExtendsTrueLike(compared) ? ExtendsTrue(exports_memory.Assign(inferred, compared.inferred)) : ExtendsFalse();
}
function ExtendsObjectToObject(inferred, left, right) {
  return ExtendsProperties(inferred, left, right);
}
function ExtendsObject(inferred, left, right) {
  return IsObject6(right) ? ExtendsObjectToObject(inferred, left, right.properties) : ExtendsRight(inferred, _Object_2(left), right);
}

// ../../node_modules/typebox/build/type/extends/promise.mjs
function ExtendsPromise(inferred, left, right) {
  return IsPromise4(right) ? ExtendsLeft(inferred, left, right.item) : ExtendsRight(inferred, _Promise_(left), right);
}

// ../../node_modules/typebox/build/type/extends/string.mjs
function ExtendsString(inferred, left, right) {
  return IsString6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/symbol.mjs
function ExtendsSymbol(inferred, left, right) {
  return IsSymbol6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/template_literal.mjs
function ExtendsTemplateLiteral(inferred, left, right) {
  const decoded = TemplateLiteralDecode(left);
  return ExtendsLeft(inferred, decoded, right);
}

// ../../node_modules/typebox/build/type/extends/inference.mjs
function Inferrable(name, type) {
  return exports_memory.Create({ "~kind": "Inferrable" }, { name, type }, {});
}
function IsInferable(value) {
  return exports_guard.IsObject(value) && exports_guard.HasPropertyKey(value, "~kind") && exports_guard.HasPropertyKey(value, "name") && exports_guard.HasPropertyKey(value, "type") && exports_guard.IsEqual(value["~kind"], "Inferrable") && exports_guard.IsString(value.name) && exports_guard.IsObject(value.type);
}
function TryRestInferable(type) {
  return IsRest(type) ? IsInfer(type.items) ? IsArray6(type.items.extends) ? Inferrable(type.items.name, type.items.extends.items) : IsUnknown3(type.items.extends) ? Inferrable(type.items.name, type.items.extends) : undefined : Unreachable() : undefined;
}
function TryInferable(type) {
  return IsInfer(type) ? Inferrable(type.name, type.extends) : undefined;
}
function TryInferResults(rest3, right, result = []) {
  return exports_guard.TakeLeft(rest3, (head, tail) => Match3(ExtendsLeft({}, head, right), () => TryInferResults(tail, right, [...result, head]), () => {
    return;
  }), () => result);
}
function InferTupleResult(inferred, name, left, right) {
  const results = TryInferResults(left, right);
  return exports_guard.IsArray(results) ? ExtendsTrue(exports_memory.Assign(inferred, { [name]: Tuple2(results) })) : ExtendsFalse();
}
function InferUnionResult(inferred, name, left, right) {
  const results = TryInferResults(left, right);
  return exports_guard.IsArray(results) ? ExtendsTrue(exports_memory.Assign(inferred, { [name]: Union3(results) })) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/extends/tuple.mjs
function Reverse(types) {
  return [...types].reverse();
}
function ApplyReverse(types, reversed) {
  return reversed ? Reverse(types) : types;
}
function Reversed(types) {
  const first = types.length > 0 ? types[0] : undefined;
  const inferrable = IsSchema3(first) ? TryRestInferable(first) : undefined;
  return IsSchema3(inferrable);
}
function ElementsCompare(inferred, reversed, left, leftRest, right, rightRest) {
  return Match3(ExtendsLeft(inferred, left, right), (checkInferred) => Elements(checkInferred, reversed, leftRest, rightRest), () => ExtendsFalse());
}
function ElementsLeft(inferred, reversed, leftRest, right, rightRest) {
  const inferable = TryRestInferable(right);
  return IsInferable(inferable) ? InferTupleResult(inferred, inferable["name"], ApplyReverse(leftRest, reversed), inferable["type"]) : exports_guard.TakeLeft(leftRest, (head, tail) => ElementsCompare(inferred, reversed, head, tail, right, rightRest), () => ExtendsFalse());
}
function ElementsRight(inferred, reversed, leftRest, rightRest) {
  return exports_guard.TakeLeft(rightRest, (head, tail) => ElementsLeft(inferred, reversed, leftRest, head, tail), () => exports_guard.IsEqual(leftRest.length, 0) ? ExtendsTrue(inferred) : ExtendsFalse());
}
function Elements(inferred, reversed, leftRest, rightRest) {
  return ElementsRight(inferred, reversed, leftRest, rightRest);
}
function ExtendsTupleToTuple(inferred, left, right) {
  const instantiatedRight = InstantiateElements(inferred, { callstack: [] }, right);
  const reversed = Reversed(instantiatedRight);
  return Elements(inferred, reversed, ApplyReverse(left, reversed), ApplyReverse(instantiatedRight, reversed));
}
function ExtendsTupleToArray(inferred, left, right) {
  const inferrable = TryInferable(right);
  return IsInferable(inferrable) ? InferUnionResult(inferred, inferrable["name"], left, inferrable["type"]) : exports_guard.TakeLeft(left, (head, tail) => Match3(ExtendsLeft(inferred, head, right), (inferred2) => ExtendsTupleToArray(inferred2, tail, right), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsTuple(inferred, left, right) {
  const instantiatedLeft = InstantiateElements(inferred, { callstack: [] }, left);
  return IsTuple3(right) ? ExtendsTupleToTuple(inferred, instantiatedLeft, right.items) : IsArray6(right) ? ExtendsTupleToArray(inferred, instantiatedLeft, right.items) : ExtendsRight(inferred, Tuple2(instantiatedLeft), right);
}

// ../../node_modules/typebox/build/type/extends/undefined.mjs
function ExtendsUndefined(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : IsUndefined6(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/union.mjs
function ExtendsUnionSome(inferred, type, unionTypes) {
  return exports_guard.TakeLeft(unionTypes, (head, tail) => Match3(ExtendsLeft(inferred, type, head), (inferred2) => ExtendsTrue(inferred2), () => ExtendsUnionSome(inferred, type, tail)), () => ExtendsFalse());
}
function ExtendsUnionLeft(inferred, left, right) {
  return exports_guard.TakeLeft(left, (head, tail) => Match3(ExtendsUnionSome(inferred, head, right), (inferred2) => ExtendsUnionLeft(inferred2, tail, right), () => ExtendsFalse()), () => ExtendsTrue(inferred));
}
function ExtendsUnion2(inferred, left, right) {
  const inferrable = TryInferable(right);
  return IsInferable(inferrable) ? InferUnionResult(inferred, inferrable.name, left, inferrable.type) : IsUnion3(right) ? ExtendsUnionLeft(inferred, left, right.anyOf) : ExtendsUnionLeft(inferred, left, [right]);
}

// ../../node_modules/typebox/build/type/extends/unknown.mjs
function ExtendsUnknown(inferred, left, right) {
  return IsInfer(right) ? ExtendsRight(inferred, left, right) : IsAny3(right) ? ExtendsTrue(inferred) : IsUnknown3(right) ? ExtendsTrue(inferred) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/extends/void.mjs
function ExtendsVoid(inferred, left, right) {
  return IsVoid3(right) ? ExtendsTrue(inferred) : ExtendsRight(inferred, left, right);
}

// ../../node_modules/typebox/build/type/extends/extends_left.mjs
function ExtendsLeft(inferred, left, right) {
  return IsAny3(left) ? ExtendsAny(inferred, left, right) : IsArray6(left) ? ExtendsArray(inferred, left, left.items, right) : IsAsyncIterator6(left) ? ExtendsAsyncIterator(inferred, left.iteratorItems, right) : IsBigInt6(left) ? ExtendsBigInt(inferred, left, right) : IsBoolean6(left) ? ExtendsBoolean(inferred, left, right) : IsConstructor4(left) ? ExtendsConstructor(inferred, left.parameters, left.instanceType, right) : IsEnum(left) ? ExtendsEnum(inferred, left, right) : IsFunction6(left) ? ExtendsFunction(inferred, left.parameters, left.returnType, right) : IsInteger5(left) ? ExtendsInteger(inferred, left, right) : IsIntersect3(left) ? ExtendsIntersect(inferred, left.allOf, right) : IsIterator6(left) ? ExtendsIterator(inferred, left.iteratorItems, right) : IsLiteral3(left) ? ExtendsLiteral(inferred, left, right) : IsNever3(left) ? ExtendsNever(inferred, left, right) : IsNull6(left) ? ExtendsNull(inferred, left, right) : IsNumber6(left) ? ExtendsNumber(inferred, left, right) : IsObject6(left) ? ExtendsObject(inferred, left.properties, right) : IsPromise4(left) ? ExtendsPromise(inferred, left.item, right) : IsString6(left) ? ExtendsString(inferred, left, right) : IsSymbol6(left) ? ExtendsSymbol(inferred, left, right) : IsTemplateLiteral3(left) ? ExtendsTemplateLiteral(inferred, left.pattern, right) : IsTuple3(left) ? ExtendsTuple(inferred, left.items, right) : IsUndefined6(left) ? ExtendsUndefined(inferred, left, right) : IsUnion3(left) ? ExtendsUnion2(inferred, left.anyOf, right) : IsUnknown3(left) ? ExtendsUnknown(inferred, left, right) : IsVoid3(left) ? ExtendsVoid(inferred, left, right) : ExtendsFalse();
}

// ../../node_modules/typebox/build/type/engine/interface/instantiate.mjs
function InterfaceOperation(heritage, properties2) {
  const result = EvaluateIntersect([...heritage, _Object_2(properties2)]);
  return result;
}
function InterfaceAction(heritage, properties2, options) {
  const result = CanInstantiate(heritage) ? exports_memory.Update(InterfaceOperation(heritage, properties2), {}, options) : InterfaceDeferred(heritage, properties2, options);
  return result;
}
function InterfaceInstantiate(context, state, heritage, properties2, options) {
  const instantiatedHeritage = InstantiateTypes(context, state, heritage);
  const instantiatedProperties = InstantiateProperties(context, state, properties2);
  return InterfaceAction(instantiatedHeritage, instantiatedProperties, options);
}

// ../../node_modules/typebox/build/type/action/interface.mjs
function InterfaceDeferred(heritage, properties2, options = {}) {
  return Deferred("Interface", [heritage, properties2], options);
}
function IsInterfaceDeferred(value) {
  return IsSchema3(value) && exports_guard.HasPropertyKey(value, "action") && exports_guard.IsEqual(value.action, "Interface");
}
function Interface(heritage, properties2, options = {}) {
  return InterfaceAction(heritage, properties2, options);
}

// ../../node_modules/typebox/build/type/engine/cyclic/check.mjs
function FromRef15(stack, context, ref2) {
  return stack.includes(ref2) ? true : FromType5([...stack, ref2], context, context[ref2]);
}
function FromProperties20(stack, context, properties2) {
  const types = PropertyValues(properties2);
  return FromTypes4(stack, context, types);
}
function FromTypes4(stack, context, types) {
  return exports_guard.TakeLeft(types, (left, right) => FromType5(stack, context, left) ? true : FromTypes4(stack, context, right), () => false);
}
function FromType5(stack, context, type) {
  return IsRef3(type) ? FromRef15(stack, context, type.$ref) : IsArray6(type) ? FromType5(stack, context, type.items) : IsAsyncIterator6(type) ? FromType5(stack, context, type.iteratorItems) : IsConstructor4(type) ? FromTypes4(stack, context, [...type.parameters, type.instanceType]) : IsFunction6(type) ? FromTypes4(stack, context, [...type.parameters, type.returnType]) : IsInterfaceDeferred(type) ? FromProperties20(stack, context, type.parameters[1]) : IsIntersect3(type) ? FromTypes4(stack, context, type.allOf) : IsIterator6(type) ? FromType5(stack, context, type.iteratorItems) : IsObject6(type) ? FromProperties20(stack, context, type.properties) : IsPromise4(type) ? FromType5(stack, context, type.item) : IsUnion3(type) ? FromTypes4(stack, context, type.anyOf) : IsTuple3(type) ? FromTypes4(stack, context, type.items) : IsRecord3(type) ? FromType5(stack, context, RecordValue3(type)) : false;
}
function CyclicCheck(stack, context, type) {
  const result = FromType5(stack, context, type);
  return result;
}

// ../../node_modules/typebox/build/type/engine/cyclic/candidates.mjs
function ResolveCandidateKeys(context, keys) {
  return keys.reduce((result, left) => {
    return left in context ? CyclicCheck([left], context, context[left]) ? [...result, left] : result : Unreachable();
  }, []);
}
function CyclicCandidates(context) {
  const keys = PropertyKeys(context);
  const result = ResolveCandidateKeys(context, keys);
  return result;
}
// ../../node_modules/typebox/build/type/engine/cyclic/dependencies.mjs
function FromRef16(context, ref2, result) {
  return result.includes(ref2) ? result : (ref2 in context) ? FromType6(context, context[ref2], [...result, ref2]) : Unreachable();
}
function FromProperties21(context, properties2, result) {
  const types = PropertyValues(properties2);
  return FromTypes5(context, types, result);
}
function FromTypes5(context, types, result) {
  return types.reduce((result2, left) => {
    return FromType6(context, left, result2);
  }, result);
}
function FromType6(context, type, result) {
  return IsRef3(type) ? FromRef16(context, type.$ref, result) : IsArray6(type) ? FromType6(context, type.items, result) : IsAsyncIterator6(type) ? FromType6(context, type.iteratorItems, result) : IsConstructor4(type) ? FromTypes5(context, [...type.parameters, type.instanceType], result) : IsFunction6(type) ? FromTypes5(context, [...type.parameters, type.returnType], result) : IsInterfaceDeferred(type) ? FromProperties21(context, type.parameters[1], result) : IsIntersect3(type) ? FromTypes5(context, type.allOf, result) : IsIterator6(type) ? FromType6(context, type.iteratorItems, result) : IsObject6(type) ? FromProperties21(context, type.properties, result) : IsPromise4(type) ? FromType6(context, type.item, result) : IsUnion3(type) ? FromTypes5(context, type.anyOf, result) : IsTuple3(type) ? FromTypes5(context, type.items, result) : IsRecord3(type) ? FromType6(context, RecordValue3(type), result) : result;
}
function CyclicDependencies(context, key, type) {
  const result = FromType6(context, type, [key]);
  return result;
}
// ../../node_modules/typebox/build/type/engine/cyclic/extends.mjs
function FromRef17(_ref) {
  return Any2();
}
function FromProperties22(properties2) {
  return exports_guard.Keys(properties2).reduce((result, key) => {
    return { ...result, [key]: FromType7(properties2[key]) };
  }, {});
}
function FromTypes6(types) {
  return types.reduce((result, left) => {
    return [...result, FromType7(left)];
  }, []);
}
function FromType7(type) {
  return IsRef3(type) ? FromRef17(type.$ref) : IsArray6(type) ? _Array_(FromType7(type.items), ArrayOptions(type)) : IsAsyncIterator6(type) ? AsyncIterator2(FromType7(type.iteratorItems)) : IsConstructor4(type) ? Constructor2(FromTypes6(type.parameters), FromType7(type.instanceType)) : IsFunction6(type) ? _Function_(FromTypes6(type.parameters), FromType7(type.returnType)) : IsIntersect3(type) ? Intersect3(FromTypes6(type.allOf)) : IsIterator6(type) ? Iterator2(FromType7(type.iteratorItems)) : IsObject6(type) ? _Object_2(FromProperties22(type.properties)) : IsPromise4(type) ? _Promise_(FromType7(type.item)) : IsRecord3(type) ? Record2(RecordKey3(type), FromType7(RecordValue3(type))) : IsUnion3(type) ? Union3(FromTypes6(type.anyOf)) : IsTuple3(type) ? Tuple2(FromTypes6(type.items)) : type;
}
function CyclicAnyFromParameters(defs, ref2) {
  return ref2 in defs ? FromType7(defs[ref2]) : Unknown2();
}
function CyclicExtends(type) {
  return CyclicAnyFromParameters(type.$defs, type.$ref);
}
// ../../node_modules/typebox/build/type/engine/cyclic/instantiate.mjs
function CyclicInterface(context, heritage, properties2) {
  const instantiatedHeritage = InstantiateTypes(context, { callstack: [] }, heritage);
  const instantiatedProperties = InstantiateProperties({}, { callstack: [] }, properties2);
  const evaluatedInterface = EvaluateIntersect([...instantiatedHeritage, _Object_2(instantiatedProperties)]);
  return evaluatedInterface;
}
function CyclicDefinitions(context, dependencies) {
  const keys = exports_guard.Keys(context).filter((key) => dependencies.includes(key));
  return keys.reduce((result, key) => {
    const type = context[key];
    const instantiatedType = IsInterfaceDeferred(type) ? CyclicInterface(context, type.parameters[0], type.parameters[1]) : type;
    return { ...result, [key]: instantiatedType };
  }, {});
}
function InstantiateCyclic(context, ref2, type) {
  const dependencies = CyclicDependencies(context, ref2, type);
  const definitions = CyclicDefinitions(context, dependencies);
  const result = Cyclic(definitions, ref2);
  return result;
}
// ../../node_modules/typebox/build/type/engine/cyclic/target.mjs
function Resolve2(defs, ref2) {
  return ref2 in defs ? IsRef3(defs[ref2]) ? Resolve2(defs, defs[ref2].$ref) : defs[ref2] : Never2();
}
function CyclicTarget(defs, ref2) {
  const result = Resolve2(defs, ref2);
  return result;
}
// ../../node_modules/typebox/build/type/extends/extends.mjs
function Canonical(type) {
  return IsCyclic(type) ? CyclicExtends(type) : IsUnsafe3(type) ? Unknown2() : type;
}
function Extends3(inferred, left, right) {
  const canonicalLeft = Canonical(left);
  const canonicalRight = Canonical(right);
  return ExtendsLeft(inferred, canonicalLeft, canonicalRight);
}
// ../../node_modules/typebox/build/type/engine/evaluate/compare.mjs
var ResultEqual = "equal";
var ResultDisjoint = "disjoint";
var ResultLeftInside = "left-inside";
var ResultRightInside = "right-inside";
function Compare(left, right) {
  const extendsCheck = [
    IsUnknown3(left) ? exports_result.ExtendsFalse() : Extends3({}, left, right),
    IsUnknown3(left) ? exports_result.ExtendsTrue({}) : Extends3({}, right, left)
  ];
  return exports_result.IsExtendsTrueLike(extendsCheck[0]) && exports_result.IsExtendsTrueLike(extendsCheck[1]) ? ResultEqual : exports_result.IsExtendsTrueLike(extendsCheck[0]) && exports_result.IsExtendsFalse(extendsCheck[1]) ? ResultLeftInside : exports_result.IsExtendsFalse(extendsCheck[0]) && exports_result.IsExtendsTrueLike(extendsCheck[1]) ? ResultRightInside : ResultDisjoint;
}

// ../../node_modules/typebox/build/type/engine/evaluate/broaden.mjs
function BroadFilter(type, types) {
  return types.filter((left) => {
    return Compare(type, left) === ResultRightInside ? false : true;
  });
}
function IsBroadestType(type, types) {
  const result = types.some((left) => {
    const result2 = Compare(type, left);
    return exports_guard.IsEqual(result2, ResultLeftInside) || exports_guard.IsEqual(result2, ResultEqual);
  });
  return exports_guard.IsEqual(result, false);
}
function BroadenType(type, types) {
  const evaluated = EvaluateType(type);
  return IsAny3(evaluated) ? [evaluated] : IsBroadestType(evaluated, types) ? [...BroadFilter(evaluated, types), evaluated] : types;
}
function BroadenTypes(types) {
  return types.reduce((result, left) => {
    return IsObject6(left) ? [...result, left] : IsNever3(left) ? result : BroadenType(left, result);
  }, []);
}
function Broaden(types) {
  const broadened = BroadenTypes(types);
  const flattened = Flatten(broadened);
  const result = flattened.length === 0 ? Never2() : flattened.length === 1 ? flattened[0] : Union3(flattened);
  return result;
}
// ../../node_modules/typebox/build/type/engine/evaluate/instantiate.mjs
function EvaluateAction(type, options) {
  const result = exports_memory.Update(EvaluateType(type), {}, options);
  return result;
}
function EvaluateInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return EvaluateAction(instantiatedType, options);
}
// ../../node_modules/typebox/build/type/engine/call/distribute_arguments.mjs
function CollectDistributionNames(expression, result = []) {
  return IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Conditional") ? IsRef3(expression.parameters[0]) ? CollectDistributionNames(expression.parameters[2], CollectDistributionNames(expression.parameters[3], [...result, expression.parameters[0]["$ref"]])) : CollectDistributionNames(expression.parameters[2], CollectDistributionNames(expression.parameters[3], result)) : IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Mapped") ? IsDeferred(expression.parameters[1]) && exports_guard.IsEqual(expression.parameters[1].action, "KeyOf") && IsRef3(expression.parameters[1].parameters[0]) ? [...result, expression.parameters[1].parameters[0]["$ref"]] : result : result;
}
function BuildDistributionArray(parameters, names) {
  return parameters.reduce((result, left) => [...result, names.includes(left.name)], []);
}
function ZipDistributionArray(arguments_, distributionArray, result = []) {
  return exports_guard.TakeLeft(arguments_, (argumentLeft, argumentRight) => exports_guard.TakeLeft(distributionArray, (booleanLeft, booleanRight) => ZipDistributionArray(argumentRight, booleanRight, [...result, [booleanLeft, argumentLeft]]), () => result), () => result);
}
function Expand(type) {
  return IsUnion3(type) ? [...type.anyOf] : [type];
}
function Append(current, type) {
  return current.reduce((result, left) => [...result, [...left, type]], []);
}
function Cross(current, variants) {
  return variants.reduce((result, left) => {
    return [...result, ...Append(current, left)];
  }, []);
}
function Distribute2(zipped) {
  return zipped.reduce((result, left) => {
    return exports_guard.IsEqual(left[0], true) ? Cross(result, Expand(left[1])) : Cross(result, [left[1]]);
  }, [[]]);
}
function DistributeArguments(parameters, arguments_, expression) {
  const distributionNames = CollectDistributionNames(expression);
  const distributionArray = BuildDistributionArray(parameters, distributionNames);
  const zippedArguments = ZipDistributionArray(arguments_, distributionArray);
  return IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Conditional") ? Distribute2(zippedArguments) : IsDeferred(expression) && exports_guard.IsEqual(expression.action, "Mapped") ? Distribute2(zippedArguments) : [arguments_];
}

// ../../node_modules/typebox/build/type/engine/call/resolve_target.mjs
function FromNotResolvable() {
  return ["(not-resolvable)", Never2()];
}
function FromNotGeneric() {
  return ["(not-generic)", Never2()];
}
function FromGeneric(name, parameters, expression) {
  return [name, Generic(parameters, expression)];
}
function FromRef18(context, ref2, arguments_) {
  return ref2 in context ? FromType8(context, ref2, context[ref2], arguments_) : FromNotResolvable();
}
function FromType8(context, name, target2, arguments_) {
  return IsGeneric(target2) ? FromGeneric(name, target2.parameters, target2.expression) : IsRef3(target2) ? FromRef18(context, target2.$ref, arguments_) : FromNotGeneric();
}
function ResolveTarget(context, target2, arguments_) {
  return FromType8(context, "(anonymous)", target2, arguments_);
}

// ../../node_modules/typebox/build/type/engine/call/resolve_arguments.mjs
function AssertArgumentExtends(name, type, extends_) {
  if (IsInfer(type) || IsCall(type) || exports_result.IsExtendsTrueLike(Extends3({}, type, extends_)))
    return;
  const cause = { parameter: name, expect: extends_, actual: type };
  throw new Error(`Argument for parameter ${name} does not satisfy constraint`, { cause });
}
function BindArgument(context, state, name, extends_, type) {
  const instantiatedArgument = InstantiateType(context, state, type);
  AssertArgumentExtends(name, instantiatedArgument, extends_);
  return exports_memory.Assign(context, { [name]: instantiatedArgument });
}
function BindArguments(context, state, parameterLeft, parameterRight, arguments_) {
  const instantiatedExtends = InstantiateType(context, state, parameterLeft.extends);
  const instantiatedEquals = InstantiateType(context, state, parameterLeft.equals);
  return exports_guard.TakeLeft(arguments_, (left, right) => BindParameters(BindArgument(context, state, parameterLeft["name"], instantiatedExtends, left), state, parameterRight, right), () => BindParameters(BindArgument(context, state, parameterLeft["name"], instantiatedExtends, instantiatedEquals), state, parameterRight, []));
}
function BindParameters(context, state, parameters, arguments_) {
  return exports_guard.TakeLeft(parameters, (left, right) => BindArguments(context, state, left, right, arguments_), () => context);
}
function ResolveArgumentsContext(context, state, parameters, arguments_) {
  return BindParameters(context, state, parameters, arguments_);
}

// ../../node_modules/typebox/build/type/engine/call/instantiate.mjs
function Peek(state) {
  const result = exports_guard.IsGreaterThan(state.callstack.length, 0) ? state.callstack[state.callstack.length - 1] : "";
  return result;
}
function IsTailCall(state, name) {
  const result = exports_guard.IsEqual(Peek(state), name);
  return result;
}
function CallDispatch(context, state, target2, parameters, expression, arguments_) {
  const argumentsContext = ResolveArgumentsContext(context, state, parameters, arguments_);
  const returnType = InstantiateType(argumentsContext, { callstack: [...state.callstack, target2.$ref] }, expression);
  return InstantiateType(context, state, returnType);
}
function CallDistributed(context, state, target2, parameters, expression, distributedArguments) {
  return distributedArguments.reduce((result, arguments_) => [...result, CallDispatch(context, state, target2, parameters, expression, arguments_)], []);
}
function CallImmediate(context, state, target2, parameters, expression, arguments_) {
  const distributedArguments = DistributeArguments(parameters, arguments_, expression);
  const returnTypes = CallDistributed(context, state, target2, parameters, expression, distributedArguments);
  const result = exports_guard.IsEqual(returnTypes.length, 1) ? returnTypes[0] : EvaluateUnion(returnTypes);
  return result;
}
function CallInstantiate(context, state, target2, arguments_) {
  const instantiatedArguments = InstantiateTypes(context, state, arguments_);
  const resolved = ResolveTarget(context, target2, arguments_);
  const name = resolved[0];
  const type = resolved[1];
  const result = IsGeneric(type) ? IsTailCall(state, name) ? CallConstruct(Ref2(name), instantiatedArguments) : CallImmediate(context, state, Ref2(name), type.parameters, type.expression, instantiatedArguments) : CallConstruct(target2, instantiatedArguments);
  return result;
}

// ../../node_modules/typebox/build/type/types/call.mjs
function CallConstruct(target2, arguments_) {
  return exports_memory.Create({ ["~kind"]: "Call" }, { target: target2, arguments: arguments_ }, {});
}
function Call(target2, arguments_) {
  return CallInstantiate({}, { callstack: [] }, target2, arguments_);
}
function IsCall(value) {
  return IsKind3(value, "Call");
}

// ../../node_modules/typebox/build/type/engine/intrinsics/mapping.mjs
function ApplyMapping(mapping, value) {
  return mapping(value);
}

// ../../node_modules/typebox/build/type/engine/intrinsics/from_literal.mjs
function FromLiteral9(mapping, value) {
  return exports_guard.IsString(value) ? Literal2(ApplyMapping(mapping, value)) : Literal2(value);
}

// ../../node_modules/typebox/build/type/engine/intrinsics/from_template_literal.mjs
function FromTemplateLiteral7(mapping, pattern) {
  const decoded = TemplateLiteralDecode(pattern);
  const result = FromType9(mapping, decoded);
  return result;
}

// ../../node_modules/typebox/build/type/engine/intrinsics/from_union.mjs
function FromUnion22(mapping, types) {
  const result = types.map((type) => FromType9(mapping, type));
  return Union3(result);
}

// ../../node_modules/typebox/build/type/engine/intrinsics/from_type.mjs
function FromType9(mapping, type) {
  return IsLiteral3(type) ? FromLiteral9(mapping, type.const) : IsTemplateLiteral3(type) ? FromTemplateLiteral7(mapping, type.pattern) : IsUnion3(type) ? FromUnion22(mapping, type.anyOf) : type;
}

// ../../node_modules/typebox/build/type/action/capitalize.mjs
function CapitalizeDeferred(type, options = {}) {
  return Deferred("Capitalize", [type], options);
}
function Capitalize2(type, options = {}) {
  return CapitalizeAction(type, options);
}

// ../../node_modules/typebox/build/type/action/lowercase.mjs
function LowercaseDeferred(type, options = {}) {
  return Deferred("Lowercase", [type], options);
}
function Lowercase2(type, options = {}) {
  return LowercaseAction(type, options);
}

// ../../node_modules/typebox/build/type/action/uncapitalize.mjs
function UncapitalizeDeferred(type, options = {}) {
  return Deferred("Uncapitalize", [type], options);
}
function Uncapitalize2(type, options = {}) {
  return UncapitalizeAction(type, options);
}

// ../../node_modules/typebox/build/type/action/uppercase.mjs
function UppercaseDeferred(type, options = {}) {
  return Deferred("Uppercase", [type], options);
}
function Uppercase2(type, options = {}) {
  return UppercaseAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/intrinsics/instantiate.mjs
var CapitalizeMapping = (input) => input[0].toUpperCase() + input.slice(1);
var LowercaseMapping = (input) => input.toLowerCase();
var UncapitalizeMapping = (input) => input[0].toLowerCase() + input.slice(1);
var UppercaseMapping = (input) => input.toUpperCase();
function CapitalizeAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType9(CapitalizeMapping, type), {}, options) : CapitalizeDeferred(type, options);
  return result;
}
function LowercaseAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType9(LowercaseMapping, type), {}, options) : LowercaseDeferred(type, options);
  return result;
}
function UncapitalizeAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType9(UncapitalizeMapping, type), {}, options) : UncapitalizeDeferred(type, options);
  return result;
}
function UppercaseAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType9(UppercaseMapping, type), {}, options) : UppercaseDeferred(type, options);
  return result;
}
function CapitalizeInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return CapitalizeAction(instantiatedType, options);
}
function LowercaseInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return LowercaseAction(instantiatedType, options);
}
function UncapitalizeInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return UncapitalizeAction(instantiatedType, options);
}
function UppercaseInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return UppercaseAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/conditional.mjs
function ConditionalDeferred(left, right, true_, false_, options = {}) {
  return Deferred("Conditional", [left, right, true_, false_], options);
}
function Conditional(left, right, true_, false_, options = {}) {
  return ConditionalAction({}, { callstack: [] }, left, right, true_, false_, options);
}

// ../../node_modules/typebox/build/type/engine/conditional/instantiate.mjs
function ConditionalOperation(context, state, left, right, true_, false_) {
  const extendsResult = Extends3(context, left, right);
  return exports_result.IsExtendsUnion(extendsResult) ? Union3([InstantiateType(extendsResult.inferred, state, true_), InstantiateType(context, state, false_)]) : exports_result.IsExtendsTrue(extendsResult) ? InstantiateType(extendsResult.inferred, state, true_) : InstantiateType(context, state, false_);
}
function ConditionalAction(context, state, left, right, true_, false_, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ConditionalOperation(context, state, left, right, true_, false_), {}, options) : ConditionalDeferred(left, right, true_, false_, options);
  return result;
}
function ConditionalInstantiate(context, state, left, right, true_, false_, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ConditionalAction(context, state, instantiatedLeft, instantiatedRight, true_, false_, options);
}
// ../../node_modules/typebox/build/type/action/constructor_parameters.mjs
function ConstructorParametersDeferred(type, options = {}) {
  return Deferred("ConstructorParameters", [type], options);
}
function ConstructorParameters2(type, options = {}) {
  return ConstructorParametersAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/constructor_parameters/instantiate.mjs
function ConstructorParametersOperation(type) {
  const parameters = IsConstructor4(type) ? type["parameters"] : [];
  const instantiatedParameters = InstantiateElements({}, { callstack: [] }, parameters);
  const result = Tuple2(instantiatedParameters);
  return result;
}
function ConstructorParametersAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(ConstructorParametersOperation(type), {}, options) : ConstructorParametersDeferred(type, options);
  return result;
}
function ConstructorParametersInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return ConstructorParametersAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/exclude.mjs
function ExcludeDeferred(left, right, options = {}) {
  return Deferred("Exclude", [left, right], options);
}
function Exclude2(left, right, options = {}) {
  return ExcludeAction(left, right, options);
}

// ../../node_modules/typebox/build/type/engine/exclude/operation.mjs
function ExcludeUnionLeft(types, right) {
  return types.reduce((result, head) => {
    return [...result, ...ExcludeTypeLeft(head, right)];
  }, []);
}
function ExcludeTypeLeft(left, right) {
  const check3 = Extends3({}, left, right);
  const result = exports_result.IsExtendsTrueLike(check3) ? [] : [left];
  return result;
}
function ExcludeOperation(left, right) {
  const remaining = IsEnum(left) ? ExcludeUnionLeft(EnumValuesToVariants(left.enum), right) : IsUnion3(left) ? ExcludeUnionLeft(Flatten(left.anyOf), right) : ExcludeTypeLeft(left, right);
  const result = EvaluateUnion(remaining);
  return result;
}

// ../../node_modules/typebox/build/type/engine/exclude/instantiate.mjs
function ExcludeAction(left, right, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ExcludeOperation(left, right), {}, options) : ExcludeDeferred(left, right, options);
  return result;
}
function ExcludeInstantiate(context, state, left, right, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ExcludeAction(instantiatedLeft, instantiatedRight, options);
}

// ../../node_modules/typebox/build/type/action/extract.mjs
function ExtractDeferred(left, right, options = {}) {
  return Deferred("Extract", [left, right], options);
}
function Extract2(left, right, options = {}) {
  return ExtractAction(left, right, options);
}

// ../../node_modules/typebox/build/type/engine/extract/operation.mjs
function ExtractUnionLeft(types, right) {
  return types.reduce((result, head) => {
    return [...result, ...ExtractTypeLeft(head, right)];
  }, []);
}
function ExtractTypeLeft(left, right) {
  const check3 = Extends3({}, left, right);
  const result = exports_result.IsExtendsTrueLike(check3) ? [left] : [];
  return result;
}
function ExtractOperation(left, right) {
  const remaining = IsEnum(left) ? ExtractUnionLeft(EnumValuesToVariants(left.enum), right) : IsUnion3(left) ? ExtractUnionLeft(Flatten(left.anyOf), right) : ExtractTypeLeft(left, right);
  const result = EvaluateUnion(remaining);
  return result;
}

// ../../node_modules/typebox/build/type/engine/extract/instantiate.mjs
function ExtractAction(left, right, options) {
  const result = CanInstantiate([left, right]) ? exports_memory.Update(ExtractOperation(left, right), {}, options) : ExtractDeferred(left, right, options);
  return result;
}
function ExtractInstantiate(context, state, left, right, options) {
  const instantiatedLeft = InstantiateType(context, state, left);
  const instantiatedRight = InstantiateType(context, state, right);
  return ExtractAction(instantiatedLeft, instantiatedRight, options);
}

// ../../node_modules/typebox/build/type/engine/helpers/keys_to_indexer.mjs
function KeysToLiterals(keys) {
  return keys.reduce((result, left) => {
    return IsLiteralValue3(left) ? [...result, Literal2(left)] : result;
  }, []);
}
function KeysToIndexer(keys) {
  const literals = KeysToLiterals(keys);
  const result = Union3(literals);
  return result;
}

// ../../node_modules/typebox/build/type/action/indexed.mjs
function IndexDeferred(type, indexer, options = {}) {
  return Deferred("Index", [type, indexer], options);
}
function Index2(type, indexer_or_keys, options = {}) {
  const indexer = exports_guard.IsArray(indexer_or_keys) ? KeysToIndexer(indexer_or_keys) : indexer_or_keys;
  return IndexAction(type, indexer, options);
}

// ../../node_modules/typebox/build/type/engine/object/from_cyclic.mjs
function FromCyclic(defs, ref2) {
  const target2 = CyclicTarget(defs, ref2);
  const result = FromType10(target2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/object/from_intersect.mjs
function CollapseIntersectProperties(left, right) {
  const leftKeys = exports_guard.Keys(left).filter((key) => !exports_guard.HasPropertyKey(right, key));
  const rightKeys = exports_guard.Keys(right).filter((key) => !exports_guard.HasPropertyKey(left, key));
  const sharedKeys = exports_guard.Keys(left).filter((key) => exports_guard.HasPropertyKey(right, key));
  const leftProperties = leftKeys.reduce((result, key) => ({ ...result, [key]: left[key] }), {});
  const rightProperties = rightKeys.reduce((result, key) => ({ ...result, [key]: right[key] }), {});
  const sharedProperties = sharedKeys.reduce((result, key) => ({ ...result, [key]: EvaluateIntersect([left[key], right[key]]) }), {});
  const unique = exports_memory.Assign(leftProperties, rightProperties);
  const shared = exports_memory.Assign(unique, sharedProperties);
  return shared;
}
function FromIntersect19(types) {
  return types.reduce((result, left) => {
    return CollapseIntersectProperties(result, FromType10(left));
  }, {});
}

// ../../node_modules/typebox/build/type/engine/object/from_object.mjs
function FromObject20(properties2) {
  return properties2;
}

// ../../node_modules/typebox/build/type/engine/object/from_tuple.mjs
function FromTuple16(types) {
  const object2 = TupleToObject(Tuple2(types));
  const result = FromType10(object2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/object/from_union.mjs
function CollapseUnionProperties(left, right) {
  const sharedKeys = exports_guard.Keys(left).filter((key) => (key in right));
  const result = sharedKeys.reduce((result2, key) => {
    return { ...result2, [key]: EvaluateUnion([left[key], right[key]]) };
  }, {});
  return result;
}
function ReduceVariants(types, result) {
  return exports_guard.TakeLeft(types, (left, right) => ReduceVariants(right, CollapseUnionProperties(result, FromType10(left))), () => result);
}
function FromUnion23(types) {
  return exports_guard.TakeLeft(types, (left, right) => ReduceVariants(right, FromType10(left)), () => Unreachable());
}

// ../../node_modules/typebox/build/type/engine/object/from_type.mjs
function FromType10(type) {
  return IsCyclic(type) ? FromCyclic(type.$defs, type.$ref) : IsIntersect3(type) ? FromIntersect19(type.allOf) : IsUnion3(type) ? FromUnion23(type.anyOf) : IsTuple3(type) ? FromTuple16(type.items) : IsObject6(type) ? FromObject20(type.properties) : {};
}

// ../../node_modules/typebox/build/type/engine/object/collapse.mjs
function CollapseToObject(type) {
  const properties2 = FromType10(type);
  const result = _Object_2(properties2);
  return result;
}
// ../../node_modules/typebox/build/type/engine/helpers/keys.mjs
var integerKeyPattern = new RegExp("^(?:0|[1-9][0-9]*)$");
function ConvertToIntegerKey(value) {
  const normal = `${value}`;
  return integerKeyPattern.test(normal) ? parseInt(normal) : value;
}

// ../../node_modules/typebox/build/type/engine/indexed/from_array.mjs
function NormalizeLiteral(value) {
  return Literal2(ConvertToIntegerKey(value));
}
function NormalizeIndexerTypes(types) {
  return types.map((type) => NormalizeIndexer(type));
}
function NormalizeIndexer(type) {
  return IsIntersect3(type) ? Intersect3(NormalizeIndexerTypes(type.allOf)) : IsUnion3(type) ? Union3(NormalizeIndexerTypes(type.anyOf)) : IsLiteral3(type) ? NormalizeLiteral(type.const) : type;
}
function FromArray19(type, indexer) {
  const normalizedIndexer = NormalizeIndexer(indexer);
  const check3 = Extends3({}, normalizedIndexer, Number3());
  const result = exports_result.IsExtendsTrueLike(check3) ? type : IsLiteral3(indexer) && exports_guard.IsEqual(indexer.const, "length") ? Number3() : Never2();
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_cyclic.mjs
function FromCyclic2(defs, ref2) {
  const target2 = CyclicTarget(defs, ref2);
  const result = FromType11(target2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_union.mjs
function FromUnion24(types) {
  return types.reduce((result, left) => {
    return [...result, ...FromType11(left)];
  }, []);
}

// ../../node_modules/typebox/build/type/engine/indexable/from_enum.mjs
function FromEnum(values) {
  const variants = EnumValuesToVariants(values);
  const result = FromUnion24(variants);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_intersect.mjs
function FromIntersect20(types) {
  const evaluated = EvaluateIntersect(types);
  const result = FromType11(evaluated);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_literal.mjs
function FromLiteral10(value) {
  const result = [`${value}`];
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_template_literal.mjs
function FromTemplateLiteral8(pattern) {
  const decoded = TemplateLiteralDecode(pattern);
  const result = FromType11(decoded);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexable/from_type.mjs
function FromType11(type) {
  return IsCyclic(type) ? FromCyclic2(type.$defs, type.$ref) : IsEnum(type) ? FromEnum(type.enum) : IsIntersect3(type) ? FromIntersect20(type.allOf) : IsLiteral3(type) ? FromLiteral10(type.const) : IsTemplateLiteral3(type) ? FromTemplateLiteral8(type.pattern) : IsUnion3(type) ? FromUnion24(type.anyOf) : [];
}

// ../../node_modules/typebox/build/type/engine/indexable/to_indexable_keys.mjs
function ToIndexableKeys(type) {
  const result = FromType11(type);
  return result;
}

// ../../node_modules/typebox/build/type/engine/this/expand_this.mjs
function FromTypes7(properties2, types) {
  return types.map((type) => FromType12(properties2, type));
}
function FromType12(properties2, type) {
  return IsArray6(type) ? _Array_(FromType12(properties2, type.items)) : IsAsyncIterator6(type) ? AsyncIterator2(FromType12(properties2, type.iteratorItems)) : IsConstructor4(type) ? Constructor2(FromTypes7(properties2, type.parameters), FromType12(properties2, type.instanceType)) : IsFunction6(type) ? _Function_(FromTypes7(properties2, type.parameters), FromType12(properties2, type.returnType)) : IsIterator6(type) ? Iterator2(FromType12(properties2, type.iteratorItems)) : IsPromise4(type) ? _Promise_(FromType12(properties2, type.item)) : IsTuple3(type) ? Tuple2(FromTypes7(properties2, type.items)) : IsUnion3(type) ? Union3(FromTypes7(properties2, type.anyOf)) : IsIntersect3(type) ? Intersect3(FromTypes7(properties2, type.allOf)) : IsThis3(type) ? _Object_2(properties2) : type;
}
function ExpandThis(properties2, type) {
  const result = FromType12(properties2, type);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexed/from_object.mjs
function IndexProperty(properties2, key) {
  const selectedType = key in properties2 ? properties2[key] : Never2();
  const result = ExpandThis(properties2, selectedType);
  return result;
}
function IndexProperties(properties2, keys) {
  return keys.reduce((result, left) => {
    return [...result, IndexProperty(properties2, left)];
  }, []);
}
function FromIndexer(properties2, indexer) {
  const keys = ToIndexableKeys(indexer);
  const variants = IndexProperties(properties2, keys);
  const result = EvaluateUnion(variants);
  return result;
}
var NumericKeyPattern = new RegExp(IntegerKey);
function NumericKeys(keys) {
  const result = keys.filter((key) => NumericKeyPattern.test(key));
  return result;
}
function FromIndexerNumber(properties2) {
  const keys = PropertyKeys(properties2);
  const numericKeys = NumericKeys(keys);
  const variants = IndexProperties(properties2, numericKeys);
  const result = EvaluateUnion(variants);
  return result;
}
function FromObject21(properties2, indexer) {
  const result = IsNumber6(indexer) ? FromIndexerNumber(properties2) : FromIndexer(properties2, indexer);
  return result;
}

// ../../node_modules/typebox/build/type/engine/indexed/array_indexer.mjs
function ConvertLiteral(value) {
  return Literal2(ConvertToIntegerKey(value));
}
function ArrayIndexerTypes(types) {
  return types.map((type) => FormatArrayIndexer(type));
}
function FormatArrayIndexer(type) {
  return IsIntersect3(type) ? Intersect3(ArrayIndexerTypes(type.allOf)) : IsUnion3(type) ? Union3(ArrayIndexerTypes(type.anyOf)) : IsLiteral3(type) ? ConvertLiteral(type.const) : type;
}

// ../../node_modules/typebox/build/type/engine/indexed/from_tuple.mjs
function IndexElementsWithIndexer(types, indexer) {
  return types.reduceRight((result, right, index) => {
    const check3 = Extends3({}, Literal2(index), indexer);
    return exports_result.IsExtendsTrueLike(check3) ? [right, ...result] : result;
  }, []);
}
function FromTupleWithIndexer(types, indexer) {
  const formattedArrayIndexer = FormatArrayIndexer(indexer);
  const elements = IndexElementsWithIndexer(types, formattedArrayIndexer);
  return EvaluateUnionFast(elements);
}
function FromTupleWithoutIndexer(types) {
  return EvaluateUnionFast(types);
}
function FromTuple17(types, indexer) {
  return IsLiteral3(indexer) && exports_guard.IsEqual(indexer.const, "length") ? Literal2(types.length) : IsNumber6(indexer) || IsInteger5(indexer) ? FromTupleWithoutIndexer(types) : FromTupleWithIndexer(types, indexer);
}

// ../../node_modules/typebox/build/type/engine/indexed/from_type.mjs
function FromType13(type, indexer) {
  return IsArray6(type) ? FromArray19(type.items, indexer) : IsObject6(type) ? FromObject21(type.properties, indexer) : IsTuple3(type) ? FromTuple17(type.items, indexer) : Never2();
}

// ../../node_modules/typebox/build/type/engine/indexed/instantiate.mjs
function NormalizeType(type) {
  const result = IsCyclic(type) || IsIntersect3(type) || IsUnion3(type) ? CollapseToObject(type) : type;
  return result;
}
function IndexAction(type, indexer, options) {
  const result = CanInstantiate([type, indexer]) ? exports_memory.Update(FromType13(NormalizeType(type), indexer), {}, options) : IndexDeferred(type, indexer, options);
  return result;
}
function IndexInstantiate(context, state, type, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return IndexAction(instantiatedType, instantiatedIndexer, options);
}

// ../../node_modules/typebox/build/type/action/instance_type.mjs
function InstanceTypeDeferred(type, options = {}) {
  return Deferred("InstanceType", [type], options);
}
function InstanceType2(type, options = {}) {
  return InstanceTypeAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/instance_type/instantiate.mjs
function InstanceTypeOperation(type) {
  return IsConstructor4(type) ? type["instanceType"] : Never2();
}
function InstanceTypeAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(InstanceTypeOperation(type), {}, options) : InstanceTypeDeferred(type, options);
  return result;
}
function InstanceTypeInstantiate(context, state, type, options = {}) {
  const instantiatedType = InstantiateType(context, state, type);
  return InstanceTypeAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/keyof.mjs
function KeyOfDeferred(type, options = {}) {
  return Deferred("KeyOf", [type], options);
}
function KeyOf3(type, options = {}) {
  return KeyOfAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/keyof/from_any.mjs
function FromAny5() {
  return Union3([Number3(), String3(), Symbol3()]);
}

// ../../node_modules/typebox/build/type/engine/keyof/from_array.mjs
function FromArray20(_type) {
  return Number3();
}

// ../../node_modules/typebox/build/type/engine/keyof/from_object.mjs
function FromPropertyKeys4(keys) {
  const result = keys.reduce((result2, left) => {
    return IsLiteralValue3(left) ? [...result2, Literal2(ConvertToIntegerKey(left))] : Unreachable();
  }, []);
  return result;
}
function FromObject22(properties2) {
  const propertyKeys = exports_guard.Keys(properties2);
  const variants = FromPropertyKeys4(propertyKeys);
  const result = EvaluateUnionFast(variants);
  return result;
}

// ../../node_modules/typebox/build/type/engine/keyof/from_record.mjs
function FromRecord14(type) {
  return RecordKey3(type);
}

// ../../node_modules/typebox/build/type/engine/keyof/from_tuple.mjs
function FromTuple18(types) {
  const result = types.map((_, index) => Literal2(index));
  return EvaluateUnionFast(result);
}

// ../../node_modules/typebox/build/type/engine/keyof/from_type.mjs
function FromType14(type) {
  return IsAny3(type) ? FromAny5() : IsArray6(type) ? FromArray20(type.items) : IsObject6(type) ? FromObject22(type.properties) : IsRecord3(type) ? FromRecord14(type) : IsTuple3(type) ? FromTuple18(type.items) : Never2();
}

// ../../node_modules/typebox/build/type/engine/keyof/instantiate.mjs
function NormalizeType2(type) {
  const result = IsCyclic(type) || IsIntersect3(type) || IsUnion3(type) ? CollapseToObject(type) : type;
  return result;
}
function KeyOfAction(type, options) {
  return CanInstantiate([type]) ? exports_memory.Update(FromType14(NormalizeType2(type)), {}, options) : KeyOfDeferred(type, options);
}
function KeyOfInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return KeyOfAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/mapped.mjs
function MappedDeferred(identifier2, type, as, property, options = {}) {
  return Deferred("Mapped", [identifier2, type, as, property], options);
}
function Mapped3(identifier2, type, as, property, options = {}) {
  return MappedAction({}, { callstack: [] }, identifier2, type, as, property, options);
}

// ../../node_modules/typebox/build/type/engine/mapped/mapped_variants.mjs
function FromTemplateLiteral9(pattern) {
  const decoded = TemplateLiteralDecode(pattern);
  const result = FromType15(decoded);
  return result;
}
function FromUnion25(types) {
  return types.reduce((result, left) => {
    return [...result, ...FromType15(left)];
  }, []);
}
function FromLiteral11(value) {
  const result = exports_guard.IsNumber(value) ? [Literal2(`${value}`)] : [Literal2(value)];
  return result;
}
function FromType15(type) {
  const result = IsEnum(type) ? FromUnion25(EnumValuesToVariants(type.enum)) : IsLiteral3(type) ? FromLiteral11(type.const) : IsTemplateLiteral3(type) ? FromTemplateLiteral9(type.pattern) : IsUnion3(type) ? FromUnion25(type.anyOf) : [type];
  return result;
}
function MappedVariants(type) {
  const result = FromType15(type);
  return result;
}

// ../../node_modules/typebox/build/type/engine/mapped/mapped_operation.mjs
function CanonicalAs(instantiatedAs) {
  const result = IsTemplateLiteral3(instantiatedAs) ? TemplateLiteralDecode(instantiatedAs.pattern) : instantiatedAs;
  return result;
}
function MappedVariant(context, state, identifier2, variant, as, property) {
  const variantContext = exports_memory.Assign(context, { [identifier2["name"]]: variant });
  const instantiatedAs = InstantiateType(variantContext, state, as);
  const canonicalAs = CanonicalAs(instantiatedAs);
  const instantiatedProperty = InstantiateType(variantContext, state, property);
  return IsLiteralNumber2(canonicalAs) || IsLiteralString2(canonicalAs) ? { [canonicalAs.const]: instantiatedProperty } : {};
}
function MappedProperties(context, state, identifier2, variants, as, property) {
  return variants.reduce((result, left) => {
    return [...result, MappedVariant(context, state, identifier2, left, as, property)];
  }, []);
}
function MappedObjects(properties2) {
  return properties2.reduce((result, left) => {
    return [...result, _Object_2(left)];
  }, []);
}
function MappedOperation(context, state, identifier2, type, as, property) {
  const variants = MappedVariants(type);
  const mappedProperties = MappedProperties(context, state, identifier2, variants, as, property);
  const mappedObjects = MappedObjects(mappedProperties);
  const result = EvaluateIntersect(mappedObjects);
  return result;
}

// ../../node_modules/typebox/build/type/engine/mapped/instantiate.mjs
function MappedAction(context, state, identifier2, type, as, property, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(MappedOperation(context, state, identifier2, type, as, property), {}, options) : MappedDeferred(identifier2, type, as, property, options);
  return result;
}
function MappedInstantiate(context, state, identifier2, type, as, property, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return MappedAction(context, state, identifier2, instantiatedType, as, property, options);
}

// ../../node_modules/typebox/build/type/engine/module/instantiate.mjs
function InstantiateCyclics(context, cyclicKeys) {
  const keys = exports_guard.Keys(context).filter((key) => cyclicKeys.includes(key));
  return keys.reduce((result, key) => {
    return { ...result, [key]: InstantiateCyclic(context, key, context[key]) };
  }, {});
}
function InstantiateNonCyclics(context, cyclicKeys) {
  const keys = exports_guard.Keys(context).filter((key) => !cyclicKeys.includes(key));
  return keys.reduce((result, key) => {
    return { ...result, [key]: InstantiateType(context, { callstack: [] }, context[key]) };
  }, {});
}
function InstantiateModule(context, options) {
  const cyclicCandidates = CyclicCandidates(context);
  const instantiatedCyclics = InstantiateCyclics(context, cyclicCandidates);
  const instantiatedNonCyclics = InstantiateNonCyclics(context, cyclicCandidates);
  const instantiatedModule = { ...instantiatedCyclics, ...instantiatedNonCyclics };
  return exports_memory.Update(instantiatedModule, {}, options);
}
function ModuleInstantiate(context, _state, properties2, options) {
  const moduleContext = exports_memory.Assign(context, properties2);
  const instantiatedModule = InstantiateModule(moduleContext, options);
  return instantiatedModule;
}

// ../../node_modules/typebox/build/type/action/non_nullable.mjs
function NonNullableDeferred(type, options = {}) {
  return Deferred("NonNullable", [type], options);
}
function NonNullable(type, options = {}) {
  return NonNullableAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/non_nullable/instantiate.mjs
function NonNullableOperation(type) {
  const excluded = Union3([Null2(), Undefined2()]);
  return ExcludeAction(type, excluded, {});
}
function NonNullableAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(NonNullableOperation(type), {}, options) : NonNullableDeferred(type, options);
  return result;
}
function NonNullableInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return NonNullableAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/omit.mjs
function OmitDeferred(type, indexer, options = {}) {
  return Deferred("Omit", [type, indexer], options);
}
function Omit2(type, indexer_or_keys, options = {}) {
  const indexer = exports_guard.IsArray(indexer_or_keys) ? KeysToIndexer(indexer_or_keys) : indexer_or_keys;
  return OmitAction(type, indexer, options);
}

// ../../node_modules/typebox/build/type/engine/indexable/to_indexable.mjs
function ToIndexable(type) {
  const collapsed = CollapseToObject(type);
  const result = IsObject6(collapsed) ? collapsed.properties : Unreachable();
  return result;
}

// ../../node_modules/typebox/build/type/engine/omit/from_type.mjs
function FromKeys(properties2, keys) {
  const result = exports_guard.Keys(properties2).reduce((result2, key) => {
    return keys.includes(key) ? result2 : { ...result2, [key]: properties2[key] };
  }, {});
  return result;
}
function FromType16(type, indexer) {
  const indexable = ToIndexable(type);
  const indexableKeys = ToIndexableKeys(indexer);
  const omitted = FromKeys(indexable, indexableKeys);
  const result = _Object_2(omitted);
  return result;
}

// ../../node_modules/typebox/build/type/engine/omit/instantiate.mjs
function OmitAction(type, indexer, options) {
  const result = CanInstantiate([type, indexer]) ? exports_memory.Update(FromType16(type, indexer), {}, options) : OmitDeferred(type, indexer, options);
  return result;
}
function OmitInstantiate(context, state, type, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return OmitAction(instantiatedType, instantiatedIndexer, options);
}

// ../../node_modules/typebox/build/type/action/options.mjs
function OptionsDeferred(type, options) {
  return Deferred("Options", [type, options], {});
}
function Options2(type, options) {
  return OptionsAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/options/instantiate.mjs
function OptionsAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(type, {}, options) : OptionsDeferred(type, options);
  return result;
}
function OptionsInstantiate(context, state, type, options) {
  const instaniatedType = InstantiateType(context, state, type);
  return OptionsAction(instaniatedType, options);
}

// ../../node_modules/typebox/build/type/action/parameters.mjs
function ParametersDeferred(type, options = {}) {
  return Deferred("Parameters", [type], options);
}
function Parameters2(type, options = {}) {
  return ParametersAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/parameters/instantiate.mjs
function ParametersOperation(type) {
  const parameters = IsFunction6(type) ? type["parameters"] : [];
  const instantiatedParameters = InstantiateElements({}, { callstack: [] }, parameters);
  const result = Tuple2(instantiatedParameters);
  return result;
}
function ParametersAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(ParametersOperation(type), {}, options) : ParametersDeferred(type, options);
  return result;
}
function ParametersInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return ParametersAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/partial.mjs
function PartialDeferred(type, options = {}) {
  return Deferred("Partial", [type], options);
}
function Partial2(type, options = {}) {
  return PartialAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/partial/from_cyclic.mjs
function FromCyclic3(defs, ref2) {
  const target2 = CyclicTarget(defs, ref2);
  const partial = FromType17(target2);
  const result = Cyclic(exports_memory.Assign(defs, { [ref2]: partial }), ref2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/partial/from_intersect.mjs
function FromIntersect21(types) {
  const result = types.map((type) => FromType17(type));
  return EvaluateIntersect(result);
}

// ../../node_modules/typebox/build/type/engine/partial/from_union.mjs
function FromUnion26(types) {
  const result = types.map((type) => FromType17(type));
  return Union3(result);
}

// ../../node_modules/typebox/build/type/engine/partial/from_object.mjs
function FromObject23(properties2) {
  const mapped = exports_guard.Keys(properties2).reduce((result2, left) => {
    return { ...result2, [left]: Optional2(properties2[left]) };
  }, {});
  const result = _Object_2(mapped);
  return result;
}

// ../../node_modules/typebox/build/type/engine/partial/from_type.mjs
function FromType17(type) {
  return IsCyclic(type) ? FromCyclic3(type.$defs, type.$ref) : IsIntersect3(type) ? FromIntersect21(type.allOf) : IsUnion3(type) ? FromUnion26(type.anyOf) : IsObject6(type) ? FromObject23(type.properties) : _Object_2({});
}

// ../../node_modules/typebox/build/type/engine/partial/instantiate.mjs
function PartialAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType17(type), {}, options) : PartialDeferred(type, options);
  return result;
}
function PartialInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return PartialAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/pick.mjs
function PickDeferred(type, indexer, options = {}) {
  return Deferred("Pick", [type, indexer], options);
}
function Pick2(type, indexer_or_keys, options = {}) {
  const indexer = exports_guard.IsArray(indexer_or_keys) ? KeysToIndexer(indexer_or_keys) : indexer_or_keys;
  return PickAction(type, indexer, options);
}

// ../../node_modules/typebox/build/type/engine/pick/from_type.mjs
function FromKeys2(properties2, keys) {
  const result = exports_guard.Keys(properties2).reduce((result2, key) => {
    return keys.includes(key) ? exports_memory.Assign(result2, { [key]: properties2[key] }) : result2;
  }, {});
  return result;
}
function FromType18(type, indexer) {
  const indexable = ToIndexable(type);
  const keys = ToIndexableKeys(indexer);
  const applied = FromKeys2(indexable, keys);
  const result = _Object_2(applied);
  return result;
}

// ../../node_modules/typebox/build/type/engine/pick/instantiate.mjs
function PickAction(type, indexer, options) {
  const result = CanInstantiate([type, indexer]) ? exports_memory.Update(FromType18(type, indexer), {}, options) : PickDeferred(type, indexer, options);
  return result;
}
function PickInstantiate(context, state, type, indexer, options) {
  const instantiatedType = InstantiateType(context, state, type);
  const instantiatedIndexer = InstantiateType(context, state, indexer);
  return PickAction(instantiatedType, instantiatedIndexer, options);
}

// ../../node_modules/typebox/build/type/action/readonly_object.mjs
function ReadonlyObjectDeferred(type, options = {}) {
  return Deferred("ReadonlyObject", [type], options);
}
function ReadonlyObject(type, options = {}) {
  return ReadonlyObjectAction(type, options);
}
var ReadonlyType = ReadonlyObject;

// ../../node_modules/typebox/build/type/engine/readonly_object/from_array.mjs
function FromArray21(type) {
  const result = Immutable2(_Array_(type));
  return result;
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_cyclic.mjs
function FromCyclic4(defs, ref2) {
  const target2 = CyclicTarget(defs, ref2);
  const partial = FromType19(target2);
  const result = Cyclic(exports_memory.Assign(defs, { [ref2]: partial }), ref2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_intersect.mjs
function FromIntersect22(types) {
  const result = types.map((type) => FromType19(type));
  return EvaluateIntersect(result);
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_object.mjs
function FromObject24(properties2) {
  const mapped = exports_guard.Keys(properties2).reduce((result2, left) => {
    return { ...result2, [left]: Readonly2(properties2[left]) };
  }, {});
  const result = _Object_2(mapped);
  return result;
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_tuple.mjs
function FromTuple19(types) {
  const result = Immutable2(Tuple2(types));
  return result;
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_union.mjs
function FromUnion27(types) {
  const result = types.map((type) => FromType19(type));
  return Union3(result);
}

// ../../node_modules/typebox/build/type/engine/readonly_object/from_type.mjs
function FromType19(type) {
  return IsArray6(type) ? FromArray21(type.items) : IsCyclic(type) ? FromCyclic4(type.$defs, type.$ref) : IsIntersect3(type) ? FromIntersect22(type.allOf) : IsObject6(type) ? FromObject24(type.properties) : IsTuple3(type) ? FromTuple19(type.items) : IsUnion3(type) ? FromUnion27(type.anyOf) : type;
}

// ../../node_modules/typebox/build/type/engine/readonly_object/instantiate.mjs
function ReadonlyObjectAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType19(type), {}, options) : ReadonlyObjectDeferred(type);
  return result;
}
function ReadonlyObjectInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return ReadonlyObjectAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/engine/ref/instantiate.mjs
function RefInstantiate(context, state, type, ref2) {
  return ref2 in context ? CyclicCheck([ref2], context, context[ref2]) ? type : InstantiateType(context, state, context[ref2]) : type;
}

// ../../node_modules/typebox/build/type/engine/required/from_cyclic.mjs
function FromCyclic5(defs, ref2) {
  const target2 = CyclicTarget(defs, ref2);
  const partial = FromType20(target2);
  const result = Cyclic(exports_memory.Assign(defs, { [ref2]: partial }), ref2);
  return result;
}

// ../../node_modules/typebox/build/type/engine/required/from_intersect.mjs
function FromIntersect23(types) {
  const result = types.map((type) => FromType20(type));
  return EvaluateIntersect(result);
}

// ../../node_modules/typebox/build/type/engine/required/from_union.mjs
function FromUnion28(types) {
  const result = types.map((type) => FromType20(type));
  return Union3(result);
}

// ../../node_modules/typebox/build/type/engine/required/from_object.mjs
function FromObject25(properties2) {
  const mapped = exports_guard.Keys(properties2).reduce((result2, left) => {
    return { ...result2, [left]: OptionalRemove(properties2[left]) };
  }, {});
  const result = _Object_2(mapped);
  return result;
}

// ../../node_modules/typebox/build/type/engine/required/from_type.mjs
function FromType20(type) {
  return IsCyclic(type) ? FromCyclic5(type.$defs, type.$ref) : IsIntersect3(type) ? FromIntersect23(type.allOf) : IsUnion3(type) ? FromUnion28(type.anyOf) : IsObject6(type) ? FromObject25(type.properties) : _Object_2({});
}

// ../../node_modules/typebox/build/type/action/required.mjs
function RequiredDeferred(type, options = {}) {
  return Deferred("Required", [type], options);
}
function Required2(type, options = {}) {
  return RequiredAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/required/instantiate.mjs
function RequiredAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(FromType20(type), {}, options) : RequiredDeferred(type, options);
  return result;
}
function RequiredInstantiate(context, state, type, options) {
  const instaniatedType = InstantiateType(context, state, type);
  return RequiredAction(instaniatedType, options);
}

// ../../node_modules/typebox/build/type/action/return_type.mjs
function ReturnTypeDeferred(type, options = {}) {
  return Deferred("ReturnType", [type], options);
}
function ReturnType2(type, options = {}) {
  return ReturnTypeAction(type, options);
}

// ../../node_modules/typebox/build/type/engine/return_type/instantiate.mjs
function ReturnTypeOperation(type) {
  return IsFunction6(type) ? type["returnType"] : Never2();
}
function ReturnTypeAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(ReturnTypeOperation(type), {}, options) : ReturnTypeDeferred(type, options);
  return result;
}
function ReturnTypeInstantiate(context, state, type, options = {}) {
  const instantiatedType = InstantiateType(context, state, type);
  return ReturnTypeAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/engine/rest/spread.mjs
function SpreadElement(type) {
  const result = IsRest(type) ? IsTuple3(type.items) ? RestSpread(type.items.items) : IsInfer(type.items) ? [type] : IsRef3(type.items) ? [type] : [Never2()] : [type];
  return result;
}
function RestSpread(types) {
  const result = types.reduce((result2, left) => {
    return [...result2, ...SpreadElement(left)];
  }, []);
  return result;
}
// ../../node_modules/typebox/build/type/engine/instantiate.mjs
function CanInstantiate(types) {
  return exports_guard.TakeLeft(types, (left, right) => IsRef3(left) ? false : CanInstantiate(right), () => true);
}
function ModifierActions(type, readonly, optional) {
  return IsReadonlyRemoveAction(type) ? ModifierActions(type.type, "remove", optional) : IsOptionalRemoveAction(type) ? ModifierActions(type.type, readonly, "remove") : IsReadonlyAddAction(type) ? ModifierActions(type.type, "add", optional) : IsOptionalAddAction(type) ? ModifierActions(type.type, readonly, "add") : [type, readonly, optional];
}
function ApplyReadonly2(action, type) {
  return exports_guard.IsEqual(action, "remove") ? ReadonlyRemove(type) : exports_guard.IsEqual(action, "add") ? ReadonlyAdd(type) : type;
}
function ApplyOptional2(action, type) {
  return exports_guard.IsEqual(action, "remove") ? OptionalRemove(type) : exports_guard.IsEqual(action, "add") ? OptionalAdd(type) : type;
}
function InstantiateProperties(context, state, properties2) {
  return exports_guard.Keys(properties2).reduce((result, key) => {
    return { ...result, [key]: InstantiateType(context, state, properties2[key]) };
  }, {});
}
function InstantiateElements(context, state, types) {
  const elements = InstantiateTypes(context, state, types);
  const result = RestSpread(elements);
  return result;
}
function InstantiateTypes(context, state, types) {
  return types.map((type) => InstantiateType(context, state, type));
}
function InstantiateDeferred(context, state, action, parameters, options) {
  return exports_guard.IsEqual(action, "Awaited") ? AwaitedInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Capitalize") ? CapitalizeInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Conditional") ? ConditionalInstantiate(context, state, parameters[0], parameters[1], parameters[2], parameters[3], options) : exports_guard.IsEqual(action, "ConstructorParameters") ? ConstructorParametersInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Evaluate") ? EvaluateInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Exclude") ? ExcludeInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "Extract") ? ExtractInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "Index") ? IndexInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "InstanceType") ? InstanceTypeInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Interface") ? InterfaceInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "KeyOf") ? KeyOfInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Lowercase") ? LowercaseInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Mapped") ? MappedInstantiate(context, state, parameters[0], parameters[1], parameters[2], parameters[3], options) : exports_guard.IsEqual(action, "Module") ? ModuleInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "NonNullable") ? NonNullableInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Pick") ? PickInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "Options") ? OptionsInstantiate(context, state, parameters[0], parameters[1]) : exports_guard.IsEqual(action, "Parameters") ? ParametersInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Partial") ? PartialInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Omit") ? OmitInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "ReadonlyObject") ? ReadonlyObjectInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Record") ? RecordInstantiate(context, state, parameters[0], parameters[1], options) : exports_guard.IsEqual(action, "Required") ? RequiredInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "ReturnType") ? ReturnTypeInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "TemplateLiteral") ? TemplateLiteralInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Uncapitalize") ? UncapitalizeInstantiate(context, state, parameters[0], options) : exports_guard.IsEqual(action, "Uppercase") ? UppercaseInstantiate(context, state, parameters[0], options) : Deferred(action, parameters, options);
}
function InstantiateType(context, state, input) {
  const immutable = IsImmutable(input);
  const modifiers = ModifierActions(input, IsReadonly3(input) ? "add" : "none", IsOptional3(input) ? "add" : "none");
  const type = IsBase(modifiers[0]) ? modifiers[0].Clone() : modifiers[0];
  const instantiated = IsRef3(type) ? RefInstantiate(context, state, type, type.$ref) : IsArray6(type) ? _Array_(InstantiateType(context, state, type.items), ArrayOptions(type)) : IsAsyncIterator6(type) ? AsyncIterator2(InstantiateType(context, state, type.iteratorItems), AsyncIteratorOptions(type)) : IsCall(type) ? CallInstantiate(context, state, type.target, type.arguments) : IsConstructor4(type) ? Constructor2(InstantiateTypes(context, state, type.parameters), InstantiateType(context, state, type.instanceType), ConstructorOptions(type)) : IsDeferred(type) ? InstantiateDeferred(context, state, type.action, type.parameters, type.options) : IsFunction6(type) ? _Function_(InstantiateTypes(context, state, type.parameters), InstantiateType(context, state, type.returnType), FunctionOptions(type)) : IsIntersect3(type) ? Intersect3(InstantiateTypes(context, state, type.allOf), IntersectOptions(type)) : IsIterator6(type) ? Iterator2(InstantiateType(context, state, type.iteratorItems), IteratorOptions(type)) : IsObject6(type) ? _Object_2(InstantiateProperties(context, state, type.properties), ObjectOptions(type)) : IsPromise4(type) ? _Promise_(InstantiateType(context, state, type.item), PromiseOptions(type)) : IsRecord3(type) ? RecordFromPattern(RecordPattern2(type), InstantiateType(context, state, RecordValue3(type))) : IsRest(type) ? Rest2(InstantiateType(context, state, type.items)) : IsTuple3(type) ? Tuple2(InstantiateElements(context, state, type.items), TupleOptions(type)) : IsUnion3(type) ? Union3(InstantiateTypes(context, state, type.anyOf), UnionOptions(type)) : type;
  const withImmutable = immutable ? Immutable2(instantiated) : instantiated;
  const withModifiers = ApplyReadonly2(modifiers[1], ApplyOptional2(modifiers[2], withImmutable));
  return withModifiers;
}
function Instantiate2(context, type) {
  return InstantiateType(context, { callstack: [] }, type);
}

// ../../node_modules/typebox/build/type/engine/awaited/instantiate.mjs
function AwaitedOperation(type) {
  return IsPromise4(type) ? AwaitedOperation(type.item) : type;
}
function AwaitedAction(type, options) {
  const result = CanInstantiate([type]) ? exports_memory.Update(AwaitedOperation(type), {}, options) : AwaitedDeferred(type, options);
  return result;
}
function AwaitedInstantiate(context, state, type, options) {
  const instantiatedType = InstantiateType(context, state, type);
  return AwaitedAction(instantiatedType, options);
}

// ../../node_modules/typebox/build/type/action/awaited.mjs
function AwaitedDeferred(type, options = {}) {
  return Deferred("Awaited", [type], options);
}
function Awaited2(type, options = {}) {
  return AwaitedAction(type, options);
}
// ../../node_modules/typebox/build/type/action/evaluate.mjs
function EvaluateDeferred(type, options = {}) {
  return Deferred("Evaluate", [type], options);
}
function Evaluate(type, options = {}) {
  return EvaluateAction(type, options);
}
// ../../node_modules/typebox/build/type/action/module.mjs
function ModuleDeferred(context, options = {}) {
  return Deferred("Module", [context], options);
}
function Module3(context, options = {}) {
  return Instantiate2({}, ModuleDeferred(context, options));
}
// ../../node_modules/typebox/build/type/script/script.mjs
function Script2(...args) {
  const [context, input, options3] = exports_arguments.Match(args, {
    2: (script, options4) => exports_guard.IsString(script) ? [{}, script, options4] : [script, options4, {}],
    3: (context2, script, options4) => [context2, script, options4],
    1: (script) => [{}, script, {}]
  });
  const result = Script(input);
  const parsed = exports_guard.IsArray(result) && exports_guard.IsEqual(result.length, 2) ? InstantiateType(context, { callstack: [] }, result[0]) : Never2();
  return exports_memory.Update(parsed, {}, options3);
}
// ../../node_modules/typebox/build/typebox.mjs
var exports_typebox = {};
__export(exports_typebox, {
  Void: () => Void2,
  Uppercase: () => Uppercase2,
  Unsafe: () => Unsafe2,
  Unknown: () => Unknown2,
  Union: () => Union3,
  Undefined: () => Undefined2,
  Uncapitalize: () => Uncapitalize2,
  Tuple: () => Tuple2,
  This: () => This,
  TemplateLiteral: () => TemplateLiteral3,
  Symbol: () => Symbol3,
  String: () => String3,
  Script: () => Script2,
  ReturnType: () => ReturnType2,
  Rest: () => Rest2,
  Required: () => Required2,
  Refine: () => Refine,
  Ref: () => Ref2,
  RecordValue: () => RecordValue3,
  RecordPattern: () => RecordPattern2,
  RecordKey: () => RecordKey3,
  Record: () => Record2,
  ReadonlyType: () => ReadonlyType,
  ReadonlyObject: () => ReadonlyObject,
  Readonly: () => Readonly2,
  Promise: () => _Promise_,
  Pick: () => Pick2,
  Partial: () => Partial2,
  Parameters: () => Parameters2,
  Parameter: () => Parameter,
  Options: () => Options2,
  Optional: () => Optional2,
  Omit: () => Omit2,
  Object: () => _Object_2,
  Number: () => Number3,
  Null: () => Null2,
  NonNullable: () => NonNullable,
  Never: () => Never2,
  Module: () => Module3,
  Mapped: () => Mapped3,
  Lowercase: () => Lowercase2,
  Literal: () => Literal2,
  KeyOf: () => KeyOf3,
  Iterator: () => Iterator2,
  IsVoid: () => IsVoid3,
  IsUnsafe: () => IsUnsafe3,
  IsUnknown: () => IsUnknown3,
  IsUnion: () => IsUnion3,
  IsUndefined: () => IsUndefined6,
  IsTuple: () => IsTuple3,
  IsThis: () => IsThis3,
  IsTemplateLiteral: () => IsTemplateLiteral3,
  IsSymbol: () => IsSymbol6,
  IsString: () => IsString6,
  IsSchema: () => IsSchema3,
  IsRest: () => IsRest,
  IsRefine: () => IsRefine,
  IsRef: () => IsRef3,
  IsRecord: () => IsRecord3,
  IsReadonly: () => IsReadonly3,
  IsPromise: () => IsPromise4,
  IsParameter: () => IsParameter,
  IsOptional: () => IsOptional3,
  IsObject: () => IsObject6,
  IsNumber: () => IsNumber6,
  IsNull: () => IsNull6,
  IsNever: () => IsNever3,
  IsLiteral: () => IsLiteral3,
  IsKind: () => IsKind3,
  IsIterator: () => IsIterator6,
  IsIntersect: () => IsIntersect3,
  IsInteger: () => IsInteger5,
  IsInfer: () => IsInfer,
  IsImmutable: () => IsImmutable,
  IsIdentifier: () => IsIdentifier,
  IsGeneric: () => IsGeneric,
  IsFunction: () => IsFunction6,
  IsEnum: () => IsEnum,
  IsCyclic: () => IsCyclic,
  IsConstructor: () => IsConstructor4,
  IsCodec: () => IsCodec,
  IsCall: () => IsCall,
  IsBoolean: () => IsBoolean6,
  IsBigInt: () => IsBigInt6,
  IsBase: () => IsBase,
  IsAsyncIterator: () => IsAsyncIterator6,
  IsArray: () => IsArray6,
  IsAny: () => IsAny3,
  Intersect: () => Intersect3,
  Interface: () => Interface,
  Integer: () => Integer2,
  Instantiate: () => Instantiate2,
  InstanceType: () => InstanceType2,
  Infer: () => Infer,
  Index: () => Index2,
  Immutable: () => Immutable2,
  Identifier: () => Identifier,
  Generic: () => Generic,
  Function: () => _Function_,
  Extract: () => Extract2,
  ExtendsResult: () => exports_result,
  Extends: () => Extends3,
  Exclude: () => Exclude2,
  Evaluate: () => Evaluate,
  Enum: () => Enum2,
  EncodeBuilder: () => EncodeBuilder,
  Encode: () => Encode2,
  DecodeBuilder: () => DecodeBuilder,
  Decode: () => Decode2,
  Cyclic: () => Cyclic,
  ConstructorParameters: () => ConstructorParameters2,
  Constructor: () => Constructor2,
  Conditional: () => Conditional,
  Codec: () => Codec,
  Capitalize: () => Capitalize2,
  Call: () => Call,
  Boolean: () => Boolean3,
  BigInt: () => BigInt3,
  Base: () => Base,
  Awaited: () => Awaited2,
  AsyncIterator: () => AsyncIterator2,
  Array: () => _Array_,
  Any: () => Any2
});
// ../../node_modules/@earendil-works/pi-ai/dist/utils/typebox-helpers.js
function StringEnum(values, options3) {
  return exports_typebox.Unsafe({
    type: "string",
    enum: values,
    ...options3?.description && { description: options3.description },
    ...options3?.default && { default: options3.default }
  });
}

// src/schemas.ts
var SensitiveHeaders = exports_typebox.Record(exports_typebox.String(), exports_typebox.String(), {
  description: "HTTP header values. Authorization and Cookie values are sensitive and must not be disclosed."
});
var Query = exports_typebox.Record(exports_typebox.String(), exports_typebox.Unknown(), {
  description: "URL query values may contain sensitive API keys or tokens and are not returned in Pi metadata."
});
var Authentication = exports_typebox.Union([
  exports_typebox.Object({
    type: StringEnum(["basic"]),
    username: exports_typebox.String({ description: "Basic-auth username; treat as sensitive." }),
    password: exports_typebox.String({ description: "Sensitive Basic-auth password. Never disclose it." })
  }, { additionalProperties: false }),
  exports_typebox.Object({
    type: StringEnum(["bearer"]),
    token: exports_typebox.String({ description: "Sensitive Bearer token. Never disclose it." })
  }, { additionalProperties: false })
], { description: "Sensitive authentication credentials." });
var MultipartPart = exports_typebox.Union([
  exports_typebox.Object({
    path: exports_typebox.String({ description: "Upload path. The uploaded file contents are sensitive and are never returned in details." }),
    filename: exports_typebox.Optional(exports_typebox.String()),
    content_type: exports_typebox.Optional(exports_typebox.String()),
    value: exports_typebox.Optional(exports_typebox.Never())
  }, { additionalProperties: false }),
  exports_typebox.Object({
    value: exports_typebox.String({ description: "Multipart text value; may be sensitive." }),
    content_type: exports_typebox.Optional(exports_typebox.String()),
    path: exports_typebox.Optional(exports_typebox.Never()),
    filename: exports_typebox.Optional(exports_typebox.Never())
  }, { additionalProperties: false })
]);
var NoBody = exports_typebox.Object({
  json: exports_typebox.Optional(exports_typebox.Never()),
  form: exports_typebox.Optional(exports_typebox.Never()),
  content: exports_typebox.Optional(exports_typebox.Never()),
  multipart: exports_typebox.Optional(exports_typebox.Never())
});
var JsonBody = exports_typebox.Object({
  json: exports_typebox.Unknown({ description: "JSON request body; may contain sensitive data." }),
  form: exports_typebox.Optional(exports_typebox.Never()),
  content: exports_typebox.Optional(exports_typebox.Never()),
  multipart: exports_typebox.Optional(exports_typebox.Never())
});
var FormBody = exports_typebox.Object({
  form: exports_typebox.Record(exports_typebox.String(), exports_typebox.Unknown(), { description: "Form request body; values may be sensitive." }),
  json: exports_typebox.Optional(exports_typebox.Never()),
  content: exports_typebox.Optional(exports_typebox.Never()),
  multipart: exports_typebox.Optional(exports_typebox.Never())
});
var ContentBody = exports_typebox.Object({
  content: exports_typebox.String({ description: "Raw text request body; may be sensitive." }),
  json: exports_typebox.Optional(exports_typebox.Never()),
  form: exports_typebox.Optional(exports_typebox.Never()),
  multipart: exports_typebox.Optional(exports_typebox.Never())
});
var MultipartBody = exports_typebox.Object({
  multipart: exports_typebox.Record(exports_typebox.String(), MultipartPart, {
    description: "Multipart fields and file uploads; values and uploaded file contents may be sensitive."
  }),
  json: exports_typebox.Optional(exports_typebox.Never()),
  form: exports_typebox.Optional(exports_typebox.Never()),
  content: exports_typebox.Optional(exports_typebox.Never())
});
var RequestOptions = {
  url: exports_typebox.String({ description: "HTTP or HTTPS URL. Do not embed credentials in the URL." }),
  method: exports_typebox.Optional(exports_typebox.String({ description: "Arbitrary HTTP method (default GET)." })),
  query: exports_typebox.Optional(Query),
  headers: exports_typebox.Optional(SensitiveHeaders),
  auth: exports_typebox.Optional(Authentication),
  profile: exports_typebox.Optional(exports_typebox.String({ description: "Installed curl_cffi browser profile." })),
  http_version: exports_typebox.Optional(StringEnum(["auto", "1.1", "2", "3"], {
    description: "HTTP protocol preference.",
    default: "auto"
  })),
  proxy: exports_typebox.Optional(exports_typebox.String({
    description: "Sensitive proxy URL. Proxy usernames and passwords must not be disclosed."
  })),
  allow_redirects: exports_typebox.Optional(exports_typebox.Union([exports_typebox.Boolean(), exports_typebox.Literal("safe")])),
  max_redirects: exports_typebox.Optional(exports_typebox.Integer({ minimum: 0 })),
  timeout: exports_typebox.Optional(exports_typebox.Number({ minimum: 0 })),
  retries: exports_typebox.Optional(exports_typebox.Integer({ minimum: 0 })),
  verify: exports_typebox.Optional(exports_typebox.Boolean({ description: "Whether to verify TLS certificates." })),
  session_id: exports_typebox.Optional(exports_typebox.String())
};
var RequestParameters = exports_typebox.Intersect([
  exports_typebox.Object(RequestOptions),
  exports_typebox.Union([NoBody, JsonBody, FormBody, ContentBody, MultipartBody])
]);
var DownloadParameters = exports_typebox.Object({
  url: RequestOptions.url,
  query: RequestOptions.query,
  headers: RequestOptions.headers,
  auth: RequestOptions.auth,
  profile: RequestOptions.profile,
  http_version: RequestOptions.http_version,
  proxy: RequestOptions.proxy,
  allow_redirects: RequestOptions.allow_redirects,
  max_redirects: RequestOptions.max_redirects,
  timeout: RequestOptions.timeout,
  retries: RequestOptions.retries,
  verify: RequestOptions.verify,
  session_id: RequestOptions.session_id,
  path: exports_typebox.Optional(exports_typebox.String({ description: "Destination path. A private temporary path is used when omitted." })),
  overwrite: exports_typebox.Optional(exports_typebox.Boolean({ default: false }))
}, { additionalProperties: false });
var SessionParameters = exports_typebox.Object({
  action: StringEnum(["create", "list", "close"], {
    description: "Session action."
  }),
  session_id: exports_typebox.Optional(exports_typebox.String({ description: "Required for close." })),
  profile: exports_typebox.Optional(exports_typebox.String({ description: "Default browser profile for a created session." }))
}, { additionalProperties: false });
var WebSocketParameters = exports_typebox.Object({
  action: StringEnum(["connect", "send", "receive", "close"], {
    description: "WebSocket action."
  }),
  websocket_id: exports_typebox.Optional(exports_typebox.String()),
  url: exports_typebox.Optional(exports_typebox.String({ description: "WebSocket URL for connect." })),
  headers: exports_typebox.Optional(SensitiveHeaders),
  profile: exports_typebox.Optional(exports_typebox.String()),
  proxy: RequestOptions.proxy,
  verify: RequestOptions.verify,
  session_id: RequestOptions.session_id,
  message: exports_typebox.Optional(exports_typebox.String({ description: "Text message to send; may be sensitive." })),
  data_base64: exports_typebox.Optional(exports_typebox.String({ description: "Base64 binary message to send; may be sensitive." })),
  timeout: exports_typebox.Optional(exports_typebox.Number({ minimum: 0 })),
  code: exports_typebox.Optional(exports_typebox.Integer({ minimum: 0, maximum: 65535 })),
  reason: exports_typebox.Optional(exports_typebox.String())
}, { additionalProperties: false });
var ProfilesParameters = exports_typebox.Object({
  action: StringEnum(["list", "fingerprint"], {
    description: "List installed profiles or run a public fingerprint diagnostic."
  }),
  profile: exports_typebox.Optional(exports_typebox.String({ description: "Browser profile for fingerprint diagnostics." })),
  url: exports_typebox.Optional(exports_typebox.String({ description: "Optional public fingerprint endpoint." }))
}, { additionalProperties: false });

// src/tools.ts
function createToolDefinitions(worker) {
  return [
    {
      name: "decent_curl_request",
      label: "Browser HTTP request",
      description: "Make an HTTP request using curl_cffi browser impersonation. Response bodies are returned as text. Authorization, Cookie, proxy credentials, request bodies, and upload contents are sensitive and excluded from result details.",
      parameters: RequestParameters,
      async execute(_id, params, signal) {
        const result = asRecord(await worker.call("request.execute", asRecord(params), signal));
        return responseResult(result);
      }
    },
    {
      name: "decent_curl_download",
      label: "Browser HTTP download",
      description: "Stream an HTTP download to a private file using browser impersonation. Authorization, Cookie, and proxy credentials are sensitive and excluded from result details.",
      parameters: DownloadParameters,
      async execute(_id, params, signal) {
        const result = asRecord(await worker.call("download.execute", asRecord(params), signal));
        const details = pick3(result, ["path", "size", "content_type", "status", "url", "profile", "sha256"]);
        sanitizeUrlMetadata(details);
        const path = typeof details.path === "string" ? details.path : "unknown path";
        const size = typeof details.size === "number" ? ` (${details.size} bytes)` : "";
        return { content: [{ type: "text", text: `Downloaded to ${path}${size}` }], details };
      }
    },
    {
      name: "decent_curl_session",
      label: "Browser HTTP session",
      description: "Create, list, or close named in-memory HTTP sessions. Cookie values and credentials are sensitive and are never returned.",
      parameters: SessionParameters,
      async execute(_id, params, signal) {
        const { action: action2, ...operationParams } = params;
        const result = asRecord(await worker.call(`session.${action2}`, operationParams, signal));
        const details = sessionDetails(result);
        return { content: [{ type: "text", text: JSON.stringify(details, null, 2) }], details };
      }
    },
    {
      name: "decent_curl_websocket",
      label: "Browser WebSocket",
      description: "Connect, send, receive, or close a browser-impersonated WebSocket. Authorization, Cookie, proxy credentials, and outbound messages are sensitive and excluded from result details.",
      parameters: WebSocketParameters,
      async execute(_id, params, signal) {
        const { action: action2, ...operationParams } = params;
        const result = asRecord(await worker.call(`websocket.${action2}`, operationParams, signal));
        return websocketResult(action2, result);
      }
    },
    {
      name: "decent_curl_profiles",
      label: "Browser profiles",
      description: "List installed curl_cffi browser profiles or run a public fingerprint diagnostic.",
      parameters: ProfilesParameters,
      async execute(_id, params, signal) {
        const { action: action2, ...operationParams } = params;
        const operation = action2 === "list" ? "profiles.list" : "diagnostic.fingerprint";
        const result = asRecord(await worker.call(operation, operationParams, signal));
        if (action2 === "fingerprint" && typeof result.body === "string")
          return responseResult(result);
        const profiles = stringArray(result.profiles);
        const families = stringArray(result.families);
        const details = { profile_count: profiles.length, families };
        return {
          content: [{ type: "text", text: JSON.stringify({ profiles, families }, null, 2) }],
          details
        };
      }
    }
  ];
}
async function responseResult(result) {
  const details = pick3(result, [
    "status",
    "reason",
    "url",
    "elapsed_ms",
    "http_version",
    "profile",
    "body_encoding"
  ]);
  sanitizeUrlMetadata(details);
  const headers = safeHeaders(result.headers);
  if (Object.keys(headers).length > 0)
    details.headers = headers;
  const cookies = safeCookies(result.cookies);
  if (cookies.length > 0)
    details.cookies = cookies;
  const body = typeof result.body === "string" ? result.body : "";
  const truncation = truncateHead(body, {
    maxBytes: DEFAULT_MAX_BYTES,
    maxLines: DEFAULT_MAX_LINES
  });
  let text = truncation.content;
  if (truncation.truncated) {
    const directory = await mkdtemp(join(tmpdir(), "decent-curl-response-"));
    await chmod(directory, 448);
    const fullOutputPath = join(directory, "response-body.txt");
    await writeFile(fullOutputPath, body, { encoding: "utf8", flag: "wx", mode: 384 });
    await chmod(fullOutputPath, 384);
    details.fullOutputPath = fullOutputPath;
    details.truncation = {
      truncatedBy: truncation.truncatedBy,
      totalLines: truncation.totalLines,
      totalBytes: truncation.totalBytes,
      outputLines: truncation.outputLines,
      outputBytes: truncation.outputBytes
    };
    text += `

[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines`;
    text += ` (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).`;
    text += ` Full response body saved to: ${fullOutputPath}]`;
  }
  return { content: [{ type: "text", text }], details };
}
function sessionDetails(result) {
  const details = pick3(result, ["session_id", "profile", "closed"]);
  if (Array.isArray(result.sessions)) {
    details.sessions = result.sessions.map((entry) => pick3(asRecord(entry), ["session_id", "profile"]));
  }
  return details;
}
function websocketResult(action2, result) {
  const details = pick3(result, ["websocket_id", "connected", "closed", "message_type", "code", "reason"]);
  let text;
  if (action2 === "receive" && typeof result.message === "string")
    text = result.message;
  else if (action2 === "receive" && typeof result.data_base64 === "string")
    text = result.data_base64;
  else
    text = JSON.stringify(details, null, 2);
  return { content: [{ type: "text", text }], details };
}
function pick3(record3, keys2) {
  const result = {};
  for (const key of keys2) {
    const value = record3[key];
    if (value === null || ["string", "number", "boolean"].includes(typeof value))
      result[key] = value;
  }
  return result;
}
function sanitizeUrlMetadata(details) {
  if (typeof details.url !== "string")
    return;
  try {
    const url = new URL(details.url);
    details.url = `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    delete details.url;
  }
}
function safeHeaders(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {};
  const sensitive = new Set(["authorization", "cookie", "proxy-authorization", "set-cookie"]);
  return Object.fromEntries(Object.entries(value).filter(([name, headerValue]) => !sensitive.has(name.toLowerCase()) && typeof headerValue === "string"));
}
function safeCookies(value) {
  if (!Array.isArray(value))
    return [];
  return value.flatMap((entry) => {
    const cookie = asRecord(entry);
    return typeof cookie.name === "string" && typeof cookie.domain === "string" ? [{ name: cookie.name, domain: cookie.domain }] : [];
  });
}
function stringArray(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

// src/index.ts
var PACKAGE_VERSION = "0.1.0";
var STATUS_SCRIPT = [
  "import json, platform",
  "import curl_cffi",
  "from curl_cffi import Curl",
  "from curl_cffi.requests import BrowserType",
  "curl = Curl()",
  "libcurl = curl.version().decode('utf-8', 'replace')",
  "curl.close()",
  "print(json.dumps({'python': platform.python_version(), 'curl_cffi': curl_cffi.__version__, 'libcurl': libcurl, 'profile_count': len(BrowserType.__members__)}))"
].join("; ");
function registerDecentCurlExtension(pi, dependencies2 = {}) {
  const packageRoot = dependencies2.packageRoot ?? resolve2(dirname2(fileURLToPath2(import.meta.url)), "..");
  const pythonCommand = dependencies2.pythonCommand ?? resolvePythonCommand(packageRoot);
  const worker = dependencies2.worker ?? new WorkerClient({ cwd: packageRoot });
  const runVisible = dependencies2.runVisible ?? runCommandVisible;
  const runCapture = dependencies2.runCapture ?? runCommandCapture;
  const packageVersion = dependencies2.packageVersion ?? PACKAGE_VERSION;
  for (const tool of createToolDefinitions(worker))
    pi.registerTool(tool);
  pi.registerCommand("decent-curl-setup", {
    description: "Create the frozen package-local Python 3.13 environment",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Running decent-curl setup visibly with uv...", "info");
      try {
        await runVisible("uv", ["sync", "--frozen", "--python", "3.13", "--no-dev"], packageRoot);
        ctx.ui.notify("decent-curl setup complete.", "info");
      } catch {
        ctx.ui.notify("decent-curl setup failed. See the visible uv output above.", "error");
      }
    }
  });
  pi.registerCommand("decent-curl-status", {
    description: "Report extension, Python, curl_cffi, libcurl, and profile status",
    handler: async (_args, ctx) => {
      try {
        const output = await runCapture(pythonCommand, ["-c", STATUS_SCRIPT], packageRoot);
        const status = parseStatus(output);
        ctx.ui.notify([
          `decent-curl-impersonate ${packageVersion}`,
          `Python environment: ${pythonCommand}`,
          `Python version: ${status.python}`,
          `curl_cffi: ${status.curl_cffi}`,
          `libcurl: ${status.libcurl}`,
          `Available profiles: ${status.profile_count}`
        ].join(`
`), "info");
      } catch {
        ctx.ui.notify([
          `decent-curl-impersonate ${packageVersion}`,
          `Python environment unavailable: ${pythonCommand}`,
          "Run /decent-curl-setup to create the frozen environment."
        ].join(`
`), "warning");
      }
    }
  });
  pi.on("session_shutdown", async () => {
    await worker.stop();
  });
}
function decentCurlExtension(pi) {
  registerDecentCurlExtension(pi);
}
function parseStatus(output) {
  const parsed = JSON.parse(output.trim());
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Invalid status");
  const value = parsed;
  if (typeof value.python !== "string" || typeof value.curl_cffi !== "string" || typeof value.libcurl !== "string" || typeof value.profile_count !== "number")
    throw new Error("Invalid status");
  return value;
}
function runCommandVisible(command, args, cwd) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn2(command, args, { cwd, stdio: "inherit", shell: false });
    child.once("error", () => rejectRun(new Error("Setup command failed to start")));
    child.once("exit", (code) => {
      if (code === 0)
        resolveRun();
      else
        rejectRun(new Error("Setup command failed"));
    });
  });
}
function runCommandCapture(command, args, cwd) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn2(command, args, { cwd, stdio: ["ignore", "pipe", "ignore"], shell: false });
    const chunks = [];
    let size = 0;
    child.stdout.on("data", (chunk) => {
      size += chunk.byteLength;
      if (size <= 1024 * 1024)
        chunks.push(chunk);
      else
        child.kill();
    });
    child.once("error", () => rejectRun(new Error("Status command failed to start")));
    child.once("exit", (code) => {
      if (code === 0 && size <= 1024 * 1024)
        resolveRun(Buffer.concat(chunks).toString("utf8"));
      else
        rejectRun(new Error("Status command failed"));
    });
  });
}
export {
  registerDecentCurlExtension,
  decentCurlExtension as default
};
