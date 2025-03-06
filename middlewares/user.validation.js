const Joi = require("joi");
const userValidator = (req, res, next) => {
    const { userName, email, password } = req.body;
    const passwordPattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$');
    const schema = Joi.object({
        userName: Joi.string().min(3).max(10).required(),
        password: Joi.string().pattern(passwordPattern).message("Password should contain following A-Z a-z @#$!*"),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        }),
    });
    const { error, value } = schema.validate({ userName: userName, email: email, password: password });
    if (error) {
        return res.status(400).json({ error: error.details[0].message })
    }
    next();
};

const loginValidator = (req, res, next) => {
    const { email, password } = req.body;

    const schema = Joi.object({
        password: Joi.string()
            .trim()
            .required()
            .messages({
                "any.required": "Password is required",
                "string.empty": "Password cannot be empty",
            }),
        email: Joi.string()
            .trim()
            .required()
            .messages({
                "any.required": "Email is required",
                "string.empty": "Email cannot be empty",
            }),
    });

    const { error, value } = schema.validate({ email, password });
    console.log(value);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { userValidator,loginValidator };
