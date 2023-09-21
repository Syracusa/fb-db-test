/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall } = require("firebase-functions/v2/https");
const {
  log,
  info,
  debug,
  warn,
  error,
  write,
} = require("firebase-functions/logger");

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const FieldValue = require('firebase-admin').firestore.FieldValue;

// Initialize admin sdk for Firestore read in getInspirationalQuote
initializeApp();

exports.addCount = onCall(
(request) => {
  const ref = getFirestore().collection(request.data.board).doc(request.data.id);
  return ref.update({ count: FieldValue.increment(1) });
});