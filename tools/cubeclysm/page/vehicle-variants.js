// How engines and the studio place the vehicle cabin parts (vehicles.js) inside a whole-vehicle
// model (road-vehicles.js). Plain data, no three.js: tools/cubeclysm/bind-terrain.mjs writes it
// next to the models as models/cubeclysm/vehicles/variants.json, and meshset.json names that file
// as "vehicleParts".
//
// A whole-vehicle entry in meshset.json carries `interior`: { floor, length, width } (metres). Take
// the vehicle's CDDA part layout, keep the parts listed in `interior` below (`vp_<part id>`), and
// place each at its mount: the layout's frame tiles spread evenly over interior.length (mount x,
// forward = −Z) and interior.width (mount y, right = +X), round the shell's centre, lifted from
// heights.floor to interior.floor. The parts face the vehicle's front (−Z); they are real size.
export const VEHICLE_VARIANTS = {
  about: 'Cabin parts placed inside Cubeclysm whole-vehicle models by the CDDA part layout; see tools/cubeclysm/page/vehicle-variants.js.',
  tile: .55,
  heights: { floor: .3 },
  rotation: { N: 0, W: 90, S: 180, E: -90 },
  interior: ['vp_seat', 'vp_reclining_seat', 'vp_seat_back', 'vp_seatbelt', 'vp_controls', 'vp_dashboard', 'vp_stereo', 'vp_vehicle_alarm', 'vp_integrated_heater_small', 'vp_integrated_cooler', 'vp_trunk', 'vp_cargo_space', 'vp_aisle'],
  parts: {},
};
