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
export const courseValidation = (req, res, next) => {
    const bodySchema = Joi.object({
        title: Joi.string().min(4).required().messages({
            'string.min': 'Minimum 4 characters are required for the title.',
            'any.required': 'Title is required.',
        }),
        subTitle: Joi.string().min(4).required().messages({
            'string.min': 'Minimum 4 characters are required for the subtitle.',
            'any.required': 'Subtitle is required.',
        }),
        catagory: Joi.string().required().messages({
            'any.required': 'Category is required.',
        }),
        tags: Joi.string().required().messages({
            'any.required': 'Tags is required.',
        }),
        price: Joi.number().required().messages({
            'number.base': 'Price should be a number.',
            'any.required': 'Price is required.',
        }),
        description: Joi.string().min(20).required().messages({
            'string.min': 'Minimum 20 characters are required for the description.',
            'any.required': 'Description is required.',
        }),
        content: Joi.string().min(20).required().messages({
            'string.min': 'Minimum 20 characters are required for the description.',
            'any.required': 'Content is required.',
        }),
        level: Joi.string().required().messages({
            'any.required': 'Level is required.',
        }),
    });
    
    const fileSchema = Joi.object({
        
        mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif,video/mp4').required().messages({
            'any.only': 'Invalid mimetype. Only JPEG, PNG,GIF and mp4 are allowed.',
            'any.required': 'Mimetype is required.',
        }),
        buffer: Joi.binary().required().messages({
            'any.required': 'Buffer is required.',
        }),
    });

    const { error: bodyError } = bodySchema.validate(req.body);
    const { error: fileError } = fileSchema.validate(req.file);

    if (bodyError || fileError) {
        const errors = [];
        if (bodyError) errors.push(bodyError.details[0].message);
        if (fileError) errors.push(fileError.details[0].message);
        return res.status(400).json({ error: errors.join('; ') });
    } else {
        next();
    }
};
