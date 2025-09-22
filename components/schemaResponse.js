import CustomError from "./customErrors.js";

export const schemaResponse = (schema, data) => {
    const validationFields = schema.safeParse(data);
    if (!validationFields.success) {
        const errors = validationFields.error.flatten().fieldErrors
        console.log(errors);
        throw new CustomError('Validation Error', 400, errors);
    }
    return validationFields.data;
}