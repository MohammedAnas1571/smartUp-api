import Joi from "joi";

export const signUpValidator = (req, res, next) => {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; 
    
    const signUpSchema = Joi.object({
        username: Joi.string().min(3).required().messages({
            'string.empty': 'Username is required'
        }),
        
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required'
        }),
        password: Joi.string().pattern(passwordPattern).required().messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one special character, and one number',
            'any.required': 'Password is required'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Passwords must match',
            'any.required': 'Please confirm your password'
        }),
    });
    const { error } = signUpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        next();
    }
};

export const signvalidation = (req, res, next) => {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; 
    const signInSchema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required'
        }),
        password: Joi.string().pattern(passwordPattern).required().messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one special character, and one number',
            'any.required': 'Password is required'
        })
    })
    const { error } = signInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        next();
    }
}