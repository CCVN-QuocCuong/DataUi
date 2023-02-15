import Cookies from 'js-cookie';
import _isString from 'lodash/isString';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/config';

/**
 * Function to set new cookie with key
 * @param {string} key
 * @param {string} rawValue
 * @param {object} option
 */
export function set(key, rawValue, option) {
  const value = _isString(rawValue) ? rawValue : JSON.stringify(rawValue);

  Cookies.set(key, value, option);
};

/**
 * Function to get value from cookie with key
 * @param {string} key
 */
export function get(key) {
  const value = Cookies.get(key);

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

/**
 * Function to set remove value cookie with key
 * @param {string} key
 */
export function remove(key) {
  Cookies.remove(key);
};
export function removeAll() {
  localStorage.removeItem("user")
  Object.keys(Cookies.get()).forEach((cookieName) => {
    Cookies.remove(cookieName);
  });
};

/**
 * Function to set token to cookie
 * @param {string} value
 * @param {object} option
 */
export function setToken(value, option) {
  set(ACCESS_TOKEN, value, option);
};

/**
 * Function to get value token from cookie
 * @param {string} key
 */
export function getToken() {
  return get(ACCESS_TOKEN);
};

/**
 * Function to set refresh token to cookie
 * @param {string} value
 * @param {object} option
 */
export function setRefreshToken(value, option) {
  set(REFRESH_TOKEN, value, option);
};

/**
 * Function to get value refresh token from cookie
 * @param {string} key
 */
export function getRefreshToken() {
  return get(REFRESH_TOKEN);
};