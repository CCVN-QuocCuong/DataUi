import * as Yup from "yup";

/**
 * Declare schema for validation project form
 */
export const ProjectValidation = Yup.object().shape({
  project_number: Yup.string()
    .required("Project number is required.")
    .min(1, "Must be greater than 1 digit.")
    .max(20, "Must be less than 20 digits."),
  project_name: Yup.string()
    .required("Project name is required.")
    .min(1, "Must be greater than 1 digit.")
    .max(60, "Must be less than 60 digits."),
  elevation_datum: Yup.string().required("Elevation datum is required."),
  coordinate_system: Yup.string().required(
    "Coordinate system is required."
  ),
  client_name: Yup.string()
    .required("Client name is required.")
    .min(1, "Must be greater than 1 digit.")
    .max(60, "Must be less than 60 digits."),
  version: Yup.string()
    .required("Version is required.")
    .min(1, "Must be greater than 1 digit.")
    .max(20, "Must be less than 20 digits."),
});
