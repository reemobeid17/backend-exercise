import * as Joi from "joi";
import JoiPassword from "joi-password";

interface UserSchema {
  validate: (s: any) => Joi.ValidationResult;
}
const userSchema = {} as UserSchema;
const schema = Joi.object({
  required: Joi.boolean(),
  firstName: Joi.string()
    .min(3)
    .max(100)
    .when("required", { is: true, then: Joi.required() }),
  lastName: Joi.string()
    .min(3)
    .max(100)
    .when("required", { is: true, then: Joi.required() }),
  email: Joi.string()
    .email()
    .when("required", { is: true, then: Joi.required() }),
  password: JoiPassword.string()
    .min(6)
    .minOfLowercase(1)
    .minOfNumeric(1)
    .minOfSpecialCharacters(1)
    .when("required", { is: true, then: Joi.required() }),
  role: Joi.string().valid("user", "admin", "moderator").optional(),
});

userSchema.validate = (s) => {
  return schema.validate(s);
};

export default userSchema;
