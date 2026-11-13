import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PubchemService } from './pubchem.service';

export interface ExportAtom {
  x: number;
  y: number;
  z: number;
  element: string;
  radius?: number;
  color?: [number, number, number];
}

export interface ExportBond {
  from: number;
  to: number;
  thickness?: number;
}

interface SdfMolecule {
  atoms: ExportAtom[];
  bonds: ExportBond[];
}

const ELEMENT_COLORS: { [element: string]: [number, number, number] } = {
  H: [0.92, 0.92, 0.92],
  C: [0.32, 0.32, 0.32],
  N: [0.12, 0.32, 0.9],
  O: [0.9, 0.12, 0.12],
  S: [0.9, 0.82, 0.12],
  P: [0.95, 0.5, 0.12],
  F: [0.12, 0.8, 0.2],
  Cl: [0.12, 0.8, 0.2],
  Br: [0.55, 0.12, 0.12],
  I: [0.45, 0.12, 0.65],
  default: [0.55, 0.35, 0.8]
};

const ELEMENT_RADII: { [element: string]: number } = {
  H: 0.25,
  C: 0.34,
  N: 0.34,
  O: 0.34,
  S: 0.4,
  P: 0.4,
  default: 0.34
};

export function parseSdf(sdf: string): SdfMolecule {
  const lines = sdf.split(/\r?\n/);
  const counts = lines[3] || '';
  const atomCount = parseInt(counts.slice(0, 3), 10) || 0;
  const bondCount = parseInt(counts.slice(3, 6), 10) || 0;

  const atoms: ExportAtom[] = [];
  for (let i = 0; i < atomCount; i++) {
    const line = lines[4 + i] || '';
    const element = (line.slice(31, 34).trim() || 'C');
    atoms.push({
      x: Number(line.slice(0, 10)),
      y: Number(line.slice(10, 20)),
      z: Number(line.slice(20, 30)),
      element
    });
  }

  const bonds: ExportBond[] = [];
  for (let i = 0; i < bondCount; i++) {
    const line = lines[4 + atomCount + i] || '';
    const from = (parseInt(line.slice(0, 3), 10) || 1) - 1;
    const to = (parseInt(line.slice(3, 6), 10) || 1) - 1;
    if (from >= 0 && to >= 0 && from < atoms.length && to < atoms.length && from !== to) {
      bonds.push({ from, to });
    }
  }

  return { atoms, bonds };
}

@Injectable({
  providedIn: 'root'
})
export class StructureExportService {

  constructor(
    private http: HttpClient,
    private pubchem: PubchemService
  ) { }

  async moleculeObjectUrl(name: string): Promise<string> {
    const sdf = await this.http
      .get(this.pubchem.get3DSDFLink(name), { responseType: 'text' })
      .toPromise();

    const molecule = parseSdf(sdf as string);
    if (!molecule.atoms.length) {
      throw new Error('No 3D coordinates available');
    }
    return this.toObjectUrl(molecule.atoms, molecule.bonds);
  }

  toObjectUrl(atoms: ExportAtom[], bonds: ExportBond[]): string {
    const glb = buildGlb(atoms, bonds);
    return URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
  }
}

function sphereGeometry(segments = 10, rings = 6) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= rings; y++) {
    const v = y / rings;
    const phi = v * Math.PI;
    for (let x = 0; x <= segments; x++) {
      const u = x / segments;
      const theta = u * Math.PI * 2;
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = Math.sin(phi) * Math.sin(theta);
      positions.push(sx, sy, sz);
      normals.push(sx, sy, sz);
    }
  }

  for (let y = 0; y < rings; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  return { positions, normals, indices };
}

function quaternionFromZ(direction: [number, number, number]): [number, number, number, number] {
  const [x, y, z] = direction;
  if (z > 0.999999) {
    return [0, 0, 0, 1];
  }
  if (z < -0.999999) {
    return [0, 1, 0, 0];
  }
  const axis: [number, number, number] = [-y, x, 0];
  const length = Math.hypot(axis[0], axis[1], axis[2]);
  if (length < 1e-6) {
    return [0, 0, 0, 1];
  }
  const angle = Math.acos(Math.max(-1, Math.min(1, z)));
  const s = Math.sin(angle / 2);
  return [axis[0] / length * s, axis[1] / length * s, axis[2] / length * s, Math.cos(angle / 2)];
}

export function buildGlb(atoms: ExportAtom[], bonds: ExportBond[]): ArrayBuffer {
  const geometry = sphereGeometry();
  const positions = new Float32Array(geometry.positions);
  const normals = new Float32Array(geometry.normals);
  const indices = new Uint16Array(geometry.indices);

  const elements = Array.from(new Set(atoms.map(atom => atom.element)));
  const materials: any[] = elements.map(element => ({
    pbrMetallicRoughness: {
      baseColorFactor: [...(ELEMENT_COLORS[element] || ELEMENT_COLORS.default), 1],
      metallicFactor: 0.05,
      roughnessFactor: 0.65
    }
  }));
  const bondMaterial = materials.length;
  materials.push({
    pbrMetallicRoughness: {
      baseColorFactor: [0.72, 0.72, 0.78, 1],
      metallicFactor: 0.05,
      roughnessFactor: 0.65
    }
  });

  const meshes: any[] = elements.map((element, index) => ({
    primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: index }]
  }));
  const bondMesh = meshes.length;
  meshes.push({
    primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: bondMaterial }]
  });

  const nodes: any[] = [];
  for (const atom of atoms) {
    const radius = atom.radius ?? (ELEMENT_RADII[atom.element] ?? ELEMENT_RADII.default);
    nodes.push({
      mesh: elements.indexOf(atom.element),
      translation: [atom.x, atom.y, atom.z],
      scale: [radius, radius, radius]
    });
  }

  for (const bond of bonds) {
    const from = atoms[bond.from];
    const to = atoms[bond.to];
    if (!from || !to) {
      continue;
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const length = Math.hypot(dx, dy, dz);
    if (length < 1e-6) {
      continue;
    }
    const thickness = bond.thickness ?? 0.16;
    nodes.push({
      mesh: bondMesh,
      translation: [(from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2],
      rotation: quaternionFromZ([dx / length, dy / length, dz / length]),
      scale: [thickness, thickness, length / 2]
    });
  }

  const align4 = (value: number) => (value + 3) & ~3;
  const positionOffset = 0;
  const normalOffset = align4(positionOffset + positions.byteLength);
  const indexOffset = align4(normalOffset + normals.byteLength);
  const binLength = align4(indexOffset + indices.byteLength);
  const bin = new Uint8Array(binLength);
  bin.set(new Uint8Array(positions.buffer), positionOffset);
  bin.set(new Uint8Array(normals.buffer), normalOffset);
  bin.set(new Uint8Array(indices.buffer), indexOffset);

  const json = {
    asset: { version: '2.0', generator: 'Chemview' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: 'VEC3',
        min: [-1, -1, -1],
        max: [1, 1, 1]
      },
      { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: indices.length, type: 'SCALAR' }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: positionOffset, byteLength: positions.byteLength, target: 34962 },
      { buffer: 0, byteOffset: normalOffset, byteLength: normals.byteLength, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indices.byteLength, target: 34963 }
    ],
    buffers: [{ byteLength: binLength }]
  };

  return packGlb(json, bin);
}

function packGlb(json: any, bin: Uint8Array): ArrayBuffer {
  const encoder = new TextEncoder();
  let jsonBytes = encoder.encode(JSON.stringify(json));
  const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
  if (jsonPadding) {
    const padded = new Uint8Array(jsonBytes.length + jsonPadding);
    padded.set(jsonBytes);
    padded.fill(0x20, jsonBytes.length);
    jsonBytes = padded;
  }

  const binPadding = (4 - (bin.length % 4)) % 4;
  const binLength = bin.length + binPadding;
  const totalLength = 12 + 8 + jsonBytes.length + 8 + binLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;
  view.setUint32(offset, 0x46546C67, true); offset += 4;
  view.setUint32(offset, 2, true); offset += 4;
  view.setUint32(offset, totalLength, true); offset += 4;
  view.setUint32(offset, jsonBytes.length, true); offset += 4;
  view.setUint32(offset, 0x4E4F534A, true); offset += 4;
  bytes.set(jsonBytes, offset); offset += jsonBytes.length;
  view.setUint32(offset, binLength, true); offset += 4;
  view.setUint32(offset, 0x004E4942, true); offset += 4;
  bytes.set(bin, offset);

  return buffer;
}
