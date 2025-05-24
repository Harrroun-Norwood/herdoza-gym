// Import payment configurations from payment-popup.js
import { paymentConfigs } from './payment-popup.js';

// Service-specific payment popup functions
window.openMmaSingle = function(details) {
  window.openPaymentPopup({
    ...paymentConfigs.mmaSingle,
    ...details
  });
};

window.openMma25Sessions = function(details) {
  window.openPaymentPopup({
    ...paymentConfigs.mma25Sessions,
    ...details
  });
};

window.openMmaZumba = function(details) {
  window.openPaymentPopup({
    ...paymentConfigs.mmaZumba,
    ...details,
    zumbaTime: "7:00 AM - 8:00 AM"
  });
};

window.openSmallStudio = function(details) {
  window.openPaymentPopup({
    ...paymentConfigs.smallStudio,
    ...details
  });
};

window.openLargeStudio = function(details) {
  window.openPaymentPopup({
    ...paymentConfigs.largeStudio,
    ...details,
    price: details.numberOfPeople * paymentConfigs.largeStudio.pricePerPerson
  });
};

window.openGymMembership = function(details) {
  const config = details.hasTrainer ? 
    (details.duration === 1 ? paymentConfigs.gymTrainerSingle : 
     details.duration === 25 ? paymentConfigs.gymTrainer25 : 
     paymentConfigs.gymMonthlyTrainer) :
    paymentConfigs.gymMonthly;

  window.openPaymentPopup({
    ...config,
    ...details
  });
};

window.openZumba = function(details) {
  window.openPaymentPopup({
    id: "zumba",
    pass: "Zumba Session",
    description: "One Zumba fitness session.",
    price: 80,
    type: "zumba",
    redirectPage: "user-schedule-zumba.html",
    ...details
  });
};
