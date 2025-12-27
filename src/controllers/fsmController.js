// src/controllers/fsmController.js

export const SCENES = {
  FIRST_TIME_GPS: "FIRST_TIME_GPS",
  GPS_NOMAD: "GPS_NOMAD",
  PORT_IDLE: "PORT_IDLE",
  PORT_TRAVEL: "PORT_TRAVEL",
  EVENT: "EVENT",
  PROFILE: "PROFILE",
};

let currentState = SCENES.FIRST_TIME_GPS;
const listeners = new Set();

function notify() {
  console.log("[FSM] currentState =", currentState);
  listeners.forEach((fn) => fn(currentState));
}

export const fsmController = {
  getState() {
    return currentState;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  cta() {
    switch (currentState) {
      case SCENES.FIRST_TIME_GPS:
        currentState = SCENES.PORT_IDLE;
        break;
      case SCENES.PORT_IDLE:
        currentState = SCENES.PORT_TRAVEL;
        break;
      case SCENES.PORT_TRAVEL:
        currentState = SCENES.GPS_NOMAD;
        break;
      default:
        return;
    }
    notify();
  },

  goProfile() {
    console.log("[FSM] goProfile()");
    currentState = SCENES.PROFILE;
    notify();
  },
};
