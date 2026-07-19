---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Operation
version: 1.0
---

# Running the Pump

## Purpose
Describes ongoing monitoring practices during PUMP-101A operation, and how to evaluate the effects of changing hydraulic, mechanical, and electrical duty conditions.

## Engineering Information
Once PUMP-101A has completed its start sequence, ongoing monitoring during operation prevents damage from thermal, mechanical, and hydraulic upset conditions.

### Bearings
- In potentially explosive atmospheres, temperature or vibration monitoring at the bearings is recommended.
- Record a benchmark bearing temperature at commissioning after temperature has stabilized.
- Temperature rise should be gradual after start-up, reaching maximum after approximately 1.5–2 hours, then holding steady or slightly reducing. A continuously or abruptly rising temperature indicates a fault.
- See vibration_and_noise_limits.md for alarm/trip temperature-setting formulas.

### Stop/Start Frequency
Generally up to six equally spaced stop/starts per hour is satisfactory; refer frequent stop/starting requirements to the motor manufacturer. Where duty and standby pumps are installed, run them alternately every week.

## Engineering Information — Hydraulic, Mechanical, and Electrical Duty Changes
If duty conditions change from the original purchase order specification, evaluate:
- **Specific gravity (SG):** capacity/head unaffected, but pressure gauge reading and power absorbed scale directly with SG — check the driver is not overloaded and the pump is not over-pressurized.
- **Viscosity:** head reduces and power absorbed increases with higher viscosity for a given flow (and vice versa) — check with the OEM if viscosity changes are planned.
- **Pump speed:** flow varies directly with speed; head varies as speed squared; power varies as speed cubed. Confirm maximum working pressure, driver load, NPSHA > NPSHR, and noise/vibration remain compliant if speed increases.
- **NPSH:** NPSHA must exceed NPSHR with the largest practical margin; re-check the performance curve if flow has changed.
- **Pumped flow:** must stay within the minimum and maximum continuous safe flow shown on the performance curve/data sheet.

## Procedure

### Duty/Standby Practice
Check the capability of the driver and control/starting system before commissioning. Alternate duty/standby pumps weekly to keep both units in good running condition.

## Inspection Points
- Benchmark bearing temperature at commissioning (after stabilization).
- Bearing temperature rise pattern (gradual, peaking at 1.5–2 hours, then steady/reducing).
- Vibration levels versus normal/alarm/trip thresholds (see vibration_and_noise_limits.md).
- Stop/start frequency versus the six-per-hour general guideline.
- Duty and standby pump alternation on a weekly basis.

## Warnings
- A continuously or abruptly rising bearing temperature indicates a fault and must be investigated.
- More than approximately six stop/starts per hour requires confirmation from the motor manufacturer.
- Confirm working pressure, driver load, NPSH margin, and noise/vibration remain within limits before implementing any change to speed or duty conditions.

## Best Practices
- Record a benchmark bearing temperature at commissioning, once temperature has stabilized, to support later trend-based fault detection.
- Alternate duty and standby pumps weekly to keep both units in good running condition.
- Re-check the performance curve any time pumped flow, viscosity, or speed changes from the original purchase order specification.

## Related Documents
- vibration_and_noise_limits.md
- operating_limits.md
- lubrication.md
- priming_and_auxiliary_supplies.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Bearings
- Motor/driver
- Control/starting system
- Duty pump
- Standby pump

**Processes:**
- Operation monitoring
- Bearing temperature trending
- Duty condition evaluation
- Duty/standby alternation

### FAQ
Q: How soon after start-up does bearing temperature typically reach its maximum?
A: Approximately 1.5–2 hours after start-up, after which it should hold steady or slightly reduce; a continuously or abruptly rising temperature indicates a fault.

Q: How many stop/starts per hour are generally acceptable for PUMP-101A?
A: Up to six equally spaced stop/starts per hour is generally satisfactory; more frequent stop/starting should be referred to the motor manufacturer.

Q: How often should duty and standby pumps be alternated?
A: Weekly, to keep both units in good running condition.

Q: What happens to power absorbed if pump speed is increased?
A: Power varies as the cube of speed, so even modest speed increases significantly increase power absorbed — driver load must be re-checked.

## Keywords
running the pump, bearing temperature monitoring, benchmark temperature, stop start frequency, duty standby alternation, specific gravity effect, viscosity effect, pump speed effect, NPSH margin, performance curve, vibration monitoring, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
