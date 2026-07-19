---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Operating Parameters
version: 1.0
---

# Operating Limits

## Purpose
Defines the temperature, speed, flow, NPSH, and pressure limits within which PUMP-101A must be operated, and the effects of changing duty conditions.

## Engineering Information

PUMP-101A must never be operated beyond the parameters specified for its application. Exceeding these limits is considered misuse and voids OEM warranty coverage.

### Temperature Limits (Magnetic Drive Components)
- Neodymium magnets: -40°C to +120°C
- Samarium cobalt magnets: -40°C to +250°C
- PEEK shell (pressure dependent): -40°C to +120°C

### Ambient Temperature
- Standard TEFC motors: ambient limit +40°C.
- Motors for higher ambient temperatures must be specifically rated; check motor nameplate.

### Pump Speed
- Maximum pump speed: refer to the equipment nameplate. Do not exceed under any circumstance.

### Flow Limits
- Flow must not fall outside the minimum and maximum continuous safe flow shown on the pump performance curve or data sheet.

### NPSH (Net Positive Suction Head)
- NPSH available (NPSHA) must always exceed NPSH required (NPSHR).
- Keep the margin between NPSHA and NPSHR as large as possible.

### Pressure
- Never exceed the Maximum Design Pressure (MDP) at the working temperature stated on the pump nameplate.

## Engineering Information — Effects of Changing Duty Conditions
- **Specific gravity (SG):** capacity and head do not change with SG, but pressure gauge reading and power absorbed are directly proportional to SG. Confirm the driver is not overloaded if SG increases.
- **Viscosity:** increased viscosity reduces head and increases power absorbed for a given flow; reduced viscosity has the opposite effect.
- **Pump speed:** flow varies directly with speed, head varies with speed squared, power varies with speed cubed. Confirm working pressure, driver load, NPSH margin, noise, and vibration remain within limits if speed is changed.

## Inspection Points
- Pump speed versus nameplate maximum rating.
- Operating flow versus minimum/maximum continuous safe flow on performance curve.
- NPSHA margin over NPSHR.
- Working pressure versus Maximum Design Pressure (MDP) at working temperature.

## Warnings
- Never run the pump at zero flow or below minimum continuous flow for extended periods — this causes overheating, cavitation, and bearing damage.
- Do not operate at abnormally high flow rates — this can overload the motor and cause cavitation.
- Never exceed the Maximum Design Pressure (MDP) at the working temperature stated on the nameplate.
- Never exceed the maximum pump speed stated on the nameplate under any circumstance.
- Any proposed change to liquid pumped, temperature, or duty conditions requires written agreement from Flowserve (or the responsible engineering authority) before start-up.

## Best Practices
- Any proposed change to suction conditions must be checked against the pump performance curve before implementation.
- Confirm driver load, working pressure, NPSH margin, noise, and vibration remain within limits whenever speed or duty conditions change.

## Related Documents
- magnetic_drive.md
- hazardous_area_atex.md
- vibration_and_noise_limits.md
- piping_guidelines.md
- running_the_pump.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Neodymium magnets
- Samarium cobalt magnets
- PEEK shell
- Motor
- Impeller

**Processes:**
- Operation
- Duty condition change evaluation
- NPSH verification
- Overpressure prevention

### FAQ
Q: Why should PUMP-101A never run at zero flow or below minimum continuous flow?
A: Extended operation below minimum continuous flow causes overheating, cavitation, and bearing damage.

Q: What temperature range can neodymium magnets in PUMP-101A withstand?
A: -40°C to +120°C.

Q: What must always be true of NPSHA relative to NPSHR?
A: NPSH available (NPSHA) must always exceed NPSH required (NPSHR), with as large a margin as practically possible.

Q: What happens if pump speed is increased?
A: Flow increases directly with speed, head increases with the square of speed, and power increases with the cube of speed — working pressure, driver load, NPSH margin, noise, and vibration must all be re-verified.

## Keywords
operating limits, maximum design pressure, MDP, NPSH, NPSHA, NPSHR, minimum continuous flow, maximum continuous flow, pump speed limit, neodymium magnet temperature, samarium cobalt magnet, PEEK shell temperature, ambient temperature limit, cavitation, duty condition change, specific gravity, viscosity effect, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
