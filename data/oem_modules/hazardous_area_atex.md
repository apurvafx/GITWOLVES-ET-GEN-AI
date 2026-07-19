---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Safety and Regulatory Compliance
version: 1.0
---

# Hazardous Area (ATEX) Compliance

## Purpose
Defines the ATEX compliance requirements for PUMP-101A when installed in potentially explosive atmospheres, covering temperature control, spark prevention, leakage prevention, and maintenance obligations.

## Engineering Information
When PUMP-101A is installed in a potentially explosive atmosphere, additional measures are required to avoid excess temperature, prevent build-up of explosive mixtures, prevent spark generation, prevent leakage, and maintain the pump to avoid hazard.

### Scope of Compliance
- Use the equipment only in the zone for which it is rated.
- Confirm the driver, drive coupling assembly, seal, and pump equipment are all suitably rated/certified for the specific atmosphere classification.
- Where only a bare-shaft pump is supplied, the Ex rating applies only to the pump; the party assembling the full ATEX set must select a compliant coupling and driver with the necessary certification.
- For VFD-driven motors, the ATEX certification must explicitly cover VFD electrical supply, even if the VFD itself is located in a safe area.

### ATEX Marking Example
`II 2 GD c IIC 135°C (T4)`

- Equipment Group: I = Mining, II = Non-mining
- Category: 2/M2 = high level protection, 3 = normal level protection
- Gas/Dust: G = Gas, D = Dust
- c = Constructional safety (EN13463-5)
- Gas Group: IIA (Propane-typical), IIB (Ethylene-typical), IIC (Hydrogen-typical)
- Temperature Class (max surface temperature) — see table below

### Maximum Surface Temperature vs. Liquid Temperature Limit
| Temp Class | Max Surface Temp | Liquid Limit (standard casing) | Liquid Limit (self-priming casing) |
|---|---|---|---|
| T6 | 85°C | Consult OEM | Consult OEM |
| T5 | 100°C | Consult OEM | Consult OEM |
| T4 | 135°C | 115°C | 110°C |
| T3 | 200°C | 180°C | 175°C |
| T2 | 300°C | 275°C | 270°C |

Ratings are based on 40°C max ambient; consult the OEM for higher ambient temperatures. The plant operator is responsible for ensuring liquid temperature never exceeds the rated limit for the installed location.

## Procedure / Compliance Measures

### Preventing Explosive Mixture Build-up
- Ensure the pump, suction, and discharge pipeline system remain totally filled with liquid at all times during operation.
- Fit a dry-run protection device (liquid detection or power monitor) if the system cannot guarantee this.
- Ensure surrounding areas are well ventilated to disperse fugitive vapour/gas emissions.

### Preventing Sparks
- Coupling guard must be non-sparking for category 2 equipment.
- Baseplate must be properly grounded to avoid random induced current sparking.
- Do not rub non-metallic surfaces with a dry cloth (electrostatic charge risk) — use a damp cloth.
- Metallic components fitted on non-metallic baseplates must be individually earthed.

### Preventing Leakage
- Use the pump only for liquids it is approved to handle with correct corrosion resistance.
- Avoid liquid entrapment between closed suction/discharge valves, which can cause dangerous pressure build-up from heat input.
- Protect against freezing-induced bursting by draining or protecting the pump and ancillary systems.
- Install a liquid detection device if leakage to atmosphere could create a hazard.

## Inspection Points
- Driver, coupling, seal, and pump certification match the required atmosphere classification/zone.
- Liquid temperature versus rated temperature class limit for the installed location.
- Coupling guard non-sparking condition (category 2 equipment).
- Baseplate and metallic component grounding/earthing continuity.

## Warnings
- Never operate the equipment outside the zone for which it is rated.
- Do not rub non-metallic surfaces with a dry cloth — this creates an electrostatic spark risk; use a damp cloth instead.
- Never allow liquid entrapment between closed suction/discharge valves — this can cause dangerous pressure build-up from heat input.
- The plant operator is responsible for ensuring liquid temperature never exceeds the rated limit for the installed location.
- Tools, cleaning agents, and painting materials used during maintenance must not create sparking or adversely affect ambient conditions; conduct maintenance in a safe area if any such risk exists.

## Best Practices
- For VFD-driven motors, confirm ATEX certification explicitly covers the VFD electrical supply, even if the VFD is located in a safe area.
- Fit dry-run protection and liquid detection devices wherever the system cannot inherently guarantee the pump and pipeline remain full of liquid.
- Compliance with maintenance instructions is the plant operator's responsibility and should be documented as part of the site's hazardous-area management system.

## Related Documents
- electrical_connections.md
- operating_limits.md
- running_the_pump.md
- priming_and_auxiliary_supplies.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Coupling guard
- Baseplate
- Driver
- Drive coupling assembly
- Dry-run protection device
- Liquid detection device
- VFD (Variable Frequency Drive)

**Processes:**
- Hazardous area classification compliance
- Dry-run protection
- Grounding/earthing
- Maintenance in hazardous areas

### FAQ
Q: What does the ATEX marking "II 2 GD c IIC 135°C (T4)" mean?
A: It denotes Equipment Group II (non-mining), Category 2 (high level protection), suitable for Gas and Dust atmospheres, using constructional safety per EN13463-5, Gas Group IIC (hydrogen-typical), with a maximum surface temperature of 135°C (Temperature Class T4).

Q: What liquid temperature limit applies for a T4-rated standard casing pump?
A: 115°C for standard casing, or 110°C for self-priming casing, based on 40°C maximum ambient.

Q: Why should non-metallic surfaces never be rubbed with a dry cloth in a hazardous area?
A: This creates an electrostatic charge risk that could generate a spark; a damp cloth should be used instead.

Q: Who is responsible for ensuring liquid temperature never exceeds the rated limit for the installation zone?
A: The plant operator.

## Keywords
ATEX, hazardous area, explosive atmosphere, temperature class, T4, T3, gas group, IIC, dry-run protection, spark prevention, grounding, earthing, VFD certification, IEC 60079-14, liquid detection, dust atmosphere, coupling guard, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
