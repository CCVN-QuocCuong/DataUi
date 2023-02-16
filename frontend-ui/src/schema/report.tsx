import * as Yup from "yup";

/**
 * Declare schema for validation report parameter form
 */
export const ReportParameterValidation = Yup.object().shape({
    formattype: Yup.string().required('Format Type is required.'),
});

