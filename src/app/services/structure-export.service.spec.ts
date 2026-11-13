import { buildGlb, parseSdf } from './structure-export.service';

const SDF = [
  'ethane',
  '  test',
  '',
  '  2  1  0  0  0  0  0  0  0  0999 V2000',
  '    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
  '  1  2  1  0  0  0  0',
  'M  END'
].join('\n');

describe('StructureExportService helpers', () => {
  it('parses atoms and bonds from SDF', () => {
    const molecule = parseSdf(SDF);

    expect(molecule.atoms.length).toBe(2);
    expect(molecule.atoms[0].element).toBe('C');
    expect(molecule.bonds.length).toBe(1);
    expect(molecule.bonds[0].from).toBe(0);
    expect(molecule.bonds[0].to).toBe(1);
  });

  it('builds a GLB with the glTF magic and one node per atom and bond', () => {
    const molecule = parseSdf(SDF);
    const glb = buildGlb(molecule.atoms, molecule.bonds);
    const view = new DataView(glb);

    expect(view.getUint32(0, true)).toBe(0x46546C67);
    expect(view.getUint32(4, true)).toBe(2);
    expect(view.getUint32(8, true)).toBe(glb.byteLength);

    const jsonLength = view.getUint32(12, true);
    const jsonBytes = new Uint8Array(glb, 20, jsonLength);
    const json = JSON.parse(new TextDecoder().decode(jsonBytes).trim());

    expect(json.nodes.length).toBe(3);
    expect(json.meshes.length).toBeGreaterThan(0);
    expect(json.materials.length).toBeGreaterThan(0);
  });
});
