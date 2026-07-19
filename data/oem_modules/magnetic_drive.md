---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Engineering Design
version: 1.0
---

# Magnetic Drive System

## Purpose
Describes the magnetic drive design principle, key components, containment shell options, and dry-running/demagnetization risks of PUMP-101A's sealless drive system.

## Engineering Information
PUMP-101A uses a magnetic drive design in place of a conventional mechanical shaft seal. An inner magnet assembly (rotor) inside the containment shell is driven by an outer magnet assembly (carrier) coupled to the motor, transmitting torque across the shell without a physical shaft penetration. This eliminates seal leakage paths, making the design well suited to toxic, corrosive, or highly volatile liquids.

### Key Components
- Inner rotor (magnet assembly, product-wetted side)
- Outer rotor (magnet assembly, driver side)
- Containment shell (PEEK, metallic, or dual containment configuration)
- Product-lubricated journal bearings
- Thrust collar and drive pin

### Containment Shell Options
- Single containment – PEEK shell (polymer)
- Single containment – metallic shell
- Dual containment – PEEK + metallic shell with monitored interspace (pressure switch connected to alarm/starter)

## Engineering Information — Risks

### Risks of Dry Running
Magnetic drive pumps are inherently safe but can suffer severe, costly damage within minutes of dry running. Main causes:
1. Blocking of lubrication ports by solids in the pumped liquid.
2. Loss of liquid to pump suction.
3. Impeller seizing due to debris in the casing.
4. Solidification of liquid in the shell (e.g., poor temperature control).

If any of these conditions occur, the system must be switched off within one minute. A power or current monitor fitted into the starter is the most universal protection method.

### Demagnetization Risk
- High operating temperatures around the magnet assemblies, or magnetic decoupling while operating around a metallic containment shell, can permanently reduce magnet strength.
- The inner magnet assembly is most susceptible to high temperatures and must not operate above its upper critical temperature limit.
- If decoupling occurs or temperature limits are exceeded, perform the magnet torque test procedure to verify remaining magnetic strength (see disassembly documentation for factory torque specifications by model/series).

## Inspection Points
- Magnet torque test after any suspected decoupling event or temperature excursion, verified against factory torque specifications by model/series.
- Containment shell integrity and interspace pressure (dual containment configurations).
- Journal bearing lubrication path clearance (product-lubricated).

## Warnings
- Magnetic drive pumps can suffer severe, costly damage within minutes of dry running — the system must be switched off within one minute if dry running occurs.
- The inner magnet assembly must not operate above its upper critical temperature limit or permanent demagnetization can occur.
- Dismantled magnet assemblies (inner and outer) have very strong mutual attraction — handle them separately, at a safe distance, and store in a clean, non-ferrous area.
- Persons with pacemakers or magnetically sensitive instrumentation must stay well clear of the magnetic drive unit during dismantling.
- Ferritic dust attracts to magnetic assemblies — keep the work area free of metallic chips and dust; do not drill, grind, or machine near the work area.

## Best Practices
- Fit a power or current monitor into the starter as the most universal protection method against dry running.
- Perform a magnet torque test after any suspected decoupling event or temperature excursion to verify remaining magnetic strength before returning the pump to service.
- For dual containment shells, actively monitor interspace pressure via a pressure switch connected to an alarm or motor starter.

## Related Documents
- assembly_procedure.md
- disassembly_procedure.md
- operating_limits.md
- priming_and_auxiliary_supplies.md
- hazardous_area_atex.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Inner rotor (magnet assembly)
- Outer rotor (magnet assembly)
- Containment shell (PEEK / metallic / dual)
- Journal bearings
- Thrust collar
- Drive pin
- Power/current monitor
- Pressure switch

**Processes:**
- Torque transmission
- Dry-run protection
- Demagnetization prevention
- Magnet torque testing

### FAQ
Q: How does the magnetic drive eliminate the need for a mechanical shaft seal?
A: An inner magnet assembly inside the containment shell is driven by an outer magnet assembly coupled to the motor, transmitting torque across the shell without any physical shaft penetration, eliminating seal leakage paths entirely.

Q: How quickly can dry running damage a magnetic drive pump?
A: Severe, costly damage can occur within minutes; the system must be switched off within one minute if dry running is detected.

Q: What is the most universal protection method against dry running?
A: A power or current monitor fitted into the motor starter.

Q: What happens if the inner magnet assembly exceeds its upper critical temperature limit?
A: It can suffer permanent demagnetization, reducing magnet strength; a magnet torque test should be performed to verify remaining strength.

## Keywords
magnetic drive, sealless pump, inner rotor, outer rotor, containment shell, PEEK shell, dual containment, dry running, demagnetization, magnet torque test, journal bearing, thrust collar, drive pin, power monitor, current monitor, toxic liquid handling, corrosive liquid handling, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
