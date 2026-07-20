---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Maintenance Procedure
version: 1.0
---

# Setting Impeller Clearance

## Purpose
Describes the procedure for setting correct front clearance between the open impeller and casing on PUMP-101A after dismantling or whenever a different clearance is needed.

## Engineering Information
PUMP-101A uses an open impeller. Correct front clearance between the impeller and casing must be maintained for efficient hydraulic performance. This procedure is required after dismantling or whenever a different clearance is needed.

### Design Front Clearances
| Impeller Diameter | Clearance |
|---|---|
| Up to 210 mm inclusive | 0.3 mm (0.012 in.) |
| 211 mm to 254 mm | 0.4 mm (0.016 in.) |

### Key Values
- Gasket compression factor: 0.15 mm (0.006 in.).
- Required axial float after setting: 0.5–1.5 mm (0.02–0.06 in.).

## Procedure
1. Position the pump casing with the suction flange facing down on the bench.
2. Install the casing gasket followed by the inner rotor/casing cover assembly.
3. Tighten the casing bolts.
4. Locate a dial indicator on top of the pump shaft to record vertical movement.
5. Loosen the inner rotor locknut and record the shaft drop when the impeller touches the pump casing. Check 3 times at 120-degree intervals and record the smallest value.
6. Record this reading (Line 1: Shaft drop). Subtract the gasket compression factor of 0.15 mm (0.006 in.) (Line 2) to get Line 3.
7. Subtract the design front clearance (Line 4) from Line 3 to get the shim adjustment (Line 5).
   - If POSITIVE: ADD shims.
   - If NEGATIVE: SUBTRACT shims.
8. Re-install the inner rotor and tighten the locknut to the torque specified in the fastener torque documentation.
9. Check axial float is between 0.5 and 1.5 mm (0.02–0.06 in.).

## Inspection Points
- Shaft drop reading, taken at 3 points 120 degrees apart, using the smallest value.
- Final axial float (must fall between 0.5 and 1.5 mm).
- Locknut torque after re-installation (per fastener_torques.md).

## Warnings
- The inner rotor locknut has a left-hand thread; using right-hand-thread technique risks damaging the assembly, and a handle extension may be required.
- Non-metallic gaskets undergo creep relaxation — before commissioning, check and retighten fasteners to stated torques.
- Bolts must always be torqued crosswise on all bolting patterns; do NOT torque in a circular sequence.

## Best Practices
- Take shaft drop readings at three points 120 degrees apart and use the smallest recorded value for accuracy.
- Always verify final axial float (0.5–1.5 mm) as a cross-check after shim adjustment and locknut torqueing.

## Related Documents
- assembly_procedure.md
- fastener_torques.md
- disassembly_procedure.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Open impeller
- Pump casing
- Casing gasket
- Inner rotor
- Casing cover assembly
- Dial indicator
- Inner rotor locknut
- Shims

**Processes:**
- Impeller clearance setting
- Shimming
- Torqueing
- Axial float verification

### FAQ
Q: What is the design front clearance for an impeller up to 210 mm in diameter?
A: 0.3 mm (0.012 in.).

Q: What gasket compression factor is subtracted when calculating shim adjustment?
A: 0.15 mm (0.006 in.).

Q: What axial float range should be confirmed after setting impeller clearance?
A: Between 0.5 and 1.5 mm (0.02–0.06 in.).

Q: When is the impeller clearance procedure required?
A: After dismantling the pump, or whenever a different clearance setting is needed.

## Keywords
impeller clearance, front clearance, open impeller, shim adjustment, axial float, shaft drop, dial indicator, inner rotor locknut, gasket compression factor, casing cover assembly, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
