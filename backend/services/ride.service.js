const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

// async function getFare(pickup, destination) {
//   if (!pickup || !destination) {
//     throw new Error('Pickup and destination are required');
//   }

//   try {
//     const distanceTime = await mapService.getDistanceTime(pickup, destination);
    
//     if (!distanceTime || typeof distanceTime.distance !== 'number' || typeof distanceTime.duration !== 'number') {
//       throw new Error('Invalid response from map service');
//     }
    
//     console.log("Distance & Time Data:", distanceTime); // Debugging

//     const baseFare = { 
//       '4-seater hatchback': 30, 
//       '4-seater sedan': 35, 
//       '7-seater SUV': 50, 
//       '7-seater MUV': 55 
//     };
//     const perKmRate = { 
//       '4-seater hatchback': 10, 
//       '4-seater sedan': 12, 
//       '7-seater SUV': 15, 
//       '7-seater MUV': 18 
//     };
//     const perMinuteRate = { 
//       '4-seater hatchback': 2, 
//       '4-seater sedan': 2.5, 
//       '7-seater SUV': 3, 
//       '7-seater MUV': 3.5 
//     };

//     const fare = {};
//     for (const type in baseFare) {
//       fare[type] = Math.round(
//         baseFare[type] +
//         ((distanceTime.distance / 1000) * perKmRate[type]) +
//         ((distanceTime.duration / 60) * perMinuteRate[type])
//       );
//     }
//     console.log("Calculated Fare:", fare); // Debugging
//     return fare;
//   } catch (error) {
//     console.error('Error in fare calculation:', error.message);
//     throw new Error('Fare calculation failed');
//   }
// }






//Testing 
async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  try {
    // Optionally, you can still call the map service to log distance & time
    // but we'll ignore its values for fare calculation.
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    console.log("Distance & Time Data (ignored):", distanceTime);

    // Return a fixed fare of 1 rupee for all vehicle types
    const fare = {
      '4-seater hatchback': 1,
      '4-seater sedan': 1,
      '7-seater SUV': 1,
      '7-seater MUV': 1
    };
    console.log("Calculated Fare:", fare);
    return fare;
  } catch (error) {
    console.error('Error in fare calculation:', error.message);
    throw new Error('Fare calculation failed');
  }
}

module.exports.getFare = getFare;

function getOtp(num) {
  // Generate a numeric OTP of length `num`
  return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

module.exports.createRide = async ({
  user, pickup, destination, vehicleType, rideDate, rideTime, paymentType
}) => {
  // Ensure all required fields are provided
  if (!user || !pickup || !destination || !vehicleType || !rideDate || !rideTime || !paymentType) {
    throw new Error('All fields are required');
  }

  const fare = await getFare(pickup, destination);

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    rideDate,
    rideTime,
    paymentType, 
    otp: getOtp(6),
    fare: fare[vehicleType]
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, {
    status: 'accepted',
    captain: captain._id
  });
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error('Ride id and OTP are required');
  }
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'accepted') {
    throw new Error('Ride not accepted');
  }
  if (ride.otp !== otp) {
    throw new Error('Invalid OTP');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'ongoing' });
  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  const ride = await rideModel.findOne({ _id: rideId, captain: captain._id })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'ongoing') {
    throw new Error('Ride not ongoing');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'completed' });
  return ride;
};
