---
document_type: OEM_MANUAL
equipment_tag: PUMP-101A
equipment_type: Centrifugal Pump (Sealless Magnetic Drive)
manufacturer: Flowserve
source_document: Flowserve CPXS Installation, Operation & Maintenance Manual
knowledge_category: Operating Parameters - Condition Monitoring
version: 1.0
---

# Vibration and Noise Limits

## Purpose
Defines vibration velocity thresholds, noise level guidance, and bearing temperature alarm/trip-setting formulas for condition monitoring of PUMP-101A.

## Engineering Information
PUMP-101A falls under the classification for rigid support machines within international rotating machinery standards. Vibration and noise monitoring supports early detection of pump or system deterioration.

### Vibration Velocity Limits (Unfiltered, Horizontal Pumps)
| Condition | ≤15 kW | >15 kW |
|---|---|---|
| Normal (N) | ≤ 3.0 mm/sec (0.12 in/sec) | ≤ 4.5 mm/sec (0.18 in/sec) |
| Alarm (N × 1.25) | ≤ 3.8 mm/sec (0.15 in/sec) | ≤ 5.6 mm/sec (0.22 in/sec) |
| Shutdown Trip (N × 2.0) | ≤ 6.0 mm/sec (0.24 in/sec) | ≤ 9.0 mm/sec (0.35 in/sec) |

Alarm and trip values for installed pumps should be based on actual measurements (N) taken on the pump in the fully commissioned, as-new condition. Regular vibration measurement then reveals any deterioration in pump or system operating conditions.

### Stop/Start Frequency
Pump sets are normally suitable for a limited number of equally spaced stop/starts per hour — generally up to six per hour is satisfactory. Refer frequent stop/start requirements to the motor manufacturer.

### Noise Level
- Typical exposure guidance threshold: 80–85 dBA; local legislation defines when noise limitation guidance or exposure reduction becomes mandatory.
- Noise level depends on operational factors: flow rate, pipework design, and building acoustics. Published values carry a 3 dBA tolerance and cannot be guaranteed.
- A motor driven by an inverter (VFD) may show increased noise at certain speeds.
- Values in OEM tables are sound pressure level LpA at 1 m, free-field conditions over a reflecting plane. To estimate sound power level LWA (re 1 pW), add 14 dBA to the sound pressure value.
- Where exposure approaches prescribed limits, site noise measurements should be performed.

### Bearing Temperature Monitoring Formula
If bearing temperatures are monitored, record a benchmark temperature at commissioning after the bearing temperature has stabilized:
- Record bearing temperature (t) and ambient temperature (ta).
- Estimate the likely maximum ambient temperature (tb).
- Set alarm at (t + tb - ta + 5)°C.
- Set trip at 100°C for oil lubrication, 105°C for grease lubrication.

## Procedure

### Establishing Vibration Alarm/Trip Values
1. Take actual vibration measurements (N) on the pump in the fully commissioned, as-new condition.
2. Set alarm threshold at N × 1.25.
3. Set shutdown trip threshold at N × 2.0.
4. Regularly re-measure vibration to detect deterioration trends relative to the baseline.

## Inspection Points
- Vibration velocity versus normal/alarm/shutdown-trip thresholds (by motor power band).
- Bearing temperature versus calculated alarm and trip setpoints.
- Noise level versus 80–85 dBA exposure guidance threshold.
- Temperature rise pattern after start-up (gradual, peaking at 1.5–2 hours).

## Warnings
- A continuously rising or abruptly rising bearing temperature indicates a fault and must be investigated.
- Trip temperature must never exceed 100°C for oil lubrication or 105°C for grease lubrication.
- Published noise values carry a 3 dBA tolerance and cannot be guaranteed — perform site noise measurements where exposure approaches prescribed limits.
- More than approximately six stop/starts per hour should be referred to the motor manufacturer for confirmation.

## Best Practices
- Base alarm and trip vibration values on actual as-new commissioning measurements (N), not on generic published limits alone.
- Use the bearing temperature alarm formula (t + tb − ta + 5)°C to account for seasonal ambient temperature variation.
- Account for potential increased noise at certain speeds when a motor is VFD-driven.

## Related Documents
- running_the_pump.md
- lubrication.md
- inspection_checklist.md
- alignment.md

## Engineering Entities

**Equipment:**
- PUMP-101A

**Components:**
- Bearings
- Motor
- VFD (inverter)

**Processes:**
- Vibration monitoring
- Noise monitoring
- Bearing temperature monitoring
- Condition-based maintenance

### FAQ
Q: What is the normal vibration velocity limit for a PUMP-101A driven by a motor over 15 kW?
A: ≤ 4.5 mm/sec (0.18 in/sec), unfiltered, for horizontal pumps.

Q: How are alarm and shutdown-trip vibration thresholds derived?
A: Alarm is set at 1.25 times the normal as-new baseline measurement (N), and shutdown trip is set at 2.0 times N.

Q: What is the maximum trip temperature for oil-lubricated versus grease-lubricated bearings?
A: 100°C for oil lubrication and 105°C for grease lubrication.

Q: What is the typical noise exposure guidance threshold for PUMP-101A?
A: 80–85 dBA, though local legislation defines when noise limitation guidance or exposure reduction becomes mandatory; published values carry a 3 dBA tolerance.

## Keywords
vibration limits, vibration velocity, alarm threshold, shutdown trip, bearing temperature alarm, noise level, dBA, sound pressure level, sound power level, VFD noise, condition monitoring, rigid support machine, stop start frequency, centrifugal pump, magnetic drive pump, PUMP-101A

OEM Source:
Flowserve CPXS Installation, Operation & Maintenance Manual
